import type { FastifyInstance } from "fastify";
import { sportsdbService } from "../services/sportsdb.js";
import { cacheGet, cacheSet } from "../cache/redis.js";
import { requireAuth } from "../auth/middleware.js";

export async function sportsRoutes(app: FastifyInstance) {
  app.addHook("onRequest", requireAuth);

  app.get("/api/sports/events", async (request) => {
    const { date } = request.query as { date?: string };
    const targetDate = date ?? new Date().toISOString().split("T")[0];
    const cacheKey = `sports:events:${targetDate}`;
    const cached = await cacheGet<unknown>(cacheKey);
    if (cached) return cached;
    const events = date ? await sportsdbService.getEventsByDate(date) : await sportsdbService.getEventsToday();
    const result = { events, date: targetDate };
    await cacheSet(cacheKey, result, 15 * 60);
    return result;
  });

  app.get("/api/sports/search", async (request) => {
    const { query } = request.query as { query: string };
    if (!query) return { events: [] };
    const events = await sportsdbService.searchEvents(query);
    return { events };
  });
}
