import { isAbsolute, join, resolve } from 'path';
import { existsSync, lstatSync } from 'fs';

import { parseConfigFileTextToJson, findConfigFile, sys } from 'typescript';
import type { Plugin } from 'vite';
import { createMatchPath } from 'tsconfig-paths';
import type { MatchPath } from 'tsconfig-paths';
import type { Package } from '@manypkg/get-packages';
import { getPackages } from '@manypkg/get-packages';

import type { TsConfig, TsMonoAliasOption } from './types';

function isDir(path: string) {
  return existsSync(path) && lstatSync(path).isDirectory();
}

function getTsConfig(configPath?: string): TsConfig {
  const defaults = { compilerOptions: {}, outDir: '.' };

  if (!configPath) {
    return defaults;
  }

  const configJson = sys.readFile(configPath);

  if (!configJson) {
    return defaults;
  }

  const { config } = parseConfigFileTextToJson(configPath, configJson);

  return {
    ...defaults,
    ...config,
  };
}

function getTsConfigMapping(packages: Package[]) {
  const result: Record<
    string,
    {
      config: TsConfig;
      match: MatchPath;
    }
  > = {};

  packages.forEach((pkg) => {
    const tsConfig = getTsConfig(findConfigFile(pkg.dir, sys.fileExists));

    result[pkg.packageJson.name] = {
      config: tsConfig,
      match: createMatchPath(
        join(pkg.dir, tsConfig.compilerOptions.baseUrl || '.'),
        tsConfig.compilerOptions.paths || {},
      ),
    };
  });

  return result;
}

const defaultOptions = {
  alias: {},
  ignorePackages: undefined,
};

export default async function tsMonoAlias(options: TsMonoAliasOption = defaultOptions): Promise<Plugin> {
  const { alias = {}, ignorePackages } = options;
  const workspace = await getPackages(process.cwd());
  const currentPkg = require(resolve(process.cwd(), 'package.json'));
  const currentApp = workspace.packages.find((pkg) => pkg.packageJson.name === currentPkg.name);

  if (!currentApp?.packageJson.name) {
    throw new Error('Your current package.json does not have a name.');
  }

  const ignoredPackages = ignorePackages || [currentApp.packageJson.name];
  const packages = workspace.packages
    .filter((pkg) => {
      return !ignoredPackages.find((ipkg) => {
        if (isDir(ipkg)) {
          return resolve(pkg.dir) === resolve(ipkg);
        }

        return pkg.packageJson.name === ipkg;
      });
    })
    .map((pkg) => ({
      ...pkg,
      dir: resolve(pkg.dir),
    }));
  const tsConfigMapping = getTsConfigMapping(packages);

  function matchModule(importee: string, importer: string): string | null {
    const matchedPackage = packages.find((pkg) => {
      return pkg.packageJson.name === importee;
    });

    if (matchedPackage) {
      const matchedAlias = alias[matchedPackage.packageJson.name];

      if (!matchedAlias) {
        return join(matchedPackage.dir, 'src');
      }

      if (typeof matchedAlias === 'function') {
        return matchedAlias(matchedPackage);
      }

      if (isAbsolute(matchedAlias)) {
        return matchedAlias;
      }

      if (matchedAlias.startsWith('.')) {
        return join(process.cwd(), matchedAlias);
      }

      return join(matchedPackage.dir, 'src');
    }

    const resolvedImporter = resolve(importer);
    const importedFromPackage = packages.find((pkg) => resolvedImporter.includes(pkg.dir));

    if (!importedFromPackage) {
      return null;
    }

    const compilerOptions = tsConfigMapping[importedFromPackage.packageJson.name].config.compilerOptions;
    const matchPath = tsConfigMapping[importedFromPackage.packageJson.name].match;
    const pathsInTsConfig = compilerOptions.paths;

    if (pathsInTsConfig && !isAbsolute(importee)) {
      const result = matchPath(importee, undefined, undefined, ['.js', '.json', '.mjs', '.ts', '.tsx', '.jsx']);

      if (!result) {
        return null;
      }

      return result;
    }

    // Working with built-in alias plugin
    if (isAbsolute(importee) && currentApp) {
      return importee.replace(currentApp.dir, importedFromPackage.dir);
    }

    return null;
  }

  return {
    name: 'ts-mono-alias',
    enforce: 'pre',
    resolveId(importee, importer, resolveOptions) {
      if (!importer || importee.startsWith('.')) {
        return null;
      }

      const resolvedImporter = resolve(importer);
      const newResolveOptions = Object.assign({ skipSelf: true }, resolveOptions);

      if (!currentApp) {
        console.log(
          'ts-mono-alias works only in mono-repo projects. You may include the current working directory (CWD) to your workspace setting.',
        );

        return null;
      }

      const matchedPackage = matchModule(importee, importer);

      if (matchedPackage) {
        return this.resolve(matchedPackage, resolvedImporter, newResolveOptions).then((resolved) => {
          return resolved || { id: matchedPackage };
        });
      }

      return null;
    },
  };
}
