import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: [
    '@ai-media-studio/ui',
    '@ai-media-studio/api-client',
    '@ai-media-studio/media-utils',
  ],
};

export default nextConfig;
