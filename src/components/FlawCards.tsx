import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Clock, BarChart2, Check } from 'lucide-react';
import { Clay3DIcon } from './Clay3DIcon';
import type { Flaw, FlawType } from '../types/speech';

interface FlawCardsProps {
  flaws: Flaw[];
  activeFlawId?: string | null;
  onPlaySegment: (start: number, end: number, flawId: string) => void;
}

export const FlawCards: React.FC<FlawCardsProps> = ({
  flaws,
  activeFlawId,
  onPlaySegment
}) => {
  const [expandedCardIds, setExpandedCardIds] = useState<Record<string, boolean>>({
    [flaws[0]?.id || '']: true
  });

  const toggleExpand = (id: string) => {
    setExpandedCardIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getTypeBadge = (type: FlawType) => {
    switch (type) {
      case 'fast_speech':
        return {
          icon: <Clay3DIcon name="rocket" size="md" withPedestal />,
          label: 'Fast Cadence',
          badgeClass: 'bg-pink-50 text-pink-800 border-pink-200',
          activeRing: 'ring-2 ring-pink-500 border-pink-300',
        };
      case 'unnatural_pause':
        return {
          icon: <Clay3DIcon name="clock" size="md" withPedestal />,
          label: 'Unnatural Pause',
          badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
          activeRing: 'ring-2 ring-amber-500 border-amber-300',
        };
      case 'mumbling':
        return {
          icon: <Clay3DIcon name="mic" size="md" withPedestal />,
          label: 'Muffled Articulation',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          activeRing: 'ring-2 ring-emerald-500 border-emerald-300',
        };
      case 'monotone_pitch':
        return {
          icon: <Clay3DIcon name="target" size="md" withPedestal />,
          label: 'Monotone Pitch',
          badgeClass: 'bg-violet-50 text-violet-800 border-violet-200',
          activeRing: 'ring-2 ring-violet-500 border-violet-300',
        };
      case 'volume_drop':
      default:
        return {
          icon: <Clay3DIcon name="speaker" size="md" withPedestal />,
          label: 'Volume Drop',
          badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
          activeRing: 'ring-2 ring-rose-500 border-rose-300',
        };
    }
  };

  const getSeverityBadge = (sev: Flaw['severity']) => {
    switch (sev) {
      case 'high':
        return 'bg-pink-500 text-white shadow-sugary-pink';
      case 'medium':
        return 'bg-amber-500 text-white shadow-sugary-amber';
      case 'low':
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-200';
    }
  };

  if (flaws.length === 0) {
    return (
      <div className="card-clay p-8 text-center rounded-3xl border border-white/80 space-y-4">
        <div className="mx-auto flex justify-center">
          <Clay3DIcon name="trophy" size="xl" floating />
        </div>
        <h3 className="text-xl font-black text-slate-900 font-heading">Zero Delivery Flaws Detected! 🎉</h3>
        <p className="text-xs text-slate-500 font-medium max-w-md mx-auto">
          Your delivery rhythm, pause distribution, and vocal articulation align within 95% of national competition benchmark standards.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2.5">
          <Clay3DIcon name="warning" size="sm" floating />
          <h3 className="text-base sm:text-lg font-black text-slate-900 font-heading tracking-tight">
            Temporally Grounded Flaws ({flaws.length})
          </h3>
        </div>
        <span className="hidden sm:inline-block text-xs text-slate-500 font-semibold bg-white px-3.5 py-1.5 rounded-full border border-slate-200 shadow-clay-pill">
          Click card to play exact audio region
        </span>
      </div>

      <div className="space-y-3.5">
        {flaws.map((flaw) => {
          const badge = getTypeBadge(flaw.type);
          const isExpanded = !!expandedCardIds[flaw.id];
          const isActive = flaw.id === activeFlawId;

          return (
            <div
              key={flaw.id}
              className={`card-clay transition-all duration-300 overflow-hidden ${
                isActive 
                  ? `${badge.activeRing} shadow-clay-card-hover scale-[1.01]` 
                  : 'hover:border-slate-300'
              }`}
            >
              <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                
                <div className="flex items-start gap-3 sm:gap-3.5 flex-1">
                  {/* Category 3D Clay Icon with Pedestal */}
                  {badge.icon}

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <span className={`px-2.5 sm:px-3 py-0.5 rounded-full text-xs font-bold border shadow-sm ${badge.badgeClass}`}>
                        {badge.label}
                      </span>
                      <span className={`px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getSeverityBadge(flaw.severity)}`}>
                        {flaw.severity}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono font-semibold text-slate-700 pt-0.5 flex-wrap">
                      <Clock className="w-3.5 h-3.5 text-violet-600 shrink-0" />
                      <span className="bg-slate-50 text-slate-800 px-2 py-0.5 rounded-md border border-slate-200">
                        {formatTime(flaw.start)} – {formatTime(flaw.end)}
                      </span>
                      <span className="text-slate-400 font-sans font-normal text-[11px]">
                        ({(flaw.end - flaw.start).toFixed(1)}s duration)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => onPlaySegment(flaw.start, flaw.end, flaw.id)}
                    className="btn-clay-primary px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs flex items-center gap-1.5 font-bold"
                    title={`Play region ${formatTime(flaw.start)} to ${formatTime(flaw.end)}`}
                  >
                    <Clay3DIcon name="play" size="xs" />
                    <span>Play Flaw</span>
                  </button>

                  <button
                    onClick={() => toggleExpand(flaw.id)}
                    className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors shadow-clay-pill"
                    title={isExpanded ? 'Collapse improvement tips' : 'Expand how to improve'}
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

              </div>

              {/* FR-4 Short Causal Explanation */}
              <div className="px-5 pb-4">
                <p className="text-xs sm:text-sm text-slate-700 font-normal leading-relaxed">
                  {flaw.explanation}
                </p>

                {(flaw.measuredValue || flaw.baselineValue) && (
                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                    {flaw.measuredValue && (
                      <span className="px-3.5 py-1 rounded-full bg-pink-50 border border-pink-200 text-pink-800 shadow-clay-pill flex items-center gap-1.5">
                        <BarChart2 className="w-3.5 h-3.5 text-pink-600" />
                        Measured: <strong>{flaw.measuredValue}</strong>
                      </span>
                    )}
                    {flaw.baselineValue && (
                      <span className="px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 shadow-clay-pill flex items-center gap-1.5">
                        <Clay3DIcon name="sparkles" size="xs" />
                        Ideal Baseline: <strong>{flaw.baselineValue}</strong>
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* FR-5 Expandable "How to Improve" Drawer */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-0">
                  <div className="clay-inset-well p-4.5 space-y-3 animate-fade-in">
                    <div className="flex items-center gap-2 text-xs font-bold text-violet-700 uppercase tracking-wider font-heading">
                      <Clay3DIcon name="bulb" size="xs" />
                      <span>How to Improve (Prescriptive Guidance)</span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                      {flaw.improvement}
                    </p>

                    {flaw.drillSteps && flaw.drillSteps.length > 0 && (
                      <div className="pt-2 space-y-2 border-t border-slate-200/60">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          Actionable Practice Drills:
                        </span>
                        <ul className="space-y-2">
                          {flaw.drillSteps.map((drill, idx) => (
                            <li key={idx} className="text-xs text-slate-700 font-normal flex items-start gap-2.5">
                              <span className="w-5 h-5 rounded-full bg-violet-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5 shadow-sugary-violet">
                                {idx + 1}
                              </span>
                              <span className="pt-0.5 leading-snug">{drill}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
};
