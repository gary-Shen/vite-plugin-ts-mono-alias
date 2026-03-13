import { join } from 'path';

import { describe, it, expect } from 'vitest';

import tsMonoAlias from '../src/index';

describe('ts-mono-alias plugin', () => {
  const rootDir = join(__dirname, '../example');
  const cwd = join(rootDir, 'apps/example');
  
  const appFile = join(cwd, 'src/main.ts');
  const libAFile = join(rootDir, 'packages/package-a/src/index.ts');

  // Helper context to mock Rollup Context
  // Simulate Vite 7/8 throwing an error for external ids without trailing specs
  const getContext = (simulateError = false) => ({
    resolve: async (id: string) => {
      if (simulateError) {
        throw new Error(`Rollup Error: Could not resolve entry module "${id}"`);
      }
      return { id };
    }
  });

  it('resolves bare import for workspace package to its src directory', async () => {
    const plugin = await tsMonoAlias({ cwd });
    
    // @ts-expect-error - mock plugin context for testing
    const result = await plugin.resolveId.call(getContext(), '@ts-mono-alias/package-a', appFile, {});
    
    expect(result).toBeDefined();
    expect(result).toBeDefined();
    expect(result?.id).toBe(join(rootDir, 'packages/package-a/src'));
  });

  it('safely falls back if `this.resolve` throws an error (Vite 7/8 compatibility)', async () => {
    const plugin = await tsMonoAlias({ cwd });
    
    // @ts-expect-error - mock plugin context for testing
    const result = await plugin.resolveId.call(getContext(true), '@ts-mono-alias/package-a', appFile, {});
    
    expect(result).toBeDefined();
    expect(result?.id).toBe(join(rootDir, 'packages/package-a/src'));
  });

  it('resolves tsconfig paths mapped alias internally via tsconfig-paths', async () => {
    const plugin = await tsMonoAlias({ cwd });
    
    // @/index should map to package-a/src/index.ts
    // @ts-expect-error - mock plugin context for testing
    const result = await plugin.resolveId.call(getContext(), '@/index', libAFile, {});
    // We expect it to resolve to the file path without extension
    expect(result?.id).toBe(join(rootDir, 'packages/package-a/src/index'));
  });

  it('resolves using custom alias object', async () => {
    const plugin = await tsMonoAlias({
      cwd,
      alias: {
        '@ts-mono-alias/package-b': join(rootDir, 'packages/package-b/core')
      }
    });

    // @ts-expect-error - mock plugin context for testing
    const result = await plugin.resolveId.call(getContext(), '@ts-mono-alias/package-b', appFile, {});

    expect(result).toBeDefined();
    expect(result?.id).toBe(join(rootDir, 'packages/package-b/core'));
  });

  it('resolves using an absolute custom alias object', async () => {
    const plugin = await tsMonoAlias({
      cwd,
      alias: {
        '@ts-mono-alias/package-b': join(rootDir, 'packages/package-b/absolute_dir')
      }
    });

    // @ts-expect-error - mock plugin context for testing
    const result = await plugin.resolveId.call(getContext(), '@ts-mono-alias/package-b', appFile, {});

    expect(result).toBeDefined();
    expect(result?.id).toBe(join(rootDir, 'packages/package-b/absolute_dir'));
  });

  it('resolves using a custom function mapper for alias', async () => {
    const plugin = await tsMonoAlias({
      cwd,
      alias: {
        '@ts-mono-alias/package-b': (pkg) => join(pkg.dir, 'custom_dir')
      }
    });

    // @ts-expect-error - mock plugin context for testing
    const result = await plugin.resolveId.call(getContext(), '@ts-mono-alias/package-b', appFile, {});

    expect(result).toBeDefined();
    expect(result?.id).toBe(join(rootDir, 'packages/package-b/custom_dir'));
  });

  it('skips processing if a package is ignored', async () => {
    const plugin = await tsMonoAlias({
      cwd,
      ignorePackages: ['@ts-mono-alias/package-a']
    });

    // @ts-expect-error - mock plugin context for testing
    const result = await plugin.resolveId.call(getContext(), '@ts-mono-alias/package-a', appFile, {});

    expect(result).toBeNull();
  });

  it('skips processing for relative imports', async () => {
    const plugin = await tsMonoAlias({ cwd });

    // @ts-expect-error - mock plugin context for testing
    const result = await plugin.resolveId.call(getContext(), './utils', appFile, {});

    expect(result).toBeNull();
  });

  it('handles absolute import correctly (working with built-in alias plugin)', async () => {
    const plugin = await tsMonoAlias({ cwd });

    // An absolute import path pretending to be re-aliased by Vite itself
    const absoluteImportee = join(cwd, 'src/test.ts');
    
    // @ts-expect-error - mock plugin context for testing
    const result = await plugin.resolveId.call(getContext(), absoluteImportee, libAFile, {});

    // It should replace the currentApp dir with importedFromPackage dir
    expect(result?.id).toBe(join(rootDir, 'packages/package-a/src/test.ts'));
  });

  it('returns null if no matching tsconfig path is found', async () => {
    const plugin = await tsMonoAlias({ cwd });
    
    // Call with a path that doesn't exist in compilerOptions.paths
    // @ts-expect-error - mock plugin context for testing
    const result = await plugin.resolveId.call(getContext(), '@/non-existent', appFile, {});

    expect(result).toBeNull();
  });

  it('returns null if importedFromPackage is not found', async () => {
    const plugin = await tsMonoAlias({ cwd });
    
    // An importer outside the workspace
    const outsideImporter = '/temp/outside/file.ts';
    
    // @ts-expect-error - mock plugin context for testing
    const result = await plugin.resolveId.call(getContext(), '@/something', outsideImporter, {});

    expect(result).toBeNull();
  });
});
