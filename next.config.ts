import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    domains: ['images.unsplash.com']
  },
  experimental: {
    serverComponentsExternalPackages: ['@google/generative-ai']
  }
};

export default nextConfig;
