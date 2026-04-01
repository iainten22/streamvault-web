import type { FastifyInstance } from "fastify";
import { db } from "../db/index.js";
import { settings } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { requireAuth } from "../auth/middleware.js";
import { debridService } from "../services/debrid.js";

async function getDebridKey(userId: number): Promise<string> {
  const [row] = await db.select().from(settings).where(eq(settings.userId, userId)).limit(1);
  const data = row?.data as Record<string, unknown> | undefined;
  const key = data?.realdebridApiKey as string | undefined;
  if (!key) throw new Error("RealDebrid API key not configured. Set it in Settings.");
  return key;
}

export async function debridRoutes(app: FastifyInstance) {
  app.addHook("onRequest", requireAuth);

  app.get("/api/debrid/user", async (request) => {
    const apiKey = await getDebridKey(request.user!.userId);
    return debridService.getUser(apiKey);
  });

  app.post("/api/debrid/add-magnet", async (request) => {
    const apiKey = await getDebridKey(request.user!.userId);
    const { magnet } = request.body as { magnet: string };
    return debridService.addMagnet(apiKey, magnet);
  });

  app.post("/api/debrid/select-files", async (request) => {
    const apiKey = await getDebridKey(request.user!.userId);
    const { torrentId, files } = request.body as { torrentId: string; files: string };
    await debridService.selectFiles(apiKey, torrentId, files);
    return { success: true };
  });

  app.get("/api/debrid/torrent/:id", async (request) => {
    const apiKey = await getDebridKey(request.user!.userId);
    const { id } = request.params as { id: string };
    return debridService.getTorrentInfo(apiKey, id);
  });

  app.post("/api/debrid/unrestrict", async (request) => {
    const apiKey = await getDebridKey(request.user!.userId);
    const { link } = request.body as { link: string };
    return debridService.unrestrict(apiKey, link);
  });

  app.post("/api/debrid/check", async (request) => {
    const apiKey = await getDebridKey(request.user!.userId);
    const { hashes } = request.body as { hashes: string[] };
    return debridService.checkInstantAvailability(apiKey, hashes);
  });
}
