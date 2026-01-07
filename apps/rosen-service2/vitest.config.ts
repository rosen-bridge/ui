import path from 'node:path';
import { defineConfig } from 'vitest/config';

const configDir = new URL('.', import.meta.url).pathname;

export default defineConfig({
  test: {
    globals: true,
    coverage: {
      all: true,
      provider: 'istanbul',
      reporter: 'cobertura',
    },
    setupFiles: ['./tests/setup.ts'],
    passWithNoTests: true,
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    env: {
      NODE_ENV: 'test',
      NODE_CONFIG_DIR: path.resolve(configDir, 'config'),
    },
  },
});
