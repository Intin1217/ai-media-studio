import { fileURLToPath } from 'node:url';
import { createVitestConfig } from '@ai-media-studio/config/vitest/shared';

export default createVitestConfig({
  setupFiles: ['./src/test/setup.ts'],
  alias: {
    '@/': fileURLToPath(new URL('./src/', import.meta.url)),
  },
  coverageRoot: './src',
});
