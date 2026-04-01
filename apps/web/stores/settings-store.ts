import { create } from "zustand";
import { api } from "@/lib/api-client";

interface SettingsState {
  data: Record<string, unknown>;
  loading: boolean;
  fetchSettings: () => Promise<void>;
  updateSettings: (patch: Record<string, unknown>) => Promise<void>;
  get: <T>(key: string) => T | undefined;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  data: {},
  loading: false,

  fetchSettings: async () => {
    set({ loading: true });
    try {
      const data = await api.get<Record<string, unknown>>("/api/settings");
      set({ data });
    } catch {
    } finally {
      set({ loading: false });
    }
  },

  updateSettings: async (patch) => {
    const merged = { ...get().data, ...patch };
    await api.put<Record<string, unknown>>("/api/settings", patch);
    set({ data: merged });
  },

  get: <T>(key: string) => get().data[key] as T | undefined,
}));
