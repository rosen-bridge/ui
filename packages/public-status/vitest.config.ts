import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('.', import.meta.url)),
    },
  },
  test: {
    globals: true,
    setupFiles: [],
    coverage: {
      all: true,
      provider: 'istanbul',
      reporter: 'cobertura',
    },
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
  },
});
