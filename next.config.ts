import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  async rewrites() {
    return [
      {
        source: "/u/:id",
        destination: "/u/[id]",
      },
    ];
  },
};

export default nextConfig;