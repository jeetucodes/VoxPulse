import React, { useState } from 'react';
import { Clay3DIcon, type Clay3DIconName } from './Clay3DIcon';
import { WaterWaveDecoration } from './WaterWaveDecoration';
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
  onOpenJsonModal
}) => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const stats = [
    { value: '< 120ms', label: 'DSP Processing Time', desc: 'Real-time in-browser acoustic extraction', icon: 'zap' as Clay3DIconName },
    { value: '100%', label: 'Client-Side Privacy', desc: 'Zero audio ever uploaded to any cloud server', icon: 'tick' as Clay3DIconName },
    { value: '12+', label: 'Acoustic Diagnostics', desc: 'Pitch variance, pause duration, WPM, and clarity', icon: 'chart' as Clay3DIconName },
    { value: 'Bilingual', label: 'Hindi & English Support', desc: 'Neural auto-translation & aligned grounding', icon: 'globe' as Clay3DIconName },
  ];

  const steps = [
    {
      num: '01',
      title: 'Record Live or Upload',
      desc: 'Use our zero-latency in-browser studio with real-time waveform visualizer, or upload any MP3, WAV, or M4A speech file.',
      icon: 'mic' as Clay3DIconName,
      badgeColor: 'bg-violet-100 text-violet-800 border-violet-200'
    },
    {
      num: '02',
      title: 'Contrastive DSP Diagnostics',
      desc: 'Acoustic metrics are extracted directly via Web Audio API and benchmarked against champion baselines to locate millisecond flaws.',
      icon: 'target' as Clay3DIconName,
      badgeColor: 'bg-pink-100 text-pink-800 border-pink-200'
    },
    {
      num: '03',
      title: 'AI Coach Drills & Practice',
      desc: 'Get exact timestamps, causal explanations, customized vocal exercises, and interactive synchronized transcript grounding.',
      icon: 'bulb' as Clay3DIconName,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200'
    }
  ];

  const features = [
    {
      title: 'Temporal Flaw Grounding',
      desc: 'Pinpoint exact millisecond boundaries where unnatural pauses occur, cadence rushes exceed 180 WPM, or consonants blur into mumbling.',
      icon: 'target' as Clay3DIconName,
      tag: 'Millisecond Precision',
      bgGlow: 'from-pink-500/10 to-transparent'
    },
    {
      title: 'Participant vs Baseline Dynamics',
      desc: 'Compare your speech pitch contours (F0 in Hz) and dynamic intensity decibels against ideal champion orators in an interactive time-series overlay.',
      icon: 'chart' as Clay3DIconName,
      tag: 'Contrastive AI',
      bgGlow: 'from-violet-500/10 to-transparent'
    },
    {
      title: 'Bilingual Synchronized Transcript',
      desc: 'Read speech synced word-by-word with live playback. Includes automatic English-Hindi neural translation and Web Speech voice dictation.',
      icon: 'speech' as Clay3DIconName,
      tag: 'Hindi + English',
      bgGlow: 'from-emerald-500/10 to-transparent'
    },
    {
      title: 'Interactive Waveform Studio',
      desc: 'Visual audio canvas with color-coded flaw brackets. Click any flaw region to immediately seek, loop, and hear your speech flaws in context.',
      icon: 'music' as Clay3DIconName,
      tag: 'Tactile Scrubbing',
      bgGlow: 'from-blue-500/10 to-transparent'
    },
    {
      title: 'Contextual AI Speech Coach',
      desc: 'Ask questions like "How do I fix my pacing?" and receive tailored vocal drills, breathing techniques, and diagnostic breakdowns.',
      icon: 'robot' as Clay3DIconName,
      tag: 'Diagnostic Drills',
      bgGlow: 'from-purple-500/10 to-transparent'
    },
    {
      title: 'PRD JSON Data Contract',
      desc: 'Export machine-readable telemetry conforming to strict Hackathon PRD requirements. Includes full timestamps, metrics, and scoring breakdowns.',
      icon: 'document' as Clay3DIconName,
      tag: 'Developer Ready',
      bgGlow: 'from-amber-500/10 to-transparent'
    }
  ];

  const faqs = [
    {
      q: 'Does VoxPulse upload my audio to external servers?',
      a: 'No! VoxPulse processes 100% of your audio locally inside your browser using the HTML5 Web Audio API and linear PCM decoders. Your voice never leaves your device.'
    },
    {
      q: 'How does Contrastive Diagnostics work?',
      a: 'VoxPulse extracts quantitative acoustic features (Fundamental frequency F0, word cadence, silence durations, energy variance) and mathematically contrasts them against ideal baseline baseline distributions for competition categories like Extempore and Persuasive Oratory.'
    },
    {
      q: 'What audio formats are supported?',
      a: 'VoxPulse supports direct live browser microphone recording as well as uploads of MP3, WAV, M4A, OGG, and AAC files.'
    },
    {
      q: 'Can I use Hindi or bilingual English-Hindi speeches?',
      a: 'Yes! VoxPulse features an integrated bilingual translation engine that accurately aligns Hindi and English words to the playback timeline.'
    }
  ];

  return (
    <div className="w-full space-y-16 sm:space-y-24 pb-12 animate-pop-in">
      
      {/* ===================== HERO SECTION ===================== */}
      <section className="relative text-center pt-4 sm:pt-10 pb-6 sm:pb-12 max-w-5xl mx-auto px-4">
        
        {/* Floating Ambient Badges */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/95 backdrop-blur-md border border-violet-200/90 shadow-clay-pill text-violet-800 text-xs sm:text-sm font-bold tracking-wide animate-float-slow mb-6">
          <Clay3DIcon name="sparkles" size="xs" />
          <span>Next-Gen Contrastive Speech Diagnostics & AI Coaching</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>

        {/* Main Display Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight font-heading leading-[1.1] mb-6">
          Speak with Confidence. <br className="hidden sm:inline" />
          Master Every{' '}
          <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Vocal Cadence.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-3xl mx-auto text-base sm:text-xl text-slate-600 font-normal leading-relaxed mb-8">
          The contrastive speech analytics platform that pinpoints exact millisecond flaw boundaries, acoustic discrepancies against champion baselines, and actionable vocal drills — powered by <strong className="text-slate-800 font-bold">100% client-side DSP</strong>.
        </p>

        {/* Primary Call to Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 max-w-md sm:max-w-none mx-auto mb-10">
          <button
            onClick={() => onGetStarted('record')}
            className="w-full sm:w-auto btn-clay-primary px-7 py-4 text-sm sm:text-base font-bold flex items-center justify-center gap-2.5 shadow-clay-btn-primary hover:scale-105 active:scale-95 transition-all text-white"
          >
            <Clay3DIcon name="mic" size="sm" floating />
            <span>Record Speech Live</span>
          </button>

          <button
            onClick={() => onGetStarted('upload')}
            className="w-full sm:w-auto btn-clay-secondary px-7 py-4 text-sm sm:text-base font-bold flex items-center justify-center gap-2.5 hover:scale-105 active:scale-95 transition-all text-slate-800"
          >
            <Clay3DIcon name="cloud" size="sm" />
            <span>Upload Audio File</span>
          </button>

          <button
            onClick={() => onGetStarted('presets')}
            className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-violet-50 hover:bg-violet-100 border border-violet-200 text-violet-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xs"
          >
            <Clay3DIcon name="trophy" size="xs" />
            <span>Demo Benchmarks</span>
          </button>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-1.5">
            <Clay3DIcon name="tick" size="xs" />
            <span>100% Private (Runs in Browser)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clay3DIcon name="zap" size="xs" />
            <span>Zero Sign-Up Required</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clay3DIcon name="document" size="xs" />
            <button 
              onClick={onOpenJsonModal}
              className="text-violet-600 hover:text-violet-800 underline font-semibold"
            >
              PRD JSON Ready
            </button>
          </div>
        </div>

        {/* ===================== HERO INTERACTIVE PREVIEW CARD ===================== */}
        <div className="mt-12 sm:mt-16 relative">
          
          {/* Subtle Glow Behind Preview */}
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 via-pink-500/15 to-purple-500/20 blur-3xl -z-10 rounded-full scale-95 pointer-events-none"></div>

          {/* 3D Clay Dashboard Mockup Container */}
          <div 
            onClick={() => onGetStarted('record')}
            className="card-clay card-clay-violet p-4 sm:p-7 rounded-3xl sm:rounded-4xl shadow-clay-card hover:shadow-clay-card-hover transition-all duration-500 cursor-pointer group text-left relative overflow-hidden"
            title="Click to launch VoxPulse Studio"
          >
            <WaterWaveDecoration color="rgba(139, 92, 246, 0.09)" height="h-28" />

            {/* Top Bar of Mockup */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5 relative z-10">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200/90 text-white flex items-center justify-center p-1 shadow-sm">
                  <img src="/app-icon.png" alt="App" className="w-full h-full object-contain rounded-xl" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-slate-900 text-base sm:text-lg flex items-center gap-2">
                    <span>Live Diagnostic Session</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                      LIVE DSP ACTIVE
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Persuasive Oratory Baseline vs Speaker Delivery</p>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-clay-pill flex items-center gap-1.5">
                  <Clay3DIcon name="trophy" size="xs" />
                  Score: 88/100
                </span>
                <span className="px-3 py-1 rounded-full bg-violet-600 text-white text-xs font-bold shadow-sugary-violet flex items-center gap-1">
                  Launch Studio →
                </span>
              </div>
            </div>

            {/* Mock Waveform with Grounded Flaw Brackets */}
            <div className="clay-inset-well p-4 sm:p-5 rounded-2xl mb-5 space-y-3 relative">
              <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  Interactive Audio Waveform Scrubbing
                </span>
                <span className="font-mono text-violet-700">00:04.2 / 00:16.0</span>
              </div>

              {/* Simulated Waveform Bars */}
              <div className="h-16 sm:h-20 flex items-center justify-between gap-1 px-2 relative">
                {Array.from({ length: 48 }).map((_, i) => {
                  const heights = [30, 45, 75, 90, 60, 40, 85, 95, 35, 20, 15, 80, 95, 70, 50, 40, 65, 80, 90, 75, 40, 20, 10, 10, 85, 90, 60, 40, 30, 70, 85, 95, 60, 40, 30, 80, 90, 75, 60, 45, 80, 70, 50, 30, 40, 60, 50, 25];
                  const h = heights[i % heights.length];
                  const isFastFlaw = i >= 8 && i <= 15;
                  const isPauseFlaw = i >= 20 && i <= 24;
                  return (
                    <div
                      key={i}
                      style={{ height: `${h}%` }}
                      className={`w-full rounded-full transition-all duration-300 ${
                        isFastFlaw
                          ? 'bg-pink-500'
                          : isPauseFlaw
                          ? 'bg-amber-400'
                          : i < 18
                          ? 'bg-violet-600'
                          : 'bg-slate-300'
                      }`}
                    />
                  );
                })}
              </div>

              {/* Flaw Bracket Tags */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="px-2.5 py-1 rounded-full bg-pink-100 border border-pink-300 text-pink-900 font-bold text-[11px] flex items-center gap-1">
                  <Clay3DIcon name="rocket" size="xs" />
                  <span>00:03–00:06 Fast Speech (192 WPM)</span>
                </span>
                <span className="px-2.5 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 font-bold text-[11px] flex items-center gap-1">
                  <Clay3DIcon name="clock" size="xs" />
                  <span>00:09–00:10 Unnatural Pause (1.2s dead air)</span>
                </span>
              </div>
            </div>

            {/* Bottom Mini Metrics Row inside Mockup */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white border border-slate-100 shadow-xs">
                <p className="text-slate-400 font-medium">Fluency</p>
                <p className="text-base font-extrabold text-slate-800">84/100</p>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-100 shadow-xs">
                <p className="text-slate-400 font-medium">Pacing Pace</p>
                <p className="text-base font-extrabold text-pink-600">142 WPM</p>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-100 shadow-xs">
                <p className="text-slate-400 font-medium">Pitch Modulation</p>
                <p className="text-base font-extrabold text-violet-600">79/100</p>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-100 shadow-xs">
                <p className="text-slate-400 font-medium">Clarity Score</p>
                <p className="text-base font-extrabold text-emerald-600">92/100</p>
              </div>
            </div>

            {/* Hover overlay hint */}
            <div className="absolute inset-0 bg-violet-900/5 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="btn-clay-primary px-6 py-3 text-sm font-bold text-white shadow-clay-btn-primary scale-105 transition-transform flex items-center gap-2">
                <Clay3DIcon name="mic" size="xs" />
                Launch Live Speech Studio Now
              </span>
            </div>
          </div>
        </div>

      </section>

      {/* ===================== STATS / TRUST METRICS STRIP ===================== */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((s, idx) => {
            const statThemes = ['card-clay-violet', 'card-clay-pink', 'card-clay-emerald', 'card-clay-amber'];
            const statColors = ['rgba(139, 92, 246, 0.08)', 'rgba(244, 63, 94, 0.08)', 'rgba(16, 185, 129, 0.08)', 'rgba(245, 158, 11, 0.08)'];
            return (
              <div 
                key={idx} 
                className={`card-clay ${statThemes[idx % statThemes.length]} p-5 sm:p-6 rounded-3xl relative overflow-hidden shadow-clay-card flex flex-col justify-between space-y-2 hover:scale-[1.02] transition-transform`}
              >
                <WaterWaveDecoration color={statColors[idx % statColors.length]} height="h-12" opacity="opacity-70" />
                <div className="relative z-10 flex items-center justify-between">
                  <span className="text-2xl sm:text-4xl font-black font-heading tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                    {s.value}
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-white/90 border border-slate-200/80 flex items-center justify-center shadow-xs">
                    <Clay3DIcon name={s.icon} size="xs" />
                  </div>
                </div>
                <div className="relative z-10">
                  <p className="font-bold text-slate-800 text-sm">{s.label}</p>
                  <p className="text-xs text-slate-600 font-normal leading-relaxed">{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===================== HOW IT WORKS (3 STEPS) ===================== */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center space-y-3 mb-12">
          <span className="px-3.5 py-1 rounded-full bg-violet-100 text-violet-800 text-xs font-bold border border-violet-200 shadow-xs uppercase tracking-wider">
            Diagnostic Workflow
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 font-heading">
            How VoxPulse Perfects Your Delivery
          </h2>
          <p className="text-sm sm:text-base text-slate-500 max-w-2xl mx-auto">
            Three simple steps from speaking into your microphone to receiving actionable, millisecond-accurate acoustic diagnostics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {steps.map((st, i) => {
            const stepThemes = ['card-clay-violet', 'card-clay-pink', 'card-clay-emerald'];
            const stepColors = ['rgba(139, 92, 246, 0.08)', 'rgba(244, 63, 94, 0.08)', 'rgba(16, 185, 129, 0.08)'];
            return (
              <div 
                key={i}
                className={`card-clay ${stepThemes[i % stepThemes.length]} p-6 sm:p-7 rounded-3xl relative overflow-hidden shadow-clay-card flex flex-col justify-between space-y-5 group hover:-translate-y-1 transition-all`}
              >
                <WaterWaveDecoration color={stepColors[i % stepColors.length]} height="h-16" />
                <div className="relative z-10 flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-white/90 border border-slate-100 shadow-clay-pill flex items-center justify-center p-2">
                    <Clay3DIcon name={st.icon} size="sm" floating />
                  </div>
                  <span className="text-3xl font-black font-heading text-slate-300 group-hover:text-violet-300 transition-colors">
                    {st.num}
                  </span>
                </div>

                <div className="relative z-10 space-y-2">
                  <h3 className="font-heading font-black text-slate-900 text-lg sm:text-xl">
                    {st.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
                    {st.desc}
                  </p>
                </div>

                <div className="relative z-10 pt-2">
                  <button
                    onClick={() => onGetStarted(i === 0 ? 'record' : 'presets')}
                    className="text-xs font-bold text-violet-700 group-hover:text-violet-900 flex items-center gap-1 transition-colors"
                  >
                    <span>Explore step</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===================== DEEP DIVE BENTO GRID ===================== */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center space-y-3 mb-12">
          <span className="px-3.5 py-1 rounded-full bg-pink-100 text-pink-800 text-xs font-bold border border-pink-200 shadow-xs uppercase tracking-wider">
            Deep-Tech Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 font-heading">
            Built for Serious Orators & Competitions
          </h2>
          <p className="text-sm sm:text-base text-slate-500 max-w-2xl mx-auto">
            Traditional speech coaching relies on vague impressions. VoxPulse brings mathematical rigor and millisecond contrastive analytics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => {
            const bentoThemes = ['card-clay-violet', 'card-clay-cyan', 'card-clay-emerald', 'card-clay-pink', 'card-clay-amber', 'card-clay-violet'];
            const bentoColors = ['rgba(139, 92, 246, 0.08)', 'rgba(6, 182, 212, 0.08)', 'rgba(16, 185, 129, 0.08)', 'rgba(244, 63, 94, 0.08)', 'rgba(245, 158, 11, 0.08)', 'rgba(139, 92, 246, 0.08)'];
            return (
              <div 
                key={i}
                className={`card-clay ${bentoThemes[i % bentoThemes.length]} p-6 rounded-3xl relative overflow-hidden shadow-clay-card flex flex-col justify-between space-y-4 hover:shadow-clay-card-hover transition-all`}
              >
                <WaterWaveDecoration color={bentoColors[i % bentoColors.length]} height="h-14" />
                <div className="relative z-10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-white/90 border border-slate-100 shadow-clay-pill flex items-center justify-center">
                      <Clay3DIcon name={f.icon} size="xs" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-white/80 border border-slate-200/80 text-[11px] font-bold text-slate-700">
                      {f.tag}
                    </span>
                  </div>

                  <h3 className="font-heading font-black text-slate-900 text-base sm:text-lg">
                    {f.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
                    {f.desc}
                  </p>
                </div>

                <div className="relative z-10 pt-2 border-t border-slate-200/50">
                  <button
                    onClick={() => onGetStarted('record')}
                    className="text-xs font-bold text-slate-700 hover:text-violet-700 flex items-center gap-1 transition-colors"
                  >
                    <span>Test in studio</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===================== BENCHMARK PRESETS SHOWCASE ===================== */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="card-clay card-clay-violet p-6 sm:p-10 rounded-3xl sm:rounded-4xl relative overflow-hidden shadow-clay-card space-y-8">
          <div className="relative z-10 space-y-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200/80 pb-6">
            <div>
              <span className="px-3 py-1 rounded-full bg-violet-100 text-violet-800 text-xs font-bold border border-violet-200 shadow-xs uppercase tracking-wider">
                Pre-Computed Baselines
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading mt-2">
                Try Curated Competition Baselines
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
                Don’t have audio ready? Test VoxPulse right now using pre-recorded speeches with pre-grounded temporal flaws.
              </p>
            </div>

            <button
              onClick={() => onGetStarted('presets')}
              className="btn-clay-secondary px-5 py-2.5 text-xs font-bold self-start sm:self-auto shrink-0 flex items-center gap-2"
            >
              <span>View All Presets</span>
              <span>→</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SAMPLE_SPEECHES.map((sample, idx) => {
              const isChampion = sample.id === 'sample-ideal-baseline';
              const cardThemes = ['card-clay-violet', 'card-clay-pink', 'card-clay-emerald'];
              const waveColors = ['rgba(139, 92, 246, 0.08)', 'rgba(244, 63, 94, 0.08)', 'rgba(16, 185, 129, 0.08)'];
              const appliedTheme = isChampion ? 'card-clay-amber' : cardThemes[idx % cardThemes.length];
              const appliedWave = isChampion ? 'rgba(245, 158, 11, 0.08)' : waveColors[idx % waveColors.length];

              return (
                <div
                  key={sample.id}
                  onClick={() => onSelectBenchmark(sample)}
                  className={`p-5 rounded-2xl border card-clay ${appliedTheme} relative overflow-hidden transition-all cursor-pointer flex flex-col justify-between space-y-4 hover:scale-[1.03] group shadow-clay-card`}
                >
                  <WaterWaveDecoration color={appliedWave} height="h-12" />

                  <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          isChampion ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-white/80 text-violet-800 border-violet-200'
                        }`}>
                          {sample.category}
                        </span>
                        <span className="text-xs font-extrabold text-slate-800 bg-white/90 px-2 py-0.5 rounded-full border border-slate-200">
                          {sample.precomputedResult.overall_score}/100
                        </span>
                      </div>

                      <h4 className="font-heading font-black text-slate-900 text-sm line-clamp-2 group-hover:text-violet-700 transition-colors">
                        {sample.title}
                      </h4>

                      <p className="text-[11px] text-slate-600 line-clamp-2">
                        {sample.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                      <span className="text-slate-500 font-mono text-[10px]">{sample.durationSec}s audio</span>
                      <span className="font-bold text-violet-700 group-hover:translate-x-0.5 transition-transform">
                        Analyze →
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          </div>
        </div>
      </section>

      {/* ===================== FAQ SECTION ===================== */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="text-center space-y-3 mb-10">
          <span className="px-3.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 shadow-xs uppercase tracking-wider">
            Frequently Answered
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
            Got Questions? We Have Answers.
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className="card-clay rounded-2xl border border-white/90 shadow-xs overflow-hidden transition-all"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-slate-900 hover:text-violet-600 transition-colors"
                >
                  <span>{faq.q}</span>
                  <span className="text-lg text-slate-400 shrink-0">{isOpen ? '−' : '+'}</span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3 animate-pop-in">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ===================== BOTTOM CTA BANNER ===================== */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="card-clay p-8 sm:p-12 rounded-3xl sm:rounded-4xl border border-white/90 shadow-clay-card bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 text-white text-center space-y-6 relative overflow-hidden">
          
          {/* Subtle Ambient Background Bubbles */}
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
          <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-pink-500/20 blur-2xl pointer-events-none"></div>

          <div className="relative z-10 max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-5xl font-black font-heading tracking-tight leading-tight">
              Ready to Perfect Your Next Speech?
            </h2>
            <p className="text-sm sm:text-base text-violet-100/90 leading-relaxed font-normal">
              No registration, no credit cards, no audio uploads. Start analyzing your cadence in 5 seconds with zero setup.
            </p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onGetStarted('record')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white text-violet-950 font-black text-sm sm:text-base shadow-clay-btn-secondary hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Clay3DIcon name="mic" size="sm" floating />
              <span>Launch VoxPulse Studio Now</span>
            </button>

            <button
              onClick={onOpenJsonModal}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white/15 hover:bg-white/20 border border-white/30 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Clay3DIcon name="document" size="xs" />
              <span>Inspect PRD JSON Schema</span>
            </button>
          </div>

          <p className="relative z-10 text-[11px] text-violet-200 font-medium">
            Open-source speech analytics framework · Smart India Hackathon
          </p>
        </div>
      </section>

      {/* ===================== FOOTER ===================== */}
      <footer className="border-t border-slate-200/80 pt-8 max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white border border-slate-200/90 p-1 shadow-xs flex items-center justify-center">
            <img src="/app-icon.png" alt="VoxPulse" className="w-full h-full object-contain rounded-lg" />
          </div>
          <span className="font-heading font-black text-slate-800 text-sm">
            Vox<span className="text-violet-600">Pulse</span>
          </span>
          <span className="text-slate-300">|</span>
          <span>Contrastive Speech Diagnostics</span>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={() => onGetStarted('record')} className="hover:text-violet-600 transition-colors">
            Studio
          </button>
          <button onClick={() => onGetStarted('presets')} className="hover:text-violet-600 transition-colors">
            Benchmarks
          </button>
          <button onClick={onOpenJsonModal} className="hover:text-violet-600 transition-colors">
            PRD Contract
          </button>
          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-mono font-bold text-slate-600">
            v1.2.0
          </span>
        </div>
      </footer>

    </div>
  );
};
