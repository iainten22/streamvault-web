import type { FastifyRequest, FastifyReply } from "fastify";
import { verifyToken } from "./jwt.js";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { hashPassword } from "./password.js";

let defaultUserId: number | null = null;

async function getOrCreateDefaultUser(): Promise<number> {
  if (defaultUserId) return defaultUserId;

  const [existing] = await db.select().from(users).where(eq(users.email, "admin")).limit(1);
  if (existing) {
    defaultUserId = existing.id;
    return existing.id;
  }

  const passwordHash = await hashPassword("admin");
  const [created] = await db.insert(users).values({ email: "admin", passwordHash }).returning();
  defaultUserId = created.id;
  return created.id;
}

export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  const token = request.cookies.token ?? request.headers.authorization?.replace("Bearer ", "");
  if (token) {
    try {
      request.user = verifyToken(token);
      return;
    } catch {
      // Fall through to default user
    }
  }

  // Auto-login as default user
  const userId = await getOrCreateDefaultUser();
  request.user = { userId, email: "admin" };
}

export async function optionalAuth(request: FastifyRequest) {
  const token = request.cookies.token ?? request.headers.authorization?.replace("Bearer ", "");
  if (token) {
    try {
      request.user = verifyToken(token);
      return;
    } catch {}
  }
  const userId = await getOrCreateDefaultUser();
  request.user = { userId, email: "admin" };
}

declare module "fastify" {
  interface FastifyRequest {
    user?: { userId: number; email: string };
  }
}
