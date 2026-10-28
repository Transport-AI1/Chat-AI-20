import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    proxyTimeout: 120_000,
  },
};

export default nextConfig;
