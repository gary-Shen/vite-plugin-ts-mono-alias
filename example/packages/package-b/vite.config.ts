import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

const path = require('path');

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [tsconfigPaths()],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'packageB',
      formats: ['es', 'umd'],
      fileName: 'index',
    },
  },
  resolve: {
    alias: {
      '@/': path.resolve(__dirname, 'src'),
    },
  },
});
