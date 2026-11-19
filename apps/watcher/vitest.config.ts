import { fileURLToPath } from 'node:url';

import wasm from 'vite-plugin-wasm';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [wasm()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    name: 'watcher-app',
    include: ['unitTests/**/*.spec.ts'],
    server: {
      deps: { inline: ['ergo-lib-wasm-browser'] },
    },
    coverage: {
      provider: 'istanbul',
      include: ['src/utils/validateErgoAddress.ts'],
      reporter: ['text', 'cobertura'],
    },
  },
});
