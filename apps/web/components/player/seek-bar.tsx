"use client";
import { useRef, useCallback } from "react";

interface SeekBarProps {
  currentTime: number;
  duration: number;
  buffered: number;
  onSeek: (time: number) => void;
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${m}:${ss}`;
}

export function SeekBar({ currentTime, duration, buffered, onSeek }: SeekBarProps) {
  const barRef = useRef<HTMLDivElement>(null);

  const calcTime = useCallback(
    (clientX: number) => {
      const bar = barRef.current;
      if (!bar || duration <= 0) return 0;
      const rect = bar.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      return ratio * duration;
    },
    [duration],
  );

  const handleClick = (e: React.MouseEvent) => {
    onSeek(calcTime(e.clientX));
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedPct = duration > 0 ? (buffered / duration) * 100 : 0;

  return (
    <div className="flex items-center gap-3 w-full">
      <span className="text-xs text-gray-300 tabular-nums w-12 text-right">{formatTime(currentTime)}</span>
      <div
        ref={barRef}
        className="relative flex-1 h-1.5 bg-white/20 rounded cursor-pointer group hover:h-2.5 transition-all"
        onClick={handleClick}
      >
        <div className="absolute inset-y-0 left-0 bg-white/30 rounded" style={{ width: `${bufferedPct}%` }} />
        <div className="absolute inset-y-0 left-0 bg-primary rounded" style={{ width: `${progress}%` }} />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ left: `${progress}%`, transform: `translate(-50%, -50%)` }}
        />
      </div>
      <span className="text-xs text-gray-300 tabular-nums w-12">{formatTime(duration)}</span>
    </div>
  );
}
