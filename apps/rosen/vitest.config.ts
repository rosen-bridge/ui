import { defineConfig } from 'vitest/config';

import { fileURLToPath } from 'url';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./app', import.meta.url)),
    },
  },
  test: {
    name: 'rosen-app',
    include: ['**/*.test.?(c|m)[jt]s?(x)'],
    server: {
      deps: {
        inline: true,
      },
    },
  },
});
