"use client";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  PictureInPicture2,
  Subtitles,
} from "lucide-react";
import { SeekBar } from "./seek-bar";
import { QualitySelector } from "./quality-selector";
import type { QualityLevel } from "@/stores/player-store";

interface PlayerControlsProps {
  title: string;
  playing: boolean;
  muted: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  buffered: number;
  isFullscreen: boolean;
  isPip: boolean;
  qualityLevels: QualityLevel[];
  activeQuality: number;
  subtitleTracks: { index: number; label: string; language: string }[];
  activeSubtitle: number;
  visible: boolean;
  onTogglePlay: () => void;
  onToggleMute: () => void;
  onVolumeChange: (v: number) => void;
  onSeek: (time: number) => void;
  onToggleFullscreen: () => void;
  onTogglePip: () => void;
  onQualityChange: (index: number) => void;
  onSubtitleChange: (index: number) => void;
}

export function PlayerControls({
  title,
  playing,
  muted,
  volume,
  currentTime,
  duration,
  buffered,
  isFullscreen,
  isPip,
  qualityLevels,
  activeQuality,
  subtitleTracks,
  activeSubtitle,
  visible,
  onTogglePlay,
  onToggleMute,
  onVolumeChange,
  onSeek,
  onToggleFullscreen,
  onTogglePip,
  onQualityChange,
  onSubtitleChange,
}: PlayerControlsProps) {
  return (
    <div
      className={`absolute inset-0 flex flex-col justify-between transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0 pointer-events-none"}`}
    >
      {/* Top gradient + title */}
      <div className="bg-gradient-to-b from-black/70 to-transparent px-4 pt-4 pb-8">
        <h2 className="text-lg font-semibold truncate">{title}</h2>
      </div>

      {/* Bottom controls */}
      <div className="bg-gradient-to-t from-black/70 to-transparent px-4 pb-4 pt-8 flex flex-col gap-2">
        <SeekBar currentTime={currentTime} duration={duration} buffered={buffered} onSeek={onSeek} />

        <div className="flex items-center gap-2">
          <button onClick={onTogglePlay} className="p-1.5 hover:bg-white/10 rounded transition">
            {playing ? <Pause size={22} /> : <Play size={22} />}
          </button>

          <button onClick={onToggleMute} className="p-1.5 hover:bg-white/10 rounded transition">
            {muted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={muted ? 0 : volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="w-20 accent-primary h-1"
          />

          <div className="flex-1" />

          {subtitleTracks.length > 0 && (
            <button
              onClick={() => onSubtitleChange(activeSubtitle === -1 ? 0 : -1)}
              className={`p-1.5 rounded transition ${activeSubtitle >= 0 ? "bg-primary/30 text-primary-light" : "hover:bg-white/10"}`}
            >
              <Subtitles size={20} />
            </button>
          )}

          <QualitySelector levels={qualityLevels} active={activeQuality} onSelect={onQualityChange} />

          <button onClick={onTogglePip} className={`p-1.5 rounded transition ${isPip ? "bg-primary/30" : "hover:bg-white/10"}`}>
            <PictureInPicture2 size={20} />
          </button>

          <button onClick={onToggleFullscreen} className="p-1.5 hover:bg-white/10 rounded transition">
            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
}
