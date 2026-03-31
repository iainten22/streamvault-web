import { create } from "zustand";
import { api } from "@/lib/api-client";
import type { ServerAccountCreate } from "@streamvault/shared";

interface ServerListItem {
  id: number;
  name: string;
  serverUrl: string;
  username: string;
  status: string;
  expiresAt: string | null;
}

interface ServerState {
  servers: ServerListItem[];
  activeServerId: number | null;
  loading: boolean;
  fetchServers: () => Promise<void>;
  addServer: (server: ServerAccountCreate) => Promise<void>;
  removeServer: (id: number) => Promise<void>;
  setActiveServer: (id: number) => void;
  authenticateServer: (id: number) => Promise<unknown>;
}

export const useServerStore = create<ServerState>((set, get) => ({
  servers: [],
  activeServerId: null,
  loading: false,

  fetchServers: async () => {
    set({ loading: true });
    const servers = await api.get<ServerListItem[]>("/api/servers");
    set({ servers, loading: false });
    if (servers.length > 0 && !get().activeServerId) {
      set({ activeServerId: servers[0].id });
    }
  },

  addServer: async (server) => {
    await api.post("/api/servers", server);
    await get().fetchServers();
  },

  removeServer: async (id) => {
    await api.del(`/api/servers/${id}`);
    await get().fetchServers();
  },

  setActiveServer: (id) => set({ activeServerId: id }),

  authenticateServer: async (id) => {
    const result = await api.post(`/api/xtream/${id}/auth`, {});
    await get().fetchServers();
    return result;
  },
}));
