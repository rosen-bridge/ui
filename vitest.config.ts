import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      enabled: true,
      provider: 'istanbul',
      reporter: ['cobertura', 'json-summary'],
      reportOnFailure: true,
      exclude: ['apps/public-status-command', 'apps/public-status-query'],
    },
  },
});
