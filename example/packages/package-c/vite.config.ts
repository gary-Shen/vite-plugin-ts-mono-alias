import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

const path = require('path');

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [tsconfigPaths()],
  build: {
    lib: {
      entry: 'index.ts',
      name: 'packageC',
      formats: ['es', 'umd'],
      fileName: 'index',
    },
  },
});
