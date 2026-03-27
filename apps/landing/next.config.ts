import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  transpilePackages: [
    '@ai-media-studio/ui',
  ],
};

export default nextConfig;
