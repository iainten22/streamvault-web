import type { FastifyInstance } from "fastify";
import { db } from "../db/index.js";
import { servers } from "../db/schema.js";
import { eq, and } from "drizzle-orm";
import { decrypt } from "../crypto/encrypt.js";
import { requireAuth } from "../auth/middleware.js";
import { xtreamService } from "../services/xtream.js";
import { cacheGet, cacheSet } from "../cache/redis.js";
import { config } from "../config.js";

async function getServerCredentials(userId: number, serverId: number) {
  const [server] = await db
    .select()
    .from(servers)
    .where(and(eq(servers.id, serverId), eq(servers.userId, userId)))
    .limit(1);

  if (!server) throw new Error("Server not found");

  return {
    serverUrl: server.serverUrl,
    username: decrypt(server.usernameEnc, config.encryptionKey),
    password: decrypt(server.passwordEnc, config.encryptionKey),
  };
}

export async function xtreamRoutes(app: FastifyInstance) {
  app.addHook("onRequest", requireAuth);

  app.post("/api/xtream/:serverId/auth", async (request, reply) => {
    const { serverId } = request.params as { serverId: string };
    const creds = await getServerCredentials(request.user!.userId, parseInt(serverId));

    const result = await xtreamService.authenticate(creds.serverUrl, creds.username, creds.password);

    if (result.user_info?.auth !== 1) {
      return reply.status(401).send({ error: result.user_info?.message ?? "Authentication failed" });
    }

    const statusMap: Record<string, string> = {
      Active: "active",
      Expired: "expired",
      Disabled: "disabled",
      Banned: "banned",
    };

    await db
      .update(servers)
      .set({
        status: statusMap[result.user_info.status] ?? "unknown",
        expiresAt: result.user_info.expDate,
        isTrial: result.user_info.isTrial === "1",
        maxConnections: parseInt(result.user_info.maxConnections) || 1,
        activeConnections: parseInt(result.user_info.activeCons) || 0,
        lastUsedAt: new Date(),
      })
      .where(eq(servers.id, parseInt(serverId)));

    return { userInfo: result.user_info, serverInfo: result.server_info };
  });

  app.get("/api/xtream/:serverId/live/categories", async (request) => {
    const { serverId } = request.params as { serverId: string };
    const cacheKey = `live_categories:${serverId}`;

    const cached = await cacheGet<unknown[]>(cacheKey);
    if (cached) return cached;

    const creds = await getServerCredentials(request.user!.userId, parseInt(serverId));
    const categories = await xtreamService.getLiveCategories(creds.serverUrl, creds.username, creds.password);

    await cacheSet(cacheKey, categories, 15 * 60);
    return categories;
  });

  app.get("/api/xtream/:serverId/live/streams", async (request) => {
    const { serverId } = request.params as { serverId: string };
    const { category_id } = request.query as { category_id?: string };
    const cacheKey = `live_streams:${serverId}:${category_id ?? "all"}`;

    const cached = await cacheGet<unknown[]>(cacheKey);
    if (cached) return cached;

    const creds = await getServerCredentials(request.user!.userId, parseInt(serverId));
    const streams = await xtreamService.getLiveStreams(creds.serverUrl, creds.username, creds.password, category_id);

    await cacheSet(cacheKey, streams, 15 * 60);
    return streams;
  });

  app.get("/api/xtream/:serverId/stream-url", async (request) => {
    const { serverId } = request.params as { serverId: string };
    const { type, stream_id, extension } = request.query as {
      type: "live" | "movie" | "series";
      stream_id: string;
      extension?: string;
    };

    const creds = await getServerCredentials(request.user!.userId, parseInt(serverId));
    const url = xtreamService.buildStreamUrl(
      creds.serverUrl,
      creds.username,
      creds.password,
      type,
      parseInt(stream_id),
      extension ?? "ts",
    );

    return { url };
  });

  app.get("/api/xtream/:serverId/epg/:streamId", async (request) => {
    const { serverId, streamId } = request.params as { serverId: string; streamId: string };
    const cacheKey = `epg:${serverId}:${streamId}`;

    const cached = await cacheGet<unknown>(cacheKey);
    if (cached) return cached;

    const creds = await getServerCredentials(request.user!.userId, parseInt(serverId));
    const epg = await xtreamService.getShortEpg(creds.serverUrl, creds.username, creds.password, parseInt(streamId));

    await cacheSet(cacheKey, epg, 6 * 60 * 60);
    return epg;
  });

  app.get("/api/xtream/:serverId/vod/categories", async (request) => {
    const { serverId } = request.params as { serverId: string };
    const cacheKey = `vod_categories:${serverId}`;
    const cached = await cacheGet<unknown[]>(cacheKey);
    if (cached) return cached;
    const creds = await getServerCredentials(request.user!.userId, parseInt(serverId));
    const categories = await xtreamService.getVodCategories(creds.serverUrl, creds.username, creds.password);
    await cacheSet(cacheKey, categories, 15 * 60);
    return categories;
  });

  app.get("/api/xtream/:serverId/vod/streams", async (request) => {
    const { serverId } = request.params as { serverId: string };
    const { category_id } = request.query as { category_id?: string };
    const cacheKey = `vod_streams:${serverId}:${category_id ?? "all"}`;
    const cached = await cacheGet<unknown[]>(cacheKey);
    if (cached) return cached;
    const creds = await getServerCredentials(request.user!.userId, parseInt(serverId));
    const streams = await xtreamService.getVodStreams(creds.serverUrl, creds.username, creds.password, category_id);
    await cacheSet(cacheKey, streams, 30 * 60);
    return streams;
  });

  app.get("/api/xtream/:serverId/series/categories", async (request) => {
    const { serverId } = request.params as { serverId: string };
    const cacheKey = `series_categories:${serverId}`;
    const cached = await cacheGet<unknown[]>(cacheKey);
    if (cached) return cached;
    const creds = await getServerCredentials(request.user!.userId, parseInt(serverId));
    const categories = await xtreamService.getSeriesCategories(creds.serverUrl, creds.username, creds.password);
    await cacheSet(cacheKey, categories, 15 * 60);
    return categories;
  });

  app.get("/api/xtream/:serverId/series/list", async (request) => {
    const { serverId } = request.params as { serverId: string };
    const { category_id } = request.query as { category_id?: string };
    const cacheKey = `series_list:${serverId}:${category_id ?? "all"}`;
    const cached = await cacheGet<unknown[]>(cacheKey);
    if (cached) return cached;
    const creds = await getServerCredentials(request.user!.userId, parseInt(serverId));
    const series = await xtreamService.getSeries(creds.serverUrl, creds.username, creds.password, category_id);
    await cacheSet(cacheKey, series, 30 * 60);
    return series;
  });

  app.get("/api/xtream/:serverId/series/:seriesId/info", async (request) => {
    const { serverId, seriesId } = request.params as { serverId: string; seriesId: string };
    const cacheKey = `series_info:${serverId}:${seriesId}`;
    const cached = await cacheGet<unknown>(cacheKey);
    if (cached) return cached;
    const creds = await getServerCredentials(request.user!.userId, parseInt(serverId));
    const info = await xtreamService.getSeriesInfo(creds.serverUrl, creds.username, creds.password, parseInt(seriesId));
    await cacheSet(cacheKey, info, 30 * 60);
    return info;
  });
}
