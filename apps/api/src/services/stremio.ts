import type { StremioManifest, StremioMetaItem, StremioStream } from "@streamvault/shared";

const TIMEOUT_MS = 15_000;

function normalizeAddonUrl(url: string): string {
  let normalized = url.trim().replace(/\/$/, "");
  if (!normalized.startsWith("http://") && !normalized.startsWith("https://")) {
    normalized = `https://${normalized}`;
  }
  normalized = normalized.replace(/\/manifest\.json$/, "");
  return normalized;
}

async function addonGet<T>(baseUrl: string, path: string): Promise<T> {
  const url = `${normalizeAddonUrl(baseUrl)}${path}`;
  const response = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!response.ok) throw new Error(`Stremio addon error: ${response.status} from ${url}`);
  return response.json() as Promise<T>;
}

export const stremioService = {
  async getManifest(addonUrl: string): Promise<StremioManifest> {
    return addonGet<StremioManifest>(addonUrl, "/manifest.json");
  },
  async getCatalog(addonUrl: string, type: string, id: string, extra?: string): Promise<{ metas: StremioMetaItem[] }> {
    const extraPath = extra ? `/${extra}` : "";
    return addonGet<{ metas: StremioMetaItem[] }>(addonUrl, `/catalog/${type}/${id}${extraPath}.json`);
  },
  async getStreams(addonUrl: string, type: string, id: string): Promise<{ streams: StremioStream[] }> {
    return addonGet<{ streams: StremioStream[] }>(addonUrl, `/stream/${type}/${id}.json`);
  },
};
