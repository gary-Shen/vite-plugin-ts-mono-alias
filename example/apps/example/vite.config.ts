import { resolve } from 'path';

import tsMonoAlias from 'vite-plugin-ts-mono-alias';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    optimizeDeps: {
      include: ['react/jsx-runtime'],
    },
    plugins: [
      tsMonoAlias({
        ignorePackages: ['example', 'vite-plugin-ts-mono-alias'],
        exact: true,
      }),
    ],
    resolve: {
      alias: [{ find: '@', replacement: resolve(__dirname, 'src') }],
    },

    build: {
      assetsDir: '',
    },
  };
});
