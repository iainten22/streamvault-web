"use client";
import { useState } from "react";
import { useServerStore } from "@/stores/server-store";
import { useApiQuery } from "@/hooks/use-api";
import { PosterCard } from "@/components/content/poster-card";
import { CategoryFilter } from "@/components/content/category-filter";
import { Loading } from "@/components/common/loading";
import type { XtreamCategoryDto, XtreamVodDto } from "@streamvault/shared";

export default function VodPage() {
  const { activeServerId } = useServerStore();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categoriesPath = activeServerId ? `/api/xtream/${activeServerId}/vod/categories` : null;
  const streamsPath = activeServerId
    ? `/api/xtream/${activeServerId}/vod/streams${selectedCategory ? `?category_id=${selectedCategory}` : ""}`
    : null;

  const { data: categories, loading: loadingCats } = useApiQuery<XtreamCategoryDto[]>(categoriesPath);
  const { data: streams, loading: loadingStreams } = useApiQuery<XtreamVodDto[]>(streamsPath);

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
        <h1 className="text-2xl font-bold mb-4">Movies</h1>
        {loadingStreams ? (
          <Loading className="py-8" />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
            {(streams ?? []).map((movie) => (
              <PosterCard
                key={movie.stream_id}
                title={movie.name}
                posterUrl={movie.stream_icon}
                rating={movie.rating}
                onClick={() => {
                  window.location.href = `/player?serverId=${activeServerId}&streamId=${movie.stream_id}&type=movie&title=${encodeURIComponent(movie.name)}&logo=${encodeURIComponent(movie.stream_icon ?? "")}`;
                }}
              />
            ))}
          </div>
        )}
        {streams?.length === 0 && !loadingStreams && (
          <p className="text-gray-500 text-center py-8">No movies found.</p>
        )}
      </div>
    </div>
  );
}
