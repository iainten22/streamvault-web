import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword } from "../auth/password.js";
import { signToken } from "../auth/jwt.js";
import { config } from "../config.js";

const registerSchema = z.object({
  email: z.string().min(3),
  password: z.string().min(8),
  inviteCode: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().min(1),
  password: z.string(),
});

export async function authRoutes(app: FastifyInstance) {
  app.post("/api/auth/register", async (request, reply) => {
    const body = registerSchema.parse(request.body);

    if (config.inviteCode && body.inviteCode !== config.inviteCode) {
      return reply.status(403).send({ error: "Invalid invite code" });
    }

    const existing = await db.select().from(users).where(eq(users.email, body.email)).limit(1);
    if (existing.length > 0) {
      return reply.status(409).send({ error: "Email already registered" });
    }

    const passwordHash = await hashPassword(body.password);
    const [user] = await db.insert(users).values({ email: body.email, passwordHash }).returning();

    const token = signToken({ userId: user.id, email: user.email });
    reply.setCookie("token", token, {
      httpOnly: true,
      secure: config.corsOrigin.startsWith("https"),
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return { user: { id: user.id, email: user.email } };
  });

  app.post("/api/auth/login", async (request, reply) => {
    const body = loginSchema.parse(request.body);

    const [user] = await db.select().from(users).where(eq(users.email, body.email)).limit(1);
    if (!user || !(await verifyPassword(body.password, user.passwordHash))) {
      return reply.status(401).send({ error: "Invalid email or password" });
    }

    const token = signToken({ userId: user.id, email: user.email });
    reply.setCookie("token", token, {
      httpOnly: true,
      secure: config.corsOrigin.startsWith("https"),
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return { user: { id: user.id, email: user.email } };
  });

  app.post("/api/auth/logout", async (_request, reply) => {
    reply.clearCookie("token", { path: "/" });
    return { success: true };
  });

  app.get("/api/auth/me", async (request, reply) => {
    const token = request.cookies.token ?? request.headers.authorization?.replace("Bearer ", "");
    if (!token) return reply.status(401).send({ error: "Not authenticated" });

    try {
      const { verifyToken } = await import("../auth/jwt.js");
      const payload = verifyToken(token);
      return { user: { id: payload.userId, email: payload.email } };
    } catch {
      return reply.status(401).send({ error: "Invalid token" });
    }
  });
}
