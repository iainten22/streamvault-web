import type { FastifyInstance } from "fastify";
import { db } from "../db/index.js";
import { stremioAddons } from "../db/schema.js";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../auth/middleware.js";
import { stremioService } from "../services/stremio.js";
import { cacheGet, cacheSet } from "../cache/redis.js";

export async function stremioRoutes(app: FastifyInstance) {
  app.addHook("onRequest", requireAuth);

  app.get("/api/stremio/addons", async (request) => {
    const addons = await db.select().from(stremioAddons).where(eq(stremioAddons.userId, request.user!.userId));
    const results = await Promise.all(
      addons.map(async (addon) => {
        try {
          const manifest = await stremioService.getManifest(addon.addonUrl);
          return { ...addon, manifest };
        } catch {
          return { ...addon, manifest: null };
        }
      }),
    );
    return results;
  });

  app.post("/api/stremio/addons", async (request, reply) => {
    const { addonUrl } = request.body as { addonUrl: string };
    const manifest = await stremioService.getManifest(addonUrl);
    const [addon] = await db.insert(stremioAddons).values({
      userId: request.user!.userId, addonUrl, config: {}, enabled: true,
    }).returning();
    return reply.status(201).send({ ...addon, manifest });
  });

  app.delete("/api/stremio/addons/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    await db.delete(stremioAddons).where(and(eq(stremioAddons.id, parseInt(id)), eq(stremioAddons.userId, request.user!.userId)));
    return reply.status(204).send();
  });

  app.get("/api/stremio/catalog/:addonId/:type/:catalogId", async (request) => {
    const { addonId, type, catalogId } = request.params as { addonId: string; type: string; catalogId: string };
    const { extra } = request.query as { extra?: string };
    const [addon] = await db.select().from(stremioAddons)
      .where(and(eq(stremioAddons.id, parseInt(addonId)), eq(stremioAddons.userId, request.user!.userId))).limit(1);
    if (!addon) throw new Error("Addon not found");
    const cacheKey = `stremio:catalog:${addonId}:${type}:${catalogId}:${extra ?? ""}`;
    const cached = await cacheGet<unknown>(cacheKey);
    if (cached) return cached;
    const result = await stremioService.getCatalog(addon.addonUrl, type, catalogId, extra);
    await cacheSet(cacheKey, result, 60 * 60);
    return result;
  });

  app.get("/api/stremio/streams/:addonId/:type/:contentId", async (request) => {
    const { addonId, type, contentId } = request.params as { addonId: string; type: string; contentId: string };
    const [addon] = await db.select().from(stremioAddons)
      .where(and(eq(stremioAddons.id, parseInt(addonId)), eq(stremioAddons.userId, request.user!.userId))).limit(1);
    if (!addon) throw new Error("Addon not found");
    return stremioService.getStreams(addon.addonUrl, type, contentId);
  });

  app.get("/api/stremio/streams-all/:type/:contentId", async (request) => {
    const { type, contentId } = request.params as { type: string; contentId: string };
    const addons = await db.select().from(stremioAddons)
      .where(and(eq(stremioAddons.userId, request.user!.userId), eq(stremioAddons.enabled, true)));
    const allStreams = await Promise.all(
      addons.map(async (addon) => {
        try {
          const result = await stremioService.getStreams(addon.addonUrl, type, contentId);
          return result.streams.map((s) => ({ ...s, addonId: addon.id, addonUrl: addon.addonUrl }));
        } catch { return []; }
      }),
    );
    return { streams: allStreams.flat() };
  });
}
