import autoprefixer from 'autoprefixer';
import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  platform: 'neutral',
  dts: true,
  format: ['esm'],
  deps: {
    onlyAllowBundle: false,
  },
  css: {
    postcss: {
      plugins: [autoprefixer()],
    },
  },
});
