import type { FastifyInstance } from "fastify";
import { db } from "../db/index.js";
import { settings } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { requireAuth } from "../auth/middleware.js";

export async function settingsRoutes(app: FastifyInstance) {
  app.addHook("onRequest", requireAuth);

  app.get("/api/settings", async (request) => {
    const [row] = await db.select().from(settings).where(eq(settings.userId, request.user!.userId)).limit(1);
    return row?.data ?? {};
  });

  app.put("/api/settings", async (request) => {
    const data = request.body as Record<string, unknown>;
    const userId = request.user!.userId;
    const [existing] = await db.select().from(settings).where(eq(settings.userId, userId)).limit(1);
    if (existing) {
      const merged = { ...(existing.data as Record<string, unknown>), ...data };
      const [updated] = await db.update(settings).set({ data: merged }).where(eq(settings.id, existing.id)).returning();
      return updated.data;
    }
    const [created] = await db.insert(settings).values({ userId, data }).returning();
    return created.data;
  });
}
