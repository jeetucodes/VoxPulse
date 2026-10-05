import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Clock, BarChart2, Check, Sparkles, Volume2 } from 'lucide-react';
import { Clay3DIcon } from './Clay3DIcon';
import { WaterWaveDecoration } from './WaterWaveDecoration';
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
          badgeClass: 'bg-pink-100/90 text-pink-800 border-pink-200',
          activeRing: 'ring-2 ring-pink-500 border-pink-300',
          cardTheme: 'card-clay-pink',
          waveColor: 'rgba(244, 63, 94, 0.08)',
          calloutBorder: 'border-l-4 border-l-pink-500 border-pink-200/80 bg-pink-50/60',
          calloutTitle: 'text-pink-800',
        };
      case 'unnatural_pause':
        return {
          icon: <Clay3DIcon name="clock" size="md" withPedestal />,
          label: 'Unnatural Pause',
          badgeClass: 'bg-amber-100/90 text-amber-800 border-amber-200',
          activeRing: 'ring-2 ring-amber-500 border-amber-300',
          cardTheme: 'card-clay-amber',
          waveColor: 'rgba(245, 158, 11, 0.08)',
          calloutBorder: 'border-l-4 border-l-amber-500 border-amber-200/80 bg-amber-50/60',
          calloutTitle: 'text-amber-800',
        };
      case 'mumbling':
        return {
          icon: <Clay3DIcon name="mic" size="md" withPedestal />,
          label: 'Muffled Articulation',
          badgeClass: 'bg-emerald-100/90 text-emerald-800 border-emerald-200',
          activeRing: 'ring-2 ring-emerald-500 border-emerald-300',
          cardTheme: 'card-clay-emerald',
          waveColor: 'rgba(16, 185, 129, 0.08)',
          calloutBorder: 'border-l-4 border-l-emerald-500 border-emerald-200/80 bg-emerald-50/60',
          calloutTitle: 'text-emerald-800',
        };
      case 'monotone_pitch':
        return {
          icon: <Clay3DIcon name="target" size="md" withPedestal />,
          label: 'Monotone Pitch',
          badgeClass: 'bg-violet-100/90 text-violet-800 border-violet-200',
          activeRing: 'ring-2 ring-violet-500 border-violet-300',
          cardTheme: 'card-clay-violet',
          waveColor: 'rgba(139, 92, 246, 0.08)',
          calloutBorder: 'border-l-4 border-l-violet-500 border-violet-200/80 bg-violet-50/60',
          calloutTitle: 'text-violet-800',
        };
      case 'volume_drop':
      default:
        return {
          icon: <Clay3DIcon name="speaker" size="md" withPedestal />,
          label: 'Volume Drop',
          badgeClass: 'bg-rose-100/90 text-rose-800 border-rose-200',
          activeRing: 'ring-2 ring-rose-500 border-rose-300',
          cardTheme: 'card-clay-pink',
          waveColor: 'rgba(244, 63, 94, 0.08)',
          calloutBorder: 'border-l-4 border-l-rose-500 border-rose-200/80 bg-rose-50/60',
          calloutTitle: 'text-rose-800',
        };
    }
  };

  const getSeverityBadge = (sev: Flaw['severity']) => {
    switch (sev) {
      case 'high':
        return 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-sugary-pink';
      case 'medium':
        return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sugary-amber';
      case 'low':
      default:
        return 'bg-gradient-to-r from-slate-500 to-slate-600 text-white';
    }
  };

  if (flaws.length === 0) {
    return (
      <div className="card-clay card-clay-emerald p-6 sm:p-8 text-center rounded-3xl relative overflow-hidden space-y-4 w-full min-w-0">
        <WaterWaveDecoration color="rgba(16, 185, 129, 0.1)" height="h-20" />
        <div className="relative z-10 mx-auto flex justify-center">
          <Clay3DIcon name="trophy" size="xl" floating />
        </div>
        <h3 className="relative z-10 text-xl font-black text-slate-900 font-heading">Zero Delivery Flaws Detected! 🎉</h3>
        <p className="relative z-10 text-xs sm:text-sm text-slate-600 font-medium max-w-md mx-auto leading-relaxed break-words">
          Your delivery rhythm, pause distribution, and vocal articulation align within 95% of national competition benchmark standards.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full min-w-0">
      
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 w-full min-w-0">
        <div className="flex items-center space-x-2.5 min-w-0">
          <Clay3DIcon name="warning" size="sm" floating />
          <h3 className="text-base sm:text-lg font-black text-slate-900 font-heading tracking-tight break-words">
            Temporally Grounded Flaws ({flaws.length})
          </h3>
        </div>
        <span className="text-xs text-slate-600 font-semibold bg-white/90 px-3 py-1 rounded-full border border-slate-200/80 shadow-clay-pill flex items-center gap-1.5 shrink-0">
          <Volume2 className="w-3.5 h-3.5 text-violet-600" />
          <span>Click to audition segment</span>
        </span>
      </div>

      {/* Flaws List */}
      <div className="space-y-4 w-full min-w-0">
        {flaws.map((flaw) => {
          const badge = getTypeBadge(flaw.type);
          const isExpanded = !!expandedCardIds[flaw.id];
          const isActive = flaw.id === activeFlawId;

          return (
            <div
              key={flaw.id}
              className={`card-clay ${badge.cardTheme} transition-all duration-300 relative overflow-hidden w-full min-w-0 rounded-2xl sm:rounded-3xl border border-slate-200/80 ${
                isActive 
                  ? `${badge.activeRing} shadow-clay-card-hover scale-[1.01]` 
                  : 'hover:border-slate-300 shadow-clay-card'
              }`}
            >
              <WaterWaveDecoration color={badge.waveColor} height="h-16" />
              
              <div className="relative z-10 w-full min-w-0 flex flex-col">
                
                {/* Top Header Row: Category, Severity, Duration & Action Buttons */}
                <div className="p-4 sm:p-5 pb-3 sm:pb-3.5 border-b border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 w-full min-w-0">
                  
                  {/* Left: 3D Icon & Title Tags */}
                  <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
                    <div className="shrink-0">
                      {badge.icon}
                    </div>

                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <span className={`px-2.5 sm:px-3 py-0.5 rounded-full text-xs font-bold border shadow-sm break-words ${badge.badgeClass}`}>
                          {badge.label}
                        </span>
                        <span className={`px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${getSeverityBadge(flaw.severity)}`}>
                          {flaw.severity}
                        </span>
                      </div>

                      {/* Timestamp Tag */}
                      <div className="flex items-center gap-2 text-xs font-mono font-semibold text-slate-700 pt-0.5 flex-wrap">
                        <Clock className="w-3.5 h-3.5 text-violet-600 shrink-0" />
                        <span className="bg-white/90 text-slate-800 px-2 py-0.5 rounded-md border border-slate-200 font-bold text-[11px] sm:text-xs">
                          {formatTime(flaw.start)} – {formatTime(flaw.end)}
                        </span>
                        <span className="text-slate-500 font-sans font-medium text-[11px]">
                          ({(flaw.end - flaw.start).toFixed(1)}s duration)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Audio Playback & Drawer Trigger Buttons */}
                  <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                    <button
                      onClick={() => onPlaySegment(flaw.start, flaw.end, flaw.id)}
                      className="btn-clay-primary px-3 sm:px-3.5 py-1.5 text-xs flex items-center gap-1.5 font-bold shadow-clay-btn-primary hover:shadow-clay-btn-primary-hover active:scale-95 transition-all"
                      title={`Play region ${formatTime(flaw.start)} to ${formatTime(flaw.end)}`}
                    >
                      <Clay3DIcon name="play" size="xs" />
                      <span>Play Flaw</span>
                    </button>

                    <button
                      onClick={() => toggleExpand(flaw.id)}
                      className="p-1.5 sm:p-2 rounded-xl border border-slate-200 bg-white/90 hover:bg-white text-slate-600 hover:text-slate-900 transition-all shadow-clay-pill active:scale-95"
                      title={isExpanded ? 'Collapse improvement tips' : 'Expand how to improve'}
                      aria-label={isExpanded ? 'Collapse improvement tips' : 'Expand how to improve'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                </div>

                {/* Causal Explanation Box (FR-4) */}
                <div className="p-4 sm:p-5 pt-3 sm:pt-4 space-y-3 w-full min-w-0">
                  <div className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border ${badge.calloutBorder} backdrop-blur-sm shadow-sm w-full min-w-0`}>
                    <div className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider ${badge.calloutTitle} mb-1.5`}>
                      <Clay3DIcon name="target" size="xs" />
                      <span>Diagnostic Root Cause</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-800 font-normal leading-relaxed break-words [overflow-wrap:anywhere]">
                      {flaw.explanation}
                    </p>
                  </div>

                  {/* Measured vs Ideal Baseline Grid */}
                  {(flaw.measuredValue || flaw.baselineValue) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-0.5 w-full min-w-0">
                      {flaw.measuredValue && (
                        <div className="p-2.5 sm:p-3 rounded-xl bg-white/80 border border-pink-200/80 shadow-clay-pill flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-pink-100 text-pink-700 flex items-center justify-center shrink-0">
                            <BarChart2 className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-pink-700">Measured Value</div>
                            <div className="text-xs sm:text-sm font-extrabold text-slate-900 break-words [overflow-wrap:anywhere]">
                              {flaw.measuredValue}
                            </div>
                          </div>
                        </div>
                      )}

                      {flaw.baselineValue && (
                        <div className="p-2.5 sm:p-3 rounded-xl bg-white/80 border border-emerald-200/80 shadow-clay-pill flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                            <Sparkles className="w-4 h-4 text-emerald-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Target Baseline</div>
                            <div className="text-xs sm:text-sm font-extrabold text-slate-900 break-words [overflow-wrap:anywhere]">
                              {flaw.baselineValue}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Expandable "How to Improve" Drawer (FR-5) */}
                {isExpanded && (
                  <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0 w-full min-w-0">
                    <div className="clay-inset-well p-4 sm:p-4.5 space-y-3.5 animate-fade-in w-full min-w-0 rounded-2xl">
                      <div className="flex items-center gap-2 text-xs font-bold text-violet-700 uppercase tracking-wider font-heading">
                        <Clay3DIcon name="bulb" size="xs" />
                        <span>Prescriptive Guidance & Action Steps</span>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed break-words [overflow-wrap:anywhere]">
                        {flaw.improvement}
                      </p>

                      {flaw.drillSteps && flaw.drillSteps.length > 0 && (
                        <div className="pt-2.5 space-y-2 border-t border-slate-200/70 w-full min-w-0">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            Actionable Practice Drills:
                          </span>
                          <ul className="space-y-2 w-full min-w-0">
                            {flaw.drillSteps.map((drill, idx) => (
                              <li 
                                key={idx} 
                                className="text-xs sm:text-sm text-slate-700 font-normal flex items-start gap-2.5 p-2 rounded-xl bg-white/70 hover:bg-white border border-slate-100 hover:border-violet-200/60 transition-colors w-full min-w-0"
                              >
                                <span className="w-5 h-5 rounded-full bg-violet-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5 shadow-sugary-violet">
                                  {idx + 1}
                                </span>
                                <span className="pt-0.5 leading-relaxed min-w-0 flex-1 break-words [overflow-wrap:anywhere]">
                                  {drill}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
