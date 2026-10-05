import React from 'react';

export type SugaryColor = 'violet' | 'pink' | 'amber' | 'emerald' | 'blue' | 'rose' | 'slate';
export type SugarySize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface SugaryIconProps {
  icon: React.ReactNode;
  color?: SugaryColor;
  size?: SugarySize;
  animated?: boolean;
  bounceOnHover?: boolean;
  className?: string;
  sparkle?: boolean;
}

export const SugaryIcon: React.FC<SugaryIconProps> = ({
  icon,
  color = 'violet',
  size = 'md',
  animated = false,
  bounceOnHover = true,
  className = '',
  sparkle = false,
}) => {
  // Color palette with 3D clay-candy gradient & layered depth
  const colorStyles: Record<SugaryColor, {
    bg: string;
    shadow: string;
    text: string;
    border: string;
    glow: string;
  }> = {
    violet: {
      bg: 'bg-gradient-to-b from-violet-500 via-indigo-600 to-purple-700',
      shadow: 'shadow-sugary-violet',
      text: 'text-white',
      border: 'border-white/40',
      glow: 'from-violet-400/30 to-purple-600/30',
    },
    pink: {
      bg: 'bg-gradient-to-b from-pink-400 via-rose-500 to-pink-600',
      shadow: 'shadow-sugary-pink',
      text: 'text-white',
      border: 'border-white/40',
      glow: 'from-pink-400/30 to-rose-600/30',
    },
    amber: {
      bg: 'bg-gradient-to-b from-amber-400 via-orange-500 to-amber-600',
      shadow: 'shadow-sugary-amber',
      text: 'text-white',
      border: 'border-white/40',
      glow: 'from-amber-400/30 to-orange-600/30',
    },
    emerald: {
      bg: 'bg-gradient-to-b from-emerald-400 via-teal-500 to-emerald-600',
      shadow: 'shadow-sugary-emerald',
      text: 'text-white',
      border: 'border-white/40',
      glow: 'from-emerald-400/30 to-teal-600/30',
    },
    blue: {
      bg: 'bg-gradient-to-b from-sky-400 via-blue-500 to-indigo-600',
      shadow: 'shadow-sugary-blue',
      text: 'text-white',
      border: 'border-white/40',
      glow: 'from-sky-400/30 to-blue-600/30',
    },
    rose: {
      bg: 'bg-gradient-to-b from-rose-400 via-red-500 to-rose-600',
      shadow: 'shadow-sugary-pink',
      text: 'text-white',
      border: 'border-white/40',
      glow: 'from-rose-400/30 to-red-600/30',
    },
    slate: {
      bg: 'bg-gradient-to-b from-slate-600 via-slate-700 to-slate-800',
      shadow: 'shadow-sugary-slate',
      text: 'text-white',
      border: 'border-white/30',
      glow: 'from-slate-500/20 to-slate-700/20',
    },
  };

  // Dimensions
  const sizeStyles: Record<SugarySize, {
    container: string;
    gloss: string;
    iconWrap: string;
  }> = {
    xs: {
      container: 'w-6 h-6 rounded-lg',
      gloss: 'h-1.5 left-1 right-1 top-0.5',
      iconWrap: 'scale-75',
    },
    sm: {
      container: 'w-8 h-8 rounded-xl',
      gloss: 'h-2 left-1.5 right-1.5 top-0.5',
      iconWrap: 'scale-90',
    },
    md: {
      container: 'w-10 h-10 rounded-2xl',
      gloss: 'h-2.5 left-2 right-2 top-1',
      iconWrap: 'scale-100',
    },
    lg: {
      container: 'w-13 h-13 rounded-3xl',
      gloss: 'h-3.5 left-2.5 right-2.5 top-1',
      iconWrap: 'scale-110',
    },
    xl: {
      container: 'w-16 h-16 rounded-[26px]',
      gloss: 'h-4 left-3 right-3 top-1.5',
      iconWrap: 'scale-125',
    },
  };

  const c = colorStyles[color];
  const s = sizeStyles[size];

  return (
    <div
      className={`relative shrink-0 flex items-center justify-center transition-all duration-300 select-none ${
        s.container
      } ${c.bg} ${c.shadow} ${c.text} border ${c.border} ${
        animated ? 'animate-sugary-bounce' : ''
      } ${bounceOnHover ? 'hover:scale-110 hover:-translate-y-1 hover:rotate-3 active:scale-95' : ''} ${className}`}
    >
      {/* 3D Glossy Candy Highlight Sheen */}
      <div
        className={`absolute rounded-full bg-gradient-to-b from-white/80 via-white/40 to-transparent pointer-events-none ${s.gloss}`}
      />

      {/* Subtle Bottom Ambient Glow */}
      <div
        className={`absolute inset-0 rounded-inherit -z-10 blur-md opacity-40 bg-gradient-to-b ${c.glow}`}
      />

      {/* The Lucide Icon */}
      <div className={`relative z-10 flex items-center justify-center ${s.iconWrap}`}>
        {icon}
      </div>

      {/* Cute Sugary Sparkle Badge */}
      {sparkle && (
        <span className="absolute -top-1.5 -right-1.5 text-xs animate-ping-slow select-none pointer-events-none drop-shadow-sm">
          ✨
        </span>
      )}
    </div>
  );
};
