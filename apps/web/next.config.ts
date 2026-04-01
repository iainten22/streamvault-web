import type { NextConfig } from "next";

const config: NextConfig = {
  transpilePackages: ["@streamvault/shared"],
  images: {
    remotePatterns: [{ protocol: "http", hostname: "**" }, { protocol: "https", hostname: "**" }],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.API_INTERNAL_URL ?? "http://streamvault-api:3001"}/api/:path*`,
      },
    ];
  },
};

export default config;
