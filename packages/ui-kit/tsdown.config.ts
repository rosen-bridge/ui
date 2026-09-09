import pluginBabel from '@rolldown/plugin-babel';
import { reactCompilerPreset } from '@vitejs/plugin-react';
import autoprefixer from 'autoprefixer';
import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  platform: 'neutral',
  dts: true,
  format: ['esm'],

  plugins: [
    pluginBabel({
      exclude: ['src/legacy/**'],
      presets: [reactCompilerPreset()],
    }),
  ],

  deps: {
    onlyBundle: false,
  },

  css: {
    postcss: {
      plugins: [autoprefixer()],
    },
  },
});
