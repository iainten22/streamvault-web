"use client";
import { useState } from "react";
import { useServerStore } from "@/stores/server-store";
import { useApiQuery } from "@/hooks/use-api";
import { PosterCard } from "@/components/content/poster-card";
import { CategoryFilter } from "@/components/content/category-filter";
import { Loading } from "@/components/common/loading";
import type { XtreamCategoryDto, XtreamSeriesDto } from "@streamvault/shared";

export default function SeriesPage() {
  const { activeServerId } = useServerStore();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categoriesPath = activeServerId ? `/api/xtream/${activeServerId}/series/categories` : null;
  const seriesPath = activeServerId
    ? `/api/xtream/${activeServerId}/series/list${selectedCategory ? `?category_id=${selectedCategory}` : ""}`
    : null;

  const { data: categories, loading: loadingCats } = useApiQuery<XtreamCategoryDto[]>(categoriesPath);
  const { data: series, loading: loadingSeries } = useApiQuery<XtreamSeriesDto[]>(seriesPath);

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
        <h1 className="text-2xl font-bold mb-4">Series</h1>
        {loadingSeries ? (
          <Loading className="py-8" />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
            {(series ?? []).map((s) => (
              <PosterCard
                key={s.series_id}
                title={s.name}
                posterUrl={s.cover}
                rating={s.rating}
                year={s.release_date?.substring(0, 4)}
                onClick={() => {
                  window.location.href = `/series/${s.series_id}?serverId=${activeServerId}`;
                }}
              />
            ))}
          </div>
        )}
        {series?.length === 0 && !loadingSeries && (
          <p className="text-gray-500 text-center py-8">No series found.</p>
        )}
      </div>
    </div>
  );
}
