import { join, resolve } from 'path';
import { existsSync, lstatSync } from 'fs';
// import { platform } from 'os'

import { parseConfigFileTextToJson, findConfigFile, sys } from 'typescript';
import type { Plugin } from 'vite';
import { getPackages, Package } from '@manypkg/get-packages';
import { createMatchPath } from 'tsconfig-paths';

interface TsMonoAliasOption {
  ignorePackages: string[];
  exact?: boolean;
}

function isDir(path: string) {
  return existsSync(path) && lstatSync(path).isDirectory();
}

function getTsConfig(configPath?: string) {
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
  const result: Record<string, any> = {};

  packages.forEach((pkg) => {
    const tsConfig = getTsConfig(findConfigFile(pkg.dir, sys.fileExists));
    console.log('ttttt', join(pkg.dir, tsConfig.compilerOptions.baseUrl))
    result[pkg.packageJson.name] = {
      config: tsConfig,
      match: createMatchPath(join(pkg.dir, tsConfig.compilerOptions.baseUrl), tsConfig.compilerOptions.paths),
    };
  });

  return result;
}

export default async function tsMonoAlias(
  { ignorePackages = [], exact = false }: TsMonoAliasOption = {
    ignorePackages: [],
    exact: false,
  },
): Promise<Plugin> {
  const workspace = await getPackages(process.cwd());
  const currentPkg = require(resolve(process.cwd(), 'package.json'));
  const currentApp = workspace.packages.find((pkg) => pkg.packageJson.name === currentPkg.name);
  const ignoredPackages = ignorePackages || [currentApp?.packageJson.name];
  const packages = workspace.packages.filter((pkg) => {
    return !ignoredPackages.find((ipkg) => {
      if (isDir(ipkg)) {
        return resolve(pkg.dir) === resolve(ipkg);
      }

      return pkg.packageJson.name === ipkg;
    });
  }).map(pkg => ({
    ...pkg,
    dir: resolve(pkg.dir),
  }));
  const tsConfigMapping = getTsConfigMapping(packages);
  // const currentPlatform = platform

  function matchModule(importee: string, importer: string): string | null {
    const matchedPackage = packages.find((pkg) => {
      if (exact) {
        return pkg.packageJson.name === importee;
      }

      return importee.startsWith(pkg.packageJson.name);
    });

    if (matchedPackage) {
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

    if (pathsInTsConfig) {
      const result = matchPath(importee, undefined, undefined, ['.js', '.json', '.mjs', '.ts', '.tsx', '.jsx']);

      if (!result) {
        return null;
      }

      return result;
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

      // const correctImportee = currentPlatform === 'win32' ? importee.replace(/\//g, '\\') : importee;
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
