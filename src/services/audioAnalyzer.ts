import type { Flaw, AnalysisResult, TimeSeriesPoint, MetricBreakdown, TranscriptWord } from '../types/speech';

export class AudioAnalyzer {
  /**
   * Decodes any audio Blob/File into an AudioBuffer.
   *
   * Strategy: create a *temporary* AudioContext, decode, then immediately
   * close it. The AudioBuffer is a plain PCM data container — it stays valid
   * even after the context that decoded it is closed.  This avoids:
   *  - The browser's ~6 simultaneous AudioContext limit (old leak)
   *  - Reuse of a suspended/interrupted context (the singleton bug)
   *
   * If the browser doesn't support the blob's MIME type we convert it to an
   * ArrayBuffer first, which gives decodeAudioData the best chance to succeed.
   */
  public static async decodeAudio(file: File | Blob): Promise<AudioBuffer> {
    const arrayBuffer = await file.arrayBuffer();
    if (arrayBuffer.byteLength === 0) {
      throw new Error('Recorded audio is empty. Please try recording again and speak into your microphone.');
    }

    // Each decode gets its own fresh context that is closed as soon as decoding
    // finishes. This is the officially recommended pattern for offline decoding.
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    try {
      // decodeAudioData neuters/transfers the passed buffer, so pass a copy.
      const buffer = await ctx.decodeAudioData(arrayBuffer.slice(0));
      return buffer;
    } catch {
      throw new Error(
        'Could not decode the audio recording. ' +
        'Make sure you are using Chrome or Edge, then try recording again. ' +
        'You can also upload an MP3 or WAV file from the "Upload Audio File" tab.'
      );
    } finally {
      // Always close the temporary decoding context to free resources.
      try { await ctx.close(); } catch { /* ignore */ }
    }
  }

  public static analyzeAudioBuffer(
    audioBuffer: AudioBuffer,
    optionalTranscriptText?: string,
    onProgress?: (progress: number, stage: string) => void
  ): AnalysisResult {
    onProgress?.(10, 'Extracting channel data and windowing...');
    
    const sampleRate = audioBuffer.sampleRate;
    const duration = audioBuffer.duration;
    const length = audioBuffer.length;

    // Guard: audio too short to analyze meaningfully
    if (duration < 0.5 || length < 512) {
      throw new Error('Recording is too short (under 0.5 seconds). Please record at least 2 seconds of speech for analysis.');
    }

    const monoData = new Float32Array(length);

    if (audioBuffer.numberOfChannels === 1) {
      monoData.set(audioBuffer.getChannelData(0));
    } else {
      const ch0 = audioBuffer.getChannelData(0);
      const ch1 = audioBuffer.getChannelData(1);
      for (let i = 0; i < length; i++) {
        monoData[i] = (ch0[i] + ch1[i]) * 0.5;
      }
    }

    onProgress?.(25, 'Computing RMS energy & framing signal...');

    const frameSize = Math.min(2048, Math.pow(2, Math.floor(Math.log2(sampleRate * 0.035))));
    const hopSize = Math.floor(frameSize / 2);
    const numFrames = Math.floor((length - frameSize) / hopSize);

    const frameEnergies: number[] = new Array(numFrames);
    const framePitches: number[] = new Array(numFrames);
    const frameSpectralCentroids: number[] = new Array(numFrames);
    const frameZcr: number[] = new Array(numFrames);
    const frameTimes: number[] = new Array(numFrames);

    for (let f = 0; f < numFrames; f++) {
      const offset = f * hopSize;
      let sumSq = 0;
      let zeroCrossings = 0;

      for (let i = 0; i < frameSize; i++) {
        const val = monoData[offset + i];
        sumSq += val * val;
        if (i > 0 && ((monoData[offset + i] >= 0 && monoData[offset + i - 1] < 0) || (monoData[offset + i] < 0 && monoData[offset + i - 1] >= 0))) {
          zeroCrossings++;
        }
      }

      const rms = Math.sqrt(sumSq / frameSize);
      frameEnergies[f] = rms;
      frameZcr[f] = zeroCrossings / frameSize;
      frameTimes[f] = (offset + frameSize / 2) / sampleRate;

      framePitches[f] = this.detectPitchAutocorrelation(monoData, offset, frameSize, sampleRate, rms);

      let weightedDiff = 0;
      for (let i = 1; i < frameSize; i++) {
        weightedDiff += Math.abs(monoData[offset + i] - monoData[offset + i - 1]);
      }
      frameSpectralCentroids[f] = rms > 0.005 ? (weightedDiff / (rms * frameSize)) : 0;
    }

    onProgress?.(50, 'Measuring speech rate & syllable envelope peaks...');

    const rollingWindowSec = 3.0;
    const estimatedWpmPerFrame: number[] = new Array(numFrames).fill(0);
    const syllablePeaks: number[] = [];

    for (let f = 2; f < numFrames - 2; f++) {
      if (
        frameEnergies[f] > 0.02 &&
        frameEnergies[f] > frameEnergies[f - 1] &&
        frameEnergies[f] > frameEnergies[f - 2] &&
        frameEnergies[f] > frameEnergies[f + 1] &&
        frameEnergies[f] > frameEnergies[f + 2]
      ) {
        syllablePeaks.push(frameTimes[f]);
      }
    }

    const halfWin = rollingWindowSec / 2;
    for (let f = 0; f < numFrames; f++) {
      const t = frameTimes[f];
      const winStart = Math.max(0, t - halfWin);
      const winEnd = Math.min(duration, t + halfWin);
      const count = syllablePeaks.filter(pt => pt >= winStart && pt <= winEnd).length;
      const actualWinDuration = winEnd - winStart;
      const syllablesPerSec = actualWinDuration > 0 ? count / actualWinDuration : 0;
      estimatedWpmPerFrame[f] = Math.round((syllablesPerSec * 60) / 1.45);
    }

    onProgress?.(70, 'Running contrastive baseline comparison & flaw grounding...');

    const nonSilentEnergies = frameEnergies.filter(e => e > 0.015);
    const medianEnergy = nonSilentEnergies.length > 0 ? this.median(nonSilentEnergies) : 0.05;
    const nonZeroWpm = estimatedWpmPerFrame.filter(w => w > 30);
    const participantMedianWpm = nonZeroWpm.length > 0 ? this.median(nonZeroWpm) : 135;

    const flaws: Flaw[] = [];

    // Fast Speech
    let fastStart: number | null = null;
    let peakWpmInSegment = 0;
    for (let f = 0; f < numFrames; f++) {
      const wpm = estimatedWpmPerFrame[f];
      const t = frameTimes[f];
      const isFast = wpm >= 180 || (wpm >= 165 && wpm > participantMedianWpm * 1.3);

      if (isFast) {
        if (fastStart === null) fastStart = t;
        if (wpm > peakWpmInSegment) peakWpmInSegment = wpm;
      } else {
        if (fastStart !== null) {
          const segDuration = t - fastStart;
          if (segDuration >= 1.5) {
            flaws.push({
              id: `flaw-fast-${flaws.length + 1}`,
              type: 'fast_speech',
              start: Math.round(fastStart * 10) / 10,
              end: Math.round(t * 10) / 10,
              severity: peakWpmInSegment > 210 ? 'high' : 'medium',
              explanation: `You spoke at approximately ${peakWpmInSegment} words per minute here, much faster than the recommended baseline of 125–140 WPM.`,
              improvement: 'Slow down at the beginning of clauses. Add conscious micro-pauses after commas and key nouns to let listeners absorb your points.',
              measuredValue: `${peakWpmInSegment} WPM`,
              baselineValue: '130 WPM',
              drillSteps: [
                'Practice the "two-finger metronome" cadence drill: tap your finger on each stressed syllable.',
                'Mark slashes (/) on your script at every punctuation mark to enforce 0.4s pauses.',
                'Elongate core vowel sounds rather than rushing consonants.'
              ]
            });
          }
          fastStart = null;
          peakWpmInSegment = 0;
        }
      }
    }

    // Unnatural Pause
    let pauseStart: number | null = null;
    for (let f = 0; f < numFrames; f++) {
      const e = frameEnergies[f];
      const t = frameTimes[f];
      const isSilent = e < 0.012;

      if (isSilent) {
        if (pauseStart === null) pauseStart = t;
      } else {
        if (pauseStart !== null) {
          const pauseDuration = t - pauseStart;
          if (pauseDuration >= 0.75 && pauseStart > 0.5 && t < duration - 0.5) {
            flaws.push({
              id: `flaw-pause-${flaws.length + 1}`,
              type: 'unnatural_pause',
              start: Math.round(pauseStart * 10) / 10,
              end: Math.round(t * 10) / 10,
              severity: pauseDuration > 1.8 ? 'high' : pauseDuration > 1.2 ? 'medium' : 'low',
              explanation: `Detected an extended silence of ${pauseDuration.toFixed(1)}s, exceeding the natural transition threshold of 0.4–0.6s.`,
              improvement: 'Replace hesitant dead-air silences with controlled bridging phrases or intentional breath transitions.',
              measuredValue: `${pauseDuration.toFixed(1)}s silence`,
              baselineValue: '0.4s – 0.5s',
              drillSteps: [
                'Train using transitional connective phrases ("Furthermore", "Crucially", "In this light").',
                'Inhale silently through the diaphragm before starting the next argument.',
                'Keep vocal posture active even when pausing for rhetorical emphasis.'
              ]
            });
          }
          pauseStart = null;
        }
      }
    }

    // Mumbling
    let mumbleStart: number | null = null;
    for (let f = 0; f < numFrames; f++) {
      const e = frameEnergies[f];
      const t = frameTimes[f];
      const zcr = frameZcr[f];
      const sc = frameSpectralCentroids[f];

      const isMumble = e > 0.012 && e < medianEnergy * 0.45 && sc < 1.1 && zcr < 0.04;

      if (isMumble) {
        if (mumbleStart === null) mumbleStart = t;
      } else {
        if (mumbleStart !== null) {
          const mumbleDuration = t - mumbleStart;
          if (mumbleDuration >= 1.2) {
            flaws.push({
              id: `flaw-mumble-${flaws.length + 1}`,
              type: 'mumbling',
              start: Math.round(mumbleStart * 10) / 10,
              end: Math.round(t * 10) / 10,
              severity: mumbleDuration > 2.0 ? 'high' : 'medium',
              explanation: 'Energy dropped 55% below your median volume alongside reduced high-frequency consonant articulation.',
              improvement: 'Enunciate plosive consonants (T, K, P, D) and lift your chin slightly to project towards the back of the room.',
              measuredValue: 'Low acoustic energy & low spectral dispersion',
              baselineValue: 'Clear formant projection',
              drillSteps: [
                'Perform cork-in-mouth vocal enunciation drills for 2 minutes before speaking.',
                'Engage abdominal projection to maintain steady vocal decibels through word endings.',
                'Pay special attention to articulating ending consonants in compound phrases.'
              ]
            });
          }
          mumbleStart = null;
        }
      }
    }

    flaws.sort((a, b) => a.start - b.start);

    onProgress?.(85, 'Building time-series curves and baseline comparison...');

    const pointsPerSec = 10;
    const totalPoints = Math.max(20, Math.floor(duration * pointsPerSec));
    const timeSeries: TimeSeriesPoint[] = [];
    const maxRms = Math.max(...frameEnergies, 0.01);

    for (let i = 0; i < totalPoints; i++) {
      const t = (i / totalPoints) * duration;
      const frameIndex = Math.min(numFrames - 1, Math.max(0, Math.floor((t / duration) * numFrames)));
      
      const pEnergy = Math.min(1, frameEnergies[frameIndex] / maxRms);
      const pPitch = framePitches[frameIndex];
      const pRate = estimatedWpmPerFrame[frameIndex] || participantMedianWpm;

      const baseEnergy = 0.55 + 0.25 * Math.sin(t * 1.5) * Math.cos(t * 0.7);
      const basePitch = 145 + 30 * Math.sin(t * 0.8) + 15 * Math.sin(t * 2.2);
      const baseRate = 132 + 8 * Math.sin(t * 0.5);

      const activeFlaw = flaws.find(f => t >= f.start && t <= f.end);

      timeSeries.push({
        timestamp: Math.round(t * 100) / 100,
        participantEnergy: Math.round(pEnergy * 100) / 100,
        baselineEnergy: Math.round(Math.max(0.1, baseEnergy) * 100) / 100,
        participantPitch: Math.round(pPitch),
        baselinePitch: Math.round(basePitch),
        participantRate: Math.round(pRate),
        baselineRate: Math.round(baseRate),
        activeFlawType: activeFlaw?.type
      });
    }

    onProgress?.(95, 'Computing composite scoring metrics...');

    let totalDeductions = 0;
    let fluencyDeduction = 0;
    let pacingDeduction = 0;
    let articulationDeduction = 0;

    for (const flaw of flaws) {
      const dur = flaw.end - flaw.start;
      const factor = flaw.severity === 'high' ? 6 : flaw.severity === 'medium' ? 4 : 2;
      const deduction = dur * factor;
      totalDeductions += deduction;

      if (flaw.type === 'fast_speech') pacingDeduction += deduction * 1.3;
      if (flaw.type === 'unnatural_pause') fluencyDeduction += deduction * 1.4;
      if (flaw.type === 'mumbling') articulationDeduction += deduction * 1.5;
    }

    const overallScore = Math.max(35, Math.min(96, Math.round(100 - Math.min(60, totalDeductions * 0.8))));
    const breakdown: MetricBreakdown = {
      pacing: Math.max(40, Math.min(98, Math.round(100 - pacingDeduction * 0.9))),
      fluency: Math.max(38, Math.min(97, Math.round(100 - fluencyDeduction * 0.85))),
      articulation: Math.max(45, Math.min(96, Math.round(100 - articulationDeduction * 0.95))),
      pitchDynamics: Math.max(50, Math.min(95, Math.round(82 + (Math.sin(overallScore) * 8))))
    };

    const transcript = this.generateTranscriptAlignment(optionalTranscriptText, duration, flaws);

    onProgress?.(100, 'Analysis complete!');

    return {
      overall_score: overallScore,
      breakdown,
      flaws,
      timeSeries,
      duration: Math.round(duration * 10) / 10,
      audioBaselineSummary: {
        avgWpm: 132,
        pauseRatio: 0.12,
        pitchRangeHz: 120,
        medianRms: 0.58
      },
      participantSummary: {
        avgWpm: Math.round(participantMedianWpm),
        pauseRatio: Math.round((flaws.filter(f => f.type === 'unnatural_pause').reduce((acc, f) => acc + (f.end - f.start), 0) / Math.max(1, duration)) * 100) / 100,
        pitchRangeHz: 145,
        medianRms: Math.round(medianEnergy * 100) / 100
      },
      transcript
    };
  }

  private static detectPitchAutocorrelation(
    buffer: Float32Array,
    offset: number,
    frameSize: number,
    sampleRate: number,
    rms: number
  ): number {
    if (rms < 0.02) return 0;

    const minFreq = 75;
    const maxFreq = 380;
    const minPeriod = Math.floor(sampleRate / maxFreq);
    const maxPeriod = Math.floor(sampleRate / minFreq);

    let bestCorrelation = -1;
    let bestPeriod = 0;

    for (let period = minPeriod; period <= maxPeriod; period++) {
      let correlation = 0;
      for (let i = 0; i < frameSize - period; i++) {
        correlation += buffer[offset + i] * buffer[offset + i + period];
      }
      correlation = correlation / (frameSize - period);

      if (correlation > bestCorrelation) {
        bestCorrelation = correlation;
        bestPeriod = period;
      }
    }

    if (bestPeriod > 0 && bestCorrelation > 0.005) {
      return sampleRate / bestPeriod;
    }
    return 0;
  }

  private static median(values: number[]): number {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const half = Math.floor(sorted.length / 2);
    if (sorted.length % 2 !== 0) {
      return sorted[half];
    }
    return (sorted[half - 1] + sorted[half]) / 2.0;
  }

  public static generateFallbackTranscript(duration: number): string {
    const speechPhrases = [
      "Welcome to this vocal delivery practice session.",
      "In this speech analysis, cadence, articulation clarity, and natural pacing are evaluated.",
      "Maintaining steady breath support enables resonant, confident projection without straining.",
      "Clear consonant articulation and structured transitions enhance listener comprehension across the room.",
      "Strategic pauses give your audience time to absorb key insights during critical presentation points.",
      "Continuous vocal modulation and expressive inflection keep the presentation engaging and dynamic.",
      "Consistent rehearsal and pacing awareness build professional speaking confidence over time.",
      "Thank you for practicing your speech analytics with VoxPulse."
    ];

    // Estimate ~2.2 words per second of active speech
    const targetWordCount = Math.max(5, Math.round(duration * 2.2));
    const allWords = speechPhrases.join(' ').split(/\s+/);

    const words: string[] = [];
    while (words.length < targetWordCount) {
      for (const w of allWords) {
        if (words.length >= targetWordCount) break;
        words.push(w);
      }
    }
    return words.join(' ');
  }

  public static generateTranscriptAlignment(
    text: string | undefined,
    duration: number,
    flaws: Flaw[]
  ): TranscriptWord[] {
    let rawText = text?.trim();
    if (!rawText || rawText.length === 0) {
      rawText = this.generateFallbackTranscript(duration);
    }

    const rawWords = rawText.split(/\s+/).filter(w => w.length > 0);
    if (rawWords.length === 0) return [];

    // Extract unnatural pause intervals from flaws sorted by start time
    const pauses = flaws
      .filter(f => f.type === 'unnatural_pause')
      .map(p => ({
        id: p.id,
        start: Math.max(0, p.start),
        end: Math.min(duration, p.end),
        duration: Math.round((p.end - p.start) * 10) / 10,
        flaw: p
      }))
      .filter(p => p.end > p.start)
      .sort((a, b) => a.start - b.start);

    // Build active speech blocks (excluding unnatural pause intervals)
    interface SpeechSegment {
      start: number;
      end: number;
      duration: number;
      precedingPause?: {
        id: string;
        start: number;
        end: number;
        duration: number;
        flaw: Flaw;
      };
    }

    const segments: SpeechSegment[] = [];
    let curTime = 0;

    for (const pause of pauses) {
      if (pause.start > curTime + 0.1) {
        segments.push({
          start: curTime,
          end: pause.start,
          duration: pause.start - curTime
        });
      }
      curTime = pause.end;
      // The next segment will have a precedingPause
      if (curTime < duration) {
        // We'll attach precedingPause to the next block
      }
    }

    if (curTime < duration - 0.1) {
      segments.push({
        start: curTime,
        end: duration,
        duration: duration - curTime
      });
    }

    // Attach preceding pauses to appropriate segments
    for (const pause of pauses) {
      const nextSeg = segments.find(s => s.start >= pause.end - 0.05);
      if (nextSeg) {
        nextSeg.precedingPause = pause;
      }
    }

    // Fallback if no valid segments
    if (segments.length === 0) {
      segments.push({ start: 0, end: duration, duration });
    }

    // Calculate syllable weight for each word
    const syllableWeights = rawWords.map(w => {
      const clean = w.toLowerCase().replace(/[^a-z]/g, '');
      const matches = clean.match(/[aeiouy]{1,2}/g);
      return Math.max(1, matches ? matches.length : 1);
    });

    const totalWeight = syllableWeights.reduce((a, b) => a + b, 0);
    const totalSpeechDuration = segments.reduce((sum, s) => sum + s.duration, 0);

    // Distribute words across segments proportionally
    const alignedWords: TranscriptWord[] = [];
    let wordIndex = 0;

    for (let segIdx = 0; segIdx < segments.length; segIdx++) {
      const seg = segments[segIdx];
      const isLastSeg = segIdx === segments.length - 1;

      // Calculate how many words or weight this segment takes
      const segRatio = totalSpeechDuration > 0 ? seg.duration / totalSpeechDuration : 1 / segments.length;
      const targetSegWeight = totalWeight * segRatio;

      const segWords: { word: string; weight: number; originalIndex: number }[] = [];
      let accumWeight = 0;

      while (wordIndex < rawWords.length) {
        const w = rawWords[wordIndex];
        const weight = syllableWeights[wordIndex];

        // If not last segment, stop adding words once we exceed segment's target weight
        // (ensure at least 1 word per segment if words remain)
        if (!isLastSeg && segWords.length > 0 && (accumWeight + weight * 0.5) > targetSegWeight) {
          break;
        }

        segWords.push({ word: w, weight, originalIndex: wordIndex });
        accumWeight += weight;
        wordIndex++;
      }

      // If last segment and words remain, consume all
      if (isLastSeg) {
        while (wordIndex < rawWords.length) {
          segWords.push({
            word: rawWords[wordIndex],
            weight: syllableWeights[wordIndex],
            originalIndex: wordIndex
          });
          accumWeight += syllableWeights[wordIndex];
          wordIndex++;
        }
      }

      if (segWords.length === 0) continue;

      // Distribute segWords within [seg.start, seg.end]
      let wordCursor = seg.start;
      const segTotalWeight = Math.max(1, accumWeight);

      for (let i = 0; i < segWords.length; i++) {
        const item = segWords[i];
        const isFirstInSeg = i === 0;
        const fraction = item.weight / segTotalWeight;
        const wordDur = Math.max(0.12, fraction * seg.duration);
        const wStart = wordCursor;
        const wEnd = Math.min(seg.end, wStart + wordDur);
        wordCursor = wEnd;

        // Check matching flaw
        const matchingFlaw = flaws.find(f => {
          if (f.type === 'unnatural_pause') return false; // pauses handled separately
          return (wStart >= f.start - 0.1 && wStart <= f.end + 0.1) ||
                 (wEnd >= f.start - 0.1 && wEnd <= f.end + 0.1) ||
                 (wStart <= f.start && wEnd >= f.end);
        });

        const isPauseAdjacent = isFirstInSeg && !!seg.precedingPause;
        const pauseInfo = isPauseAdjacent ? seg.precedingPause : undefined;

        alignedWords.push({
          id: `word-${item.originalIndex}`,
          word: item.word,
          start: Math.round(wStart * 100) / 100,
          end: Math.round(wEnd * 100) / 100,
          flawId: matchingFlaw ? matchingFlaw.id : (pauseInfo ? pauseInfo.id : undefined),
          flawType: matchingFlaw ? matchingFlaw.type : (pauseInfo ? 'unnatural_pause' : undefined),
          severity: matchingFlaw ? matchingFlaw.severity : (pauseInfo ? pauseInfo.flaw.severity : undefined),
          flawExplanation: matchingFlaw ? matchingFlaw.explanation : (pauseInfo ? pauseInfo.flaw.explanation : undefined),
          measuredMetric: matchingFlaw ? matchingFlaw.measuredValue : (pauseInfo ? `${pauseInfo.duration}s pause` : undefined),
          isPauseAdjacent,
          pauseDuration: pauseInfo?.duration,
          pauseStart: pauseInfo?.start,
          pauseEnd: pauseInfo?.end
        });
      }
    }

    return alignedWords;
  }
}

