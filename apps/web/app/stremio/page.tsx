"use client";
import { useState, useEffect } from "react";
import { useApiQuery } from "@/hooks/use-api";
import { PosterCard } from "@/components/content/poster-card";
import { Loading } from "@/components/common/loading";
import { api } from "@/lib/api-client";
import type { StremioAddon, StremioMetaItem } from "@streamvault/shared";

export default function StremioPage() {
  const [addonUrl, setAddonUrl] = useState("");
  const [installing, setInstalling] = useState(false);
  const { data: addons, loading, refetch } = useApiQuery<StremioAddon[]>("/api/stremio/addons");
  const [selectedAddon, setSelectedAddon] = useState<StremioAddon | null>(null);
  const [selectedCatalog, setSelectedCatalog] = useState<{ type: string; id: string } | null>(null);
  const [catalogItems, setCatalogItems] = useState<StremioMetaItem[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(false);

  const handleInstall = async () => {
    if (!addonUrl.trim()) return;
    setInstalling(true);
    try {
      await api.post("/api/stremio/addons", { addonUrl: addonUrl.trim() });
      setAddonUrl("");
      refetch();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to install addon");
    } finally {
      setInstalling(false);
    }
  };

  const handleRemove = async (id: number) => {
    await api.del(`/api/stremio/addons/${id}`);
    refetch();
  };

  useEffect(() => {
    if (!selectedAddon || !selectedCatalog) {
      setCatalogItems([]);
      return;
    }
    setLoadingCatalog(true);
    api
      .get<{ metas: StremioMetaItem[] }>(
        `/api/stremio/catalog/${selectedAddon.id}/${selectedCatalog.type}/${selectedCatalog.id}`,
      )
      .then((res) => setCatalogItems(res.metas ?? []))
      .catch(() => setCatalogItems([]))
      .finally(() => setLoadingCatalog(false));
  }, [selectedAddon, selectedCatalog]);

  return (
    <div className="h-full overflow-y-auto">
      <h1 className="text-2xl font-bold mb-6">Stremio Addons</h1>

      <div className="flex gap-2 mb-6 max-w-xl">
        <input
          type="text"
          value={addonUrl}
          onChange={(e) => setAddonUrl(e.target.value)}
          placeholder="Addon URL (e.g. https://addon.example.com/manifest.json)"
          className="flex-1 px-4 py-2 rounded-lg bg-surface-light border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <button
          onClick={handleInstall}
          disabled={installing}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 disabled:opacity-50 transition"
        >
          {installing ? "Installing..." : "Install"}
        </button>
      </div>

      {loading ? (
        <Loading className="py-4" />
      ) : (
        <div className="space-y-3 mb-8">
          {(addons ?? []).map((addon) => (
            <div key={addon.id} className="flex items-center gap-4 p-3 bg-surface-light rounded-lg">
              {addon.manifest?.logo && (
                <img src={addon.manifest.logo} alt="" className="w-10 h-10 object-contain rounded" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium">{addon.manifest?.name ?? addon.addonUrl}</p>
                <p className="text-xs text-gray-400 truncate">{addon.manifest?.description ?? addon.addonUrl}</p>
                {addon.manifest?.catalogs && addon.manifest.catalogs.length > 0 && (
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {addon.manifest.catalogs.map((cat) => (
                      <button
                        key={`${cat.type}-${cat.id}`}
                        onClick={() => {
                          setSelectedAddon(addon);
                          setSelectedCatalog({ type: cat.type, id: cat.id });
                        }}
                        className={`text-xs px-2 py-0.5 rounded transition ${
                          selectedAddon?.id === addon.id && selectedCatalog?.id === cat.id
                            ? "bg-primary text-white"
                            : "bg-white/10 text-gray-300 hover:bg-white/20"
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => handleRemove(addon.id)}
                className="text-red-400 hover:text-red-300 text-sm px-2"
              >
                Remove
              </button>
            </div>
          ))}
          {(addons ?? []).length === 0 && (
            <p className="text-gray-500 text-sm">No addons installed. Paste a Stremio addon URL above.</p>
          )}
        </div>
      )}

      {selectedCatalog && (
        <div>
          <h2 className="text-lg font-semibold mb-3">
            {selectedAddon?.manifest?.name} — {selectedCatalog.id}
          </h2>
          {loadingCatalog ? (
            <Loading className="py-4" />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
              {catalogItems.map((item) => (
                <PosterCard
                  key={item.id}
                  title={item.name}
                  posterUrl={item.poster ?? null}
                  rating={item.imdbRating}
                  year={item.releaseInfo}
                  onClick={() => {
                    window.location.href = `/scraper?type=${item.type}&id=${item.id}&title=${encodeURIComponent(item.name)}&poster=${encodeURIComponent(item.poster ?? "")}`;
                  }}
                />
              ))}
            </div>
          )}
          {catalogItems.length === 0 && !loadingCatalog && (
            <p className="text-gray-500 text-center py-4">No items in this catalog.</p>
          )}
        </div>
      )}
    </div>
  );
}
