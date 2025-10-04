import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    domains: ['images.unsplash.com']
  },
  serverExternalPackages: ['@google/generative-ai']
};

export default nextConfig;
