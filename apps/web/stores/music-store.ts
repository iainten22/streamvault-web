import { create } from "zustand";

export interface MusicTrack {
  id: number;
  title: string;
  artist: string;
  icon: string | null;
  streamUrl: string;
  serverId: number;
}

interface MusicState {
  currentTrack: MusicTrack | null;
  queue: MusicTrack[];
  queueIndex: number;
  playing: boolean;
  volume: number;
  currentTime: number;
  duration: number;

  play: (track: MusicTrack) => void;
  playQueue: (tracks: MusicTrack[], startIndex: number) => void;
  pause: () => void;
  resume: () => void;
  togglePlay: () => void;
  next: () => void;
  previous: () => void;
  setVolume: (v: number) => void;
  setCurrentTime: (t: number) => void;
  setDuration: (d: number) => void;
  stop: () => void;
}

export const useMusicStore = create<MusicState>((set, get) => ({
  currentTrack: null,
  queue: [],
  queueIndex: -1,
  playing: false,
  volume: 1,
  currentTime: 0,
  duration: 0,

  play: (track) => set({ currentTrack: track, queue: [track], queueIndex: 0, playing: true, currentTime: 0, duration: 0 }),
  playQueue: (tracks, startIndex) => set({ queue: tracks, queueIndex: startIndex, currentTrack: tracks[startIndex] ?? null, playing: true, currentTime: 0, duration: 0 }),
  pause: () => set({ playing: false }),
  resume: () => set({ playing: true }),
  togglePlay: () => set((s) => ({ playing: !s.playing })),
  next: () => {
    const { queue, queueIndex } = get();
    const nextIndex = queueIndex + 1;
    if (nextIndex < queue.length) {
      set({ queueIndex: nextIndex, currentTrack: queue[nextIndex], playing: true, currentTime: 0, duration: 0 });
    }
  },
  previous: () => {
    const { queue, queueIndex } = get();
    const prevIndex = queueIndex - 1;
    if (prevIndex >= 0) {
      set({ queueIndex: prevIndex, currentTrack: queue[prevIndex], playing: true, currentTime: 0, duration: 0 });
    }
  },
  setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),
  setCurrentTime: (currentTime) => set({ currentTime }),
  setDuration: (duration) => set({ duration }),
  stop: () => set({ currentTrack: null, queue: [], queueIndex: -1, playing: false, currentTime: 0, duration: 0 }),
}));
