import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
      NODE_CONFIG_DIR: path.resolve(__dirname, 'config'),
    },
  },
});
