import { useState, useRef, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { AudioUploader } from './components/AudioUploader';
import { AudioPlayer } from './components/AudioPlayer';
import { ScoreOverview } from './components/ScoreOverview';
import { FlawCards } from './components/FlawCards';
import { TimeSeriesChart } from './components/TimeSeriesChart';
import { TranscriptView } from './components/TranscriptView';
import { AskForHelp } from './components/AskForHelp';
import { JsonModal } from './components/JsonModal';
import { Clay3DIcon } from './components/Clay3DIcon';
import { AudioAnalyzer } from './services/audioAnalyzer';
import { SAMPLE_SPEECHES, generateSyntheticSpeechAudio } from './services/sampleData';
import type { AnalysisResult, SampleSpeech } from './types/speech';

export function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'studio'>('landing');
  const [uploaderInitialTab, setUploaderInitialTab] = useState<'record' | 'upload' | 'presets'>('record');

  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [activeSampleTitle, setActiveSampleTitle] = useState<string>('');
  
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [activeFlawId, setActiveFlawId] = useState<string | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisProgress, setAnalysisProgress] = useState<number>(0);
  const [analysisStage, setAnalysisStage] = useState<string>('');

  const [isJsonModalOpen, setIsJsonModalOpen] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const startOffsetRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);

  const updatePlayhead = useCallback(() => {
    if (!audioContextRef.current || !isPlaying) return;
    const now = audioContextRef.current.currentTime;
    const elapsed = now - startTimeRef.current + startOffsetRef.current;

    if (elapsed >= duration) {
      setCurrentTime(duration);
      setIsPlaying(false);
      startOffsetRef.current = 0;
      if (sourceNodeRef.current) {
        try { sourceNodeRef.current.stop(); } catch { /* ignore */ }
        sourceNodeRef.current = null;
      }
      return;
    }

    setCurrentTime(elapsed);
    animationFrameRef.current = requestAnimationFrame(updatePlayhead);
  }, [isPlaying, duration]);

  useEffect(() => {
    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(updatePlayhead);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, updatePlayhead]);

  const handlePlay = useCallback(() => {
    if (!audioBuffer) return;
    const ctx = getAudioContext();

    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.stop(); } catch { /* ignore */ }
    }

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);

    const offset = currentTime >= duration ? 0 : currentTime;
    source.start(0, offset);

    sourceNodeRef.current = source;
    startTimeRef.current = ctx.currentTime;
    startOffsetRef.current = offset;
    setIsPlaying(true);
  }, [audioBuffer, currentTime, duration, getAudioContext]);

  const handlePause = useCallback(() => {
    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.stop(); } catch { /* ignore */ }
      sourceNodeRef.current = null;
    }
    startOffsetRef.current = currentTime;
    setIsPlaying(false);
  }, [currentTime]);

  const handleSeek = useCallback((targetTime: number) => {
    const clamped = Math.max(0, Math.min(duration, targetTime));
    const wasPlaying = isPlaying;

    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.stop(); } catch { /* ignore */ }
      sourceNodeRef.current = null;
    }

    setCurrentTime(clamped);
    startOffsetRef.current = clamped;

    if (wasPlaying && audioBuffer) {
      const ctx = getAudioContext();
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.start(0, clamped);
      sourceNodeRef.current = source;
      startTimeRef.current = ctx.currentTime;
      setIsPlaying(true);
    }
  }, [duration, isPlaying, audioBuffer, getAudioContext]);

  const handlePlaySegment = useCallback((start: number, _end: number, flawId: string) => {
    setActiveFlawId(flawId);
    handleSeek(start);
    handlePlay();
  }, [handleSeek, handlePlay]);

  const handleSelectSample = (sample: SampleSpeech) => {
    handlePause();
    setActiveSampleTitle(sample.title);

    const buffer = generateSyntheticSpeechAudio(sample.synthTonePattern, sample.durationSec);
    setAudioBuffer(buffer);
    setDuration(sample.durationSec);
    setCurrentTime(0);
    startOffsetRef.current = 0;

    const resultWithTranscript: AnalysisResult = {
      ...sample.precomputedResult,
      transcript: AudioAnalyzer.generateTranscriptAlignment(
        sample.transcriptText,
        sample.durationSec,
        sample.precomputedResult.flaws
      )
    };

    setAnalysisResult(resultWithTranscript);
  };

  const handleUploadFile = async (file: File | Blob, transcript?: string) => {
    handlePause();
    setAnalysisError(null);
    setIsAnalyzing(true);
    setAnalysisProgress(5);
    setAnalysisStage('Loading audio into Web Audio API context...');
    const title = (file instanceof File && file.name) ? file.name : 'Live Microphone Recording';
    setActiveSampleTitle(title);

    try {
      const buffer = await AudioAnalyzer.decodeAudio(file);
      setAudioBuffer(buffer);
      setDuration(buffer.duration);
      setCurrentTime(0);
      startOffsetRef.current = 0;

      const result = AudioAnalyzer.analyzeAudioBuffer(
        buffer,
        transcript,
        (progress, stage) => {
          setAnalysisProgress(progress);
          setAnalysisStage(stage);
        }
      );

      setAnalysisResult(result);
    } catch (err: any) {
      setAnalysisError(err.message || 'Unable to decode audio format. Please try again.');
      setActiveSampleTitle('');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    handlePause();
    setAnalysisResult(null);
    setAudioBuffer(null);
    setActiveSampleTitle('');
    setCurrentTime(0);
    setDuration(0);
    setActiveFlawId(null);
  };

  const handleUpdateTranscript = (newTranscriptText: string) => {
    if (!analysisResult) return;
    const aligned = AudioAnalyzer.generateTranscriptAlignment(
      newTranscriptText,
      analysisResult.duration,
      analysisResult.flaws
    );
    setAnalysisResult({
      ...analysisResult,
      transcript: aligned
    });
  };

  const handleImportJson = (imported: any) => {
    if (analysisResult) {
      setAnalysisResult({
        ...analysisResult,
        overall_score: imported.overall_score || analysisResult.overall_score,
        flaws: imported.flaws || analysisResult.flaws
      });
    } else {
      const base = SAMPLE_SPEECHES[0].precomputedResult;
      setAnalysisResult({
        ...base,
        overall_score: imported.overall_score,
        flaws: imported.flaws
      });
      const buffer = generateSyntheticSpeechAudio(SAMPLE_SPEECHES[0].synthTonePattern, 16.0);
      setAudioBuffer(buffer);
      setDuration(16.0);
    }
  };

  const getPresetIcon = (category: string) => {
    switch (category) {
      case 'Persuasive Oratory':
        return <Clay3DIcon name="rocket" size="xs" />;
      case 'Extempore':
        return <Clay3DIcon name="clock" size="xs" />;
      case 'Declamation':
        return <Clay3DIcon name="target" size="xs" />;
      case 'Benchmark Baseline':
      default:
        return <Clay3DIcon name="trophy" size="xs" />;
    }
  };

  const handleGetStartedFromLanding = (preferredTab: 'record' | 'upload' | 'presets' = 'record') => {
    setUploaderInitialTab(preferredTab);
    setCurrentView('studio');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectBenchmarkFromLanding = (sample: SampleSpeech) => {
    setCurrentView('studio');
    handleSelectSample(sample);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-dot-pattern text-slate-900 flex flex-col font-body selection:bg-violet-600 selection:text-white relative overflow-hidden">
      
      {/* Subtle Ambient Glow Gradients (Modern Luxury SaaS) */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-violet-500/8 via-indigo-500/5 to-transparent blur-3xl -z-10 pointer-events-none animate-pulse-glow"></div>
      <div className="fixed top-1/3 right-10 w-[500px] h-[500px] rounded-full bg-gradient-to-bl from-pink-500/6 via-rose-500/4 to-transparent blur-3xl -z-10 pointer-events-none"></div>
      <div className="fixed bottom-10 left-10 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-emerald-500/6 via-teal-500/4 to-transparent blur-3xl -z-10 pointer-events-none"></div>

      {/* Top Header */}
      <Header
        currentView={currentView}
        onNavigateView={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onReset={handleReset}
        onOpenJsonModal={() => setIsJsonModalOpen(true)}
        activeSampleTitle={activeSampleTitle}
        hasAudio={!!audioBuffer}
        hasResult={!!analysisResult}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-5 sm:space-y-8">
        
        {currentView === 'landing' ? (
          <LandingPage
            onGetStarted={handleGetStartedFromLanding}
            onSelectBenchmark={handleSelectBenchmarkFromLanding}
            onOpenJsonModal={() => setIsJsonModalOpen(true)}
          />
        ) : (
          <>
            {/* Analysis error banner */}
            {analysisError && !analysisResult && (
              <div className="max-w-2xl mx-auto animate-pop-in">
                <div className="p-5 rounded-3xl bg-rose-50 border border-rose-200 shadow-clay-card flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center shrink-0 text-lg">⚠️</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-rose-900 text-sm mb-1">Analysis Failed</p>
                    <p className="text-xs text-rose-700 font-medium leading-relaxed">{analysisError}</p>
                  </div>
                  <button
                    onClick={() => setAnalysisError(null)}
                    className="shrink-0 text-xs font-bold text-rose-600 underline hover:text-rose-800"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {/* If no audio loaded, show uploader hero */}
            {!analysisResult && (
              <AudioUploader
                onSelectSample={handleSelectSample}
                onUploadFile={handleUploadFile}
                isAnalyzing={isAnalyzing}
                analysisProgress={analysisProgress}
                analysisStage={analysisStage}
                initialTab={uploaderInitialTab}
              />
            )}

        {/* Once audio is loaded & analyzed, show complete dashboard */}
        {analysisResult && (
          <div className="space-y-7 animate-pop-in">
            
            {/* Audio Waveform Player with Grounded Flaw Regions */}
            <section id="section-player" className="scroll-mt-20 sm:scroll-mt-24" aria-label="Audio Player">
              <AudioPlayer
                audioBuffer={audioBuffer}
                audioBlobUrl={null}
                currentTime={currentTime}
                duration={duration}
                isPlaying={isPlaying}
                flaws={analysisResult.flaws}
                activeFlawId={activeFlawId}
                onPlay={handlePlay}
                onPause={handlePause}
                onSeek={handleSeek}
              />
            </section>

            {/* Score Overview and Category Breakdown */}
            <section id="section-scores" className="scroll-mt-20 sm:scroll-mt-24" aria-label="Score Overview">
              <ScoreOverview result={analysisResult} />
            </section>

            {/* Time-Series Overlay Chart (Participant vs Baseline) */}
            <section id="section-chart" className="scroll-mt-20 sm:scroll-mt-24" aria-label="Time Series Chart">
              <TimeSeriesChart
                timeSeries={analysisResult.timeSeries}
                duration={duration}
                currentTime={currentTime}
                flaws={analysisResult.flaws}
                onSeek={handleSeek}
              />
            </section>

            {/* Two-Column Layout: Flaw Cards (Left) & Synchronized Transcript (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
              
              {/* Temporally Grounded Flaw Cards */}
              <div className="lg:col-span-6 min-w-0">
                <section id="section-flaws" className="scroll-mt-20 sm:scroll-mt-24 min-w-0" aria-label="Flaw Cards">
                  <FlawCards
                    flaws={analysisResult.flaws}
                    activeFlawId={activeFlawId}
                    onPlaySegment={handlePlaySegment}
                  />
                </section>
              </div>

              {/* Synchronized Transcript View (FR-9) */}
              <div className="lg:col-span-6 min-w-0">
                <section id="section-transcript" className="scroll-mt-20 sm:scroll-mt-24" aria-label="Transcript Grounding">
                  <TranscriptView
                    transcript={analysisResult.transcript || []}
                    currentTime={currentTime}
                    duration={duration}
                    onSeek={handleSeek}
                    activeFlawId={activeFlawId}
                    onPlaySegment={handlePlaySegment}
                    flaws={analysisResult.flaws}
                    onUpdateTranscript={handleUpdateTranscript}
                  />
                </section>
              </div>

            </div>


            {/* Change Speech / Try Another Sample Banner */}
            <div className="card-clay p-5 sm:p-6 rounded-3xl border border-white/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-semibold text-slate-700">
              <div className="flex items-center gap-3">
                <Clay3DIcon name="candy" size="sm" withPedestal floating />
                <div>
                  <span className="font-bold text-slate-900 block text-sm">
                    Want to test another speech sample?
                  </span>
                  <span className="text-slate-500 font-normal">
                    Switch benchmark test cases or upload a new custom recording.
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {SAMPLE_SPEECHES.map((s, idx) => {
                  const colors = [
                    'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sugary-violet scale-105',
                    'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-sugary-pink scale-105',
                    'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-sugary-amber scale-105',
                    'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sugary-emerald scale-105'
                  ];
                  const isActive = activeSampleTitle === s.title;

                  return (
                    <button
                      key={s.id}
                      onClick={() => handleSelectSample(s)}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-clay-pill ${
                        isActive
                          ? `${colors[idx % colors.length]}`
                          : 'bg-white text-slate-700 border border-slate-200/90 hover:bg-slate-50 hover:scale-[1.02]'
                      }`}
                    >
                      {getPresetIcon(s.category)}
                      <span>{s.category.split(' ')[0]}</span>
                    </button>
                  );
                })}
                <button
                  onClick={handleReset}
                  className="btn-clay-secondary flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold"
                >
                  <Clay3DIcon name="cloud" size="xs" />
                  <span>Upload Custom</span>
                </button>
              </div>
            </div>

          </div>
        )}
      </>
    )}
  </main>

  {/* Studio Footer */}
  {currentView === 'studio' && (
    <footer className="border-t border-slate-200/80 bg-white/70 backdrop-blur-sm py-6 text-center text-xs text-slate-500 mt-8">
      <p className="font-medium">
        Multimodal AI Hackathon 2026 • Contrastive Speech Analytics & Temporal Flaw Grounding
      </p>
      <p className="mt-1 text-[11px] text-slate-700 font-semibold flex items-center justify-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
        VoxPulse Speech Intelligence • 100% Client-Side Web Audio DSP
      </p>
    </footer>
  )}

      {/* Floating Speech Assistant (FR-6 & FR-8 Multi-Lingual Full-Screen Chatbot) - Only visible in studio/dashboard */}
      {currentView === 'studio' && (
        <AskForHelp
          result={analysisResult}
          onSeek={handleSeek}
        />
      )}

      {/* PRD Section 8 JSON Data Contract Modal */}
      <JsonModal
        isOpen={isJsonModalOpen}
        onClose={() => setIsJsonModalOpen(false)}
        result={analysisResult}
        onImportJson={handleImportJson}
      />

    </div>
  );
}
export default App;
