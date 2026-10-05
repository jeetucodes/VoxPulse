import React, { useState } from 'react';

export type Clay3DIconName =
  | 'mic'
  | 'trophy'
  | 'target'
  | 'flash'
  | 'zap'
  | 'lightning'
  | 'rocket'
  | 'tick'
  | 'check'
  | 'bulb'
  | 'idea'
  | 'star'
  | 'bat'
  | 'candy'
  | 'robot'
  | 'bot'
  | 'speech'
  | 'chat'
  | 'speaker'
  | 'volume'
  | 'clock'
  | 'timer'
  | 'stopwatch'
  | 'music'
  | 'notes'
  | 'sparkles'
  | 'chart'
  | 'growth'
  | 'warning'
  | 'alert'
  | 'fire'
  | 'energy'
  | 'gem'
  | 'diamond'
  | 'brain'
  | 'cloud'
  | 'upload'
  | 'play'
  | 'pause'
  | 'document'
  | 'memo'
  | 'globe'
  | 'translate'
  | 'refresh'
  | 'repeat'
  | 'pin';

interface Clay3DIconProps {
  name: Clay3DIconName;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  floating?: boolean;
  bouncing?: boolean;
  className?: string;
  alt?: string;
  withPedestal?: boolean;
}

// Precise Unicode codepoints from Microsoft Fluent 3D Emoji collection
const ICON_CODEPOINTS: Record<Clay3DIconName, string> = {
  mic: '1f3a4',
  trophy: '1f3c6',
  target: '1f3af',
  flash: '26a1',
  zap: '26a1',
  lightning: '26a1',
  rocket: '1f680',
  tick: '2714',
  check: '2714',
  bulb: '1f4a1',
  idea: '1f4a1',
  star: '2b50',
  bat: '1f987',
  candy: '1f36c',
  robot: '1f916',
  bot: '1f916',
  speech: '1f4ac',
  chat: '1f4ac',
  speaker: '1f50a',
  volume: '1f50a',
  clock: '23f1',
  timer: '23f1',
  stopwatch: '23f1',
  music: '1f3b5',
  notes: '1f3b5',
  sparkles: '2728',
  chart: '1f4c8',
  growth: '1f4c8',
  warning: '26a0',
  alert: '26a0',
  fire: '1f525',
  energy: '1f525',
  gem: '1f48e',
  diamond: '1f48e',
  brain: '1f9e0',
  cloud: '2601',
  upload: '1f4e4',
  play: '25b6',
  pause: '23f8',
  document: '1f4dd',
  memo: '1f4dd',
  globe: '1f310',
  translate: '1f310',
  refresh: '1f504',
  repeat: '1f504',
  pin: '1f4cd'
};

const SIZE_CONFIGS = {
  xs: {
    imgSize: 'w-5 h-5 min-w-[20px] min-h-[20px]',
    pedestalSize: 'w-7 h-7 min-w-[28px] min-h-[28px]',
    shadow: 'drop-shadow-[0_2px_4px_rgba(15,23,42,0.18)]'
  },
  sm: {
    imgSize: 'w-7 h-7 min-w-[28px] min-h-[28px]',
    pedestalSize: 'w-10 h-10 min-w-[40px] min-h-[40px]',
    shadow: 'drop-shadow-[0_4px_8px_rgba(15,23,42,0.20)]'
  },
  md: {
    imgSize: 'w-10 h-10 min-w-[40px] min-h-[40px]',
    pedestalSize: 'w-14 h-14 min-w-[56px] min-h-[56px]',
    shadow: 'drop-shadow-[0_6px_12px_rgba(15,23,42,0.22)]'
  },
  lg: {
    imgSize: 'w-14 h-14 min-w-[56px] min-h-[56px]',
    pedestalSize: 'w-20 h-20 min-w-[80px] min-h-[80px]',
    shadow: 'drop-shadow-[0_10px_20px_rgba(15,23,42,0.24)]'
  },
  xl: {
    imgSize: 'w-20 h-20 min-w-[80px] min-h-[80px]',
    pedestalSize: 'w-28 h-28 min-w-[112px] min-h-[112px]',
    shadow: 'drop-shadow-[0_14px_28px_rgba(15,23,42,0.28)]'
  },
  '2xl': {
    imgSize: 'w-28 h-28 min-w-[112px] min-h-[112px]',
    pedestalSize: 'w-36 h-36 min-w-[144px] min-h-[144px]',
    shadow: 'drop-shadow-[0_18px_36px_rgba(15,23,42,0.32)]'
  }
};

export const Clay3DIcon: React.FC<Clay3DIconProps> = ({
  name,
  size = 'md',
  floating = false,
  bouncing = false,
  className = '',
  alt,
  withPedestal = false
}) => {
  const [hasError, setHasError] = useState(false);
  const codepoint = ICON_CODEPOINTS[name] || '2728';
  const cdnUrl = `https://cdn.jsdelivr.net/gh/shuding/fluentui-emoji-unicode/assets/${codepoint}_3d.png`;

  const config = SIZE_CONFIGS[size];

  const animationClass = floating
    ? 'animate-sugary-float'
    : bouncing
    ? 'animate-sugary-bounce'
    : 'transition-transform duration-200 hover:scale-110 active:scale-95';

  const iconElement = (
    <img
      src={cdnUrl}
      alt={alt || `${name} 3D icon`}
      loading="lazy"
      onError={() => setHasError(true)}
      className={`object-contain select-none pointer-events-none ${config.imgSize} ${config.shadow} ${animationClass} ${className}`}
    />
  );

  if (hasError) {
    // Fallback if network issue
    return (
      <span className={`inline-flex items-center justify-center font-bold text-xs ${className}`}>
        ✨
      </span>
    );
  }

  if (withPedestal) {
    return (
      <div
        className={`inline-flex items-center justify-center rounded-2xl bg-gradient-to-b from-white to-slate-50 border border-white/90 shadow-clay-card relative overflow-hidden group shrink-0 ${config.pedestalSize}`}
      >
        {/* Soft top-left light sheen on the pedestal */}
        <div className="absolute top-1 left-2 right-2 h-1/3 bg-gradient-to-b from-white/90 to-transparent rounded-full pointer-events-none" />
        {/* Pedestal Ambient base shadow */}
        <div className="absolute bottom-1 w-3/4 h-2 bg-slate-300/40 blur-xs rounded-full pointer-events-none" />
        <div className="relative z-10 flex items-center justify-center">
          {iconElement}
        </div>
      </div>
    );
  }

  return (
    <span className="inline-flex items-center justify-center shrink-0 relative">
      {iconElement}
    </span>
  );
};
