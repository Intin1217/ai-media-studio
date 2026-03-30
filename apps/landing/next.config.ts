import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  experimental: {
    reactCompiler: true,
  },
  transpilePackages: ['@ai-media-studio/ui'],
};

export default nextConfig;
