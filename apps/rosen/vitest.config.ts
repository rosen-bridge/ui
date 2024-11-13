import { fileURLToPath } from 'url';
import { defineConfig } from 'vitest/config';

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
