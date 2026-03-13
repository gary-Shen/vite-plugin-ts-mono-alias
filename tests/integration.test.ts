import { describe, it, expect } from 'vitest';
import { exec } from 'child_process';
import { join } from 'path';
import { promisify } from 'util';
import { existsSync, readFileSync } from 'fs';

const execAsync = promisify(exec);

describe('ts-mono-alias integration tests across Vite versions', () => {
  const exampleDir = join(__dirname, '../example');

  const runBuild = async (appName: string) => {
    const root = join(exampleDir, 'apps', appName);
    
    // Execute a real build to guarantee proper isolated Vite execution bypassing vitest require chains
    // Using `pnpm build` utilizes the workspace binary correctly
    await execAsync('pnpm run build', { cwd: root });
    
    const distFile = join(root, 'dist/index.html');
    if (!existsSync(distFile)) {
      throw new Error(`Build failed to produce dist output for ${appName}`);
    }
    
    // Just a heuristic verify to ensure output exists
    return readFileSync(distFile, 'utf8');
  };

  it('successfully bundles aliased packages in Vite 4', async () => {
    const html = await runBuild('example');
    expect(html).toContain('Vite');
  }, 120000);

  it('successfully bundles aliased packages in Vite 7', async () => {
    const html = await runBuild('example-vite7');
    expect(html).toContain('Vite');
  }, 120000);

  it('successfully bundles aliased packages in Vite 8', async () => {
    const html = await runBuild('example-vite8');
    expect(html).toContain('Vite');
  }, 120000);
});
