import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    setupFiles: [],
    coverage: {
      all: true,
      reporter: ['cobertura', 'lcov', 'text', 'text-summary'],
      provider: 'istanbul',
      include: ['src'],
    },
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
  },
});
