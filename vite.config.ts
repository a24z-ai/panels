import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      exclude: ['**/*.stories.tsx', '**/*.test.tsx'],
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'A24ZPanels',
      formats: ['es', 'umd'],
      fileName: (format) => `index.${format === 'es' ? 'esm' : 'umd'}.js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react-resizable-panels'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react-resizable-panels': 'ReactResizablePanels',
        },
      },
    },
    sourcemap: true,
    minify: 'terser',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});