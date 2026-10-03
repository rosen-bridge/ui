import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.spec.ts'],
    pool: 'forks',
    poolOptions: {
      forks: { execArgv: ['--import', import.meta.resolve('tsx')] },
    },
  },
});
