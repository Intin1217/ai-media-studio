import { defineConfig, mergeConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

interface CreateVitestConfigOptions {
  /**
   * Path to the vitest setup file (e.g. './src/test/setup.ts').
   * The shared setup (jest-dom matchers) is always included.
   */
  setupFiles?: string[];
  /**
   * Module alias map — forwarded to resolve.alias.
   * Example: { '@/': new URL('./src/', import.meta.url).href }
   */
  alias?: Record<string, string>;
  /**
   * Root directory for coverage collection (defaults to './src').
   */
  coverageRoot?: string;
}

export function createVitestConfig(
  options: CreateVitestConfigOptions = {},
): ReturnType<typeof defineConfig> {
  const { setupFiles = [], alias = {}, coverageRoot = './src' } = options;

  return defineConfig({
    plugins: [react()],
    test: {
      globals: true,
      environment: 'jsdom',
      css: true,
      setupFiles,
      coverage: {
        provider: 'v8',
        include: [`${coverageRoot}/**`],
        exclude: [
          `${coverageRoot}/**/*.d.ts`,
          `${coverageRoot}/**/*.stories.{ts,tsx}`,
          `${coverageRoot}/**/index.ts`,
        ],
      },
    },
    resolve: {
      alias,
    },
  });
}

export function mergeVitestConfig(
  base: ReturnType<typeof defineConfig>,
  overrides: ReturnType<typeof defineConfig>,
): ReturnType<typeof mergeConfig> {
  return mergeConfig(base, overrides);
}
