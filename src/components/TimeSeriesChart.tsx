import React, { useState, useMemo } from 'react';
import { Clay3DIcon } from './Clay3DIcon';
import { WaterWaveDecoration } from './WaterWaveDecoration';
import type { TimeSeriesPoint, Flaw } from '../types/speech';

interface TimeSeriesChartProps {
  timeSeries: TimeSeriesPoint[];
  duration: number;
  currentTime: number;
  flaws: Flaw[];
  onSeek: (time: number) => void;
}

type MetricMode = 'rate' | 'energy' | 'pitch';

export const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({
  timeSeries,
  duration,
  currentTime,
  flaws,
  onSeek
}) => {
  const [metricMode, setMetricMode] = useState<MetricMode>('rate');
  const [hoveredPoint, setHoveredPoint] = useState<TimeSeriesPoint | null>(null);

  const svgWidth = 800;
  const svgHeight = 230;
  const padding = { top: 25, right: 30, bottom: 40, left: 60 };
  const graphWidth = svgWidth - padding.left - padding.right;
  const graphHeight = svgHeight - padding.top - padding.bottom;

  const { minY, maxY, unit, participantKey, baselineKey } = useMemo(() => {
    switch (metricMode) {
      case 'energy':
        return {
          minY: 0,
          maxY: 1.0,
          unit: 'RMS',
          participantKey: 'participantEnergy' as const,
          baselineKey: 'baselineEnergy' as const
        };
      case 'pitch':
        return {
          minY: 60,
          maxY: 280,
          unit: 'Hz',
          participantKey: 'participantPitch' as const,
          baselineKey: 'baselinePitch' as const
        };
      case 'rate':
      default:
        return {
          minY: 60,
          maxY: 240,
          unit: 'WPM',
          participantKey: 'participantRate' as const,
          baselineKey: 'baselineRate' as const
        };
    }
  }, [metricMode]);

  const getX = (timestamp: number) => {
    if (duration <= 0) return padding.left;
    return padding.left + (timestamp / duration) * graphWidth;
  };

  const getY = (val: number) => {
    const clamped = Math.max(minY, Math.min(maxY, val));
    const ratio = (clamped - minY) / (maxY - minY);
    return padding.top + (1 - ratio) * graphHeight;
  };

  const { participantPath, baselinePath, participantArea } = useMemo(() => {
    if (timeSeries.length === 0) return { participantPath: '', baselinePath: '', participantArea: '' };

    const pPoints: string[] = [];
    const bPoints: string[] = [];

    timeSeries.forEach((pt) => {
      const x = getX(pt.timestamp);
      const py = getY(pt[participantKey]);
      const by = getY(pt[baselineKey]);
      pPoints.push(`${x},${py}`);
      bPoints.push(`${x},${by}`);
    });

    const pPath = `M ${pPoints.join(' L ')}`;
    const bPath = `M ${bPoints.join(' L ')}`;
    const bottomY = padding.top + graphHeight;
    const pArea = `${pPath} L ${getX(duration)},${bottomY} L ${padding.left},${bottomY} Z`;

    return {
      participantPath: pPath,
      baselinePath: bPath,
      participantArea: pArea
    };
  }, [timeSeries, participantKey, baselineKey, duration, minY, maxY]);

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const scaleX = svgWidth / rect.width;
    const svgClickX = clickX * scaleX;

    if (svgClickX >= padding.left && svgClickX <= svgWidth - padding.right) {
      const ratio = (svgClickX - padding.left) / graphWidth;
      const targetTime = Math.max(0, Math.min(duration, ratio * duration));
      onSeek(targetTime);
    }
  };

  const handleSvgMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const scaleX = svgWidth / rect.width;
    const svgClickX = clickX * scaleX;

    if (svgClickX >= padding.left && svgClickX <= svgWidth - padding.right && timeSeries.length > 0) {
      const ratio = (svgClickX - padding.left) / graphWidth;
      const targetTime = ratio * duration;
      const nearest = timeSeries.reduce((prev, curr) => 
        Math.abs(curr.timestamp - targetTime) < Math.abs(prev.timestamp - targetTime) ? curr : prev
      );
      setHoveredPoint(nearest);
    }
  };

  const playheadX = getX(currentTime);

  return (
    <div className="card-clay card-clay-cyan p-6 sm:p-7 rounded-3xl space-y-5 relative overflow-hidden">
      <WaterWaveDecoration color="rgba(6, 182, 212, 0.08)" height="h-28" />

      <div className="relative z-10 space-y-5">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Clay3DIcon name="chart" size="sm" floating />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-black text-slate-900 font-heading tracking-tight">
                Time-Series Contrastive Overlay
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-violet-100/70 border border-violet-200 text-violet-800 text-[10px] font-bold uppercase shadow-sm">
                FR-7
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Synchronized acoustic curves contrasted against champion reference baselines
            </p>
          </div>
        </div>

        {/* Metric Selector Pills */}
        <div className="clay-inset-well p-1 rounded-2xl flex items-center gap-1 self-start sm:self-auto">
          <button
            onClick={() => setMetricMode('rate')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              metricMode === 'rate'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sugary-violet scale-[1.02]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
            }`}
          >
            <Clay3DIcon name="clock" size="xs" />
            <span>Cadence (WPM)</span>
          </button>

          <button
            onClick={() => setMetricMode('energy')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              metricMode === 'energy'
                ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-sugary-pink scale-[1.02]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
            }`}
          >
            <Clay3DIcon name="fire" size="xs" />
            <span>Energy (RMS)</span>
          </button>

          <button
            onClick={() => setMetricMode('pitch')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              metricMode === 'pitch'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sugary-emerald scale-[1.02]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
            }`}
          >
            <Clay3DIcon name="chart" size="xs" />
            <span>Pitch (Hz)</span>
          </button>
        </div>
      </div>

      {/* Legend & Hover Readout */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-medium text-slate-600 pt-2 border-t border-slate-100">
        <div className="flex items-center space-x-4">
          <span className="flex items-center gap-1.5 text-violet-700 font-bold">
            <span className="w-3.5 h-1.5 bg-violet-600 rounded-full inline-block shadow-sm"></span>
            Participant
          </span>
          <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
            <span className="w-3.5 h-1.5 border-t-2 border-dashed border-emerald-500 inline-block"></span>
            Ideal Baseline Reference
          </span>
          <span className="hidden sm:flex items-center gap-1.5 text-pink-600 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-400 inline-block"></span>
            Grounded Flaw Intervals
          </span>
        </div>

        {hoveredPoint ? (
          <div className="text-xs font-mono font-semibold text-slate-800 bg-white px-3.5 py-1 rounded-full border border-slate-200/90 shadow-clay-pill flex items-center gap-1.5">
            <span className="text-slate-500">t={hoveredPoint.timestamp}s:</span>
            <span className="text-violet-700 font-bold">{hoveredPoint[participantKey]} {unit}</span>
            <span className="text-slate-300">vs</span>
            <span className="text-emerald-700 font-bold">{hoveredPoint[baselineKey]} {unit}</span>
          </div>
        ) : (
          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
            Click chart to seek audio playhead
          </span>
        )}
      </div>

      {/* SVG Chart Container */}
      <div className="w-full overflow-hidden rounded-2xl clay-inset-well p-3 sm:p-4">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto cursor-crosshair select-none"
          onClick={handleSvgClick}
          onMouseMove={handleSvgMouseMove}
          onMouseLeave={() => setHoveredPoint(null)}
        >
          {/* Subtle horizontal grid lines */}
          {[0, 0.25, 0.5, 0.75, 1.0].map((ratio, idx) => {
            const y = padding.top + ratio * graphHeight;
            const labelVal = Math.round(maxY - ratio * (maxY - minY));
            return (
              <g key={idx}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={svgWidth - padding.right}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  fill="#64748B"
                  fontSize="11"
                  fontFamily="monospace"
                  fontWeight="bold"
                  textAnchor="end"
                >
                  {labelVal}
                </text>
              </g>
            );
          })}

          {/* Time axis markers */}
          {[0, 0.25, 0.5, 0.75, 1.0].map((ratio, idx) => {
            const x = padding.left + ratio * graphWidth;
            const t = Math.round(ratio * duration);
            return (
              <g key={idx}>
                <line
                  x1={x}
                  y1={padding.top + graphHeight}
                  x2={x}
                  y2={padding.top + graphHeight + 6}
                  stroke="#94A3B8"
                  strokeWidth="1.5"
                />
                <text
                  x={x}
                  y={padding.top + graphHeight + 20}
                  fill="#64748B"
                  fontSize="11"
                  fontFamily="monospace"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  {t}s
                </text>
              </g>
            );
          })}

          {/* Shaded Flaw Interval Bands */}
          {flaws.map((flaw) => {
            const x1 = getX(flaw.start);
            const x2 = getX(flaw.end);
            const bandWidth = Math.max(3, x2 - x1);

            let fill = 'rgba(236, 72, 153, 0.16)'; // Soft Pink
            if (flaw.type === 'unnatural_pause') fill = 'rgba(245, 158, 11, 0.18)'; // Soft Amber
            if (flaw.type === 'mumbling') fill = 'rgba(16, 185, 129, 0.18)'; // Soft Emerald

            return (
              <rect
                key={flaw.id}
                x={x1}
                y={padding.top}
                width={bandWidth}
                height={graphHeight}
                fill={fill}
              />
            );
          })}

          <defs>
            <linearGradient id="popParticipantGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.20" />
              <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Participant Filled Area */}
          <path
            d={participantArea}
            fill="url(#popParticipantGradient)"
          />

          {/* Baseline Curve (Dashed Emerald) */}
          <path
            d={baselinePath}
            fill="none"
            stroke="#10B981"
            strokeWidth="2"
            strokeDasharray="5 4"
          />

          {/* Participant Curve (Solid Vivid Violet) */}
          <path
            d={participantPath}
            fill="none"
            stroke="#7C3AED"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Live Playhead Line */}
          {currentTime >= 0 && currentTime <= duration && (
            <g>
              <line
                x1={playheadX}
                y1={padding.top}
                x2={playheadX}
                y2={padding.top + graphHeight}
                stroke="#7C3AED"
                strokeWidth="2"
              />
              <circle
                cx={playheadX}
                cy={padding.top}
                r="5"
                fill="#7C3AED"
                stroke="#FFFFFF"
                strokeWidth="1.5"
              />
            </g>
          )}

          {/* Hover Crosshair Dot */}
          {hoveredPoint && (
            <circle
              cx={getX(hoveredPoint.timestamp)}
              cy={getY(hoveredPoint[participantKey])}
              r="5"
              fill="#EC4899"
              stroke="#FFFFFF"
              strokeWidth="1.5"
            />
          )}
        </svg>
      </div>

      </div>

    </div>
  );
};
