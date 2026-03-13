import { join, resolve } from 'path';

import tsMonoAlias from '../../../dist/index.cjs';
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
        cwd: __dirname,
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
