import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  bigint,
  timestamp,
  jsonb,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const servers = pgTable("servers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  serverUrl: text("server_url").notNull(),
  usernameEnc: text("username_enc").notNull(),
  passwordEnc: text("password_enc").notNull(),
  status: text("status").notNull().default("unknown"),
  expiresAt: text("expires_at"),
  isTrial: boolean("is_trial").default(false).notNull(),
  maxConnections: integer("max_connections").default(1).notNull(),
  activeConnections: integer("active_connections").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastUsedAt: timestamp("last_used_at").defaultNow().notNull(),
});

export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  serverId: integer("server_id").references(() => servers.id, { onDelete: "cascade" }).notNull(),
  contentId: integer("content_id").notNull(),
  contentType: text("content_type").notNull(),
  name: text("name").notNull(),
  icon: text("icon"),
  addedAt: timestamp("added_at").defaultNow().notNull(),
});

export const watchHistory = pgTable("watch_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  contentId: text("content_id").notNull(),
  title: text("title").notNull(),
  genre: text("genre").default("").notNull(),
  progress: bigint("progress", { mode: "number" }).default(0).notNull(),
  duration: bigint("duration", { mode: "number" }).default(0).notNull(),
  lastWatchedAt: timestamp("last_watched_at").defaultNow().notNull(),
  type: text("type").notNull(),
  posterPath: text("poster_path"),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull().unique(),
  data: jsonb("data").default({}).notNull(),
});

export const stremioAddons = pgTable("stremio_addons", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  addonUrl: text("addon_url").notNull(),
  config: jsonb("config").default({}).notNull(),
  enabled: boolean("enabled").default(true).notNull(),
  installedAt: timestamp("installed_at").defaultNow().notNull(),
});
