import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  plugins: [
    dts({ entryRoot: './src' }),
    svgr({ svgrOptions: { expandProps: 'end' } }),
    viteStaticCopy({
      targets: [
        {
          src: 'src/tokens/*.*',
          dest: 'tokens',
        },
      ],
    }),
  ],
  build: {
    lib: {
      entry: './src/index.ts',
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
    },
  },
});
