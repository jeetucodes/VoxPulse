import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
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
      
      {/* Primary Circular Gauge Card (Claymorphic 3D with Ambient Water Waves) */}
      <div className="lg:col-span-5 card-clay card-clay-violet p-7 flex flex-col items-center justify-center relative overflow-hidden space-y-4">
        
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

      {/* Sub-Metrics Breakdown Cards (3D Clay with Pastel Water Wave Flow) */}
      <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
        
        {/* Sub-Metrics Breakdown Cards: 2x2 compact grid together on mobile, 2-col on desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-2.5 sm:gap-4">
          
          {/* Card 1: Pacing & Cadence (Soft Violet Glow) */}
          <div className="card-clay card-clay-violet p-3 sm:p-5 flex flex-col justify-between space-y-2 sm:space-y-3 relative overflow-hidden">
            <WaterWaveDecoration color="rgba(139, 92, 246, 0.09)" height="h-16" />
            <div className="relative z-10 flex items-center justify-between text-xs gap-1">
              <span className="flex items-center gap-1.5 sm:gap-3 font-bold text-slate-800 font-heading min-w-0">
                <Clay3DIcon name="clock" size="sm" withPedestal className="hidden xs:inline-flex shrink-0" />
                <div className="min-w-0">
                  <span className="block text-slate-900 font-extrabold text-[11px] sm:text-sm leading-tight truncate sm:whitespace-normal">Pacing & Cadence</span>
                  <span className="hidden sm:block text-[10px] text-slate-500 font-normal">Syllables per second</span>
                </div>
              </span>
              <span className="font-black text-slate-900 text-[11px] sm:text-sm bg-violet-100/80 text-violet-800 px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-lg sm:rounded-xl border border-violet-200/90 shadow-clay-pill shrink-0">
                {breakdown.pacing}/100
              </span>
            </div>
            <div className="relative z-10 w-full h-2 sm:h-2.5 rounded-full bg-slate-200/60 shadow-inner overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-indigo-600 rounded-full transition-all duration-500 shadow-xs relative"
                style={{ width: `${breakdown.pacing}%` }}
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-white/40 rounded-full" />
              </div>
            </div>
            <div className="relative z-10 flex flex-col sm:flex-row justify-between text-[10px] sm:text-[11px] font-semibold text-slate-600 gap-0.5">
              <span className="truncate">Avg: {participantSummary.avgWpm} WPM</span>
              <span className="text-violet-700 font-bold truncate">Target: {audioBaselineSummary.avgWpm}</span>
            </div>
          </div>

          {/* Card 2: Fluency & Flow (Soft Rose/Pink Glow) */}
          <div className="card-clay card-clay-pink p-3 sm:p-5 flex flex-col justify-between space-y-2 sm:space-y-3 relative overflow-hidden">
            <WaterWaveDecoration color="rgba(244, 63, 94, 0.08)" height="h-16" />
            <div className="relative z-10 flex items-center justify-between text-xs gap-1">
              <span className="flex items-center gap-1.5 sm:gap-3 font-bold text-slate-800 font-heading min-w-0">
                <Clay3DIcon name="flash" size="sm" withPedestal className="hidden xs:inline-flex shrink-0" />
                <div className="min-w-0">
                  <span className="block text-slate-900 font-extrabold text-[11px] sm:text-sm leading-tight truncate sm:whitespace-normal">Fluency & Flow</span>
                  <span className="hidden sm:block text-[10px] text-slate-500 font-normal">Silence & pause ratio</span>
                </div>
              </span>
              <span className="font-black text-slate-900 text-[11px] sm:text-sm bg-rose-100/80 text-rose-800 px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-lg sm:rounded-xl border border-rose-200/90 shadow-clay-pill shrink-0">
                {breakdown.fluency}/100
              </span>
            </div>
            <div className="relative z-10 w-full h-2 sm:h-2.5 rounded-full bg-slate-200/60 shadow-inner overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full transition-all duration-500 shadow-xs relative"
                style={{ width: `${breakdown.fluency}%` }}
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-white/40 rounded-full" />
              </div>
            </div>
            <div className="relative z-10 flex flex-col sm:flex-row justify-between text-[10px] sm:text-[11px] font-semibold text-slate-600 gap-0.5">
              <span className="truncate">Pause: {Math.round(participantSummary.pauseRatio * 100)}%</span>
              <span className="text-rose-700 font-bold truncate">Target: &lt;10%</span>
            </div>
          </div>

          {/* Card 3: Articulation (Soft Emerald Glow) */}
          <div className="card-clay card-clay-emerald p-3 sm:p-5 flex flex-col justify-between space-y-2 sm:space-y-3 relative overflow-hidden">
            <WaterWaveDecoration color="rgba(16, 185, 129, 0.09)" height="h-16" />
            <div className="relative z-10 flex items-center justify-between text-xs gap-1">
              <span className="flex items-center gap-1.5 sm:gap-3 font-bold text-slate-800 font-heading min-w-0">
                <Clay3DIcon name="mic" size="sm" withPedestal className="hidden xs:inline-flex shrink-0" />
                <div className="min-w-0">
                  <span className="block text-slate-900 font-extrabold text-[11px] sm:text-sm leading-tight truncate sm:whitespace-normal">Articulation</span>
                  <span className="hidden sm:block text-[10px] text-slate-500 font-normal">Spectral clarity & formants</span>
                </div>
              </span>
              <span className="font-black text-slate-900 text-[11px] sm:text-sm bg-emerald-100/80 text-emerald-800 px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-lg sm:rounded-xl border border-emerald-200/90 shadow-clay-pill shrink-0">
                {breakdown.articulation}/100
              </span>
            </div>
            <div className="relative z-10 w-full h-2 sm:h-2.5 rounded-full bg-slate-200/60 shadow-inner overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500 shadow-xs relative"
                style={{ width: `${breakdown.articulation}%` }}
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-white/40 rounded-full" />
              </div>
            </div>
            <div className="relative z-10 flex flex-col sm:flex-row justify-between text-[10px] sm:text-[11px] font-semibold text-slate-600 gap-0.5">
              <span className="truncate">Formants: Crisp</span>
              <span className="text-emerald-700 font-bold truncate">High Clarity</span>
            </div>
          </div>

          {/* Card 4: Dynamic Pitch / Expression (Soft Amber Glow) */}
          <div className="card-clay card-clay-amber p-3 sm:p-5 flex flex-col justify-between space-y-2 sm:space-y-3 relative overflow-hidden">
            <WaterWaveDecoration color="rgba(245, 158, 11, 0.09)" height="h-16" />
            <div className="relative z-10 flex items-center justify-between text-xs gap-1">
              <span className="flex items-center gap-1.5 sm:gap-3 font-bold text-slate-800 font-heading min-w-0">
                <Clay3DIcon name="chart" size="sm" withPedestal className="hidden xs:inline-flex shrink-0" />
                <div className="min-w-0">
                  <span className="block text-slate-900 font-extrabold text-[11px] sm:text-sm leading-tight truncate sm:whitespace-normal">Dynamic Pitch</span>
                  <span className="hidden sm:block text-[10px] text-slate-500 font-normal">F0 vocal modulation</span>
                </div>
              </span>
              <span className="font-black text-slate-900 text-[11px] sm:text-sm bg-amber-100/80 text-amber-800 px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-lg sm:rounded-xl border border-amber-200/90 shadow-clay-pill shrink-0">
                {breakdown.pitchDynamics}/100
              </span>
            </div>
            <div className="relative z-10 w-full h-2 sm:h-2.5 rounded-full bg-slate-200/60 shadow-inner overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500 shadow-xs relative"
                style={{ width: `${breakdown.pitchDynamics}%` }}
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-white/40 rounded-full" />
              </div>
            </div>
            <div className="relative z-10 flex flex-col sm:flex-row justify-between text-[10px] sm:text-[11px] font-semibold text-slate-600 gap-0.5">
              <span className="truncate">F0: {participantSummary.pitchRangeHz}Hz</span>
              <span className="text-amber-700 font-bold truncate">Modulation: Active</span>
            </div>
          </div>

        </div>

        {/* Diagnostic Flaw Summary Bar (Clay Inset) */}
        <div className="clay-inset-well p-4 flex items-center justify-between flex-wrap gap-2 text-xs font-semibold text-slate-700">
          <div className="flex items-center space-x-2.5">
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
