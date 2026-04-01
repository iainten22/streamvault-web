import type { FastifyInstance } from "fastify";
import { db } from "../db/index.js";
import { watchHistory } from "../db/schema.js";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth } from "../auth/middleware.js";

export async function historyRoutes(app: FastifyInstance) {
  app.addHook("onRequest", requireAuth);

  app.get("/api/history", async (request) => {
    const { limit } = request.query as { limit?: string };
    return db.select().from(watchHistory)
      .where(eq(watchHistory.userId, request.user!.userId))
      .orderBy(desc(watchHistory.lastWatchedAt))
      .limit(parseInt(limit ?? "50"));
  });

  app.post("/api/history", async (request) => {
    const { contentId, title, type, progress, duration, genre, posterPath } = request.body as {
      contentId: string; title: string; type: string; progress: number; duration: number; genre?: string; posterPath?: string;
    };
    const userId = request.user!.userId;
    const [existing] = await db.select().from(watchHistory)
      .where(and(eq(watchHistory.userId, userId), eq(watchHistory.contentId, contentId))).limit(1);
    if (existing) {
      const [updated] = await db.update(watchHistory)
        .set({ progress, duration, lastWatchedAt: new Date(), title })
        .where(eq(watchHistory.id, existing.id)).returning();
      return updated;
    }
    const [created] = await db.insert(watchHistory).values({
      userId, contentId, title, type, progress, duration, genre: genre ?? "", posterPath: posterPath ?? null,
    }).returning();
    return created;
  });

  app.delete("/api/history/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    await db.delete(watchHistory).where(and(eq(watchHistory.id, parseInt(id)), eq(watchHistory.userId, request.user!.userId)));
    return reply.status(204).send();
  });
}
