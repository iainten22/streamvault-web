"use client";
import { useState, useEffect } from "react";
import { useApiQuery } from "@/hooks/use-api";
import { PosterCard } from "@/components/content/poster-card";
import { Loading } from "@/components/common/loading";
import { api } from "@/lib/api-client";
import type { StremioAddon, StremioMetaItem, StremioStream, TmdbSearchResponse } from "@streamvault/shared";

interface StreamWithAddon extends StremioStream {
  addonId?: number;
  addonUrl?: string;
}

export default function StremioPage() {
  const { data: addons, loading: loadingAddons } = useApiQuery<StremioAddon[]>("/api/stremio/addons");

  // Cinemeta catalogs
  const [popularMovies, setPopularMovies] = useState<StremioMetaItem[]>([]);
  const [popularSeries, setPopularSeries] = useState<StremioMetaItem[]>([]);
  const [loadingCatalogs, setLoadingCatalogs] = useState(true);

  // TMDB trending
  const { data: trendingData } = useApiQuery<TmdbSearchResponse>("/api/tmdb/search?query=popular");

  // Stream resolution
  const [selectedItem, setSelectedItem] = useState<{ type: string; id: string; title: string; poster: string | null } | null>(null);
  const [streams, setStreams] = useState<StreamWithAddon[]>([]);
  const [loadingStreams, setLoadingStreams] = useState(false);
  const [resolving, setResolving] = useState<string | null>(null);

  // Fetch Cinemeta catalogs
  useEffect(() => {
    if (!addons) return;
    const cinemeta = addons.find((a) => a.addonUrl.includes("cinemeta"));
    if (!cinemeta) { setLoadingCatalogs(false); return; }

    Promise.all([
      api.get<{ metas: StremioMetaItem[] }>(`/api/stremio/catalog/${cinemeta.id}/movie/top`).catch(() => ({ metas: [] })),
      api.get<{ metas: StremioMetaItem[] }>(`/api/stremio/catalog/${cinemeta.id}/series/top`).catch(() => ({ metas: [] })),
    ]).then(([movies, series]) => {
      setPopularMovies(movies.metas.slice(0, 20));
      setPopularSeries(series.metas.slice(0, 20));
      setLoadingCatalogs(false);
    });
  }, [addons]);

  const handleSelectItem = async (type: string, id: string, title: string, poster: string | null) => {
    setSelectedItem({ type, id, title, poster });
    setLoadingStreams(true);
    setStreams([]);
    try {
      const result = await api.get<{ streams: StreamWithAddon[] }>(`/api/stremio/streams-all/${type}/${id}`);
      setStreams(result.streams);
    } catch {
      setStreams([]);
    } finally {
      setLoadingStreams(false);
    }
  };

  const handlePlayStream = async (stream: StreamWithAddon) => {
    const title = selectedItem?.title ?? "Stream";
    if (stream.url) {
      window.location.href = `/player?serverId=0&streamId=0&type=movie&title=${encodeURIComponent(title)}&directUrl=${encodeURIComponent(stream.url)}`;
      return;
    }
    if (stream.infoHash) {
      setResolving(stream.infoHash);
      try {
        const magnet = `magnet:?xt=urn:btih:${stream.infoHash}`;
        const { id: torrentId } = await api.post<{ id: string }>("/api/debrid/add-magnet", { magnet });
        await api.post("/api/debrid/select-files", { torrentId, files: "all" });
        let attempts = 0;
        while (attempts < 30) {
          const info = await api.get<{ status: string; links: string[] }>(`/api/debrid/torrent/${torrentId}`);
          if (info.status === "downloaded" && info.links.length > 0) {
            const { download } = await api.post<{ download: string }>("/api/debrid/unrestrict", { link: info.links[0] });
            window.location.href = `/player?serverId=0&streamId=0&type=movie&title=${encodeURIComponent(title)}&directUrl=${encodeURIComponent(download)}`;
            return;
          }
          await new Promise((r) => setTimeout(r, 2000));
          attempts++;
        }
      } catch (e) {
        console.error("Debrid resolution failed:", e);
      } finally {
        setResolving(null);
      }
    }
  };

  // Stream detail view
  if (selectedItem) {
    return (
      <div className="h-full overflow-y-auto">
        <button onClick={() => { setSelectedItem(null); setStreams([]); }} className="text-sm text-primary-light hover:underline mb-4 block">
          ← Back to browse
        </button>
        <div className="flex gap-4 mb-6">
          {selectedItem.poster && <img src={selectedItem.poster} alt="" className="w-32 rounded-lg object-cover" />}
          <div>
            <h1 className="text-2xl font-bold">{selectedItem.title}</h1>
            <p className="text-sm text-gray-400 mt-1">{streams.length} streams found</p>
          </div>
        </div>

        {loadingStreams ? (
          <Loading className="py-4" />
        ) : (
          <div className="space-y-2 max-w-2xl">
            {streams.map((stream, i) => (
              <button
                key={i}
                onClick={() => handlePlayStream(stream)}
                disabled={resolving === stream.infoHash}
                className="w-full p-3 rounded-lg bg-surface-light hover:bg-white/10 transition text-left disabled:opacity-50"
              >
                <p className="text-sm font-medium">{stream.name ?? stream.title ?? "Stream"}</p>
                {stream.title && stream.name && <p className="text-xs text-gray-400 mt-1">{stream.title}</p>}
                <div className="flex gap-2 mt-1">
                  {stream.url && <span className="text-xs text-green-400">Direct</span>}
                  {stream.infoHash && (
                    <span className="text-xs text-yellow-400">
                      {resolving === stream.infoHash ? "Resolving..." : "Torrent"}
                    </span>
                  )}
                </div>
              </button>
            ))}
            {streams.length === 0 && !loadingStreams && (
              <p className="text-gray-500 text-center py-4">No streams found.</p>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto space-y-8">
      <h1 className="text-2xl font-bold">Browse</h1>

      {(loadingAddons || loadingCatalogs) && <Loading className="py-4" />}

      {/* Popular Movies from Cinemeta */}
      {popularMovies.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">Popular Movies</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {popularMovies.map((item) => (
              <div key={item.id} className="shrink-0 w-36">
                <PosterCard
                  title={item.name}
                  posterUrl={item.poster ?? null}
                  rating={item.imdbRating}
                  year={item.releaseInfo}
                  onClick={() => handleSelectItem(item.type, item.id, item.name, item.poster ?? null)}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Popular Series from Cinemeta */}
      {popularSeries.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">Popular Series</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {popularSeries.map((item) => (
              <div key={item.id} className="shrink-0 w-36">
                <PosterCard
                  title={item.name}
                  posterUrl={item.poster ?? null}
                  rating={item.imdbRating}
                  year={item.releaseInfo}
                  onClick={() => handleSelectItem(item.type, item.id, item.name, item.poster ?? null)}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Trending from TMDB */}
      {trendingData && trendingData.results.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">Trending</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {trendingData.results
              .filter((r) => r.media_type === "movie" || r.media_type === "tv")
              .slice(0, 20)
              .map((result) => (
                <div key={result.id} className="shrink-0 w-36">
                  <PosterCard
                    title={result.title ?? result.name ?? ""}
                    posterUrl={result.poster_path ? `https://image.tmdb.org/t/p/w300${result.poster_path}` : null}
                    rating={result.vote_average > 0 ? String(result.vote_average.toFixed(1)) : null}
                    year={(result.release_date ?? result.first_air_date)?.substring(0, 4)}
                    onClick={() => handleSelectItem(result.media_type, `tt${result.id}`, result.title ?? result.name ?? "", result.poster_path ? `https://image.tmdb.org/t/p/w300${result.poster_path}` : null)}
                  />
                </div>
              ))}
          </div>
        </section>
      )}

      {/* Installed addons info */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Installed Addons</h2>
        <div className="space-y-2">
          {(addons ?? []).map((addon) => (
            <div key={addon.id} className="flex items-center gap-3 p-3 bg-surface-light rounded-lg">
              {addon.manifest?.logo && <img src={addon.manifest.logo} alt="" className="w-8 h-8 object-contain rounded" />}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{addon.manifest?.name ?? addon.addonUrl}</p>
                <p className="text-xs text-gray-500 truncate">{addon.manifest?.description ?? ""}</p>
              </div>
              <span className="text-xs text-green-400">Active</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
