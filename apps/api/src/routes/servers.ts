import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { db } from "../db/index.js";
import { servers } from "../db/schema.js";
import { eq, and } from "drizzle-orm";
import { encrypt, decrypt } from "../crypto/encrypt.js";
import { requireAuth } from "../auth/middleware.js";
import { config } from "../config.js";

const createServerSchema = z.object({
  name: z.string().min(1),
  serverUrl: z.string().url(),
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function serverRoutes(app: FastifyInstance) {
  app.addHook("onRequest", requireAuth);

  app.get("/api/servers", async (request) => {
    const rows = await db
      .select()
      .from(servers)
      .where(eq(servers.userId, request.user!.userId));

    return rows.map((s) => ({
      id: s.id,
      name: s.name,
      serverUrl: s.serverUrl,
      username: decrypt(s.usernameEnc, config.encryptionKey),
      status: s.status,
      expiresAt: s.expiresAt,
      isTrial: s.isTrial,
      maxConnections: s.maxConnections,
      activeConnections: s.activeConnections,
      createdAt: s.createdAt,
      lastUsedAt: s.lastUsedAt,
    }));
  });

  app.post("/api/servers", async (request) => {
    const body = createServerSchema.parse(request.body);

    const [server] = await db
      .insert(servers)
      .values({
        userId: request.user!.userId,
        name: body.name,
        serverUrl: body.serverUrl.replace(/\/$/, ""),
        usernameEnc: encrypt(body.username, config.encryptionKey),
        passwordEnc: encrypt(body.password, config.encryptionKey),
      })
      .returning();

    return { id: server.id, name: server.name, serverUrl: server.serverUrl, status: server.status };
  });

  app.delete("/api/servers/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const result = await db
      .delete(servers)
      .where(and(eq(servers.id, parseInt(id)), eq(servers.userId, request.user!.userId)))
      .returning();

    if (result.length === 0) {
      return reply.status(404).send({ error: "Server not found" });
    }
    return { success: true };
  });
}
