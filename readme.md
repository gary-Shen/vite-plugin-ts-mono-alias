# `vite-plugin-ts-mono-alias`

A Vite plugin to seamlessly resolve mono-repo packages from their `src` directory, eliminating the need to build dependencies manually for easy debugging. :)

✨ **Now fully tested and officially supporting Vite 4, Vite 7, and Vite 8 (including CJS/ESM phantom `.default` fixes).**

![screenshot](./screenshots/screenshot.png)

## Usage

```bash
# pnpm (recommended for workspaces)
pnpm add vite-plugin-ts-mono-alias -D
# npm
npm install vite-plugin-ts-mono-alias -D
# yarn
yarn add vite-plugin-ts-mono-alias -D
```

### Configuration

```ts
// vite.config.ts
import tsMonoAlias from 'vite-plugin-ts-mono-alias';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    // ...
    plugins: [tsMonoAlias()],
    // ...
  };
});
```

### Options

#### `alias`

Define alias for packages.

example:

```ts
// vite.config.ts
import tsMonoAlias from 'vite-plugin-ts-mono-alias';
import { defineConfig } from 'vite';
import { join } from 'path';

// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    // ...
    plugins: [
      tsMonoAlias({
        alias: {
          '@example/package-a': '../../../package-a/lib',
          '@example/package-b': ({ dir }) => join(dir, 'index.ts'),
        },
      }),
    ],
    // ...
  };
});
```

#### `ignorePackages`

> default: [process.cwd()]

Ignore packages from redirecting.

example:

```ts
// vite.config.ts
import tsMonoAlias from 'vite-plugin-ts-mono-alias';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    // ...
    plugins: [
      tsMonoAlias({
        ignorePackages: [
          'package-a', // by package name
          '../package-b', // by path
        ],
      }),
    ],
    // ...
  };
});
```

#### `exact`

> default false.

Exactly match the importee. Such as

`import a from '@example/package-a';` - Will work.

`import a from '@example/package-a/lib/foo';` - Will not work.

## License

MIT
