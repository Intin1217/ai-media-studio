import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    reactCompiler: true,
  },
  transpilePackages: [
    '@ai-media-studio/ui',
    '@ai-media-studio/api-client',
    '@ai-media-studio/media-utils',
  ],
};

export default nextConfig;
