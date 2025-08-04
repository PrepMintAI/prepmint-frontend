import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,  // ✅ This skips ESLint checks during Vercel builds
  },
};

export default nextConfig;
