import type { FastifyInstance } from "fastify";
import { db } from "../db/index.js";
import { favorites } from "../db/schema.js";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../auth/middleware.js";

export async function favoritesRoutes(app: FastifyInstance) {
  app.addHook("onRequest", requireAuth);

  app.get("/api/favorites", async (request) => {
    const { type } = request.query as { type?: string };
    const conditions = [eq(favorites.userId, request.user!.userId)];
    if (type) conditions.push(eq(favorites.contentType, type));
    return db.select().from(favorites).where(and(...conditions)).orderBy(favorites.addedAt);
  });

  app.post("/api/favorites", async (request, reply) => {
    const { serverId, contentId, contentType, name, icon } = request.body as {
      serverId: number; contentId: number; contentType: string; name: string; icon?: string;
    };
    const [fav] = await db.insert(favorites).values({
      userId: request.user!.userId, serverId, contentId, contentType, name, icon: icon ?? null,
    }).returning();
    return reply.status(201).send(fav);
  });

  app.delete("/api/favorites/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    await db.delete(favorites).where(and(eq(favorites.id, parseInt(id)), eq(favorites.userId, request.user!.userId)));
    return reply.status(204).send();
  });

  app.get("/api/favorites/check", async (request) => {
    const { serverId, contentId, contentType } = request.query as {
      serverId: string; contentId: string; contentType: string;
    };
    const [fav] = await db.select().from(favorites).where(
      and(
        eq(favorites.userId, request.user!.userId),
        eq(favorites.serverId, parseInt(serverId)),
        eq(favorites.contentId, parseInt(contentId)),
        eq(favorites.contentType, contentType),
      ),
    ).limit(1);
    return { favorited: !!fav, favorite: fav ?? null };
  });
}
