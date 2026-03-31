import type { FastifyRequest, FastifyReply } from "fastify";
import { verifyToken } from "./jwt.js";

export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  const token = request.cookies.token ?? request.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    return reply.status(401).send({ error: "Authentication required" });
  }
  try {
    request.user = verifyToken(token);
  } catch {
    return reply.status(401).send({ error: "Invalid token" });
  }
}

export async function optionalAuth(request: FastifyRequest) {
  const token = request.cookies.token ?? request.headers.authorization?.replace("Bearer ", "");
  if (token) {
    try {
      request.user = verifyToken(token);
    } catch {
      // Ignore invalid tokens in optional auth
    }
  }
}

declare module "fastify" {
  interface FastifyRequest {
    user?: { userId: number; email: string };
  }
}
