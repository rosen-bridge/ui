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
        /*
          TODO: because of non standard import in @rosen-bridge/tokens this flag is set to true
          and it should be removed after the problem is solved
        */
        inline: true,
      },
    },
  },
});
