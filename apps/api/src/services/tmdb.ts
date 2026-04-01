import type { TmdbSearchResponse, TmdbMovieDetail, TmdbTvDetail } from "@streamvault/shared";

const BASE_URL = "https://api.themoviedb.org/3";
const TIMEOUT_MS = 10_000;

async function tmdbGet<T>(apiKey: string, path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);
  url.searchParams.set("api_key", apiKey);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v);
    }
  }
  const response = await fetch(url.toString(), { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!response.ok) throw new Error(`TMDB API error: ${response.status}`);
  return response.json() as Promise<T>;
}

export const tmdbService = {
  async search(apiKey: string, query: string, page = 1): Promise<TmdbSearchResponse> {
    return tmdbGet<TmdbSearchResponse>(apiKey, "/search/multi", { query, page: String(page), include_adult: "false" });
  },
  async getMovie(apiKey: string, movieId: number): Promise<TmdbMovieDetail> {
    return tmdbGet<TmdbMovieDetail>(apiKey, `/movie/${movieId}`);
  },
  async getTv(apiKey: string, tvId: number): Promise<TmdbTvDetail> {
    return tmdbGet<TmdbTvDetail>(apiKey, `/tv/${tvId}`, { append_to_response: "external_ids" });
  },
  posterUrl(path: string | null, size = "w500"): string | null {
    if (!path) return null;
    return `https://image.tmdb.org/t/p/${size}${path}`;
  },
};
