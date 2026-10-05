import React, { useState } from 'react';
import { Clay3DIcon, type Clay3DIconName } from './Clay3DIcon';
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
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [isPlayingDemo, setIsPlayingDemo] = useState<boolean>(false);
  const [demoTime, setDemoTime] = useState<number>(4.2);
  const [activeLang, setActiveLang] = useState<'en' | 'hi'>('en');

  // Static calm waveform heights representing natural speech dynamics
  const waveformHeights = [
    24, 38, 55, 78, 88, 95, 92, 86, 74, 60, 48, 35, 52, 70, 84, 90, 82, 68,
    45, 30, 20, 12, 10, 14, 45, 68, 82, 88, 76, 62, 50, 40, 58, 74, 85, 80,
    65, 52, 40, 55, 72, 68, 54, 42, 32, 22, 16, 12
  ];

  const stats = [
    {
      value: '< 120ms',
      label: 'DSP Latency',
      desc: 'In-browser acoustic extraction',
      icon: 'zap' as Clay3DIconName,
    },
    {
      value: '100%',
      label: 'Client Privacy',
      desc: 'Zero audio sent to external servers',
      icon: 'tick' as Clay3DIconName,
    },
    {
      value: '12+',
      label: 'Acoustic Metrics',
      desc: 'Cadence, F0 pitch, pauses & clarity',
      icon: 'chart' as Clay3DIconName,
    },
    {
      value: 'Bilingual',
      label: 'Hindi & English',
      desc: 'Synchronized alignment & translation',
      icon: 'globe' as Clay3DIconName,
    },
  ];

  const steps = [
    {
      num: '01',
      title: 'Record or Upload',
      desc: 'Speak directly into your browser or drop any MP3, WAV, or M4A audio file. Instant decoding with zero latency.',
      icon: 'mic' as Clay3DIconName,
      badge: 'Capture',
    },
    {
      num: '02',
      title: 'Contrastive DSP Benchmark',
      desc: 'Speech features are extracted via Web Audio API and mathematically compared against champion orator baselines.',
      icon: 'target' as Clay3DIconName,
      badge: 'Analysis',
    },
    {
      num: '03',
      title: 'Actionable Diagnostic Drills',
      desc: 'Pinpoint exact millisecond flaw boundaries with tailored vocal exercises and synchronized bilingual transcripts.',
      icon: 'bulb' as Clay3DIconName,
      badge: 'Mastery',
    },
  ];

  const features = [
    {
      title: 'Temporal Flaw Grounding',
      desc: 'Identifies exact start and end timestamps where speaking pace accelerates excessively or unnatural pauses interrupt delivery.',
      icon: 'target' as Clay3DIconName,
      tag: 'Millisecond Precision',
    },
    {
      title: 'Speaker vs Baseline Overlay',
      desc: 'Interactive time-series comparison of your fundamental pitch (F0 in Hz) and dynamic loudness against competition benchmarks.',
      icon: 'chart' as Clay3DIconName,
      tag: 'Contrastive DSP',
    },
    {
      title: '100% In-Browser Privacy',
      desc: 'All linear PCM decoding and acoustic feature computations run locally on your client machine. Zero audio is stored or transmitted.',
      icon: 'tick' as Clay3DIconName,
      tag: 'Zero Cloud Storage',
    },
    {
      title: 'Tactile Waveform Canvas',
      desc: 'Click on any highlighted flaw zone to instantly jump, listen to the exact speech segment, and understand context.',
      icon: 'music' as Clay3DIconName,
      tag: 'Interactive Scrubbing',
    },
    {
      title: 'AI Speech Coach Drills',
      desc: 'Receive personalized drills such as metronome pacing calibrations, pause management, and diaphragmatic breathing routines.',
      icon: 'robot' as Clay3DIconName,
      tag: 'Targeted Exercises',
    },
    {
      title: 'PRD JSON Data Contract',
      desc: 'Full compatibility with strict competition standards. Export all metrics, timestamps, and causal explanations with one click.',
      icon: 'document' as Clay3DIconName,
      tag: 'Developer Ready',
    },
  ];

  const faqs = [
    {
      q: 'Does VoxPulse upload audio to external cloud servers?',
      a: 'No. VoxPulse runs 100% locally inside your browser using the HTML5 Web Audio API. Your audio never leaves your device.',
    },
    {
      q: 'How does Contrastive Diagnostics work?',
      a: 'VoxPulse extracts quantitative acoustic features (Fundamental frequency F0, cadence in WPM, silence duration, and intensity) and mathematically benchmarks them against champion orator distributions for competition categories like Extempore and Persuasive Oratory.',
    },
    {
      q: 'What audio formats are supported?',
      a: 'VoxPulse supports direct live browser microphone recording as well as uploads of MP3, WAV, M4A, OGG, and AAC files.',
    },
    {
      q: 'Can I analyze Hindi or bilingual English-Hindi speeches?',
      a: 'Yes. VoxPulse includes an integrated bilingual engine that synchronizes and translates words along the audio playback timeline.',
    },
  ];

  return (
    <div className="w-full space-y-16 sm:space-y-24 pb-20 overflow-x-hidden">
      
      {/* ===================== HERO SECTION ===================== */}
      <section className="relative text-center pt-4 sm:pt-10 pb-4 max-w-4xl mx-auto px-4">
        
        {/* Subtle Ambient Header Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-36 bg-gradient-to-r from-violet-200/40 via-indigo-200/40 to-slate-200/40 blur-3xl -z-10 rounded-full pointer-events-none"></div>

        {/* Clean Classic Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-xs text-slate-700 text-xs sm:text-sm font-semibold mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>AI Contrastive Speech Analytics</span>
          <span className="text-slate-300">|</span>
          <span className="text-violet-600 font-bold">100% In-Browser DSP</span>
        </div>

        {/* Main Display Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight font-heading leading-[1.15] mb-5">
          Speak with Authority. <br className="hidden sm:inline" />
          Master Every{' '}
          <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            Vocal Cadence.
          </span>
        </h1>

        {/* Concise Subtitle */}
        <p className="max-w-2xl mx-auto text-sm sm:text-lg text-slate-600 font-normal leading-relaxed mb-8">
          Pinpoint exact millisecond flaw boundaries, acoustic discrepancies against champion baselines, and actionable vocal drills — with zero server latency.
        </p>

        {/* Primary Call to Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 max-w-md sm:max-w-none mx-auto mb-8">
          <button
            onClick={() => onGetStarted('record')}
            className="px-6 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm hover:shadow transition-all active:scale-[0.98] cursor-pointer"
          >
            <Clay3DIcon name="mic" size="xs" />
            <span>Record Speech Live</span>
          </button>

          <button
            onClick={() => onGetStarted('upload')}
            className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm sm:text-base border border-slate-200 shadow-xs hover:border-slate-300 transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Clay3DIcon name="cloud" size="xs" />
            <span>Upload Audio File</span>
          </button>

          <button
            onClick={() => onGetStarted('presets')}
            className="px-5 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
          >
            <Clay3DIcon name="trophy" size="xs" />
            <span>Demo Benchmarks</span>
          </button>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-1.5">
            <span className="text-emerald-500 font-bold">✓</span>
            <span>Client-Side Privacy (0 Cloud Uploads)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-emerald-500 font-bold">✓</span>
            <span>&lt; 120ms Latency</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-emerald-500 font-bold">✓</span>
            <button
              onClick={onOpenJsonModal}
              className="text-violet-600 hover:text-violet-800 underline font-semibold cursor-pointer"
            >
              PRD JSON Telemetry Ready
            </button>
          </div>
        </div>

        {/* ===================== CLASSIC STUDIO AUDIO INSPECTOR CARD ===================== */}
        <div className="mt-10 sm:mt-14 relative text-left">
          
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-md overflow-hidden transition-all">
            
            {/* macOS / Classic Window Top Bar */}
            <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-slate-300 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-slate-300 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-slate-300 inline-block"></span>
                <span className="ml-2 text-xs font-semibold text-slate-600 hidden sm:inline-block">
                  VoxPulse Diagnostic Studio · Sample Preview
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
                  Persuasive Baseline
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-violet-50 border border-violet-200 text-violet-700 text-[11px] font-bold">
                  Score: 88/100
                </span>
              </div>
            </div>

            {/* Audio Waveform & Flaw Zone Canvas */}
            <div className="p-4 sm:p-7 space-y-5">
              
              {/* Audio Waveform Display */}
              <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                
                {/* Time & Title info */}
                <div className="flex items-center justify-between text-xs font-medium text-slate-600">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsPlayingDemo(!isPlayingDemo)}
                      className="w-6 h-6 rounded-md bg-violet-600 text-white flex items-center justify-center text-[10px] font-bold shadow-xs hover:bg-violet-700 transition-colors cursor-pointer"
                    >
                      {isPlayingDemo ? '❚❚' : '▶'}
                    </button>
                    <span className="font-semibold text-slate-800">
                      National Oratory Finalist Recording
                    </span>
                  </div>
                  <span className="font-mono text-violet-700 font-bold">
                    00:0{demoTime.toFixed(1)} / 00:16.0
                  </span>
                </div>

                {/* Clean, calm static waveform with subtle flaw highlighting */}
                <div className="h-16 sm:h-20 flex items-end justify-between gap-[2px] sm:gap-1 px-1 relative select-none">
                  
                  {/* Flaw Bracket 1: Fast Speech */}
                  <div
                    className="absolute inset-y-0 rounded-lg bg-rose-50 border border-rose-300/80 pointer-events-none transition-all"
                    style={{ left: '16%', width: '25%' }}
                  >
                    <span className="absolute -top-2 left-2 text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-600 text-white uppercase tracking-wider">
                      Fast Cadence (192 WPM)
                    </span>
                  </div>

                  {/* Flaw Bracket 2: Dead-Air Pause */}
                  <div
                    className="absolute inset-y-0 rounded-lg bg-amber-50 border border-amber-300/80 pointer-events-none transition-all"
                    style={{ left: '48%', width: '18%' }}
                  >
                    <span className="absolute -top-2 left-2 text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-600 text-white uppercase tracking-wider">
                      1.2s Pause
                    </span>
                  </div>

                  {/* Audio Bars */}
                  {waveformHeights.map((h, i) => {
                    const isInsideFast = i >= 8 && i <= 19;
                    const isInsidePause = i >= 23 && i <= 31;
                    const isPlayed = i < 14;

                    return (
                      <div
                        key={i}
                        style={{ height: `${h}%` }}
                        className={`w-full rounded-sm transition-all ${
                          isInsideFast
                            ? 'bg-rose-500'
                            : isInsidePause
                            ? 'bg-amber-400'
                            : isPlayed
                            ? 'bg-violet-600'
                            : 'bg-slate-300'
                        }`}
                      />
                    );
                  })}
                </div>

                {/* Scrubber timeline track */}
                <div className="relative pt-1">
                  <input
                    type="range"
                    min="0"
                    max="16"
                    step="0.1"
                    value={demoTime}
                    onChange={(e) => setDemoTime(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                    <span>0:00</span>
                    <span>0:04</span>
                    <span>0:08</span>
                    <span>0:12</span>
                    <span>0:16</span>
                  </div>
                </div>

              </div>

              {/* 4 Clean Minimalist Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1">
                    <span>Fluency</span>
                    <span className="font-bold text-slate-700">84/100</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-violet-600 h-full rounded-full" style={{ width: '84%' }}></div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1">
                    <span>Cadence</span>
                    <span className="font-bold text-rose-600">142 WPM</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1">
                    <span>Modulation</span>
                    <span className="font-bold text-indigo-600">79/100</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full rounded-full" style={{ width: '79%' }}></div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1">
                    <span>Clarity</span>
                    <span className="font-bold text-emerald-600">92/100</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>

              </div>

              {/* Bottom Quick Trigger Bar */}
              <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Ready to test with your own voice? Studio starts in 5 seconds.
                </span>

                <button
                  onClick={() => onGetStarted('record')}
                  className="font-bold text-violet-700 hover:text-violet-900 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Launch Live Speech Studio</span>
                  <span>→</span>
                </button>
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ===================== STATS STRIP ===================== */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((s, idx) => (
            <AnimatedReveal key={idx} delayClass={`stagger-${(idx % 4) + 1}` as any}>
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl sm:text-3xl font-black font-heading text-slate-900">
                    {s.value}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-center">
                    <Clay3DIcon name={s.icon} size="xs" />
                  </div>
                </div>
                <p className="font-bold text-slate-800 text-xs sm:text-sm">{s.label}</p>
                <p className="text-[11px] sm:text-xs text-slate-500 font-normal leading-relaxed mt-0.5">
                  {s.desc}
                </p>
              </div>
            </AnimatedReveal>
          ))}
        </div>
      </section>

      {/* ===================== HOW IT WORKS (3 STEPS) ===================== */}
      <section className="max-w-5xl mx-auto px-4">
        <AnimatedReveal>
          <div className="text-center space-y-2 mb-8 sm:mb-10">
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
              Workflow
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
              How VoxPulse Diagnoses Delivery
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
              Three clear stages from acoustic signal extraction to millisecond flaw grounding.
            </p>
          </div>
        </AnimatedReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {steps.map((st, i) => (
            <AnimatedReveal key={i} delayClass={`stagger-${i + 1}` as any} className="h-full">
              <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4 h-full">
                
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                    {st.badge}
                  </span>
                  <span className="text-2xl font-black font-heading text-slate-300">
                    {st.num}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-heading font-black text-slate-900 text-base sm:text-lg">
                    {st.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
                    {st.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={() => onGetStarted(i === 0 ? 'record' : 'presets')}
                    className="text-xs font-semibold text-violet-700 hover:text-violet-900 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>Test this stage</span>
                    <span>→</span>
                  </button>
                </div>

              </div>
            </AnimatedReveal>
          ))}
        </div>
      </section>

      {/* ===================== BILINGUAL TRANSCRIPT SECTION ===================== */}
      <section className="max-w-5xl mx-auto px-4">
        <AnimatedReveal>
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-8 space-y-5">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
                  Bilingual Sync
                </span>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 font-heading mt-1.5">
                  Synchronized English & Hindi Grounding
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Words align with audio playback timestamps and detected acoustic flaws.
                </p>
              </div>

              {/* Language Switcher */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
                <button
                  onClick={() => setActiveLang('en')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeLang === 'en'
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => setActiveLang('hi')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeLang === 'hi'
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  हिन्दी
                </button>
              </div>
            </div>

            {/* Transcript Card */}
            <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-sm sm:text-base leading-relaxed text-slate-700">
                {activeLang === 'en' ? (
                  <>
                    <span className="font-bold text-violet-700 bg-violet-100/70 px-1.5 py-0.5 rounded">
                      Transformative breakthroughs
                    </span>
                    <span>do not arise by chance. They require</span>
                    <span className="bg-rose-100 text-rose-800 border border-rose-200 px-1.5 py-0.5 rounded font-medium">
                      decisive leadership,
                    </span>
                    <span className="bg-rose-100 text-rose-800 border border-rose-200 px-1.5 py-0.5 rounded font-medium">
                      resilience,
                    </span>
                    <span>and</span>
                    <span className="bg-amber-100 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded font-medium">
                      unshakeable conviction. [1.2s pause]
                    </span>
                    <span>When delivery commands every syllable, our rhetoric inspires action.</span>
                  </>
                ) : (
                  <>
                    <span className="font-bold text-violet-700 bg-violet-100/70 px-1.5 py-0.5 rounded">
                      परिवर्तनकारी उपलब्धियाँ
                    </span>
                    <span>संयोग से उत्पन्न नहीं होती हैं। इसके लिए आवश्यक है</span>
                    <span className="bg-rose-100 text-rose-800 border border-rose-200 px-1.5 py-0.5 rounded font-medium">
                      निर्णायक नेतृत्व,
                    </span>
                    <span className="bg-rose-100 text-rose-800 border border-rose-200 px-1.5 py-0.5 rounded font-medium">
                      लचीलापन,
                    </span>
                    <span>और</span>
                    <span className="bg-amber-100 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded font-medium">
                      अटूट दृढ़ विश्वास। [1.2s ठहराव]
                    </span>
                    <span>जब प्रस्तुति हर शब्द को नियंत्रित करती है, तो प्रभाव स्थायी होता है।</span>
                  </>
                )}
              </div>

              <div className="pt-2 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between font-mono">
                <span>Playhead: 00:04.2 / 00:16.0</span>
                <span className="text-violet-700 font-semibold">Bilingual Alignment Active</span>
              </div>
            </div>

          </div>
        </AnimatedReveal>
      </section>

      {/* ===================== CAPABILITIES GRID (CLASSIC) ===================== */}
      <section className="max-w-5xl mx-auto px-4">
        <AnimatedReveal>
          <div className="text-center space-y-2 mb-8 sm:mb-10">
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
              Core Capabilities
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
              Engineered for Competition Rigor
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
              Mathematical acoustic models deliver clear, objective speech evaluation.
            </p>
          </div>
        </AnimatedReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <AnimatedReveal key={i} delayClass={`stagger-${(i % 3) + 1}` as any} className="h-full">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-3 h-full">
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-center">
                      <Clay3DIcon name={f.icon} size="xs" />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                      {f.tag}
                    </span>
                  </div>

                  <h3 className="font-heading font-black text-slate-900 text-base">
                    {f.title}
                  </h3>

                  <p className="text-xs text-slate-600 font-normal leading-relaxed">
                    {f.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={() => onGetStarted('record')}
                    className="text-xs font-semibold text-slate-700 hover:text-violet-700 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>Inspect feature</span>
                    <span>→</span>
                  </button>
                </div>

              </div>
            </AnimatedReveal>
          ))}
        </div>
      </section>

      {/* ===================== BENCHMARK PRESETS SHOWCASE ===================== */}
      <section className="max-w-5xl mx-auto px-4">
        <AnimatedReveal>
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-8 space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-violet-50 text-violet-800 text-xs font-semibold border border-violet-200">
                  Pre-Computed Baselines
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-heading mt-1.5">
                  Curated Competition Benchmarks
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  No microphone ready? Click any benchmark sample to launch the diagnostic studio instantly.
                </p>
              </div>

              <button
                onClick={() => onGetStarted('presets')}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold self-start sm:self-auto shrink-0 flex items-center gap-1.5 cursor-pointer"
              >
                <span>View All Presets</span>
                <span>→</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {SAMPLE_SPEECHES.map((sample) => {
                const isChampion = sample.id === 'sample-ideal-baseline';

                return (
                  <div
                    key={sample.id}
                    onClick={() => onSelectBenchmark(sample)}
                    className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50 shadow-xs transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          isChampion
                            ? 'bg-amber-100 text-amber-900 border border-amber-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {sample.category}
                        </span>
                        <span className="text-xs font-bold text-slate-800 font-mono">
                          {sample.precomputedResult.overall_score}/100
                        </span>
                      </div>

                      <h4 className="font-heading font-black text-slate-900 text-sm line-clamp-2 group-hover:text-violet-700 transition-colors">
                        {sample.title}
                      </h4>

                      <p className="text-[11px] text-slate-500 line-clamp-2">
                        {sample.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <span className="text-slate-400 font-mono text-[10px]">
                        {sample.durationSec}s audio
                      </span>
                      <span className="font-bold text-violet-700 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                        <span>Analyze</span>
                        <span>→</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </AnimatedReveal>
      </section>

      {/* ===================== FAQ ACCORDION ===================== */}
      <section className="max-w-3xl mx-auto px-4">
        <AnimatedReveal>
          <div className="text-center space-y-2 mb-6 sm:mb-8">
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
              FAQ
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
              Frequently Asked Questions
            </h2>
          </div>
        </AnimatedReveal>

        <div className="space-y-2.5">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <AnimatedReveal key={idx} delayClass={`stagger-${(idx % 4) + 1}` as any}>
                <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden transition-all">
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between gap-3 font-semibold text-xs sm:text-sm text-slate-900 hover:text-violet-700 transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <span className="text-base text-slate-400 shrink-0 font-mono font-bold">
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              </AnimatedReveal>
            );
          })}
        </div>
      </section>

      {/* ===================== CLASSIC BOTTOM CTA ===================== */}
      <section className="max-w-5xl mx-auto px-4">
        <AnimatedReveal>
          <div className="p-8 sm:p-12 rounded-2xl sm:rounded-3xl bg-slate-900 text-white text-center space-y-5 border border-slate-800 shadow-lg">
            
            <div className="max-w-xl mx-auto space-y-2">
              <span className="px-3 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold uppercase tracking-wider inline-block">
                Start Immediately
              </span>
              <h2 className="text-2xl sm:text-4xl font-black font-heading tracking-tight leading-tight">
                Ready to Perfect Your Delivery?
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                No account required, no credit cards, zero cloud uploads. Start testing in 5 seconds.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-2">
              <button
                onClick={() => onGetStarted('record')}
                className="px-6 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Clay3DIcon name="mic" size="xs" />
                <span>Launch Speech Studio Now</span>
              </button>

              <button
                onClick={onOpenJsonModal}
                className="px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm border border-slate-700 transition-all active:scale-[0.98] cursor-pointer"
              >
                <span>Inspect PRD JSON Schema</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-400 font-medium pt-1">
              Open-Source Contrastive Speech Diagnostics · Smart India Hackathon
            </p>
          </div>
        </AnimatedReveal>
      </section>

      {/* ===================== FOOTER ===================== */}
      <footer className="border-t border-slate-200 pt-6 max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 p-0.5 flex items-center justify-center">
            <img src="/app-icon.png" alt="VoxPulse" className="w-full h-full object-contain rounded" />
          </div>
          <span className="font-heading font-black text-slate-800 text-sm">
            Vox<span className="text-violet-600">Pulse</span>
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-[11px]">Contrastive Speech Diagnostics</span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <button onClick={() => onGetStarted('record')} className="hover:text-violet-600 transition-colors cursor-pointer">
            Studio
          </button>
          <button onClick={() => onGetStarted('presets')} className="hover:text-violet-600 transition-colors cursor-pointer">
            Benchmarks
          </button>
          <button onClick={onOpenJsonModal} className="hover:text-violet-600 transition-colors cursor-pointer">
            PRD Contract
          </button>
          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-mono font-bold text-slate-600">
            v1.2.0
          </span>
        </div>
      </footer>

    </div>
  );
};
