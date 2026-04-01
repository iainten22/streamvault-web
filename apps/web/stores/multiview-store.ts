import { create } from "zustand";

export interface MultiviewSlot {
  id: number;
  streamUrl: string | null;
  title: string;
  serverId: number;
  streamId: number;
}

interface MultiviewState {
  slots: MultiviewSlot[];
  layout: 2 | 4;
  activeAudioSlot: number;
  setLayout: (layout: 2 | 4) => void;
  setSlot: (index: number, url: string, title: string, serverId: number, streamId: number) => void;
  clearSlot: (index: number) => void;
  setActiveAudio: (index: number) => void;
  swapToFull: (index: number) => void;
  reset: () => void;
}

function emptySlots(count: number): MultiviewSlot[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i, streamUrl: null, title: `Slot ${i + 1}`, serverId: 0, streamId: 0,
  }));
}

export const useMultiviewStore = create<MultiviewState>((set) => ({
  slots: emptySlots(4),
  layout: 2,
  activeAudioSlot: 0,
  setLayout: (layout) => set({ layout, slots: emptySlots(layout === 2 ? 2 : 4), activeAudioSlot: 0 }),
  setSlot: (index, streamUrl, title, serverId, streamId) =>
    set((s) => {
      const slots = [...s.slots];
      slots[index] = { id: index, streamUrl, title, serverId, streamId };
      return { slots };
    }),
  clearSlot: (index) =>
    set((s) => {
      const slots = [...s.slots];
      slots[index] = { id: index, streamUrl: null, title: `Slot ${index + 1}`, serverId: 0, streamId: 0 };
      return { slots };
    }),
  setActiveAudio: (activeAudioSlot) => set({ activeAudioSlot }),
  swapToFull: (index) =>
    set((s) => {
      const target = s.slots[index];
      if (!target?.streamUrl) return s;
      const newSlots = [...s.slots];
      newSlots.splice(index, 1);
      newSlots.unshift(target);
      return { slots: newSlots.map((sl, i) => ({ ...sl, id: i })), activeAudioSlot: 0 };
    }),
  reset: () => set({ slots: emptySlots(4), layout: 2, activeAudioSlot: 0 }),
}));
