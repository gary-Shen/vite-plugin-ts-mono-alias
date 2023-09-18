import type { CompilerOptions } from 'typescript';
import type { Package } from '@manypkg/get-packages';
import type { Plugin } from 'vite';

export interface TsConfig {
  compilerOptions: CompilerOptions;
  outDir: string;
}

export interface TsMonoAliasOption {
  /** @default [process.cwd()] */
  ignorePackages?: string[];
  /** @default to <package dir>/src */
  alias?: Record<string, string | ((pkg: Package) => string)>;
}

export type tsMonoAlias = (options?: TsMonoAliasOption) => Promise<Plugin>;
