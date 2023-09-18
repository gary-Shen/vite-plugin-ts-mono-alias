import type { CompilerOptions } from 'typescript';
import type { Package } from '@manypkg/get-packages';

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
