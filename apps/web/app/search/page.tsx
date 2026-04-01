"use client";
import { useState, useMemo } from "react";
import { useServerStore } from "@/stores/server-store";
import { useApiQuery } from "@/hooks/use-api";
import { ChannelCard } from "@/components/content/channel-card";
import { PosterCard } from "@/components/content/poster-card";
import { Loading } from "@/components/common/loading";
import type { XtreamLiveStreamDto, XtreamVodDto, XtreamSeriesDto } from "@streamvault/shared";

export default function SearchPage() {
  const { activeServerId } = useServerStore();
  const [query, setQuery] = useState("");

  const livePath = activeServerId ? `/api/xtream/${activeServerId}/live/streams` : null;
  const vodPath = activeServerId ? `/api/xtream/${activeServerId}/vod/streams` : null;
  const seriesPath = activeServerId ? `/api/xtream/${activeServerId}/series/list` : null;

  const { data: liveStreams, loading: l1 } = useApiQuery<XtreamLiveStreamDto[]>(livePath);
  const { data: vodStreams, loading: l2 } = useApiQuery<XtreamVodDto[]>(vodPath);
  const { data: seriesList, loading: l3 } = useApiQuery<XtreamSeriesDto[]>(seriesPath);

  const loading = l1 || l2 || l3;
  const q = query.toLowerCase().trim();

  const filteredLive = useMemo(
    () => (q.length >= 2 ? (liveStreams ?? []).filter((s) => s.name.toLowerCase().includes(q)) : []),
    [liveStreams, q],
  );
  const filteredVod = useMemo(
    () => (q.length >= 2 ? (vodStreams ?? []).filter((s) => s.name.toLowerCase().includes(q)) : []),
    [vodStreams, q],
  );
  const filteredSeries = useMemo(
    () => (q.length >= 2 ? (seriesList ?? []).filter((s) => s.name.toLowerCase().includes(q)) : []),
    [seriesList, q],
  );

  if (!activeServerId) {
    return <div className="text-center text-gray-400 mt-20"><p>No server selected. Add one in Settings.</p></div>;
  }

  return (
    <div className="h-full overflow-y-auto">
      <h1 className="text-2xl font-bold mb-4">Search</h1>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search channels, movies, series..."
        className="w-full max-w-xl px-4 py-2.5 rounded-lg bg-surface-light border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 mb-6"
        autoFocus
      />

      {loading && <Loading className="py-4" />}

      {q.length >= 2 && !loading && (
        <div className="space-y-8">
          {filteredLive.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-3">Live TV ({filteredLive.length})</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {filteredLive.slice(0, 12).map((channel) => (
                  <ChannelCard
                    key={channel.stream_id}
                    channel={channel}
                    onClick={() => {
                      window.location.href = `/player?serverId=${activeServerId}&streamId=${channel.stream_id}&type=live&title=${encodeURIComponent(channel.name)}&logo=${encodeURIComponent(channel.stream_icon ?? "")}`;
                    }}
                  />
                ))}
              </div>
            </section>
          )}

          {filteredVod.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-3">Movies ({filteredVod.length})</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {filteredVod.slice(0, 12).map((movie) => (
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
            </section>
          )}

          {filteredSeries.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-3">Series ({filteredSeries.length})</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {filteredSeries.slice(0, 12).map((s) => (
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
            </section>
          )}

          {filteredLive.length === 0 && filteredVod.length === 0 && filteredSeries.length === 0 && (
            <p className="text-gray-500 text-center py-8">No results for &quot;{query}&quot;</p>
          )}
        </div>
      )}

      {q.length > 0 && q.length < 2 && (
        <p className="text-gray-500 text-sm">Type at least 2 characters to search.</p>
      )}
    </div>
  );
}
