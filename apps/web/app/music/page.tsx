"use client";
import { useState, useMemo } from "react";
import { useServerStore } from "@/stores/server-store";
import { useMusicStore, type MusicTrack } from "@/stores/music-store";
import { useApiQuery } from "@/hooks/use-api";
import { CategoryFilter } from "@/components/content/category-filter";
import { Loading } from "@/components/common/loading";
import { api } from "@/lib/api-client";
import { Play, Pause } from "lucide-react";
import type { XtreamCategoryDto, XtreamLiveStreamDto } from "@streamvault/shared";

export default function MusicPage() {
  const { activeServerId } = useServerStore();
  const { currentTrack, playing, play, togglePlay } = useMusicStore();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categoriesPath = activeServerId ? `/api/xtream/${activeServerId}/live/categories` : null;
  const streamsPath = activeServerId
    ? `/api/xtream/${activeServerId}/live/streams${selectedCategory ? `?category_id=${selectedCategory}` : ""}`
    : null;

  const { data: categories, loading: loadingCats } = useApiQuery<XtreamCategoryDto[]>(categoriesPath);
  const { data: streams, loading: loadingStreams } = useApiQuery<XtreamLiveStreamDto[]>(streamsPath);

  const musicCategories = useMemo(
    () => (categories ?? []).filter((c) => /music|radio|audio|song|mp3/i.test(c.category_name)),
    [categories],
  );

  const handlePlayTrack = async (stream: XtreamLiveStreamDto) => {
    if (!activeServerId) return;
    const { url } = await api.get<{ url: string }>(
      `/api/xtream/${activeServerId}/stream-url?type=live&stream_id=${stream.stream_id}&extension=ts`,
    );
    play({
      id: stream.stream_id,
      title: stream.name,
      artist: "",
      icon: stream.stream_icon,
      streamUrl: url,
      serverId: activeServerId,
    });
  };

  if (!activeServerId) {
    return <div className="text-center text-gray-400 mt-20"><p>No server selected. Add one in Settings.</p></div>;
  }

  const displayStreams = streams ?? [];

  return (
    <div className="flex gap-4 h-full">
      {loadingCats ? (
        <Loading className="w-52" />
      ) : (
        <CategoryFilter
          categories={musicCategories.length > 0 ? musicCategories : (categories ?? [])}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
      )}
      <div className="flex-1 overflow-y-auto pb-20">
        <h1 className="text-2xl font-bold mb-4">Music</h1>
        {loadingStreams ? (
          <Loading className="py-8" />
        ) : (
          <div className="space-y-1">
            {displayStreams.map((stream, i) => {
              const isActive = currentTrack?.id === stream.stream_id;
              return (
                <button
                  key={stream.stream_id}
                  onClick={() => {
                    if (isActive) { togglePlay(); } else { handlePlayTrack(stream); }
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition text-left ${
                    isActive ? "bg-primary/20 text-primary-light" : "hover:bg-surface-light text-gray-300"
                  }`}
                >
                  <span className="text-xs text-gray-500 w-8 text-right">{i + 1}</span>
                  {stream.stream_icon ? (
                    <img src={stream.stream_icon} alt="" className="w-10 h-10 rounded object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded bg-gray-800 flex items-center justify-center">
                      {isActive && playing ? <Pause size={16} /> : <Play size={16} />}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{stream.name}</p>
                  </div>
                  {isActive && (
                    <span className="text-xs text-primary-light">{playing ? "Playing" : "Paused"}</span>
                  )}
                </button>
              );
            })}
          </div>
        )}
        {displayStreams.length === 0 && !loadingStreams && (
          <p className="text-gray-500 text-center py-8">No music streams found.</p>
        )}
      </div>
    </div>
  );
}
