import "dotenv/config";

export const config = {
  port: parseInt(process.env.PORT ?? "3001", 10),
  host: process.env.HOST ?? "0.0.0.0",

  db: {
    host: process.env.DB_HOST ?? "localhost",
    port: parseInt(process.env.DB_PORT ?? "5432", 10),
    name: process.env.DB_NAME ?? "streamvault",
    user: process.env.DB_USER ?? "streamvault",
    password: process.env.DB_PASSWORD ?? "changeme",
  },

  redis: {
    host: process.env.REDIS_HOST ?? "localhost",
    port: parseInt(process.env.REDIS_PORT ?? "6379", 10),
    password: process.env.REDIS_PASSWORD ?? "",
  },

  jwtSecret: process.env.JWT_SECRET ?? "dev-secret-change-me",
  encryptionKey: process.env.ENCRYPTION_KEY ?? "0".repeat(64),
  inviteCode: process.env.INVITE_CODE ?? "",
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
} as const;
