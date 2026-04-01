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
import { sportsRoutes } from "./routes/sports.js";
import { redis } from "./cache/redis.js";
import { db } from "./db/index.js";
import { sql } from "drizzle-orm";
import * as schema from "./db/schema.js";

const app = Fastify({ logger: true });

// Auto-create tables on startup
try {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    );
    CREATE TABLE IF NOT EXISTS servers (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      server_url TEXT NOT NULL,
      username_enc TEXT NOT NULL,
      password_enc TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'unknown',
      expires_at TEXT,
      is_trial BOOLEAN NOT NULL DEFAULT false,
      max_connections INTEGER NOT NULL DEFAULT 1,
      active_connections INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      last_used_at TIMESTAMP DEFAULT NOW() NOT NULL
    );
    CREATE TABLE IF NOT EXISTS favorites (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      server_id INTEGER NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
      content_id INTEGER NOT NULL,
      content_type TEXT NOT NULL,
      name TEXT NOT NULL,
      icon TEXT,
      added_at TIMESTAMP DEFAULT NOW() NOT NULL
    );
    CREATE TABLE IF NOT EXISTS watch_history (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      content_id TEXT NOT NULL,
      title TEXT NOT NULL,
      genre TEXT NOT NULL DEFAULT '',
      progress BIGINT NOT NULL DEFAULT 0,
      duration BIGINT NOT NULL DEFAULT 0,
      last_watched_at TIMESTAMP DEFAULT NOW() NOT NULL,
      type TEXT NOT NULL,
      poster_path TEXT
    );
    CREATE TABLE IF NOT EXISTS settings (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      data JSONB NOT NULL DEFAULT '{}'
    );
    CREATE TABLE IF NOT EXISTS stremio_addons (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      addon_url TEXT NOT NULL,
      config JSONB NOT NULL DEFAULT '{}',
      enabled BOOLEAN NOT NULL DEFAULT true,
      installed_at TIMESTAMP DEFAULT NOW() NOT NULL
    );
  `);
  console.log("Database tables ready");
} catch (e) {
  console.error("Failed to create tables:", e);
}

await app.register(cors, {
  origin: true,
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
await app.register(sportsRoutes);

await redis.connect();
await app.listen({ port: config.port, host: config.host });
console.log(`API server running on ${config.host}:${config.port}`);
