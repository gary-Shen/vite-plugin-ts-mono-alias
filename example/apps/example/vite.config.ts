import { join, resolve } from 'path';

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
        ignorePackages: ['example'],
        exact: true,
        alias: {
          '@ts-mono-alias/package-c': ({ dir }) => join(dir, './index.ts'),
        },
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
