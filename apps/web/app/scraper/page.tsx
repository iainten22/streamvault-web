"use client";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useApiQuery } from "@/hooks/use-api";
import { PosterCard } from "@/components/content/poster-card";
import { Loading } from "@/components/common/loading";
import { api } from "@/lib/api-client";
import type { TmdbSearchResponse, StremioStream } from "@streamvault/shared";

export default function ScraperPage() {
  return (
    <Suspense fallback={<Loading className="py-8" />}>
      <ScraperInner />
    </Suspense>
  );
}

function ScraperInner() {
  const searchParams = useSearchParams();
  const prefillType = searchParams.get("type");
  const prefillId = searchParams.get("id");
  const prefillTitle = searchParams.get("title");

  const [query, setQuery] = useState(prefillTitle ?? "");
  const [searchTrigger, setSearchTrigger] = useState(prefillTitle ?? "");
  const [selectedId, setSelectedId] = useState<string | null>(prefillId);
  const [selectedType, setSelectedType] = useState<string | null>(prefillType);
  const [streams, setStreams] = useState<(StremioStream & { addonId?: number })[]>([]);
  const [loadingStreams, setLoadingStreams] = useState(false);
  const [resolving, setResolving] = useState<string | null>(null);

  const searchPath = searchTrigger.length >= 2 ? `/api/tmdb/search?query=${encodeURIComponent(searchTrigger)}` : null;
  const { data: searchResults, loading: searching } = useApiQuery<TmdbSearchResponse>(searchPath);

  const handleSearch = () => {
    if (query.trim().length >= 2) {
      setSearchTrigger(query.trim());
      setSelectedId(null);
      setSelectedType(null);
      setStreams([]);
    }
  };

  const handleSelectResult = async (type: string, id: string) => {
    setSelectedId(id);
    setSelectedType(type);
    setLoadingStreams(true);
    try {
      const result = await api.get<{ streams: (StremioStream & { addonId?: number })[] }>(
        `/api/stremio/streams-all/${type}/${id}`,
      );
      setStreams(result.streams);
    } catch {
      setStreams([]);
    } finally {
      setLoadingStreams(false);
    }
  };

  const handlePlayStream = async (stream: StremioStream) => {
    if (stream.url) {
      window.location.href = `/player?serverId=0&streamId=0&type=movie&title=${encodeURIComponent(stream.title ?? stream.name ?? "Stream")}&directUrl=${encodeURIComponent(stream.url)}`;
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
            window.location.href = `/player?serverId=0&streamId=0&type=movie&title=${encodeURIComponent(stream.title ?? stream.name ?? "Stream")}&directUrl=${encodeURIComponent(download)}`;
            return;
          }
          await new Promise((r) => setTimeout(r, 2000));
          attempts++;
        }
        alert("Torrent resolution timed out.");
      } catch (e) {
        alert(e instanceof Error ? e.message : "Debrid resolution failed");
      } finally {
        setResolving(null);
      }
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <h1 className="text-2xl font-bold mb-4">Discover & Stream</h1>

      <div className="flex gap-2 mb-6 max-w-xl">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Search movies & TV shows..."
          className="flex-1 px-4 py-2.5 rounded-lg bg-surface-light border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
          autoFocus
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition"
        >
          Search
        </button>
      </div>

      {searching && <Loading className="py-4" />}
      {searchResults && !selectedId && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 mb-8">
          {searchResults.results
            .filter((r) => r.media_type === "movie" || r.media_type === "tv")
            .map((result) => (
              <PosterCard
                key={result.id}
                title={result.title ?? result.name ?? ""}
                posterUrl={result.poster_path ? `https://image.tmdb.org/t/p/w300${result.poster_path}` : null}
                rating={result.vote_average > 0 ? String(result.vote_average.toFixed(1)) : null}
                year={(result.release_date ?? result.first_air_date)?.substring(0, 4)}
                onClick={() => handleSelectResult(result.media_type, `tmdb:${result.id}`)}
              />
            ))}
        </div>
      )}

      {selectedId && (
        <div>
          <button
            onClick={() => { setSelectedId(null); setStreams([]); }}
            className="text-sm text-primary-light hover:underline mb-4 block"
          >
            ← Back to results
          </button>

          <h2 className="text-lg font-semibold mb-3">Available Streams</h2>

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
                  {stream.title && stream.name && (
                    <p className="text-xs text-gray-400 mt-1">{stream.title}</p>
                  )}
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
              {streams.length === 0 && (
                <p className="text-gray-500 text-center py-4">No streams found. Install more Stremio addons to get results.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
