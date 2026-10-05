import React, { useState, useRef, useEffect } from 'react';
import { 
  Square, RotateCcw, AlertCircle, 
  Play, Pause, Languages, 
  ArrowRight, Edit3, Mic, MicOff, Sparkles, Smartphone
} from 'lucide-react';
import { Clay3DIcon } from './Clay3DIcon';
import { liveRecorderInstance } from '../services/liveRecorder';
import { speechRecInstance } from '../services/speechRecognition';
import { AudioAnalyzer } from '../services/audioAnalyzer';

interface LiveRecorderStudioProps {
  onRecordingComplete: (blob: Blob, liveTranscript: string) => void;
  isAnalyzing: boolean;
}

export const LiveRecorderStudio: React.FC<LiveRecorderStudioProps> = ({
  onRecordingComplete,
  isAnalyzing
}) => {
  // Studio stage: 'idle' | 'recording' | 'review'
  const [stage, setStage] = useState<'idle' | 'recording' | 'review'>('idle');
  const [recordTime, setRecordTime] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [interimWord, setInterimWord] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Review stage state
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedDuration, setRecordedDuration] = useState(0);
  const [editableTranscript, setEditableTranscript] = useState('');
  const [previewAudioUrl, setPreviewAudioUrl] = useState<string | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [isDictating, setIsDictating] = useState(false);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // Speech recognition language
  const [selectedLanguage, setSelectedLanguage] = useState<'en-IN' | 'hi-IN' | 'en-US'>('en-IN');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  const isMobileDevice = typeof navigator !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isSttSupported = liveRecorderInstance.isSpeechRecognitionAvailable();

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const tenths = Math.floor((seconds % 1) * 10);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${tenths}`;
  };

  // Start live microphone frequency visualizer
  const drawLiveVisualizer = () => {
    const canvas = canvasRef.current;
    const analyser = liveRecorderInstance.getAnalyserNode();
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      analyser.getByteFrequencyData(dataArray);

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);

      const width = rect.width;
      const height = rect.height;

      ctx.clearRect(0, 0, width, height);

      // Draw subtle refined audio spectrum bars
      const numBars = 36;
      const barWidth = 4;
      const gap = (width - numBars * barWidth) / (numBars - 1);

      for (let i = 0; i < numBars; i++) {
        const dataIdx = Math.floor((i / numBars) * bufferLength * 0.7);
        const value = dataArray[dataIdx] || 0;
        const barHeight = Math.max(4, (value / 255) * (height - 12));
        const x = i * (barWidth + gap);
        const y = (height - barHeight) / 2;

        ctx.fillStyle = '#7C3AED'; // Violet spectrum bars
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();
  };

  const handleStart = async () => {
    setErrorMessage(null);
    setLiveTranscript('');
    setInterimWord('');
    setRecordTime(0);

    const started = await liveRecorderInstance.startRecording({
      lang: selectedLanguage,
      onTimeUpdate: (secs) => {
        setRecordTime(secs);
      },
      onTranscriptUpdate: (interim, final) => {
        setInterimWord(interim);
        setLiveTranscript(final);
      },
      onError: (err) => {
        setErrorMessage(err);
        setStage('idle');
      }
    });

    if (started) {
      setStage('recording');
      setTimeout(() => {
        drawLiveVisualizer();
      }, 100);
    }
  };

  const handleStop = async () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    const { blob, transcript, duration } = await liveRecorderInstance.stopRecording();

    if (blob && blob.size > 0) {
      setRecordedBlob(blob);
      setRecordedDuration(duration);
      const capturedWords = (transcript || liveTranscript).trim();
      // Provide default intelligent cadence transcript if no words captured yet
      const initialWords = capturedWords || AudioAnalyzer.generateFallbackTranscript(duration || 5);
      setEditableTranscript(initialWords);

      // Create preview audio URL
      if (previewAudioUrl) {
        URL.revokeObjectURL(previewAudioUrl);
      }
      const audioUrl = URL.createObjectURL(blob);
      setPreviewAudioUrl(audioUrl);

      setStage('review');
    } else {
      setErrorMessage('No audio recorded. Please speak into your microphone and try again.');
      setStage('idle');
    }
  };

  const handleToggleDictation = () => {
    if (isDictating) {
      speechRecInstance.stopListening();
      setIsDictating(false);
      return;
    }

    const started = speechRecInstance.startListening(
      (text) => {
        if (text) {
          setEditableTranscript(text);
        }
      },
      (errMsg) => {
        setErrorMessage(errMsg);
        setIsDictating(false);
      },
      () => {
        setIsDictating(false);
      },
      selectedLanguage
    );

    if (started) {
      setIsDictating(true);
    }
  };

  const handleAutoFillCadence = () => {
    const fallback = AudioAnalyzer.generateFallbackTranscript(recordedDuration || 5);
    setEditableTranscript(fallback);
  };

  const handleCancel = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    speechRecInstance.stopListening();
    setIsDictating(false);
    liveRecorderInstance.cancelRecording();
    setStage('idle');
    setRecordTime(0);
    setLiveTranscript('');
    setInterimWord('');
  };

  const handleTogglePreviewAudio = () => {
    if (!previewAudioRef.current) return;
    if (isPlayingPreview) {
      previewAudioRef.current.pause();
      setIsPlayingPreview(false);
    } else {
      previewAudioRef.current.play().then(() => {
        setIsPlayingPreview(true);
      }).catch(() => {
        setIsPlayingPreview(false);
      });
    }
  };

  const handleConfirmAndAnalyze = () => {
    if (!recordedBlob) return;
    speechRecInstance.stopListening();
    setIsDictating(false);
    onRecordingComplete(recordedBlob, editableTranscript.trim());
  };

  const handleReRecord = () => {
    speechRecInstance.stopListening();
    setIsDictating(false);
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
    }
    if (previewAudioUrl) {
      URL.revokeObjectURL(previewAudioUrl);
      setPreviewAudioUrl(null);
    }
    setIsPlayingPreview(false);
    setRecordedBlob(null);
    setEditableTranscript('');
    setStage('idle');
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      speechRecInstance.stopListening();
      liveRecorderInstance.cancelRecording();
      if (previewAudioUrl) {
        URL.revokeObjectURL(previewAudioUrl);
      }
    };
  }, [previewAudioUrl]);

  return (
    <div className="w-full card-clay card-clay-violet p-7 sm:p-8 rounded-3xl relative overflow-hidden space-y-6">
      <div className="relative z-10 space-y-6">
        {/* Corner Badge */}
        <div className="absolute top-0 right-0 hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-violet-100/90 border border-violet-200 text-violet-800 text-xs font-bold shadow-clay-pill">
        <Clay3DIcon name="sparkles" size="xs" />
        <span>Live Speech Diagnostics</span>
      </div>

      {/* Header Info */}
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <Clay3DIcon name="mic" size="sm" floating />
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-heading tracking-tight">
            {stage === 'review' ? 'Verify Spoken Words' : 'Record Your Speech Live'}
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          {stage === 'review'
            ? 'Verify what was spoken in your audio so words are accurately grounded with millisecond flaw intervals.'
            : 'Deliver your speech live into the mic. Speech recognition captures spoken words while DSP analyzes temporal flaws.'}
        </p>
      </div>

      {/* Error Message Alert */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-pink-50 border border-pink-200 text-pink-900 text-xs font-medium flex items-start gap-3 shadow-clay-pill">
          <AlertCircle className="w-5 h-5 text-pink-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-sm mb-0.5">Microphone Notice</p>
            <p>{errorMessage}</p>
          </div>
          <button onClick={() => setErrorMessage(null)} className="underline text-xs font-bold text-pink-700">Dismiss</button>
        </div>
      )}

      {/* STAGE 1: ACTIVE RECORDING */}
      {stage === 'recording' && (
        <div className="space-y-5 animate-pop-in">
          {/* Live Waveform & Timer Banner */}
          <div className="clay-inset-well p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              {/* Blinking REC indicator */}
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 border border-slate-200 shadow-clay-pill">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800">Recording Live</span>
              </div>

              {/* Timer */}
              <div className="font-mono text-2xl sm:text-3xl font-black text-violet-700 bg-white px-4 py-1 rounded-full border border-slate-200 shadow-clay-pill">
                {formatTimer(recordTime)}
              </div>
            </div>

            {/* Live Audio Frequency Visualizer Canvas */}
            <div className="h-28 w-full bg-white/90 rounded-2xl border border-slate-200/90 flex items-center justify-center overflow-hidden p-2 shadow-inner">
              <canvas
                ref={canvasRef}
                className="w-full h-full block"
              />
            </div>

            {/* Live Real-Time Speech Recognition Words Preview */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 text-xs leading-relaxed min-h-[55px] shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {isMobileDevice ? 'Mobile Audio Capture Mode:' : 'Live Speech Recognition Preview:'}
                </span>
                {isMobileDevice && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full border border-violet-200">
                    <Smartphone className="w-3 h-3" />
                    Clean Mobile DSP
                  </span>
                )}
              </div>
              <p className="text-slate-800 font-medium">
                {liveTranscript || interimWord ? (
                  <span>
                    {liveTranscript}
                    <span className="text-violet-600 font-semibold italic ml-1">{interimWord}</span>
                  </span>
                ) : isMobileDevice ? (
                  <span className="text-slate-500 italic flex items-center gap-1.5">
                    <Clay3DIcon name="notes" size="xs" />
                    Recording audio waveform cleanly. Dictate or auto-align words right in the next review step.
                  </span>
                ) : (
                  <span className="text-slate-400 italic flex items-center gap-1.5">
                    <Clay3DIcon name="mic" size="xs" />
                    Listening to your voice... Speak clearly into your mic.
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Stop & Cancel Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleStop}
              disabled={isAnalyzing}
              className="px-8 py-3.5 rounded-2xl font-bold text-white bg-gradient-to-b from-rose-500 to-rose-600 shadow-sugary-pink flex items-center gap-2.5 transition-all hover:scale-[1.02] active:scale-95 active:translate-y-1 relative overflow-hidden"
            >
              <div className="absolute top-1 left-2 right-2 h-1/3 bg-gradient-to-b from-white/30 to-transparent rounded-full pointer-events-none" />
              <Square className="w-4 h-4 fill-current relative z-10" />
              <span className="relative z-10">Stop Recording & Review</span>
            </button>

            <button
              onClick={handleCancel}
              className="btn-clay-secondary px-5 py-3.5 text-xs font-semibold flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      )}

      {/* STAGE 2: REVIEW & CONFIRM SPOKEN WORDS (Guarantees what is spoken appears!) */}
      {stage === 'review' && (
        <div className="space-y-5 animate-pop-in">
          {/* Audio Playback & Duration Pill */}
          <div className="card-clay p-4 sm:p-5 rounded-2xl border border-white/90 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={handleTogglePreviewAudio}
                className="w-12 h-12 rounded-2xl bg-gradient-to-b from-violet-500 to-violet-600 text-white flex items-center justify-center shadow-sugary-violet transition-all active:scale-95 relative overflow-hidden"
                title={isPlayingPreview ? 'Pause audio preview' : 'Play recorded audio preview'}
              >
                <div className="absolute top-1 left-2 right-2 h-1/3 bg-gradient-to-b from-white/30 to-transparent rounded-full pointer-events-none" />
                {isPlayingPreview ? (
                  <Pause className="w-5 h-5 fill-current relative z-10" />
                ) : (
                  <Play className="w-5 h-5 fill-current ml-0.5 relative z-10" />
                )}
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <Clay3DIcon name="tick" size="xs" />
                  <span className="text-sm font-bold text-slate-900">Audio Captured Successfully</span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Duration: {recordedDuration.toFixed(1)} seconds • Click play to preview your voice
                </p>
              </div>
            </div>

            {previewAudioUrl && (
              <audio
                ref={previewAudioRef}
                src={previewAudioUrl}
                onEnded={() => setIsPlayingPreview(false)}
                className="hidden"
              />
            )}

            <button
              onClick={handleReRecord}
              className="btn-clay-secondary px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Re-record</span>
            </button>
          </div>

          {/* Transcript Verification Card */}
          <div className="clay-inset-well p-5 rounded-2xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Edit3 className="w-3.5 h-3.5 text-violet-600" />
                Spoken Words (Transcript Grounding)
              </label>

              <div className="flex flex-wrap items-center gap-2">
                {isSttSupported && (
                  <button
                    type="button"
                    onClick={handleToggleDictation}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                      isDictating
                        ? 'bg-rose-500 text-white animate-pulse shadow-sugary-pink'
                        : 'bg-white text-violet-700 border border-violet-200 hover:bg-violet-50 shadow-clay-pill'
                    }`}
                    title={isDictating ? 'Click to finish voice input' : 'Dictate your words using microphone'}
                  >
                    {isDictating ? (
                      <>
                        <MicOff className="w-3.5 h-3.5 text-white" />
                        <span>Listening... (Tap to Finish)</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-3.5 h-3.5 text-violet-600" />
                        <span>🎙️ Dictate Words</span>
                      </>
                    )}
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleAutoFillCadence}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-clay-pill flex items-center gap-1.5"
                  title="Auto-fill words matching speech rhythm"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Auto-Cadence</span>
                </button>

                <span className="text-[11px] text-slate-500 font-semibold bg-white/80 px-2.5 py-1 rounded-full border border-slate-200">
                  {editableTranscript.trim().split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-500 font-normal">
              Review or adjust what was transcribed from your audio. Every word will be synchronized with millisecond flaw grounding and acoustic feedback:
            </p>

            <textarea
              rows={4}
              value={editableTranscript}
              onChange={(e) => setEditableTranscript(e.target.value)}
              placeholder="Spoken words for flaw grounding. You can type here, tap '🎙️ Dictate Words', or click 'Auto-Cadence'..."
              className="w-full p-4 rounded-2xl border border-slate-200/90 bg-white/95 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-violet-400 shadow-inner leading-relaxed"
            />

            {isMobileDevice && (
              <div className="p-3 rounded-xl bg-violet-50/80 border border-violet-200/80 text-violet-900 text-[11px] flex items-center gap-2 shadow-sm">
                <Smartphone className="w-4 h-4 text-violet-600 shrink-0" />
                <span>
                  <strong>Mobile Voice Sync:</strong> Microphone is now unlocked! Tap <strong>"🎙️ Dictate Words"</strong> to speak what you said, or analyze using the auto-cadence words.
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-end gap-3 pt-1">
            <button
              onClick={handleReRecord}
              className="btn-clay-secondary px-5 py-3 text-xs font-semibold"
            >
              Discard & Re-record
            </button>

            <button
              onClick={handleConfirmAndAnalyze}
              disabled={isAnalyzing}
              className="btn-clay-primary px-8 py-3 text-sm font-bold flex items-center gap-2.5"
            >
              <span>Analyze Speech & Ground Flaws</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STAGE 3: IDLE / READY TO RECORD */}
      {stage === 'idle' && (
        <div className="clay-inset-well p-8 sm:p-12 rounded-3xl flex flex-col items-center justify-center text-center space-y-6">
          <Clay3DIcon
            name="mic"
            size="2xl"
            floating
            withPedestal
          />

          <div className="space-y-1.5">
            <h4 className="text-xl sm:text-2xl font-black text-slate-900 font-heading tracking-tight">
              Ready to record your speech?
            </h4>
            <p className="text-xs sm:text-sm text-slate-500 font-normal max-w-md">
              Speak naturally into your microphone. Our browser DSP pipeline extracts pacing, unnatural pauses, mumbling, and pitch variations.
            </p>
          </div>

          {/* Language Selection Pills */}
          <div className="flex flex-col items-center gap-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Languages className="w-3.5 h-3.5 text-violet-600" />
              Speech Recognition Language:
            </span>
            <div className="inline-flex p-1 rounded-2xl bg-white border border-slate-200/90 shadow-clay-pill gap-1">
              <button
                type="button"
                onClick={() => setSelectedLanguage('en-IN')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedLanguage === 'en-IN'
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sugary-violet'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                🇮🇳 English (India)
              </button>
              <button
                type="button"
                onClick={() => setSelectedLanguage('hi-IN')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedLanguage === 'hi-IN'
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sugary-violet'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                🇮🇳 Hindi (हिंदी)
              </button>
              <button
                type="button"
                onClick={() => setSelectedLanguage('en-US')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedLanguage === 'en-US'
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sugary-violet'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                🇺🇸 English (US)
              </button>
            </div>
            {!isSttSupported && (
              <span className="text-[11px] text-amber-600 italic">
                (Browser note: Web Speech API is best supported in Chrome / Edge. You can also edit/enter words right after recording!)
              </span>
            )}
          </div>

          <button
            onClick={handleStart}
            disabled={isAnalyzing}
            className="btn-clay-primary px-9 py-4 text-sm sm:text-base font-black flex items-center gap-3"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-pulse"></span>
            <span>Start Live Recording</span>
          </button>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 pt-1">
            <span className="flex items-center gap-1.5 font-medium">
              <Clay3DIcon name="speaker" size="xs" />
              Real Acoustic Measurements
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 font-medium">
              <Clay3DIcon name="tick" size="xs" />
              100% Client-Side Private
            </span>
            <span>•</span>
            <span className="font-medium">Zero Audio Upload to External Servers</span>
          </div>
        </div>
      )}

      </div>

    </div>
  );
};
