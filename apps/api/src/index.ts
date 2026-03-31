import Fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import { config } from "./config.js";

const app = Fastify({ logger: true });

await app.register(cors, {
  origin: config.corsOrigin,
  credentials: true,
});
await app.register(cookie);

app.get("/api/health", async () => ({ status: "ok" }));

await app.listen({ port: config.port, host: config.host });
console.log(`API server running on ${config.host}:${config.port}`);
