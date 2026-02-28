import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, 'src/components/index.scss'),
      formats: ['es'],
    },
    rollupOptions: {
      output: {
        assetFileNames: 'index.css'
      }
    }
  }
})
