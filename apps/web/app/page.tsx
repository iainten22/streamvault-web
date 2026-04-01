"use client";
import { useEffect } from "react";
import { useApiQuery } from "@/hooks/use-api";
import { useFavoritesStore, type Favorite } from "@/stores/favorites-store";
import { PosterCard } from "@/components/content/poster-card";
import { ChannelCard } from "@/components/content/channel-card";
import { Loading } from "@/components/common/loading";
import {
  Tv, Film, MonitorPlay, Music, Radio, Trophy, Search, Puzzle, Layout,
} from "lucide-react";
import Link from "next/link";

interface HistoryItem {
  id: number;
  contentId: string;
  title: string;
  type: string;
  progress: number;
  duration: number;
  posterPath: string | null;
  lastWatchedAt: string;
}

const quickLinks = [
  { href: "/live", icon: Tv, label: "Live TV", color: "bg-blue-500/20 text-blue-400" },
  { href: "/vod", icon: Film, label: "Movies", color: "bg-purple-500/20 text-purple-400" },
  { href: "/series", icon: MonitorPlay, label: "Series", color: "bg-green-500/20 text-green-400" },
  { href: "/music", icon: Music, label: "Music", color: "bg-pink-500/20 text-pink-400" },
  { href: "/radio", icon: Radio, label: "Radio", color: "bg-orange-500/20 text-orange-400" },
  { href: "/sports", icon: Trophy, label: "Sports", color: "bg-yellow-500/20 text-yellow-400" },
  { href: "/stremio", icon: Puzzle, label: "Stremio", color: "bg-cyan-500/20 text-cyan-400" },
  { href: "/scraper", icon: Search, label: "Discover", color: "bg-red-500/20 text-red-400" },
  { href: "/multiview", icon: Layout, label: "Multiview", color: "bg-indigo-500/20 text-indigo-400" },
];

export default function HomePage() {
  const { data: history, loading: loadingHistory } = useApiQuery<HistoryItem[]>("/api/history?limit=10");
  const { favorites, loading: loadingFavs, fetchFavorites } = useFavoritesStore();

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const liveFavs = favorites.filter((f) => f.contentType === "live").slice(0, 8);
  const contentFavs = favorites.filter((f) => f.contentType !== "live").slice(0, 6);

  return (
    <div className="h-full overflow-y-auto space-y-8">
      <section>
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
          {quickLinks.map(({ href, icon: Icon, label, color }) => (
            <Link key={href} href={href} className={`flex flex-col items-center gap-2 p-3 rounded-xl ${color} hover:opacity-80 transition`}>
              <Icon size={22} />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {!loadingHistory && history && history.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">Continue Watching</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {history.map((item) => (
              <PosterCard key={item.id} title={item.title} posterUrl={item.posterPath} year={item.type}
                onClick={() => { window.location.href = `/player?serverId=0&streamId=${item.contentId}&type=${item.type}&title=${encodeURIComponent(item.title)}`; }} />
            ))}
          </div>
        </section>
      )}

      {!loadingFavs && liveFavs.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Favorite Channels</h2>
            <Link href="/favorites" className="text-sm text-primary-light hover:underline">View all</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {liveFavs.map((fav) => (
              <ChannelCard key={fav.id}
                channel={{ stream_id: fav.contentId, name: fav.name, stream_icon: fav.icon, num: 0, stream_type: "live", epg_channel_id: null, added: null, is_adult: "0", category_id: "", custom_sid: null, tv_archive: 0, direct_source: null, tv_archive_duration: 0 }}
                onClick={() => { window.location.href = `/player?serverId=${fav.serverId}&streamId=${fav.contentId}&type=live&title=${encodeURIComponent(fav.name)}&logo=${encodeURIComponent(fav.icon ?? "")}`; }} />
            ))}
          </div>
        </section>
      )}

      {!loadingFavs && contentFavs.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Saved Content</h2>
            <Link href="/favorites" className="text-sm text-primary-light hover:underline">View all</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {contentFavs.map((fav) => (
              <PosterCard key={fav.id} title={fav.name} posterUrl={fav.icon}
                onClick={() => {
                  const href = fav.contentType === "series"
                    ? `/series/${fav.contentId}?serverId=${fav.serverId}`
                    : `/player?serverId=${fav.serverId}&streamId=${fav.contentId}&type=${fav.contentType}&title=${encodeURIComponent(fav.name)}`;
                  window.location.href = href;
                }} />
            ))}
          </div>
        </section>
      )}

      {loadingHistory && loadingFavs && <Loading className="py-8" />}
    </div>
  );
}
