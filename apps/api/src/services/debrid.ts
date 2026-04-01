import type { RealDebridUser, RealDebridTorrent, RealDebridUnrestrict } from "@streamvault/shared";

const RD_BASE = "https://api.real-debrid.com/rest/1.0";
const TIMEOUT_MS = 15_000;

async function rdGet<T>(apiKey: string, path: string): Promise<T> {
  const response = await fetch(`${RD_BASE}${path}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`RealDebrid error: ${response.status}`);
  return response.json() as Promise<T>;
}

async function rdPost<T>(apiKey: string, path: string, body?: Record<string, string>): Promise<T> {
  const response = await fetch(`${RD_BASE}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: body ? new URLSearchParams(body).toString() : undefined,
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`RealDebrid error: ${response.status}`);
  return response.json() as Promise<T>;
}

export const debridService = {
  async getUser(apiKey: string): Promise<RealDebridUser> {
    return rdGet<RealDebridUser>(apiKey, "/user");
  },
  async addMagnet(apiKey: string, magnet: string): Promise<{ id: string; uri: string }> {
    return rdPost<{ id: string; uri: string }>(apiKey, "/torrents/addMagnet", { magnet });
  },
  async selectFiles(apiKey: string, torrentId: string, files: string): Promise<void> {
    await rdPost<void>(apiKey, `/torrents/selectFiles/${torrentId}`, { files });
  },
  async getTorrentInfo(apiKey: string, torrentId: string): Promise<RealDebridTorrent> {
    return rdGet<RealDebridTorrent>(apiKey, `/torrents/info/${torrentId}`);
  },
  async unrestrict(apiKey: string, link: string): Promise<RealDebridUnrestrict> {
    return rdPost<RealDebridUnrestrict>(apiKey, "/unrestrict/link", { link });
  },
  async checkInstantAvailability(apiKey: string, hashes: string[]): Promise<Record<string, unknown>> {
    return rdGet<Record<string, unknown>>(apiKey, `/torrents/instantAvailability/${hashes.join("/")}`);
  },
};
