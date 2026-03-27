import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: [
    '@ai-media-studio/ui',
    '@ai-media-studio/api-client',
    '@ai-media-studio/media-utils',
  ],
  // Static export can be enabled later for production
  // output: 'export',
};

export default nextConfig;
