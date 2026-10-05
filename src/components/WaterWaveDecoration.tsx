import React from 'react';

interface WaterWaveDecorationProps {
  color?: string; // CSS color string, e.g. 'rgba(139, 92, 246, 0.08)'
  height?: string; // Tailwind height class, e.g. 'h-14 sm:h-20'
  position?: 'bottom' | 'top';
  opacity?: string;
}

export const WaterWaveDecoration: React.FC<WaterWaveDecorationProps> = ({
  color = 'rgba(139, 92, 246, 0.08)',
  height = 'h-14 sm:h-18',
  position = 'bottom',
  opacity = 'opacity-100'
}) => {
  return (
    <div 
      className={`absolute inset-x-0 ${position === 'bottom' ? 'bottom-0 rounded-b-3xl' : 'top-0 rotate-180 rounded-t-3xl'} ${height} ${opacity} pointer-events-none overflow-hidden z-0 select-none`}
      aria-hidden="true"
    >
      {/* Water Wave Layer 1 (Flowing forward) */}
      <svg
        className="absolute bottom-0 left-0 w-[200%] h-full animate-[waterWaveShift_14s_linear_infinite]"
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
      >
        <path
          d="M0,20 C180,95 380,-20 540,60 C700,130 920,15 1200,45 L1200,120 L0,120 Z"
          fill={color}
        />
      </svg>

      {/* Water Wave Layer 2 (Flowing counter-ripple with soft contrast) */}
      <svg
        className="absolute bottom-0 left-0 w-[200%] h-full opacity-60 animate-[waterWaveReverse_18s_linear_infinite]"
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
      >
        <path
          d="M0,45 C220,110 420,10 640,75 C820,125 1020,-15 1200,60 L1200,120 L0,120 Z"
          fill={color}
        />
      </svg>
    </div>
  );
};
