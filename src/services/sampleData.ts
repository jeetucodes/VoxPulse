import type { SampleSpeech, TimeSeriesPoint, FlawType } from '../types/speech';

export const SAMPLE_SPEECHES: SampleSpeech[] = [
  {
    id: 'sample-persuasive-fast',
    title: 'Persuasive Oratory: Rapid Cadence & Staccato Flaws',
    category: 'Persuasive Oratory',
    description: 'High-energy debate speech where the speaker accelerates excessively during emotional appeals, losing clarity between 00:03–00:07.',
    durationSec: 16.0,
    transcriptText: 'Judges and audience, let us examine the compelling evidence before us today. When we analyze historical civic progress, we realize that transformative breakthroughs do not arise by chance. They require decisive leadership, resilience, and unshakeable conviction. However, when delivery accelerates excessively or hesitates into prolonged silences, the clarity of the core message dissolves. By calibrating our vocal cadence and commanding every syllable, we guarantee that our rhetoric inspires action and leaves an unforgettable impact.',
    synthTonePattern: {
      baseFreq: 155,
      speedFactor: 1.35,
      pauseIntervals: [[9.2, 10.1]],
      fastIntervals: [[3.0, 7.0], [12.2, 14.8]],
      mumbleIntervals: []
    },
    precomputedResult: {
      overall_score: 72,
      duration: 16.0,
      breakdown: {
        fluency: 78,
        pacing: 62,
        articulation: 84,
        pitchDynamics: 74
      },
      flaws: [
        {
          id: 'flaw-1',
          type: 'fast_speech',
          start: 3.0,
          end: 7.0,
          severity: 'high',
          explanation: 'You spoke at about 190 words per minute here, much faster than the recommended baseline of 130 WPM.',
          improvement: 'Slow down slightly at clause transitions and add a short pause after each major premise so the adjudicator can absorb your argument.',
          measuredValue: '192 WPM',
          baselineValue: '130 WPM',
          drillSteps: [
            'Practice reading your script with a metronome set to 125 beats per minute.',
            'Insert physical forward-slash marks (/) on your competition notes where you must take a deliberate micro-pause.',
            'Stretch your vowel sounds in stressed nouns (e.g., "ev-i-dence", "lead-er-ship").'
          ]
        },
        {
          id: 'flaw-2',
          type: 'unnatural_pause',
          start: 9.2,
          end: 10.4,
          severity: 'medium',
          explanation: 'Detected a 1.2-second dead-air silence mid-sentence, interrupting syntactic flow.',
          improvement: 'Use deliberate bridging vocal cues or smooth transitions instead of freezing between arguments.',
          measuredValue: '1.2s pause',
          baselineValue: '0.4s – 0.5s',
          drillSteps: [
            'Prepare bridge idioms like "Furthermore," or "To contextualize this," to fill cognitive recall gaps smoothly.',
            'Keep your vocal folds softly engaged rather than completely shutting down airflow.'
          ]
        },
        {
          id: 'flaw-3',
          type: 'fast_speech',
          start: 12.2,
          end: 14.8,
          severity: 'medium',
          explanation: 'Speaking rate spiked to 178 WPM during your concluding call-to-action.',
          improvement: 'A conclusion should decelerate for emotional gravitas rather than rushing through the final sentences.',
          measuredValue: '178 WPM',
          baselineValue: '128 WPM',
          drillSteps: [
            'Decelerate by 20% on the final 10 words of your speech.',
            'Anchor your physical posture before delivering the ultimate punchline.'
          ]
        }
      ],
      timeSeries: generateMockTimeSeries(16.0, [
        { start: 3.0, end: 7.0, type: 'fast_speech' },
        { start: 9.2, end: 10.4, type: 'unnatural_pause' },
        { start: 12.2, end: 14.8, type: 'fast_speech' }
      ]),
      audioBaselineSummary: {
        avgWpm: 132,
        pauseRatio: 0.10,
        pitchRangeHz: 110,
        medianRms: 0.55
      },
      participantSummary: {
        avgWpm: 168,
        pauseRatio: 0.16,
        pitchRangeHz: 135,
        medianRms: 0.62
      }
    }
  },
  {
    id: 'sample-extempore-pauses',
    title: 'Extempore Defense: Hesitation & Dead-Air Silences',
    category: 'Extempore',
    description: 'An extempore speech where mental search pauses create dead air gaps between 00:05–00:08 and 00:11–00:13.',
    durationSec: 15.0,
    transcriptText: 'In addressing the prompt assigned today, we must first establish the economic ramifications. If developing countries prioritize heavy industrial subsidies without green technology transfers... there is an inevitable dilemma. The short-term growth masks systemic vulnerabilities. Therefore, our proposal balances progressive fiscal intervention with sustainable infrastructure renewal.',
    synthTonePattern: {
      baseFreq: 140,
      speedFactor: 1.0,
      pauseIntervals: [[5.2, 7.6], [10.8, 12.4]],
      fastIntervals: [],
      mumbleIntervals: []
    },
    precomputedResult: {
      overall_score: 66,
      duration: 15.0,
      breakdown: {
        fluency: 52,
        pacing: 70,
        articulation: 82,
        pitchDynamics: 68
      },
      flaws: [
        {
          id: 'flaw-pause-1',
          type: 'unnatural_pause',
          start: 5.2,
          end: 7.6,
          severity: 'high',
          explanation: 'Severe 2.4-second dead-air silence recorded. In extempore judging, pauses above 1.5s signal hesitation and loss of composure.',
          improvement: 'Avoid abrupt silence when searching for words. Maintain steady gaze and use rhetorical signposts like "What this demonstrates is..."',
          measuredValue: '2.4s silence',
          baselineValue: '0.4s standard',
          drillSteps: [
            'Practice continuous extempore speaking against a 5-second silence penalty timer.',
            'Develop a standard three-point outline framework (Problem, Consequence, Remedy) so you never lose the structural path.'
          ]
        },
        {
          id: 'flaw-pause-2',
          type: 'unnatural_pause',
          start: 10.8,
          end: 12.4,
          severity: 'medium',
          explanation: 'Secondary 1.6-second interruption before articulating your policy proposal.',
          improvement: 'Use a vocal glide or deliberate rhetorical gesture to bridge the gap into your proposal.',
          measuredValue: '1.6s silence',
          baselineValue: '0.5s',
          drillSteps: [
            'Anchor transitions with hand gestures that begin before your vocal cords re-engage.'
          ]
        }
      ],
      timeSeries: generateMockTimeSeries(15.0, [
        { start: 5.2, end: 7.6, type: 'unnatural_pause' },
        { start: 10.8, end: 12.4, type: 'unnatural_pause' }
      ]),
      audioBaselineSummary: {
        avgWpm: 130,
        pauseRatio: 0.08,
        pitchRangeHz: 115,
        medianRms: 0.52
      },
      participantSummary: {
        avgWpm: 118,
        pauseRatio: 0.28,
        pitchRangeHz: 95,
        medianRms: 0.48
      }
    }
  },
  {
    id: 'sample-declamation-mumble',
    title: 'Declamation Final: Low Projection & Mumbling',
    category: 'Declamation',
    description: 'Vocal projection drops sharply in key analytical passages, resulting in muffled consonants and low spectral clarity.',
    durationSec: 15.0,
    transcriptText: 'We stand at the precipice of a constitutional reckoning. When our founders drafted the separation of powers, they anticipated human ambition would safeguard institutional integrity. Yet today, civic apathy and cynical rhetoric erode these foundational defenses from within.',
    synthTonePattern: {
      baseFreq: 130,
      speedFactor: 1.1,
      pauseIntervals: [[8.5, 9.4]],
      fastIntervals: [],
      mumbleIntervals: [[4.0, 7.8]]
    },
    precomputedResult: {
      overall_score: 64,
      duration: 15.0,
      breakdown: {
        fluency: 74,
        pacing: 78,
        articulation: 48,
        pitchDynamics: 58
      },
      flaws: [
        {
          id: 'flaw-mumble-1',
          type: 'mumbling',
          start: 4.0,
          end: 7.8,
          severity: 'high',
          explanation: 'Energy dropped 62% below median with low high-frequency harmonic energy, obscuring word endings and dental consonants.',
          improvement: 'Elevate diaphragm pressure to sustain decibel volume through phrase endings. Pronounce terminal consonants crisp and distinct.',
          measuredValue: 'Low acoustic energy & low spectral dispersion',
          baselineValue: 'Distinct consonant formants',
          drillSteps: [
            'Practice vocal projection reciting 20 feet away from a wall and ensuring echo clarity.',
            'Bite on a clean wine cork or pen crosswise while reciting your text for 90 seconds to train tongue and jaw muscle memory.'
          ]
        },
        {
          id: 'flaw-pause-3',
          type: 'unnatural_pause',
          start: 8.5,
          end: 9.4,
          severity: 'low',
          explanation: 'Minor 0.9s hesitation following the muffled passage.',
          improvement: 'Keep vocal energy continuous as you transition into your next sentence.',
          measuredValue: '0.9s pause',
          baselineValue: '0.4s',
          drillSteps: ['Practice breath cycling without vocal glottal stopping.']
        }
      ],
      timeSeries: generateMockTimeSeries(15.0, [
        { start: 4.0, end: 7.8, type: 'mumbling' },
        { start: 8.5, end: 9.4, type: 'unnatural_pause' }
      ]),
      audioBaselineSummary: {
        avgWpm: 135,
        pauseRatio: 0.10,
        pitchRangeHz: 125,
        medianRms: 0.60
      },
      participantSummary: {
        avgWpm: 138,
        pauseRatio: 0.14,
        pitchRangeHz: 82,
        medianRms: 0.32
      }
    }
  },
  {
    id: 'sample-baseline-ideal',
    title: 'National Champion Benchmark (Ideal Baseline)',
    category: 'Benchmark Baseline',
    description: 'Gold-standard declamation performance exhibiting controlled cadence (132 WPM), resonant projection, and purposeful rhetorical pauses.',
    durationSec: 15.0,
    transcriptText: 'To those who question our resolve, we respond with unequivocal clarity. The history of liberty is not written by observers; it is forged by those willing to challenge apathy, articulate truth, and champion dignity in every hall of debate.',
    synthTonePattern: {
      baseFreq: 145,
      speedFactor: 1.0,
      pauseIntervals: [[4.2, 4.6], [9.4, 9.8]],
      fastIntervals: [],
      mumbleIntervals: []
    },
    precomputedResult: {
      overall_score: 95,
      duration: 15.0,
      breakdown: {
        fluency: 96,
        pacing: 95,
        articulation: 94,
        pitchDynamics: 94
      },
      flaws: [],
      timeSeries: generateMockTimeSeries(15.0, []),
      audioBaselineSummary: {
        avgWpm: 132,
        pauseRatio: 0.08,
        pitchRangeHz: 140,
        medianRms: 0.65
      },
      participantSummary: {
        avgWpm: 132,
        pauseRatio: 0.08,
        pitchRangeHz: 140,
        medianRms: 0.65
      }
    }
  }
];

function generateMockTimeSeries(
  duration: number,
  flawIntervals: { start: number; end: number; type: FlawType }[]
): TimeSeriesPoint[] {
  const points: TimeSeriesPoint[] = [];
  const total = Math.floor(duration * 10);
  for (let i = 0; i < total; i++) {
    const t = (i / total) * duration;
    const active = flawIntervals.find(f => t >= f.start && t <= f.end);

    let pRate = 132 + 10 * Math.sin(t * 0.9);
    let pEnergy = 0.58 + 0.22 * Math.sin(t * 1.4) * Math.cos(t * 0.8);
    let pPitch = 150 + 25 * Math.sin(t * 1.1);

    if (active?.type === 'fast_speech') {
      pRate = 192 + 15 * Math.sin(t * 3);
      pEnergy = 0.75 + 0.15 * Math.sin(t * 2);
    } else if (active?.type === 'unnatural_pause') {
      pRate = 15;
      pEnergy = 0.01;
      pPitch = 0;
    } else if (active?.type === 'mumbling') {
      pRate = 130;
      pEnergy = 0.18;
      pPitch = 110 + 5 * Math.sin(t);
    }

    const baseRate = 132 + 8 * Math.sin(t * 0.5);
    const baseEnergy = 0.56 + 0.24 * Math.sin(t * 1.5) * Math.cos(t * 0.7);
    const basePitch = 145 + 30 * Math.sin(t * 0.8);

    points.push({
      timestamp: Math.round(t * 10) / 10,
      participantEnergy: Math.max(0, Math.min(1, Math.round(pEnergy * 100) / 100)),
      baselineEnergy: Math.max(0, Math.min(1, Math.round(baseEnergy * 100) / 100)),
      participantPitch: Math.round(pPitch),
      baselinePitch: Math.round(basePitch),
      participantRate: Math.round(pRate),
      baselineRate: Math.round(baseRate),
      activeFlawType: active?.type
    });
  }
  return points;
}

export function generateSyntheticSpeechAudio(
  synthPattern: SampleSpeech['synthTonePattern'],
  duration: number
): AudioBuffer {
  const sampleRate = 44100;
  const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  const buffer = audioContext.createBuffer(1, Math.floor(sampleRate * duration), sampleRate);
  const data = buffer.getChannelData(0);

  const { baseFreq, pauseIntervals, fastIntervals, mumbleIntervals } = synthPattern;

  for (let i = 0; i < data.length; i++) {
    const t = i / sampleRate;

    const isPaused = pauseIntervals.some(([s, e]) => t >= s && t <= e);
    if (isPaused) {
      data[i] = (Math.random() - 0.5) * 0.002;
      continue;
    }

    const isFast = fastIntervals.some(([s, e]) => t >= s && t <= e);
    const isMumble = mumbleIntervals.some(([s, e]) => t >= s && t <= e);

    const rhythmFreq = isFast ? 6.2 : 3.8;
    const syllableEnvelope = Math.max(0, Math.sin(2 * Math.PI * rhythmFreq * t));

    const f0 = baseFreq + 20 * Math.sin(2 * Math.PI * 1.2 * t);
    const h1 = Math.sin(2 * Math.PI * f0 * t);
    const h2 = 0.5 * Math.sin(2 * Math.PI * f0 * 2 * t);
    const h3 = 0.25 * Math.sin(2 * Math.PI * f0 * 3 * t);

    const consonantNoise = Math.sin(2 * Math.PI * rhythmFreq * t) > 0.85 ? (Math.random() - 0.5) * 0.35 : 0;

    let sample = (h1 + h2 + h3 + consonantNoise) * syllableEnvelope * 0.28;

    if (isMumble) {
      sample = sample * 0.25;
    }

    data[i] = sample;
  }

  return buffer;
}
