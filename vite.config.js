// vite.config.js
import { resolve } from 'path'
import cleanup from 'rollup-plugin-cleanup'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'lib/index.ts'),
      name: 'TextareaCaretPlus',
      fileName: 'textarea-caret-plus',
      formats: ['es', 'umd'],
    },
    minify: true,
    rollupOptions: {
      plugins: [
        cleanup(),
      ],
    },
    outDir: 'dist',
  },
  plugins: [
    dts({ rollupTypes: true }),
  ],
})
