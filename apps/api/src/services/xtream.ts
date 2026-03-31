import type {
  XtreamAuthResponse,
  XtreamCategoryDto,
  XtreamLiveStreamDto,
} from "@streamvault/shared";

const TIMEOUT_MS = 15_000;

function normalizeUrl(url: string): string {
  let normalized = url.trim();
  if (!normalized.startsWith("http://") && !normalized.startsWith("https://")) {
    normalized = `http://${normalized}`;
  }
  return normalized.replace(/\/$/, "");
}

async function xtreamGet<T>(baseUrl: string, username: string, password: string, action?: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${normalizeUrl(baseUrl)}/player_api.php`);
  url.searchParams.set("username", username);
  url.searchParams.set("password", password);
  if (action) url.searchParams.set("action", action);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v);
    }
  }

  const response = await fetch(url.toString(), {
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`Xtream API error: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const xtreamService = {
  async authenticate(baseUrl: string, username: string, password: string): Promise<XtreamAuthResponse> {
    return xtreamGet<XtreamAuthResponse>(baseUrl, username, password);
  },

  async getLiveCategories(baseUrl: string, username: string, password: string): Promise<XtreamCategoryDto[]> {
    return xtreamGet<XtreamCategoryDto[]>(baseUrl, username, password, "get_live_categories");
  },

  async getLiveStreams(baseUrl: string, username: string, password: string, categoryId?: string): Promise<XtreamLiveStreamDto[]> {
    const params = categoryId ? { category_id: categoryId } : undefined;
    return xtreamGet<XtreamLiveStreamDto[]>(baseUrl, username, password, "get_live_streams", params);
  },

  async getVodCategories(baseUrl: string, username: string, password: string): Promise<XtreamCategoryDto[]> {
    return xtreamGet<XtreamCategoryDto[]>(baseUrl, username, password, "get_vod_categories");
  },

  async getVodStreams(baseUrl: string, username: string, password: string, categoryId?: string): Promise<unknown[]> {
    const params = categoryId ? { category_id: categoryId } : undefined;
    return xtreamGet<unknown[]>(baseUrl, username, password, "get_vod_streams", params);
  },

  async getSeriesCategories(baseUrl: string, username: string, password: string): Promise<XtreamCategoryDto[]> {
    return xtreamGet<XtreamCategoryDto[]>(baseUrl, username, password, "get_series_categories");
  },

  async getSeries(baseUrl: string, username: string, password: string, categoryId?: string): Promise<unknown[]> {
    const params = categoryId ? { category_id: categoryId } : undefined;
    return xtreamGet<unknown[]>(baseUrl, username, password, "get_series", params);
  },

  async getSeriesInfo(baseUrl: string, username: string, password: string, seriesId: number): Promise<unknown> {
    return xtreamGet<unknown>(baseUrl, username, password, "get_series_info", { series_id: String(seriesId) });
  },

  async getShortEpg(baseUrl: string, username: string, password: string, streamId: number, limit = 10): Promise<unknown> {
    return xtreamGet<unknown>(baseUrl, username, password, "get_short_epg", {
      stream_id: String(streamId),
      limit: String(limit),
    });
  },

  buildStreamUrl(baseUrl: string, username: string, password: string, type: "live" | "movie" | "series", streamId: number, extension: string): string {
    return `${normalizeUrl(baseUrl)}/${type}/${username}/${password}/${streamId}.${extension}`;
  },
};
