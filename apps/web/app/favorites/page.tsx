"use client";
import { useEffect } from "react";
import { useFavoritesStore } from "@/stores/favorites-store";
import { PosterCard } from "@/components/content/poster-card";
import { ChannelCard } from "@/components/content/channel-card";
import { Loading } from "@/components/common/loading";

export default function FavoritesPage() {
  const { favorites, loading, fetchFavorites } = useFavoritesStore();

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  if (loading) return <Loading className="py-8" />;

  const liveChannels = favorites.filter((f) => f.contentType === "live");
  const movies = favorites.filter((f) => f.contentType === "vod");
  const series = favorites.filter((f) => f.contentType === "series");

  return (
    <div className="h-full overflow-y-auto">
      <h1 className="text-2xl font-bold mb-6">Favorites</h1>

      {favorites.length === 0 && (
        <p className="text-gray-500 text-center py-8">No favorites yet. Add some from Live TV, Movies, or Series.</p>
      )}

      {liveChannels.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Live Channels ({liveChannels.length})</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {liveChannels.map((fav) => (
              <ChannelCard
                key={fav.id}
                channel={{
                  stream_id: fav.contentId,
                  name: fav.name,
                  stream_icon: fav.icon,
                  num: 0,
                  stream_type: "live",
                  epg_channel_id: null,
                  added: null,
                  is_adult: "0",
                  category_id: "",
                  custom_sid: null,
                  tv_archive: 0,
                  direct_source: null,
                  tv_archive_duration: 0,
                }}
                onClick={() => {
                  window.location.href = `/player?serverId=${fav.serverId}&streamId=${fav.contentId}&type=live&title=${encodeURIComponent(fav.name)}&logo=${encodeURIComponent(fav.icon ?? "")}`;
                }}
              />
            ))}
          </div>
        </section>
      )}

      {movies.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Movies ({movies.length})</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {movies.map((fav) => (
              <PosterCard
                key={fav.id}
                title={fav.name}
                posterUrl={fav.icon}
                onClick={() => {
                  window.location.href = `/player?serverId=${fav.serverId}&streamId=${fav.contentId}&type=movie&title=${encodeURIComponent(fav.name)}&logo=${encodeURIComponent(fav.icon ?? "")}`;
                }}
              />
            ))}
          </div>
        </section>
      )}

      {series.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Series ({series.length})</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {series.map((fav) => (
              <PosterCard
                key={fav.id}
                title={fav.name}
                posterUrl={fav.icon}
                onClick={() => {
                  window.location.href = `/series/${fav.contentId}?serverId=${fav.serverId}`;
                }}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
