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
      <div className="w-full h-full relative animate-wave-bob">
        {/* Layer 1: Primary fluid swell (Seamless 600px period, flows forward) */}
        <svg
          className="absolute bottom-0 left-0 w-[200%] h-full animate-wave-flow"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M 0,35 C 150,75 220,10 360,40 C 460,62 520,18 600,35 C 750,75 820,10 960,40 C 1060,62 1120,18 1200,35 L 1200,120 L 0,120 Z"
            fill={color}
          />
        </svg>

        {/* Layer 2: Secondary harmonic ripple (Counter-current, 600px period, flows backwards) */}
        <svg
          className="absolute bottom-0 left-0 w-[200%] h-full opacity-60 animate-wave-counter"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M 0,48 C 130,20 250,72 380,36 C 480,12 550,68 600,48 C 730,20 850,72 980,36 C 1080,12 1150,68 1200,48 L 1200,120 L 0,120 Z"
            fill={color}
          />
        </svg>

        {/* Layer 3: Delicate surface crest highlight (Gentle shimmer layer) */}
        <svg
          className="absolute bottom-0 left-0 w-[200%] h-full opacity-35 animate-wave-highlight"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M 0,55 C 180,30 280,65 420,45 C 500,35 560,58 600,55 C 780,30 880,65 1020,45 C 1100,35 1160,58 1200,55 L 1200,120 L 0,120 Z"
            fill={color}
          />
        </svg>
      </div>
    </div>
  );
};
