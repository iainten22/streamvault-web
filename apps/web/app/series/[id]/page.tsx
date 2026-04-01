"use client";
import { useState, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useApiQuery } from "@/hooks/use-api";
import { Loading } from "@/components/common/loading";
import type { XtreamSeriesInfoDto } from "@streamvault/shared";

export default function SeriesDetailPage() {
  return (
    <Suspense fallback={<Loading className="py-8" />}>
      <SeriesDetailInner />
    </Suspense>
  );
}

function SeriesDetailInner() {
  const params = useParams();
  const searchParams = useSearchParams();
  const seriesId = params.id as string;
  const serverId = searchParams.get("serverId");
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null);

  const infoPath = serverId ? `/api/xtream/${serverId}/series/${seriesId}/info` : null;
  const { data: info, loading } = useApiQuery<XtreamSeriesInfoDto>(infoPath);

  if (!serverId) {
    return <div className="text-center text-gray-400 mt-20"><p>Missing server ID.</p></div>;
  }

  if (loading || !info) {
    return <Loading className="py-8" />;
  }

  const seasonKeys = Object.keys(info.episodes).sort((a, b) => parseInt(a) - parseInt(b));
  const activeSeason = selectedSeason ?? seasonKeys[0] ?? null;
  const episodes = activeSeason ? info.episodes[activeSeason] ?? [] : [];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex gap-6 mb-8">
        {info.info.cover && (
          <img src={info.info.cover} alt={info.info.name} className="w-48 rounded-lg object-cover" />
        )}
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">{info.info.name}</h1>
          {info.info.genre && <p className="text-sm text-gray-400 mb-1">{info.info.genre}</p>}
          {info.info.release_date && <p className="text-sm text-gray-500 mb-3">{info.info.release_date}</p>}
          {info.info.rating && <p className="text-yellow-400 text-sm mb-3">Rating: {info.info.rating}</p>}
          {info.info.plot && <p className="text-gray-300 text-sm leading-relaxed">{info.info.plot}</p>}
          {info.info.cast && <p className="text-gray-500 text-xs mt-2">Cast: {info.info.cast}</p>}
          {info.info.director && <p className="text-gray-500 text-xs">Director: {info.info.director}</p>}
        </div>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {seasonKeys.map((season) => (
          <button
            key={season}
            onClick={() => setSelectedSeason(season)}
            className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition ${
              activeSeason === season
                ? "bg-primary text-white"
                : "bg-surface-light text-gray-400 hover:text-white"
            }`}
          >
            Season {season}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {episodes.map((ep) => (
          <button
            key={ep.id}
            onClick={() => {
              window.location.href = `/player?serverId=${serverId}&streamId=${ep.id}&type=series&title=${encodeURIComponent(`S${activeSeason}E${ep.episode_num} - ${ep.title}`)}&logo=${encodeURIComponent(ep.info.movie_image ?? info.info.cover ?? "")}`;
            }}
            className="w-full flex items-center gap-4 p-3 rounded-lg bg-surface-light hover:bg-surface-light/80 hover:ring-1 hover:ring-primary/30 transition text-left"
          >
            {ep.info.movie_image && (
              <img src={ep.info.movie_image} alt={ep.title} className="w-28 h-16 object-cover rounded" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                E{ep.episode_num}. {ep.title}
              </p>
              {ep.info.duration && <p className="text-xs text-gray-500">{ep.info.duration}</p>}
              {ep.info.plot && <p className="text-xs text-gray-400 line-clamp-2 mt-1">{ep.info.plot}</p>}
            </div>
            {ep.info.rating != null && ep.info.rating > 0 && (
              <span className="text-xs text-yellow-400">{ep.info.rating}</span>
            )}
          </button>
        ))}
        {episodes.length === 0 && (
          <p className="text-gray-500 text-center py-4">No episodes found for this season.</p>
        )}
      </div>
    </div>
  );
}
