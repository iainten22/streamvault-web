import { create } from "zustand";
import { api } from "@/lib/api-client";

export interface Favorite {
  id: number;
  serverId: number;
  contentId: number;
  contentType: string;
  name: string;
  icon: string | null;
  addedAt: string;
}

interface FavoritesState {
  favorites: Favorite[];
  loading: boolean;
  fetchFavorites: () => Promise<void>;
  addFavorite: (fav: { serverId: number; contentId: number; contentType: string; name: string; icon?: string }) => Promise<void>;
  removeFavorite: (id: number) => Promise<void>;
  isFavorited: (contentId: number, contentType: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: [],
  loading: false,

  fetchFavorites: async () => {
    set({ loading: true });
    try {
      const data = await api.get<Favorite[]>("/api/favorites");
      set({ favorites: data });
    } catch {
      // Not logged in or no favorites
    } finally {
      set({ loading: false });
    }
  },

  addFavorite: async (fav) => {
    const created = await api.post<Favorite>("/api/favorites", fav);
    set((s) => ({ favorites: [...s.favorites, created] }));
  },

  removeFavorite: async (id) => {
    await api.del(`/api/favorites/${id}`);
    set((s) => ({ favorites: s.favorites.filter((f) => f.id !== id) }));
  },

  isFavorited: (contentId, contentType) => {
    return get().favorites.some((f) => f.contentId === contentId && f.contentType === contentType);
  },
}));
