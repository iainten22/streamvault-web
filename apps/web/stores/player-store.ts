import { create } from "zustand";

export interface StreamInfo {
  url: string;
  title: string;
  streamId: number;
  serverId: number;
  type: "live" | "movie" | "series";
  logoUrl?: string;
}

export interface QualityLevel {
  index: number;
  height: number;
  bitrate: number;
  label: string;
}

interface PlayerState {
  stream: StreamInfo | null;
  playing: boolean;
  muted: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  buffered: number;
  qualityLevels: QualityLevel[];
  activeQuality: number;
  subtitleTracks: { index: number; label: string; language: string }[];
  activeSubtitle: number;
  isFullscreen: boolean;
  isPip: boolean;
  showControls: boolean;

  setStream: (stream: StreamInfo) => void;
  clearStream: () => void;
  setPlaying: (playing: boolean) => void;
  togglePlay: () => void;
  setMuted: (muted: boolean) => void;
  toggleMute: () => void;
  setVolume: (volume: number) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setBuffered: (buffered: number) => void;
  setQualityLevels: (levels: QualityLevel[]) => void;
  setActiveQuality: (index: number) => void;
  setSubtitleTracks: (tracks: { index: number; label: string; language: string }[]) => void;
  setActiveSubtitle: (index: number) => void;
  setIsFullscreen: (fs: boolean) => void;
  setIsPip: (pip: boolean) => void;
  setShowControls: (show: boolean) => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  stream: null,
  playing: false,
  muted: false,
  volume: 1,
  currentTime: 0,
  duration: 0,
  buffered: 0,
  qualityLevels: [],
  activeQuality: -1,
  subtitleTracks: [],
  activeSubtitle: -1,
  isFullscreen: false,
  isPip: false,
  showControls: true,

  setStream: (stream) => set({ stream, playing: true, currentTime: 0, duration: 0 }),
  clearStream: () => set({ stream: null, playing: false, currentTime: 0, duration: 0, qualityLevels: [], subtitleTracks: [] }),
  setPlaying: (playing) => set({ playing }),
  togglePlay: () => set((s) => ({ playing: !s.playing })),
  setMuted: (muted) => set({ muted }),
  toggleMute: () => set((s) => ({ muted: !s.muted })),
  setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)), muted: volume === 0 }),
  setCurrentTime: (currentTime) => set({ currentTime }),
  setDuration: (duration) => set({ duration }),
  setBuffered: (buffered) => set({ buffered }),
  setQualityLevels: (qualityLevels) => set({ qualityLevels }),
  setActiveQuality: (activeQuality) => set({ activeQuality }),
  setSubtitleTracks: (subtitleTracks) => set({ subtitleTracks }),
  setActiveSubtitle: (activeSubtitle) => set({ activeSubtitle }),
  setIsFullscreen: (isFullscreen) => set({ isFullscreen }),
  setIsPip: (isPip) => set({ isPip }),
  setShowControls: (showControls) => set({ showControls }),
}));
