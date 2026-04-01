"use client";
import { useState, useMemo } from "react";
import { useServerStore } from "@/stores/server-store";
import { useMusicStore } from "@/stores/music-store";
import { useApiQuery } from "@/hooks/use-api";
import { CategoryFilter } from "@/components/content/category-filter";
import { Loading } from "@/components/common/loading";
import { api } from "@/lib/api-client";
import { Radio as RadioIcon, Play, Pause } from "lucide-react";
import type { XtreamCategoryDto, XtreamLiveStreamDto } from "@streamvault/shared";

export default function RadioPage() {
  const { activeServerId } = useServerStore();
  const { currentTrack, playing, play, togglePlay } = useMusicStore();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categoriesPath = activeServerId ? `/api/xtream/${activeServerId}/live/categories` : null;
  const streamsPath = activeServerId
    ? `/api/xtream/${activeServerId}/live/streams${selectedCategory ? `?category_id=${selectedCategory}` : ""}`
    : null;

  const { data: categories, loading: loadingCats } = useApiQuery<XtreamCategoryDto[]>(categoriesPath);
  const { data: streams, loading: loadingStreams } = useApiQuery<XtreamLiveStreamDto[]>(streamsPath);

  const radioCategories = useMemo(
    () => (categories ?? []).filter((c) => /radio|fm|am|station/i.test(c.category_name)),
    [categories],
  );

  const handlePlayRadio = async (stream: XtreamLiveStreamDto) => {
    if (!activeServerId) return;
    const { url } = await api.get<{ url: string }>(
      `/api/xtream/${activeServerId}/stream-url?type=live&stream_id=${stream.stream_id}&extension=ts`,
    );
    play({
      id: stream.stream_id,
      title: stream.name,
      artist: "Radio",
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
          categories={radioCategories.length > 0 ? radioCategories : (categories ?? [])}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
      )}
      <div className="flex-1 overflow-y-auto pb-20">
        <h1 className="text-2xl font-bold mb-4">Radio</h1>
        {loadingStreams ? (
          <Loading className="py-8" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {displayStreams.map((stream) => {
              const isActive = currentTrack?.id === stream.stream_id;
              return (
                <button
                  key={stream.stream_id}
                  onClick={() => {
                    if (isActive) { togglePlay(); } else { handlePlayRadio(stream); }
                  }}
                  className={`flex items-center gap-3 p-3 rounded-lg transition text-left ${
                    isActive ? "bg-primary/20 ring-1 ring-primary/50" : "bg-surface-light hover:bg-white/10"
                  }`}
                >
                  {stream.stream_icon ? (
                    <img src={stream.stream_icon} alt="" className="w-12 h-12 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center shrink-0">
                      <RadioIcon size={20} className="text-gray-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{stream.name}</p>
                    {isActive && (
                      <p className="text-xs text-primary-light flex items-center gap-1 mt-0.5">
                        {playing ? <><Pause size={12} /> On Air</> : <><Play size={12} /> Paused</>}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
        {displayStreams.length === 0 && !loadingStreams && (
          <p className="text-gray-500 text-center py-8">No radio streams found.</p>
        )}
      </div>
    </div>
  );
}
