import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
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
