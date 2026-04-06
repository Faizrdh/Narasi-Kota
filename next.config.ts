import type { NextConfig } from "next";

const nextConfig: NextConfig & {
  eslint?: {
    ignoreDuringBuilds?: boolean;
  };
} = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;