import React, { useState, useEffect } from 'react';
import { 
  Activity, Mic, Cloud, Trophy, Zap, ShieldCheck,
  ArrowRight, Sparkles,
  Terminal, Copy, Check
} from 'lucide-react';
import { AnimatedReveal } from './AnimatedReveal';
import { SAMPLE_SPEECHES } from '../services/sampleData';
import type { SampleSpeech } from '../types/speech';

interface LandingPageProps {
  onGetStarted: (preferredTab?: 'record' | 'upload' | 'presets') => void;
  onSelectBenchmark: (sample: SampleSpeech) => void;
  onOpenJsonModal: () => void;
}


export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onSelectBenchmark,
  onOpenJsonModal,
}) => {
  // Rotating animated headline phrases
  const animatedPhrases = [
    'Champion Cadence.',
    'Zero Hesitation.',
    'Total Authority.',
    'Flawless Delivery.'
  ];
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [copiedPrd, setCopiedPrd] = useState(false);
  const [activeBilingualWord, setActiveBilingualWord] = useState(0);

  // Rotate headline phrase every 3s
  useEffect(() => {
    const timer = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % animatedPhrases.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [animatedPhrases.length]);

  // Rotate bilingual demo word every 2.5s
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBilingualWord((prev) => (prev === 0 ? 1 : 0));
    }, 2500);
    return () => clearInterval(timer);
  }, []);




  const handleCopyPrd = () => {
    navigator.clipboard.writeText(JSON.stringify({
      schema: 'VoxPulse-v1.2',
      metrics: { latency_ms: 118, overall_score: 88, wpm: 138, pitch_f0: 145 },
      flaws: [{ timestamp: '00:03.200', type: 'fast_speech', delta_wpm: 62 }]
    }, null, 2));
    setCopiedPrd(true);
    setTimeout(() => setCopiedPrd(false), 2000);
  };

  return (
    <div className="relative w-full pb-24 overflow-hidden">
      
      {/* ============================================================== */}
      {/* LUMINOUS LIGHT HERO SECTION (Matching website theme + bubbles) */}
      {/* ============================================================== */}
      <section className="relative text-center overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        
        {/* Luminous Light Background matching theme */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Soft ambient violet-blue radial aura */}
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] sm:w-[950px] h-[550px] bg-gradient-radial from-violet-200/50 via-indigo-100/35 to-transparent rounded-full blur-[90px] animate-float-orb"></div>
          <div className="absolute top-[25%] -left-32 w-[500px] h-[500px] bg-gradient-radial from-pink-200/30 via-violet-100/20 to-transparent rounded-full blur-[80px]"></div>
          <div className="absolute top-[20%] -right-32 w-[500px] h-[500px] bg-gradient-radial from-sky-200/35 via-teal-100/20 to-transparent rounded-full blur-[80px]"></div>
          
          {/* Subtle architect dot grid */}
          <div className="absolute inset-0 bg-dot-pattern opacity-60"></div>

          {/* Floating Realistic Iridescent Soap Bubbles (Mobile: 1 lower centered bubble | Desktop: 8 non-overlapping grand bubbles) */}
          {/* Bubble 1: The Giant Statement Bubble (Mobile: lowered to top-28; Desktop: top-left flank) */}
          <div className="absolute top-28 sm:top-6 left-1/2 -translate-x-1/2 sm:left-[4%] lg:left-[5%] sm:translate-x-0 w-72 h-72 sm:w-[340px] sm:h-[340px] lg:w-[380px] lg:h-[380px] pointer-events-none z-0">
            <div className="giant-hero-bubble w-full h-full opacity-85 sm:opacity-90"></div>
          </div>
          
          {/* Bubble 2: Desktop-only top-right grand bubble */}
          <div className="hidden sm:block water-bubble sm:w-60 sm:h-60 lg:w-72 lg:h-72 top-6 right-[4%] lg:right-[6%] animate-bubble-2 opacity-85"></div>
          
          {/* Bubble 3: Desktop-only mid-lower left bubble (Well below Bubble 1, zero overlap) */}
          <div className="hidden sm:block water-bubble sm:w-48 sm:h-48 lg:w-56 lg:h-56 top-[58%] left-[2%] lg:left-[4%] animate-bubble-3 opacity-80"></div>
          
          {/* Bubble 4: Desktop-only mid-lower right bubble (Well below Bubble 2, zero overlap) */}
          <div className="hidden sm:block water-bubble sm:w-44 sm:h-44 lg:w-52 lg:h-52 top-[52%] right-[2%] lg:right-[5%] animate-bubble-4 opacity-80"></div>
          
          {/* Bubble 5: Desktop-only high-sky accent top-left (tucked high, away from Bubble 1) */}
          <div className="hidden sm:block water-bubble sm:w-20 sm:h-20 -top-6 left-[22%] lg:left-[24%] animate-bubble-1 opacity-70" style={{animationDelay: '1.2s'}}></div>
          
          {/* Bubble 6: Desktop-only high-sky accent top-right (tucked high, away from Bubble 2) */}
          <div className="hidden sm:block water-bubble sm:w-24 sm:h-24 -top-8 right-[24%] lg:right-[26%] animate-bubble-3 opacity-70" style={{animationDelay: '2.5s'}}></div>
          
          {/* Bubble 7: Desktop-only bottom-left flank accent (below content) */}
          <div className="hidden sm:block water-bubble sm:w-28 sm:h-28 top-[84%] left-[12%] lg:left-[16%] animate-bubble-2 opacity-75" style={{animationDelay: '3.2s'}}></div>
          
          {/* Bubble 8: Desktop-only bottom-right flank accent (below content) */}
          <div className="hidden sm:block water-bubble sm:w-32 sm:h-32 top-[80%] right-[14%] lg:right-[18%] animate-bubble-4 opacity-75" style={{animationDelay: '4s'}}></div>
        </div>

        {/* Hero content — constrained max-width */}
        <div className="relative z-10 max-w-5xl mx-auto px-4">
          
          {/* Floating Live Capsule Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/80 backdrop-blur-md border border-violet-200/90 shadow-clay-pill text-slate-800 text-xs sm:text-sm font-semibold tracking-wide mb-8 animate-float-slow">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-bold text-violet-700 uppercase tracking-widest text-[10px]">Live DSP Engine</span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-700">AI Speech Diagnostics</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
          </div>

          {/* Giant Headline */}
          <div className="space-y-1 sm:space-y-2 mb-6 sm:mb-8 px-2">
            <h1 className="text-3xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-[92px] font-black text-slate-900 tracking-tight font-heading leading-tight sm:leading-[0.95]">
              Master Your
            </h1>
            {/* Animated rotating gradient word with fluid responsive height */}
            <div className="min-h-[48px] sm:min-h-[80px] lg:min-h-[104px] flex items-center justify-center px-2 py-1">
              <span
                key={phraseIndex}
                className="text-3xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-[92px] font-black font-heading tracking-tight hero-gradient-text animate-hero-phrase inline-block text-center leading-tight sm:leading-none break-words"
              >
                {animatedPhrases[phraseIndex]}
              </span>
            </div>
          </div>

          {/* Punchy short subtitle */}
          <p className="max-w-xl mx-auto text-sm sm:text-lg text-slate-600 font-normal leading-relaxed mb-8 sm:mb-12 tracking-wide px-4">
            Mathematical speech diagnostics. Millisecond precision.
            <span className="block text-slate-400 text-xs sm:text-base mt-1.5">Benchmark against national champions — in-browser, instantly.</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-sm sm:max-w-none mx-auto mb-10 w-full px-4">
            <button
              onClick={() => onGetStarted('record')}
              className="w-full sm:w-auto group relative px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl text-white font-black text-sm sm:text-base flex items-center justify-center gap-2.5 cursor-pointer overflow-hidden transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]"
              style={{
                background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 50%, #7C3AED 100%)',
                backgroundSize: '200% 200%',
                boxShadow: '0 10px 30px -5px rgba(124,58,237,0.45), 0 4px 12px rgba(124,58,237,0.25), inset 0 1px 0 rgba(255,255,255,0.2)'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-violet-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Mic className="w-5 h-5 relative z-10 group-hover:scale-110 transition-transform" />
              <span className="relative z-10">Record Speech Live</span>
              <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => onGetStarted('upload')}
              className="w-full sm:w-auto px-6 sm:px-7 py-3.5 sm:py-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm sm:text-base border border-slate-200/90 hover:border-slate-300 transition-all active:scale-[0.98] flex items-center justify-center gap-2.5 cursor-pointer shadow-xs"
            >
              <Cloud className="w-5 h-5 text-violet-600" />
              <span>Upload Audio File</span>
            </button>

            <button
              onClick={() => onGetStarted('presets')}
              className="w-full sm:w-auto px-5 sm:px-6 py-3.5 sm:py-4 rounded-2xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer border border-slate-200/60"
            >
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Demo Benchmarks</span>
            </button>
          </div>

          {/* Micro Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>100% Private</span>
            </div>
            <div className="w-px h-3 bg-slate-300"></div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>&lt; 120ms DSP</span>
            </div>
            <div className="w-px h-3 bg-slate-300"></div>
            <div className="flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-violet-600" />
              <button onClick={onOpenJsonModal} className="hover:text-violet-700 transition-colors cursor-pointer font-bold">
                PRD Telemetry
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* LIGHT CONTENT ZONE (everything below the dark hero)            */}
      {/* ============================================================== */}
      <div className="relative space-y-24 sm:space-y-36">

      {/* Ambient background for light sections */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-dot-pattern opacity-50"></div>
        <div className="absolute top-[10%] -left-32 w-[500px] h-[500px] bg-violet-400/10 rounded-full blur-3xl"></div>
        <div className="absolute top-[50%] -right-32 w-[550px] h-[550px] bg-indigo-400/10 rounded-full blur-3xl"></div>
      </div>

      {/* ============================================================== */}
      {/* STATS STRIP: STICKY NOTES                                      */}
      {/* ============================================================== */}

      <section className="max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pt-2">
          
          <AnimatedReveal delayClass="stagger-1">
            <div className="sticky-note sticky-yellow -rotate-1.5 p-5 sm:p-6 text-center space-y-1">
              <div className="sticky-tape"></div>
              <span className="text-2xl sm:text-4xl lg:text-5xl font-black font-heading tracking-tight text-slate-900 block">
                &lt; 120ms
              </span>
              <p className="font-bold text-slate-800 text-xs sm:text-sm">DSP Extraction</p>
              <p className="text-[10px] sm:text-[11px] text-slate-600">Real-time linear PCM</p>
            </div>
          </AnimatedReveal>

          <AnimatedReveal delayClass="stagger-2">
            <div className="sticky-note sticky-green rotate-1.5 p-5 sm:p-6 text-center space-y-1">
              <div className="sticky-tape"></div>
              <span className="text-2xl sm:text-4xl lg:text-5xl font-black font-heading tracking-tight text-emerald-800 block">
                100%
              </span>
              <p className="font-bold text-slate-800 text-xs sm:text-sm">Client-Side Private</p>
              <p className="text-[10px] sm:text-[11px] text-slate-600">Zero cloud audio</p>
            </div>
          </AnimatedReveal>

          <AnimatedReveal delayClass="stagger-3">
            <div className="sticky-note sticky-blue -rotate-1 p-5 sm:p-6 text-center space-y-1">
              <div className="sticky-tape"></div>
              <span className="text-2xl sm:text-4xl lg:text-5xl font-black font-heading tracking-tight text-indigo-900 block">
                12+
              </span>
              <p className="font-bold text-slate-800 text-xs sm:text-sm">Acoustic Metrics</p>
              <p className="text-[10px] sm:text-[11px] text-slate-600">Cadence, F0 & Pauses</p>
            </div>
          </AnimatedReveal>

          <AnimatedReveal delayClass="stagger-4">
            <div className="sticky-note sticky-purple rotate-2 p-5 sm:p-6 text-center space-y-1">
              <div className="sticky-tape"></div>
              <span className="text-2xl sm:text-4xl lg:text-5xl font-black font-heading tracking-tight text-purple-900 block">
                Dual
              </span>
              <p className="font-bold text-slate-800 text-xs sm:text-sm">Hindi + English</p>
              <p className="text-[10px] sm:text-[11px] text-slate-600">Synchronized grounding</p>
            </div>
          </AnimatedReveal>

        </div>
      </section>

      {/* ============================================================== */}
      {/* 3-STEP PIPELINE: STICKY NOTES CONNECTED BY WORKFLOW            */}
      {/* ============================================================== */}
      <section id="section-pipeline" className="max-w-5xl mx-auto px-4 relative scroll-mt-24">
        
        <AnimatedReveal>
          <div className="text-center space-y-2 mb-12 sm:mb-16">
            <span className="px-3.5 py-1 rounded-full bg-violet-100 text-violet-800 text-xs font-bold border border-violet-200">
              WORKFLOW PIPELINE
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 font-heading tracking-tight">
              Three Steps to Mastery.
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-lg mx-auto">
              From raw soundwave to millisecond flaw detection.
            </p>
          </div>
        </AnimatedReveal>

        {/* 3 Step Sticky Note Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative pt-2">
          
          {/* Card 1: Ingest */}
          <AnimatedReveal delayClass="stagger-1" className="h-full">
            <div className="sticky-note sticky-yellow -rotate-1 p-6 space-y-5 h-full flex flex-col justify-between">
              <div className="sticky-pin"></div>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-4xl font-black font-heading text-amber-700/60">01</span>
                  <div className="w-10 h-10 rounded-2xl bg-white/80 text-amber-800 border border-amber-300 flex items-center justify-center shadow-xs">
                    <Mic className="w-5 h-5" />
                  </div>
                </div>

                <h3 className="text-xl font-black font-heading text-slate-900 mb-1">
                  Instant Capture
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  Record live in-browser or upload any MP3, WAV, or M4A file with zero latency.
                </p>
              </div>

              {/* Internal Animation: Audio Ripple Pulse */}
              <div className="p-4 rounded-2xl bg-white/85 border border-amber-200/80 shadow-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-800">REC ACTIVE</span>
                </div>
                <div className="flex items-end gap-1 h-5">
                  <span className="w-1 bg-amber-600 rounded-full animate-eq-live-1 h-full"></span>
                  <span className="w-1 bg-amber-600 rounded-full animate-eq-live-2 h-4/5"></span>
                  <span className="w-1 bg-rose-500 rounded-full animate-eq-live-3 h-full"></span>
                  <span className="w-1 bg-rose-500 rounded-full animate-eq-live-4 h-3/5"></span>
                  <span className="w-1 bg-amber-600 rounded-full animate-eq-live-5 h-5/6"></span>
                </div>
              </div>
            </div>
          </AnimatedReveal>

          {/* Card 2: DSP Contrast */}
          <AnimatedReveal delayClass="stagger-2" className="h-full">
            <div className="sticky-note sticky-blue rotate-1 p-6 space-y-5 h-full flex flex-col justify-between">
              <div className="sticky-pin"></div>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-4xl font-black font-heading text-sky-700/60">02</span>
                  <div className="w-10 h-10 rounded-2xl bg-white/80 text-sky-800 border border-sky-300 flex items-center justify-center shadow-xs">
                    <Activity className="w-5 h-5" />
                  </div>
                </div>

                <h3 className="text-xl font-black font-heading text-slate-900 mb-1">
                  Contrastive DSP
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  Extracts fundamental frequency F0 and cadence to benchmark against champions.
                </p>
              </div>

              {/* Internal Animation: Dual Wave Scanline */}
              <div className="p-4 rounded-2xl bg-white/85 border border-sky-200/80 shadow-xs space-y-2">
                <div className="flex justify-between text-[11px] font-mono font-bold">
                  <span className="text-sky-700">● Speaker Curve</span>
                  <span className="text-emerald-700">● Baseline</span>
                </div>
                <div className="h-3 rounded-full bg-slate-200/90 overflow-hidden relative">
                  <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-sky-600 via-indigo-500 to-teal-500 w-3/4 rounded-full"></div>
                  <div className="absolute inset-0 bg-white/40 animate-shimmer"></div>
                </div>
              </div>
            </div>
          </AnimatedReveal>

          {/* Card 3: Actionable Drills */}
          <AnimatedReveal delayClass="stagger-3" className="h-full">
            <div className="sticky-note sticky-green -rotate-1 p-6 space-y-5 h-full flex flex-col justify-between">
              <div className="sticky-pin"></div>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-4xl font-black font-heading text-emerald-700/60">03</span>
                  <div className="w-10 h-10 rounded-2xl bg-white/80 text-emerald-800 border border-emerald-300 flex items-center justify-center shadow-xs">
                    <Trophy className="w-5 h-5" />
                  </div>
                </div>

                <h3 className="text-xl font-black font-heading text-slate-900 mb-1">
                  Precision Drills
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  Pinpoint exact seconds where delivery faltered, with tailored vocal drills.
                </p>
              </div>

              {/* Internal Animation: Score Radar Pill */}
              <div className="p-4 rounded-2xl bg-white/85 border border-emerald-200/80 shadow-xs flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full bg-emerald-200 text-emerald-950 text-xs font-black">
                  Score: 88/100
                </span>
                <span className="text-[11px] text-slate-600 font-mono font-bold">
                  3 AI Drills Generated
                </span>
              </div>
            </div>
          </AnimatedReveal>

        </div>
      </section>

      {/* ============================================================== */}
      {/* FEATURE MATRIX: CARDS WITH LIVING ANIMATIONS INSIDE             */}
      {/* ============================================================== */}
      <section id="section-intelligence" className="max-w-5xl mx-auto px-4 scroll-mt-24">
        
        <AnimatedReveal>
          <div className="text-center space-y-2 mb-12 sm:mb-16">
            <span className="px-3.5 py-1 rounded-full bg-pink-50 text-pink-700 text-xs font-bold border border-pink-200">
              DEEP-TECH RIGOR
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 font-heading tracking-tight">
              Acoustic Intelligence.
            </h2>
            <p className="text-sm sm:text-base text-slate-500 max-w-lg mx-auto">
              Objective mathematical evaluation that human adjudicators miss.
            </p>
          </div>
        </AnimatedReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-2">
          
          {/* Bento Card 1: Millisecond Grounding with animated scrubber */}
          <AnimatedReveal delayClass="stagger-1" className="h-full">
            <div className="sticky-note sticky-purple -rotate-1 p-6 space-y-4 h-full flex flex-col justify-between">
              <div className="sticky-tape"></div>
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/80 text-purple-900 border border-purple-300">
                  TEMPORAL PRECISION
                </span>
                <h3 className="text-lg font-black font-heading text-slate-900 mt-2 mb-1">
                  Millisecond Flaw Markers
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  Pinpoints the exact millisecond timestamps where cadence rushes or dead-air pauses occur.
                </p>
              </div>

              {/* Animated Scrubber Widget inside Card */}
              <div className="p-3.5 rounded-2xl bg-white/85 border border-purple-200/80 shadow-xs space-y-2">
                <div className="flex justify-between text-[11px] font-mono font-bold">
                  <span className="text-slate-600">00:03.200</span>
                  <span className="text-rose-700 bg-rose-100 px-2 py-0.5 rounded border border-rose-300">
                    Rush (192 WPM)
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-200 overflow-hidden relative">
                  <div className="absolute inset-y-0 left-1/4 w-1/3 bg-rose-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </AnimatedReveal>

          {/* Bento Card 2: Live Bilingual Synchronizer with flip animation */}
          <AnimatedReveal delayClass="stagger-2" className="h-full">
            <div className="sticky-note sticky-green rotate-1 p-6 space-y-4 h-full flex flex-col justify-between">
              <div className="sticky-tape"></div>
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/80 text-emerald-900 border border-emerald-300">
                  BILINGUAL GROUNDING
                </span>
                <h3 className="text-lg font-black font-heading text-slate-900 mt-2 mb-1">
                  Hindi & English Sync
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  Aligned word-by-word with live audio timestamps and automatic translation.
                </p>
              </div>

              {/* Animated Bilingual Flipper Widget inside Card */}
              <div className="p-3.5 rounded-2xl bg-white/85 border border-emerald-200/80 shadow-xs flex items-center justify-between">
                <div className="text-xs font-bold font-mono text-slate-800">
                  {activeBilingualWord === 0 ? (
                    <span className="text-violet-700 bg-violet-100 px-2 py-1 rounded animate-fade-in inline-block font-bold">
                      Transformative
                    </span>
                  ) : (
                    <span className="text-emerald-800 bg-emerald-100 px-2 py-1 rounded animate-fade-in inline-block font-bold">
                      परिवर्तनकारी
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {activeBilingualWord === 0 ? 'English' : 'हिन्दी'}
                </span>
              </div>
            </div>
          </AnimatedReveal>

          {/* Bento Card 3: 100% In-Browser Privacy with animated lock */}
          <AnimatedReveal delayClass="stagger-3" className="h-full">
            <div className="sticky-note sticky-teal -rotate-1.5 p-6 space-y-4 h-full flex flex-col justify-between">
              <div className="sticky-pin"></div>
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/80 text-teal-900 border border-teal-300">
                  SECURITY & PRIVACY
                </span>
                <h3 className="text-lg font-black font-heading text-slate-900 mt-2 mb-1">
                  100% Client-Side Privacy
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  Your speech never uploads to external servers. High-precision DSP runs inside Web Audio.
                </p>
              </div>

              {/* Security Shield Widget inside Card */}
              <div className="p-3.5 rounded-2xl bg-white/85 border border-teal-200/80 shadow-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-teal-700" />
                  <span className="text-xs font-bold text-slate-800">Zero Cloud Upload</span>
                </div>
                <span className="font-mono text-[10px] text-teal-800 bg-teal-100 px-2 py-0.5 rounded font-bold border border-teal-200">
                  0 Bytes Sent
                </span>
              </div>
            </div>
          </AnimatedReveal>

          {/* Bento Card 4: F0 Pitch Dynamics with Sine Wave SVG */}
          <AnimatedReveal delayClass="stagger-4" className="h-full">
            <div className="sticky-note sticky-peach rotate-1 p-6 space-y-4 h-full flex flex-col justify-between">
              <div className="sticky-tape"></div>
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/80 text-amber-900 border border-amber-300">
                  ACOUSTIC CONTOUR
                </span>
                <h3 className="text-lg font-black font-heading text-slate-900 mt-2 mb-1">
                  F0 Frequency Modulation
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  Visualizes pitch variance in Hz to prevent monotonous delivery or robotic cadence.
                </p>
              </div>

              {/* Animated Sine Wave Contour inside Card */}
              <div className="p-3 rounded-2xl bg-slate-950 text-white flex items-center justify-between shadow-xs">
                <svg className="w-32 h-6" viewBox="0 0 120 24" fill="none">
                  <path d="M0 12 Q 15 2, 30 12 T 60 12 T 90 12 T 120 12" stroke="#FDBA74" strokeWidth="2" fill="none" />
                  <path d="M0 12 Q 15 20, 30 12 T 60 12 T 90 12 T 120 12" stroke="#34D399" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
                </svg>
                <span className="text-[11px] font-mono text-amber-300 font-bold">145 Hz F0</span>
              </div>
            </div>
          </AnimatedReveal>

          {/* Bento Card 5: AI Coach with Metronome BPM Ticker */}
          <AnimatedReveal delayClass="stagger-5" className="h-full">
            <div className="sticky-note sticky-pink -rotate-1 p-6 space-y-4 h-full flex flex-col justify-between">
              <div className="sticky-tape"></div>
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/80 text-rose-900 border border-rose-300">
                  TAILORED DRILLS
                </span>
                <h3 className="text-lg font-black font-heading text-slate-900 mt-2 mb-1">
                  Metronome Pacing Drills
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  Personalized exercises with calibrated beats per minute to train optimal speech rhythm.
                </p>
              </div>

              {/* Metronome BPM Ticker inside Card */}
              <div className="p-3.5 rounded-2xl bg-white/85 border border-rose-200/80 shadow-xs flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Pacing Calibration</span>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[11px] font-mono font-bold animate-pulse">
                  130 BPM
                </span>
              </div>
            </div>
          </AnimatedReveal>

          {/* Bento Card 6: PRD JSON Terminal with Copy Feedback */}
          <AnimatedReveal delayClass="stagger-6" className="h-full">
            <div className="sticky-note sticky-yellow rotate-1.5 p-6 space-y-4 h-full flex flex-col justify-between">
              <div className="sticky-pin"></div>
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/80 text-amber-900 border border-amber-300">
                  DEVELOPER READY
                </span>
                <h3 className="text-lg font-black font-heading text-slate-900 mt-2 mb-1">
                  PRD JSON Telemetry
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  Full programmatic export conforming to strict Hackathon data interchange specs.
                </p>
              </div>

              {/* Mini Terminal inside Card */}
              <div className="p-2.5 rounded-2xl bg-slate-950 text-slate-300 font-mono text-[10px] flex items-center justify-between shadow-xs">
                <span className="truncate pr-2">
                  {`{ "overall_score": 88, ... }`}
                </span>
                <button
                  onClick={handleCopyPrd}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white shrink-0 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  {copiedPrd ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedPrd ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </AnimatedReveal>

        </div>
      </section>

      {/* ============================================================== */}
      {/* CURATED BENCHMARKS: STICKY NOTE CARDS                          */}
      {/* ============================================================== */}
      <section id="section-benchmarks" className="max-w-5xl mx-auto px-4 scroll-mt-24">
        
        <AnimatedReveal>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 border-b border-slate-200/80 pb-5">
            <div>
              <span className="px-3 py-1 rounded-full bg-violet-100 text-violet-800 text-xs font-bold border border-violet-200">
                BENCHMARK SAMPLES
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 font-heading tracking-tight mt-2">
                Test with Pre-Computed Speeches.
              </h2>
            </div>

            <button
              onClick={() => onGetStarted('presets')}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold self-start sm:self-auto shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <span>View All Presets</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </AnimatedReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
          {SAMPLE_SPEECHES.map((sample, idx) => {
            const isChampion = sample.id === 'sample-ideal-baseline';
            const stickyVariants = [
              { color: 'sticky-yellow', rot: '-rotate-1' },
              { color: 'sticky-blue', rot: 'rotate-1.5' },
              { color: 'sticky-green', rot: '-rotate-1.5' },
              { color: 'sticky-pink', rot: 'rotate-1' }
            ];
            const variant = stickyVariants[idx % stickyVariants.length];

            return (
              <AnimatedReveal key={sample.id}>
                <div
                  onClick={() => onSelectBenchmark(sample)}
                  className={`sticky-note ${variant.color} ${variant.rot} p-5 cursor-pointer group flex flex-col justify-between space-y-4 h-full`}
                >
                  <div className="sticky-tape"></div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isChampion ? 'bg-amber-200/90 text-amber-950 border border-amber-300' : 'bg-white/80 text-slate-800 border border-slate-200/60'
                      }`}>
                        {sample.category}
                      </span>
                      <span className="text-xs font-black font-mono text-slate-900">
                        {sample.precomputedResult.overall_score}/100
                      </span>
                    </div>

                    <h4 className="font-heading font-black text-slate-900 text-sm line-clamp-2 group-hover:text-violet-900 transition-colors">
                      {sample.title}
                    </h4>

                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed font-medium">
                      {sample.description}
                    </p>
                  </div>

                  {/* Mini Waveform Graphic at Card Bottom */}
                  <div className="pt-2 border-t border-slate-900/10 flex items-center justify-between">
                    <div className="flex items-end gap-0.5 h-4 opacity-70 group-hover:opacity-100 transition-opacity">
                      <span className="w-0.5 bg-slate-700 rounded-full h-2"></span>
                      <span className="w-0.5 bg-slate-700 rounded-full h-3"></span>
                      <span className="w-0.5 bg-slate-700 rounded-full h-4"></span>
                      <span className="w-0.5 bg-slate-700 rounded-full h-2.5"></span>
                      <span className="w-0.5 bg-slate-700 rounded-full h-3.5"></span>
                    </div>

                    <span className="text-xs font-bold text-slate-800 group-hover:text-violet-900 group-hover:translate-x-1 transition-all flex items-center gap-1">
                      <span>Analyze</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </AnimatedReveal>
            );
          })}
        </div>
      </section>

      {/* ============================================================== */}
      {/* COSMIC LUXURY CTA BANNER: MASTER BOARD NOTE                    */}
      {/* ============================================================== */}
      <section className="max-w-5xl mx-auto px-4 pt-4">
        <AnimatedReveal>
          <div 
            className="p-6 sm:p-12 md:p-14 rounded-3xl sm:rounded-4xl text-white text-center space-y-6 sm:space-y-8 relative overflow-hidden border border-violet-500/25 shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, #0C0820 0%, #160D38 45%, #241154 100%)',
              boxShadow: '0 25px 60px -15px rgba(124, 58, 237, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.08) inset'
            }}
          >
            
            {/* Top Washi Tape (Connecting to Sticky Note Theme) */}
            <div className="sticky-tape !w-28 sm:!w-36 !h-6 sm:!h-7 !-top-3 !bg-white/80"></div>

            {/* Glowing Corner Aurora Nebulas */}
            <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-violet-600/35 blur-3xl pointer-events-none animate-pulse-glow"></div>
            <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-pink-600/30 blur-3xl pointer-events-none"></div>

            {/* Subtle background wave contour */}
            <div className="absolute inset-0 opacity-15 pointer-events-none flex items-center justify-center">
              <svg className="w-full h-40" viewBox="0 0 1000 200" fill="none">
                <path d="M0 100 C 250 20, 450 180, 700 80 C 850 20, 950 140, 1000 100" stroke="#C084FC" strokeWidth="2" />
                <path d="M0 120 C 200 180, 400 40, 650 140 C 800 200, 920 80, 1000 120" stroke="#818CF8" strokeWidth="1.5" strokeDasharray="4 4" />
              </svg>
            </div>

            <div className="relative z-10 max-w-xl mx-auto space-y-3">
              {/* Start Immediately Live Capsule */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.08] backdrop-blur-md border border-violet-400/30 shadow-md text-white text-xs font-semibold tracking-wide">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                </span>
                <span className="font-bold text-violet-300 uppercase tracking-widest text-[10px]">Zero Setup</span>
                <span className="text-white/30">·</span>
                <span className="text-white/90">Start Immediately</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              </div>

              {/* Bold Gradient Headline */}
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black font-heading tracking-tight leading-tight sm:leading-none text-white">
                Ready to Command <br className="hidden sm:inline" />
                <span className="hero-gradient-text inline-block">The Stage?</span>
              </h2>

              <p className="text-xs sm:text-base text-violet-200/80 leading-relaxed font-normal max-w-lg mx-auto">
                Zero signups, no audio uploads to the cloud. Start diagnosing your cadence in 5 seconds with millisecond precision.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-1 w-full max-w-md sm:max-w-none mx-auto">
              <button
                onClick={() => onGetStarted('record')}
                className="w-full sm:w-auto group relative px-7 sm:px-9 py-3.5 sm:py-4 rounded-2xl text-white font-black text-sm sm:text-base flex items-center justify-center gap-2.5 cursor-pointer overflow-hidden transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]"
                style={{
                  background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 50%, #7C3AED 100%)',
                  backgroundSize: '200% 200%',
                  boxShadow: '0 0 35px rgba(124,58,237,0.45), 0 8px 24px rgba(124,58,237,0.35), inset 0 1px 0 rgba(255,255,255,0.2)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Mic className="w-5 h-5 relative z-10 group-hover:scale-110 transition-transform" />
                <span className="relative z-10">Launch Speech Studio Now</span>
                <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onOpenJsonModal}
                className="w-full sm:w-auto px-6 py-3.5 sm:py-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-xs sm:text-sm transition-all active:scale-[0.98] cursor-pointer backdrop-blur-sm flex items-center justify-center gap-2"
              >
                <Terminal className="w-4 h-4 text-violet-300" />
                <span>Inspect PRD JSON Schema</span>
              </button>
            </div>

            {/* Trust Highlights Strip */}
            <div className="relative z-10 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-white/50 font-medium pt-2 border-t border-white/10">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>100% In-Browser Private</span>
              </div>
              <div className="w-px h-3 bg-white/20 hidden sm:block"></div>
              <div className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>&lt; 120ms Latency</span>
              </div>
              <div className="w-px h-3 bg-white/20 hidden sm:block"></div>
              <div className="flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-violet-400" />
                <span>National Champion Baseline</span>
              </div>
            </div>

            <p className="relative z-10 text-[11px] text-white/40 font-medium">
              Open-Source Contrastive Speech Diagnostics · Smart India Hackathon
            </p>
          </div>
        </AnimatedReveal>
      </section>

      {/* ============================================================== */}
      {/* FOOTER                                                         */}
      {/* ============================================================== */}
      <footer className="border-t border-slate-200/80 pt-6 max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 p-0.5 flex items-center justify-center shadow-xs">
            <img src="/app-icon.png" alt="VoxPulse" className="w-full h-full object-contain rounded" />
          </div>
          <span className="font-heading font-black text-slate-900 text-sm">
            Vox<span className="text-violet-600">Pulse</span>
          </span>
          <span className="text-slate-300">|</span>
          <span>Acoustic Speech Diagnostics</span>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <button onClick={() => onGetStarted('record')} className="hover:text-violet-600 transition-colors cursor-pointer">
            Studio
          </button>
          <button onClick={() => onGetStarted('presets')} className="hover:text-violet-600 transition-colors cursor-pointer">
            Benchmarks
          </button>
          <button onClick={onOpenJsonModal} className="hover:text-violet-600 transition-colors cursor-pointer">
            PRD Telemetry
          </button>
          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-mono font-bold text-slate-600">
            v1.2.0
          </span>
        </div>
      </footer>

      </div>{/* end light-content-zone */}
    </div>
  );
};

