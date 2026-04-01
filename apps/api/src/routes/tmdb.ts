import type { FastifyInstance } from "fastify";
import { tmdbService } from "../services/tmdb.js";
import { cacheGet, cacheSet } from "../cache/redis.js";
import { config } from "../config.js";
import { requireAuth } from "../auth/middleware.js";

export async function tmdbRoutes(app: FastifyInstance) {
  app.addHook("onRequest", requireAuth);

  app.get("/api/tmdb/search", async (request) => {
    const { query, page } = request.query as { query: string; page?: string };
    if (!query) return { results: [], total_results: 0 };
    const cacheKey = `tmdb:search:${query}:${page ?? "1"}`;
    const cached = await cacheGet<unknown>(cacheKey);
    if (cached) return cached;
    const result = await tmdbService.search(config.tmdbApiKey, query, parseInt(page ?? "1"));
    await cacheSet(cacheKey, result, 24 * 60 * 60);
    return result;
  });

  app.get("/api/tmdb/movie/:id", async (request) => {
    const { id } = request.params as { id: string };
    const cacheKey = `tmdb:movie:${id}`;
    const cached = await cacheGet<unknown>(cacheKey);
    if (cached) return cached;
    const result = await tmdbService.getMovie(config.tmdbApiKey, parseInt(id));
    await cacheSet(cacheKey, result, 24 * 60 * 60);
    return result;
  });

  app.get("/api/tmdb/tv/:id", async (request) => {
    const { id } = request.params as { id: string };
    const cacheKey = `tmdb:tv:${id}`;
    const cached = await cacheGet<unknown>(cacheKey);
    if (cached) return cached;
    const result = await tmdbService.getTv(config.tmdbApiKey, parseInt(id));
    await cacheSet(cacheKey, result, 24 * 60 * 60);
    return result;
  });

  app.get("/api/tmdb/poster", async (request, reply) => {
    const { path, size } = request.query as { path: string; size?: string };
    const url = tmdbService.posterUrl(path, size ?? "w500");
    if (!url) return reply.status(404).send({ error: "No poster" });
    return { url };
  });
}
