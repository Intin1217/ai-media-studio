import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    // pdfjs-dist는 브라우저 Canvas API 등을 사용하므로 jsdom 환경 필요
    environment: 'jsdom',
  },
});
