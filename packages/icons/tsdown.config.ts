import svgr from '@svgr/rollup';
import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  platform: 'neutral',
  dts: true,
  format: ['esm'],
  plugins: [svgr({ expandProps: 'end' })],
});
