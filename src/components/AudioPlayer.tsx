import React, { useRef, useEffect, useState } from 'react';
import { RotateCcw, FastForward, Rewind, VolumeX } from 'lucide-react';
import { Clay3DIcon } from './Clay3DIcon';
import type { Flaw } from '../types/speech';

interface AudioPlayerProps {
  audioBuffer: AudioBuffer | null;
  audioBlobUrl: string | null;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  flaws: Flaw[];
  activeFlawId?: string | null;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (time: number) => void;
  onLoopRegion?: (start: number, end: number) => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioBuffer,
  currentTime,
  duration,
  isPlaying,
  flaws,
  activeFlawId,
  onPlay,
  onPause,
  onSeek
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [volume, setVolume] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  // Handle window resize for crisp retina waveform canvas
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const tenths = Math.floor((seconds % 1) * 10);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${tenths}`;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    ctx.clearRect(0, 0, width, height);

    // 1. Draw Flaw Region Overlays (Subtle, refined tints)
    if (duration > 0) {
      flaws.forEach((flaw) => {
        const startX = (flaw.start / duration) * width;
        const endX = (flaw.end / duration) * width;
        const flawWidth = Math.max(3, endX - startX);
        const isActive = flaw.id === activeFlawId;

        let fillColor = 'rgba(236, 72, 153, 0.18)'; // Soft Pink for fast speech
        let strokeColor = 'rgba(236, 72, 153, 0.6)';
        if (flaw.type === 'unnatural_pause') {
          fillColor = 'rgba(245, 158, 11, 0.20)'; // Soft Amber
          strokeColor = 'rgba(245, 158, 11, 0.7)';
        } else if (flaw.type === 'mumbling') {
          fillColor = 'rgba(16, 185, 129, 0.20)'; // Soft Emerald
          strokeColor = 'rgba(16, 185, 129, 0.7)';
        }

        if (isActive) {
          fillColor = fillColor.replace(/0\.\d+/, '0.35');
        }

        ctx.fillStyle = fillColor;
        ctx.fillRect(startX, 0, flawWidth, height);

        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = isActive ? 2 : 1;
        ctx.strokeRect(startX, 0, flawWidth, height);
      });
    }

    // 2. Draw Waveform Peaks
    const numBars = Math.floor(width / 4);
    const barWidth = 2.5;
    const barGap = 1.5;

    let peaks: number[] = [];
    if (audioBuffer) {
      const channelData = audioBuffer.getChannelData(0);
      const blockSize = Math.floor(channelData.length / numBars);

      for (let i = 0; i < numBars; i++) {
        let blockSum = 0;
        const start = i * blockSize;
        for (let j = 0; j < blockSize; j++) {
          blockSum += Math.abs(channelData[start + j] || 0);
        }
        peaks.push(blockSum / blockSize);
      }
    } else {
      // Fallback synthetic wave bars
      for (let i = 0; i < numBars; i++) {
        const t = i / numBars;
        const p = 0.2 + 0.5 * Math.sin(t * 12) * Math.cos(t * 7) + 0.15 * Math.random();
        peaks.push(Math.abs(p));
      }
    }

    const maxPeak = Math.max(0.01, ...peaks);
    const playheadRatio = duration > 0 ? currentTime / duration : 0;
    const currentPlayheadX = playheadRatio * width;

    // Gradient for played waveform bars
    const playedGrad = ctx.createLinearGradient(0, 0, width, 0);
    playedGrad.addColorStop(0, '#7C3AED');
    playedGrad.addColorStop(0.5, '#6366F1');
    playedGrad.addColorStop(1, '#A855F7');

    for (let i = 0; i < numBars; i++) {
      const x = i * (barWidth + barGap);
      const normalizedPeak = peaks[i] / maxPeak;
      const barHeight = Math.max(4, normalizedPeak * (height - 16));
      const y = (height - barHeight) / 2;

      // Color bars based on playhead position
      if (x <= currentPlayheadX) {
        ctx.fillStyle = playedGrad;
      } else {
        ctx.fillStyle = '#E2E8F0';
      }

      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, 2);
      ctx.fill();
    }

    // 3. Draw Clean Playhead Needle with Glowing Anchor
    ctx.strokeStyle = '#7C3AED';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(currentPlayheadX, 0);
    ctx.lineTo(currentPlayheadX, height);
    ctx.stroke();

    // Playhead head marker with border
    ctx.fillStyle = '#7C3AED';
    ctx.beginPath();
    ctx.arc(currentPlayheadX, 9, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 4. Hover Scrubber
    if (hoverTime !== null && duration > 0) {
      const hoverX = (hoverTime / duration) * width;
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.5)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(hoverX, 0);
      ctx.lineTo(hoverX, height);
      ctx.stroke();
      ctx.setLineDash([]);
    }

  }, [audioBuffer, currentTime, duration, flaws, activeFlawId, hoverTime, containerWidth]);

  const handleWaveformClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container || duration <= 0) return;
    const rect = container.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickRatio = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(clickRatio * duration);
  };

  const handleTouch = (e: React.TouchEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container || duration <= 0 || !e.touches[0]) return;
    const rect = container.getBoundingClientRect();
    const touchX = e.touches[0].clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, touchX / rect.width));
    onSeek(ratio * duration);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container || duration <= 0) return;
    const rect = container.getBoundingClientRect();
    const hoverX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, hoverX / rect.width));
    setHoverTime(ratio * duration);
  };

  const handleMouseLeave = () => {
    setHoverTime(null);
  };

  const handleSkip = (seconds: number) => {
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    onSeek(newTime);
  };

  return (
    <div className="card-clay p-4 sm:p-7 rounded-2xl sm:rounded-3xl border border-white/80 space-y-4 sm:space-y-5 relative overflow-hidden">
      
      {/* Waveform Header: Timestamps & Clean Flaw Indicators */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono font-semibold text-slate-700">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-violet-700 bg-violet-50/90 px-2.5 sm:px-3 py-1 rounded-full border border-violet-200/80 shadow-clay-pill text-[11px] sm:text-xs">
              {formatTime(currentTime)}
            </span>
            {hoverTime !== null && (
              <span className="text-amber-800 bg-amber-50/90 px-2 sm:px-2.5 py-1 rounded-full border border-amber-200/80 shadow-clay-pill text-[10px] sm:text-[11px] animate-fade-in">
                Seek: {formatTime(hoverTime)}
              </span>
            )}
            <span className="bg-slate-100/90 text-slate-600 px-2.5 sm:px-3 py-1 rounded-full border border-slate-200/80 shadow-clay-pill text-[11px] sm:text-xs">
              {formatTime(duration)}
            </span>
          </div>

          {/* Clean Flaw Region Indicators */}
          <div className="flex items-center gap-2 sm:gap-2.5 text-[10px] sm:text-[11px] font-semibold bg-white/95 px-2.5 sm:px-3.5 py-1 rounded-full border border-slate-200/70 shadow-clay-pill">
            <span className="flex items-center gap-1 text-slate-700">
              <Clay3DIcon name="rocket" size="xs" />
              <span>Fast</span>
            </span>
            <span className="flex items-center gap-1 text-slate-700">
              <Clay3DIcon name="clock" size="xs" />
              <span>Pause</span>
            </span>
            <span className="flex items-center gap-1 text-slate-700">
              <Clay3DIcon name="mic" size="xs" />
              <span>Mumble</span>
            </span>
          </div>
        </div>

        {/* Waveform Scrubber with Touch & Click */}
        <div
          ref={containerRef}
          onClick={handleWaveformClick}
          onTouchStart={handleTouch}
          onTouchMove={handleTouch}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative h-28 sm:h-32 w-full clay-inset-well p-1.5 overflow-hidden cursor-pointer hover:border-violet-400 transition-colors touch-none"
        >
          <canvas
            ref={canvasRef}
            className="w-full h-full block rounded-xl"
          />
        </div>
      </div>

      {/* Media Controls Bar (Responsive on Mobile & Desktop) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3.5 sm:gap-4 pt-1">
        
        {/* Playback Transport Buttons */}
        <div className="flex items-center justify-center space-x-2 sm:space-x-2.5 w-full sm:w-auto">
          <button
            onClick={() => handleSkip(-5)}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 shadow-clay-pill hover:-translate-y-0.5 active:translate-y-0.5 transition-all flex items-center justify-center shrink-0"
            title="Rewind 5 seconds"
          >
            <Rewind className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* 3D Sugary Circular Play/Pause Button */}
          <button
            onClick={isPlaying ? onPause : onPlay}
            className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-b from-violet-500 via-indigo-600 to-purple-700 shadow-sugary-violet flex items-center justify-center p-2 text-white transition-all duration-200 hover:scale-110 active:scale-95 active:translate-y-1 relative overflow-hidden group border border-white/40 shrink-0"
            title={isPlaying ? 'Pause' : 'Play Audio'}
          >
            {/* Top Gloss Candy Sheen */}
            <div className="absolute top-1 left-2.5 right-2.5 h-3 rounded-full bg-gradient-to-b from-white/80 via-white/40 to-transparent pointer-events-none" />

            {isPlaying ? (
              <Clay3DIcon name="pause" size="sm" />
            ) : (
              <Clay3DIcon name="play" size="sm" />
            )}
          </button>

          <button
            onClick={() => handleSkip(5)}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 shadow-clay-pill hover:-translate-y-0.5 active:translate-y-0.5 transition-all flex items-center justify-center shrink-0"
            title="Fast Forward 5 seconds"
          >
            <FastForward className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          <button
            onClick={() => onSeek(0)}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 shadow-clay-pill hover:-translate-y-0.5 active:translate-y-0.5 transition-all flex items-center justify-center shrink-0"
            title="Restart from beginning"
          >
            <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Secondary Controls (Speed and Volume) */}
        <div className="flex items-center justify-center flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
          {/* Speed Controls */}
          <div className="flex items-center space-x-0.5 sm:space-x-1 clay-inset-well p-1 rounded-2xl">
            {[0.75, 1.0, 1.25, 1.5].map((rate) => (
              <button
                key={rate}
                onClick={() => setPlaybackRate(rate)}
                className={`px-2.5 sm:px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                  playbackRate === rate
                    ? 'bg-violet-600 text-white font-bold shadow-sugary-violet'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>

          {/* Volume & Mute */}
          <div className="flex items-center space-x-2 clay-inset-well px-3 py-1.5 rounded-2xl">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1 text-slate-600 hover:text-violet-600 transition-colors flex items-center"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-3.5 h-3.5 text-pink-600" />
              ) : (
                <Clay3DIcon name="speaker" size="xs" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(parseFloat(e.target.value));
                if (isMuted) setIsMuted(false);
              }}
              className="w-16 sm:w-20"
              title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
            />
          </div>
        </div>

      </div>

    </div>
  );
};
