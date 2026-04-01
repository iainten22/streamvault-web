import Fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import { config } from "./config.js";
import { authRoutes } from "./routes/auth.js";
import { serverRoutes } from "./routes/servers.js";
import { xtreamRoutes } from "./routes/xtream.js";
import { favoritesRoutes } from "./routes/favorites.js";
import { historyRoutes } from "./routes/history.js";
import { settingsRoutes } from "./routes/settings.js";
import { tmdbRoutes } from "./routes/tmdb.js";
import { stremioRoutes } from "./routes/stremio.js";
import { debridRoutes } from "./routes/debrid.js";
import { redis } from "./cache/redis.js";

const app = Fastify({ logger: true });

await app.register(cors, {
  origin: config.corsOrigin,
  credentials: true,
});
await app.register(cookie);

app.get("/api/health", async () => ({ status: "ok" }));

await app.register(authRoutes);
await app.register(serverRoutes);
await app.register(xtreamRoutes);
await app.register(favoritesRoutes);
await app.register(historyRoutes);
await app.register(settingsRoutes);
await app.register(tmdbRoutes);
await app.register(stremioRoutes);
await app.register(debridRoutes);

await redis.connect();
await app.listen({ port: config.port, host: config.host });
console.log(`API server running on ${config.host}:${config.port}`);
