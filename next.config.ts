import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true, // ✅ this disables ESLint blocking your build
  },
};

export default nextConfig;
