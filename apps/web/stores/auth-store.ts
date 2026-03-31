import { create } from "zustand";
import { api } from "@/lib/api-client";

interface User {
  id: number;
  email: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, inviteCode?: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  login: async (email, password) => {
    const { user } = await api.post<{ user: User }>("/api/auth/login", { email, password });
    set({ user });
  },

  register: async (email, password, inviteCode) => {
    const { user } = await api.post<{ user: User }>("/api/auth/register", { email, password, inviteCode });
    set({ user });
  },

  logout: async () => {
    await api.post("/api/auth/logout", {});
    set({ user: null });
  },

  checkAuth: async () => {
    try {
      const { user } = await api.get<{ user: User }>("/api/auth/me");
      set({ user, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },
}));
