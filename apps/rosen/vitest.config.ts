import { fileURLToPath } from 'url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    name: 'rosen-app',
    globals: true,
    include: ['**/*.(test|spec).?(c|m)[jt]s?(x)'],
    setupFiles: ['./unitTests/setup/setupTests.ts'],
  },
});
