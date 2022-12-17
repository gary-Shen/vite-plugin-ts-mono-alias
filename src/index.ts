import { resolve } from 'path';
import { existsSync, lstatSync } from 'fs';

import type { Plugin } from 'vite';
import { getPackages } from '@manypkg/get-packages';

interface TsMonoAliasOption {
  ignorePackages: string[];
  exact?: boolean;
}

function isDir(path: string) {
  return existsSync(path) && lstatSync(path).isDirectory();
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
  const ignoredPackages = ignorePackages || [currentApp];
  const packages = workspace.packages.filter((pkg) => {
    return ignoredPackages.find((ipkg) => {
      if (isDir(ipkg)) {
        return pkg.dir === resolve(ipkg);
      }

      return pkg.packageJson.name === ipkg;
    });
  });

  return {
    name: 'test',
    enforce: 'pre',
    resolveId(importee, importer, resolveOptions) {
      const newResolveOptions = Object.assign({ skipSelf: true }, resolveOptions);

      if (!currentApp) {
        console.log(
          'ts-mono-alias works only in mono-repo projects. You may include the current working directory (CWD) to your workspace setting.',
        );

        return null;
      }

      if (!importer) {
        return null;
      }

      const resolveFromPackage = packages.find((pkg) => importer.includes(pkg.dir));
      let newId: string;

      // vendor packages imported by the mono-repo package
      if (resolveFromPackage && currentApp) {
        newId = importee.replace(currentApp?.dir, resolveFromPackage.dir);
        return this.resolve(newId, importer, newResolveOptions).then((resolved) => {
          return resolved || { id: newId };
        });
      }

      const matchedPackage = packages.find((pkg) => {
        if (exact) {
          return pkg.packageJson.name === importee;
        }

        return importee.startsWith(pkg.packageJson.name);
      });

      if (!matchedPackage) {
        return null;
      }

      newId = matchedPackage.dir + '/src';

      return this.resolve(newId, importer, newResolveOptions).then((resolved) => {
        return resolved || { id: newId };
      });
    },
  };
}
