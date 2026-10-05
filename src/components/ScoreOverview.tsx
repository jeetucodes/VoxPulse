import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Clay3DIcon } from './Clay3DIcon';
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
      
      {/* Primary Circular Gauge Card (Claymorphic 3D) */}
      <div className="lg:col-span-5 card-clay p-7 flex flex-col items-center justify-center relative overflow-hidden space-y-4">
        
        {/* Soft Ambient Light Gradient */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-gradient-to-b from-white/90 to-transparent blur-md pointer-events-none" />

        <div className="flex items-center gap-2.5">
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
        <div>
          <span className={`px-4 py-1.5 rounded-full text-xs font-extrabold shadow-clay-pill border flex items-center gap-1.5 ${theme.badgeBg}`}>
            <Clay3DIcon name={theme.iconName} size="xs" />
            <span>{theme.label}</span>
          </span>
        </div>

        {/* Micro-insight */}
        <div className="text-center pt-1">
          <p className="text-xs text-slate-500 font-medium">
            Contrastive benchmark evaluation against championship speech models.
          </p>
        </div>
      </div>

      {/* Sub-Metrics Breakdown Cards (3D Clay & Authentic Clay Icons) */}
      <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Card 1: Pacing */}
          <div className="card-clay p-5 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-3 font-bold text-slate-800 font-heading">
                <Clay3DIcon name="clock" size="md" withPedestal />
                <div>
                  <span className="block text-slate-900 font-extrabold">Pacing & Cadence</span>
                  <span className="text-[10px] text-slate-400 font-normal">Syllables per second</span>
                </div>
              </span>
              <span className="font-black text-slate-900 text-sm bg-violet-50 text-violet-800 px-2.5 py-1 rounded-xl border border-violet-200/80 shadow-clay-pill">
                {breakdown.pacing}/100
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-100/90 shadow-inner overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-indigo-600 rounded-full transition-all duration-500 shadow-xs relative"
                style={{ width: `${breakdown.pacing}%` }}
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-white/40 rounded-full" />
              </div>
            </div>
            <div className="flex justify-between text-[11px] font-semibold text-slate-500">
              <span>Avg: {participantSummary.avgWpm} WPM</span>
              <span className="text-violet-600 font-bold">Target: {audioBaselineSummary.avgWpm}</span>
            </div>
          </div>

          {/* Card 2: Fluency */}
          <div className="card-clay p-5 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-3 font-bold text-slate-800 font-heading">
                <Clay3DIcon name="flash" size="md" withPedestal />
                <div>
                  <span className="block text-slate-900 font-extrabold">Fluency & Flow</span>
                  <span className="text-[10px] text-slate-400 font-normal">Silence & pause ratio</span>
                </div>
              </span>
              <span className="font-black text-slate-900 text-sm bg-pink-50 text-pink-800 px-2.5 py-1 rounded-xl border border-pink-200/80 shadow-clay-pill">
                {breakdown.fluency}/100
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-100/90 shadow-inner overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full transition-all duration-500 shadow-xs relative"
                style={{ width: `${breakdown.fluency}%` }}
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-white/40 rounded-full" />
              </div>
            </div>
            <div className="flex justify-between text-[11px] font-semibold text-slate-500">
              <span>Silence: {Math.round(participantSummary.pauseRatio * 100)}%</span>
              <span className="text-pink-600 font-bold">Target: &lt;10%</span>
            </div>
          </div>

          {/* Card 3: Articulation */}
          <div className="card-clay p-5 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-3 font-bold text-slate-800 font-heading">
                <Clay3DIcon name="mic" size="md" withPedestal />
                <div>
                  <span className="block text-slate-900 font-extrabold">Articulation</span>
                  <span className="text-[10px] text-slate-400 font-normal">Spectral clarity & formants</span>
                </div>
              </span>
              <span className="font-black text-slate-900 text-sm bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-xl border border-emerald-200/80 shadow-clay-pill">
                {breakdown.articulation}/100
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-100/90 shadow-inner overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500 shadow-xs relative"
                style={{ width: `${breakdown.articulation}%` }}
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-white/40 rounded-full" />
              </div>
            </div>
            <div className="flex justify-between text-[11px] font-semibold text-slate-500">
              <span>Formants: Crisp</span>
              <span className="text-emerald-600 font-bold">High Clarity</span>
            </div>
          </div>

          {/* Card 4: Dynamic Expression */}
          <div className="card-clay p-5 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-3 font-bold text-slate-800 font-heading">
                <Clay3DIcon name="chart" size="md" withPedestal />
                <div>
                  <span className="block text-slate-900 font-extrabold">Dynamic Pitch</span>
                  <span className="text-[10px] text-slate-400 font-normal">F0 vocal modulation</span>
                </div>
              </span>
              <span className="font-black text-slate-900 text-sm bg-amber-50 text-amber-800 px-2.5 py-1 rounded-xl border border-amber-200/80 shadow-clay-pill">
                {breakdown.pitchDynamics}/100
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-100/90 shadow-inner overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500 shadow-xs relative"
                style={{ width: `${breakdown.pitchDynamics}%` }}
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-white/40 rounded-full" />
              </div>
            </div>
            <div className="flex justify-between text-[11px] font-semibold text-slate-500">
              <span>F0: {participantSummary.pitchRangeHz}Hz</span>
              <span className="text-amber-600 font-bold">Modulation: Active</span>
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
