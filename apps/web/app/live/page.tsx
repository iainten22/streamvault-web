"use client";
import { useState } from "react";
import { useServerStore } from "@/stores/server-store";
import { useApiQuery } from "@/hooks/use-api";
import { ChannelCard } from "@/components/content/channel-card";
import { CategoryFilter } from "@/components/content/category-filter";
import { Loading } from "@/components/common/loading";
import type { XtreamCategoryDto, XtreamLiveStreamDto } from "@streamvault/shared";

export default function LiveTvPage() {
  const { activeServerId } = useServerStore();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categoriesPath = activeServerId ? `/api/xtream/${activeServerId}/live/categories` : null;
  const streamsPath = activeServerId
    ? `/api/xtream/${activeServerId}/live/streams${selectedCategory ? `?category_id=${selectedCategory}` : ""}`
    : null;

  const { data: categories, loading: loadingCats } = useApiQuery<XtreamCategoryDto[]>(categoriesPath);
  const { data: streams, loading: loadingStreams } = useApiQuery<XtreamLiveStreamDto[]>(streamsPath);

  if (!activeServerId) {
    return (
      <div className="text-center text-gray-400 mt-20">
        <p>No server selected. Add one in Settings.</p>
      </div>
    );
  }

  return (
    <div className="flex gap-4 h-full">
      {loadingCats ? (
        <Loading className="w-52" />
      ) : (
        <CategoryFilter
          categories={categories ?? []}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
      )}

      <div className="flex-1 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-4">Live TV</h1>
        {loadingStreams ? (
          <Loading className="py-8" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {(streams ?? []).map((channel) => (
              <ChannelCard
                key={channel.stream_id}
                channel={channel}
                onClick={() => {
                  // Player integration in Phase 2
                  console.log("Play channel:", channel.stream_id);
                }}
              />
            ))}
          </div>
        )}
        {streams?.length === 0 && !loadingStreams && (
          <p className="text-gray-500 text-center py-8">No channels found.</p>
        )}
      </div>
    </div>
  );
}
