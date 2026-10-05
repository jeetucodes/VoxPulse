import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Clock, Zap, Mic, Activity, Pin } from 'lucide-react';
import { Clay3DIcon } from './Clay3DIcon';
import { WaterWaveDecoration } from './WaterWaveDecoration';
import type { AnalysisResult } from '../types/speech';

interface ScoreOverviewProps {
  result: AnalysisResult;
}

export const ScoreOverview: React.FC<ScoreOverviewProps> = ({ result }) => {
  const { overall_score, breakdown, flaws, participantSummary, audioBaselineSummary } = result;

  useEffect(() => {
    if (overall_score >= 85) {
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore
      }
    }
  }, [overall_score]);

  const getScoreTheme = (score: number) => {
    if (score >= 85) {
      return {
        badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        label: 'Championship Benchmark',
        iconName: 'trophy' as const
      };
    }
    if (score >= 70) {
      return {
        badgeBg: 'bg-violet-50 text-violet-700 border-violet-200',
        label: 'Proficient Delivery',
        iconName: 'star' as const
      };
    }
    if (score >= 55) {
      return {
        badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
        label: 'Developing Delivery',
        iconName: 'target' as const
      };
    }
    return {
      badgeBg: 'bg-pink-50 text-pink-700 border-pink-200',
      label: 'Needs Remediation',
      iconName: 'warning' as const
    };
  };

  const theme = getScoreTheme(overall_score);

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overall_score / 100) * circumference;

  const highFlaws = flaws.filter(f => f.severity === 'high').length;
  const medFlaws = flaws.filter(f => f.severity === 'medium').length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Primary Circular Gauge Card (Sticky Note Style with Washi Tape & Waves) */}
      <div className="lg:col-span-5 sticky-note sticky-purple p-7 flex flex-col items-center justify-center relative overflow-hidden space-y-4 shadow-clay-card sm:rotate-[-0.5deg]">
        
        {/* Top Washi Tape Strip */}
        <div className="sticky-tape !w-24 !h-5 !-top-2.5"></div>
        
        {/* Animated Water Wave at Bottom */}
        <WaterWaveDecoration color="rgba(139, 92, 246, 0.12)" height="h-24 sm:h-28" />

        {/* Soft Ambient Light Gradient */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-gradient-to-b from-white/90 to-transparent blur-md pointer-events-none" />

        <div className="relative z-10 flex items-center gap-2.5">
          <Clay3DIcon name={theme.iconName} size="sm" floating />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800 font-heading">
            Overall Delivery Score
          </span>
        </div>

        {/* Circular SVG Meter (Guaranteed Pixel-Perfect Centering) */}
        <div className="relative flex items-center justify-center w-44 h-44 sm:w-48 sm:h-48 my-2 mx-auto">
          <div className="absolute inset-0 rounded-full bg-violet-400/15 blur-2xl pointer-events-none"></div>
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 168 168">
            <defs>
              <linearGradient id="scoreGaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={overall_score >= 85 ? '#10B981' : overall_score >= 70 ? '#8B5CF6' : overall_score >= 55 ? '#F59E0B' : '#EC4899'} />
                <stop offset="100%" stopColor={overall_score >= 85 ? '#059669' : overall_score >= 70 ? '#6366F1' : overall_score >= 55 ? '#D97706' : '#DB2777'} />
              </linearGradient>
            </defs>
            {/* Background track */}
            <circle
              cx="84"
              cy="84"
              r={radius}
              stroke="#E2E8F0"
              strokeWidth="12"
              fill="transparent"
            />
            {/* Value circle */}
            <circle
              cx="84"
              cy="84"
              r={radius}
              stroke="url(#scoreGaugeGradient)"
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          {/* Centered Score Number */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none select-none">
            <span className="text-4xl sm:text-5xl font-black text-slate-900 font-heading tracking-tight drop-shadow-sm leading-none">
              {overall_score}
            </span>
            <span className="text-[10px] font-extrabold tracking-widest uppercase text-slate-400 mt-1">
              OUT OF 100
            </span>
          </div>
        </div>

        {/* Dynamic Tier Badge */}
        <div className="relative z-10">
          <span className={`px-4 py-1.5 rounded-full text-xs font-extrabold shadow-clay-pill border flex items-center gap-1.5 ${theme.badgeBg}`}>
            <Clay3DIcon name={theme.iconName} size="xs" />
            <span>{theme.label}</span>
          </span>
        </div>

        {/* Micro-insight */}
        <div className="text-center pt-1 relative z-10">
          <p className="text-xs text-slate-500 font-medium">
            Contrastive benchmark evaluation against championship speech models.
          </p>
        </div>
      </div>

      {/* Sub-Metrics Breakdown Cards */}
      <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
        
        {/* ============================================================== */}
        {/* MOBILE ONLY (< 640px): EK CARD KE ANDAR 4 STICKY NOTE CARDS  */}
        {/* ============================================================== */}
        <div className="block sm:hidden card-clay p-3.5 rounded-3xl bg-gradient-to-b from-white via-slate-50 to-purple-50/20 border border-slate-200/90 shadow-clay-card space-y-3 relative overflow-hidden">
          {/* Parent Card Header with Pin */}
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/70 relative z-10">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-violet-600 text-white flex items-center justify-center shadow-xs">
                <Pin className="w-3.5 h-3.5 fill-current rotate-45" />
              </span>
              <div>
                <h4 className="text-xs font-black text-slate-900 tracking-tight font-heading">
                  Vocal Delivery Breakdown
                </h4>
                <p className="text-[10px] text-slate-500 font-medium">4 Core Metrics Together</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 border border-violet-200">
              Live Scores
            </span>
          </div>

          {/* 2x2 Grid of Sticky Note Cards inside the Parent Card */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            
            {/* Sticky Note 1: Pacing & Cadence */}
            <div className="sticky-note sticky-purple -rotate-1 p-2.5 flex flex-col justify-between space-y-2 rounded-2xl relative shadow-md">
              <div className="sticky-tape !w-10 !h-3 !-top-1.5"></div>
              
              <div className="flex items-start justify-between gap-1 pt-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="w-6 h-6 rounded-lg bg-violet-600 text-white flex items-center justify-center shadow-xs shrink-0">
                    <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-slate-900 font-extrabold text-[11px] leading-tight truncate">
                      Pacing
                    </span>
                    <span className="block text-[8px] text-purple-700/80 font-bold uppercase tracking-wider">
                      Cadence
                    </span>
                  </div>
                </div>
                <span className="font-black text-slate-900 text-[11px] bg-white/95 text-violet-800 px-1.5 py-0.5 rounded-md border border-purple-300 shadow-xs shrink-0">
                  {breakdown.pacing}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 rounded-full bg-purple-200/90 overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full"
                  style={{ width: `${breakdown.pacing}%` }}
                />
              </div>

              {/* Bottom stats */}
              <div className="flex justify-between items-center text-[9px] font-bold text-slate-700">
                <span>{participantSummary.avgWpm} WPM</span>
                <span className="text-violet-700 bg-white/70 px-1 rounded">Target {audioBaselineSummary.avgWpm}</span>
              </div>
            </div>

            {/* Sticky Note 2: Fluency & Flow */}
            <div className="sticky-note sticky-pink rotate-1 p-2.5 flex flex-col justify-between space-y-2 rounded-2xl relative shadow-md">
              <div className="sticky-tape !w-10 !h-3 !-top-1.5"></div>
              
              <div className="flex items-start justify-between gap-1 pt-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="w-6 h-6 rounded-lg bg-rose-600 text-white flex items-center justify-center shadow-xs shrink-0">
                    <Zap className="w-3.5 h-3.5 fill-current stroke-[2.5]" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-slate-900 font-extrabold text-[11px] leading-tight truncate">
                      Fluency
                    </span>
                    <span className="block text-[8px] text-pink-700/80 font-bold uppercase tracking-wider">
                      Flow
                    </span>
                  </div>
                </div>
                <span className="font-black text-slate-900 text-[11px] bg-white/95 text-rose-800 px-1.5 py-0.5 rounded-md border border-rose-300 shadow-xs shrink-0">
                  {breakdown.fluency}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 rounded-full bg-rose-200/90 overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-pink-500 to-rose-600 rounded-full"
                  style={{ width: `${breakdown.fluency}%` }}
                />
              </div>

              {/* Bottom stats */}
              <div className="flex justify-between items-center text-[9px] font-bold text-slate-700">
                <span>Pause {Math.round(participantSummary.pauseRatio * 100)}%</span>
                <span className="text-rose-700 bg-white/70 px-1 rounded">&lt;10%</span>
              </div>
            </div>

            {/* Sticky Note 3: Articulation */}
            <div className="sticky-note sticky-green -rotate-1 p-2.5 flex flex-col justify-between space-y-2 rounded-2xl relative shadow-md">
              <div className="sticky-tape !w-10 !h-3 !-top-1.5"></div>
              
              <div className="flex items-start justify-between gap-1 pt-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
                    <Mic className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-slate-900 font-extrabold text-[11px] leading-tight truncate">
                      Articulation
                    </span>
                    <span className="block text-[8px] text-emerald-800/80 font-bold uppercase tracking-wider">
                      Clarity
                    </span>
                  </div>
                </div>
                <span className="font-black text-slate-900 text-[11px] bg-white/95 text-emerald-800 px-1.5 py-0.5 rounded-md border border-emerald-300 shadow-xs shrink-0">
                  {breakdown.articulation}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 rounded-full bg-emerald-200/90 overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full"
                  style={{ width: `${breakdown.articulation}%` }}
                />
              </div>

              {/* Bottom stats */}
              <div className="flex justify-between items-center text-[9px] font-bold text-slate-700">
                <span>Formants</span>
                <span className="text-emerald-700 bg-white/70 px-1 rounded">Crisp</span>
              </div>
            </div>

            {/* Sticky Note 4: Dynamic Pitch */}
            <div className="sticky-note sticky-yellow rotate-1 p-2.5 flex flex-col justify-between space-y-2 rounded-2xl relative shadow-md">
              <div className="sticky-tape !w-10 !h-3 !-top-1.5"></div>
              
              <div className="flex items-start justify-between gap-1 pt-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs shrink-0">
                    <Activity className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-slate-900 font-extrabold text-[11px] leading-tight truncate">
                      Dynamic
                    </span>
                    <span className="block text-[8px] text-amber-800/80 font-bold uppercase tracking-wider">
                      Pitch
                    </span>
                  </div>
                </div>
                <span className="font-black text-slate-900 text-[11px] bg-white/95 text-amber-800 px-1.5 py-0.5 rounded-md border border-amber-300 shadow-xs shrink-0">
                  {breakdown.pitchDynamics}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 rounded-full bg-amber-200/90 overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                  style={{ width: `${breakdown.pitchDynamics}%` }}
                />
              </div>

              {/* Bottom stats */}
              <div className="flex justify-between items-center text-[9px] font-bold text-slate-700">
                <span>F0 Range</span>
                <span className="text-amber-800 bg-white/70 px-1 rounded">{participantSummary.pitchRangeHz}Hz</span>
              </div>
            </div>

          </div>
        </div>

        {/* ============================================================== */}
        {/* DESKTOP VIEW (>= 640px): 2-COLUMN STICKY NOTES                */}
        {/* ============================================================== */}
        <div className="hidden sm:grid sm:grid-cols-2 gap-4">
          
          {/* Card 1: Pacing & Cadence (Sticky Note Purple) */}
          <div className="sticky-note sticky-purple -rotate-1 p-5 flex flex-col justify-between space-y-3 relative overflow-hidden shadow-clay-card">
            <div className="sticky-tape !w-14 !h-4 !-top-2"></div>
            <WaterWaveDecoration color="rgba(139, 92, 246, 0.09)" height="h-16" />
            <div className="relative z-10 flex items-center justify-between text-xs">
              <span className="flex items-center gap-3 font-bold text-slate-800 font-heading">
                <div className="w-10 h-10 rounded-2xl bg-white/90 border border-violet-200 shadow-clay-card flex items-center justify-center shrink-0 text-violet-700">
                  <Clock className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <span className="block text-slate-900 font-extrabold text-sm">Pacing & Cadence</span>
                  <span className="text-[10px] text-slate-500 font-normal">Syllables per second</span>
                </div>
              </span>
              <span className="font-black text-slate-900 text-sm bg-white/95 text-violet-800 px-2.5 py-1 rounded-xl border border-violet-200/90 shadow-clay-pill">
                {breakdown.pacing}/100
              </span>
            </div>
            <div className="relative z-10 w-full h-2.5 rounded-full bg-violet-200/70 shadow-inner overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-indigo-600 rounded-full transition-all duration-500 shadow-xs relative"
                style={{ width: `${breakdown.pacing}%` }}
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-white/40 rounded-full" />
              </div>
            </div>
            <div className="relative z-10 flex justify-between text-[11px] font-semibold text-slate-600">
              <span>Avg: {participantSummary.avgWpm} WPM</span>
              <span className="text-violet-700 font-bold">Target: {audioBaselineSummary.avgWpm}</span>
            </div>
          </div>

          {/* Card 2: Fluency & Flow (Sticky Note Pink) */}
          <div className="sticky-note sticky-pink rotate-1 p-5 flex flex-col justify-between space-y-3 relative overflow-hidden shadow-clay-card">
            <div className="sticky-tape !w-14 !h-4 !-top-2"></div>
            <WaterWaveDecoration color="rgba(244, 63, 94, 0.08)" height="h-16" />
            <div className="relative z-10 flex items-center justify-between text-xs">
              <span className="flex items-center gap-3 font-bold text-slate-800 font-heading">
                <div className="w-10 h-10 rounded-2xl bg-white/90 border border-pink-200 shadow-clay-card flex items-center justify-center shrink-0 text-rose-600">
                  <Zap className="w-5 h-5 fill-current stroke-[2.5]" />
                </div>
                <div>
                  <span className="block text-slate-900 font-extrabold text-sm">Fluency & Flow</span>
                  <span className="text-[10px] text-slate-500 font-normal">Silence & pause ratio</span>
                </div>
              </span>
              <span className="font-black text-slate-900 text-sm bg-white/95 text-rose-800 px-2.5 py-1 rounded-xl border border-rose-200/90 shadow-clay-pill">
                {breakdown.fluency}/100
              </span>
            </div>
            <div className="relative z-10 w-full h-2.5 rounded-full bg-pink-200/70 shadow-inner overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full transition-all duration-500 shadow-xs relative"
                style={{ width: `${breakdown.fluency}%` }}
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-white/40 rounded-full" />
              </div>
            </div>
            <div className="relative z-10 flex justify-between text-[11px] font-semibold text-slate-600">
              <span>Silence: {Math.round(participantSummary.pauseRatio * 100)}%</span>
              <span className="text-rose-700 font-bold">Target: &lt;10%</span>
            </div>
          </div>

          {/* Card 3: Articulation (Sticky Note Green) */}
          <div className="sticky-note sticky-green -rotate-1 p-5 flex flex-col justify-between space-y-3 relative overflow-hidden shadow-clay-card">
            <div className="sticky-tape !w-14 !h-4 !-top-2"></div>
            <WaterWaveDecoration color="rgba(16, 185, 129, 0.09)" height="h-16" />
            <div className="relative z-10 flex items-center justify-between text-xs">
              <span className="flex items-center gap-3 font-bold text-slate-800 font-heading">
                <div className="w-10 h-10 rounded-2xl bg-white/90 border border-emerald-200 shadow-clay-card flex items-center justify-center shrink-0 text-emerald-600">
                  <Mic className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <span className="block text-slate-900 font-extrabold text-sm">Articulation</span>
                  <span className="text-[10px] text-slate-500 font-normal">Spectral clarity & formants</span>
                </div>
              </span>
              <span className="font-black text-slate-900 text-sm bg-white/95 text-emerald-800 px-2.5 py-1 rounded-xl border border-emerald-200/90 shadow-clay-pill">
                {breakdown.articulation}/100
              </span>
            </div>
            <div className="relative z-10 w-full h-2.5 rounded-full bg-emerald-200/70 shadow-inner overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500 shadow-xs relative"
                style={{ width: `${breakdown.articulation}%` }}
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-white/40 rounded-full" />
              </div>
            </div>
            <div className="relative z-10 flex justify-between text-[11px] font-semibold text-slate-600">
              <span>Formants: Crisp</span>
              <span className="text-emerald-700 font-bold">High Clarity</span>
            </div>
          </div>

          {/* Card 4: Dynamic Expression (Sticky Note Yellow) */}
          <div className="sticky-note sticky-yellow rotate-1 p-5 flex flex-col justify-between space-y-3 relative overflow-hidden shadow-clay-card">
            <div className="sticky-tape !w-14 !h-4 !-top-2"></div>
            <WaterWaveDecoration color="rgba(245, 158, 11, 0.09)" height="h-16" />
            <div className="relative z-10 flex items-center justify-between text-xs">
              <span className="flex items-center gap-3 font-bold text-slate-800 font-heading">
                <div className="w-10 h-10 rounded-2xl bg-white/90 border border-amber-200 shadow-clay-card flex items-center justify-center shrink-0 text-amber-600">
                  <Activity className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <span className="block text-slate-900 font-extrabold text-sm">Dynamic Pitch</span>
                  <span className="text-[10px] text-slate-500 font-normal">F0 vocal modulation</span>
                </div>
              </span>
              <span className="font-black text-slate-900 text-sm bg-white/95 text-amber-800 px-2.5 py-1 rounded-xl border border-amber-200/90 shadow-clay-pill">
                {breakdown.pitchDynamics}/100
              </span>
            </div>
            <div className="relative z-10 w-full h-2.5 rounded-full bg-amber-200/70 shadow-inner overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500 shadow-xs relative"
                style={{ width: `${breakdown.pitchDynamics}%` }}
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-white/40 rounded-full" />
              </div>
            </div>
            <div className="relative z-10 flex justify-between text-[11px] font-semibold text-slate-600">
              <span>F0: {participantSummary.pitchRangeHz}Hz</span>
              <span className="text-amber-700 font-bold">Modulation: Active</span>
            </div>
          </div>

        </div>

        {/* Diagnostic Flaw Summary Memo Strip (Sticky Note Peach with Pushpin) */}
        <div className="sticky-note sticky-peach p-4 flex items-center justify-between flex-wrap gap-2 text-xs font-semibold text-slate-800 rounded-2xl relative shadow-sm border border-orange-200/90">
          <div className="sticky-pin sticky-pin-amber !left-6 !-top-2"></div>
          <div className="flex items-center space-x-2.5 pt-1 sm:pt-0">
            {highFlaws > 0 ? (
              <Clay3DIcon name="warning" size="xs" />
            ) : (
              <Clay3DIcon name="tick" size="xs" />
            )}
            <span>
              {flaws.length === 0
                ? 'No critical delivery flaws detected. Excellent oratorical control!'
                : `Detected ${flaws.length} grounded delivery flaw${flaws.length > 1 ? 's' : ''} across speech timeline.`}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {highFlaws > 0 && (
              <span className="px-3 py-1 rounded-full bg-pink-500 text-white shadow-sugary-pink text-[11px] font-bold">
                {highFlaws} High Severity
              </span>
            )}
            {medFlaws > 0 && (
              <span className="px-3 py-1 rounded-full bg-amber-500 text-white shadow-sugary-amber text-[11px] font-bold">
                {medFlaws} Medium Severity
              </span>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
