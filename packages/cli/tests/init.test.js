import test from 'node:test';
import assert from 'node:assert/strict';
import { cp, mkdtemp, mkdir, readFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { createContext } from '../src/context.js';
import { initCommand } from '../src/commands/init.js';
import { copyRuntimeAssets } from '../scripts/copy-runtime-assets.js';

const testDir = path.dirname(fileURLToPath(import.meta.url));
const cliSourceRoot = path.resolve(testDir, '..');
const workspaceRoot = path.resolve(cliSourceRoot, '..', '..');

function noopLogger() {
  return {
    log: () => {},
  };
}

async function createTempDir(prefix) {
  return mkdtemp(path.join(tmpdir(), prefix));
}

async function setupInstalledCli() {
  const installRoot = await createTempDir('turbomini-cli-');
  const cliInstallDir = path.join(installRoot, 'node_modules', '@turbomini', 'cli');

  await copyRuntimeAssets({ sourceRoot: workspaceRoot, targetRoot: cliInstallDir });
  await mkdir(path.join(cliInstallDir, 'src'), { recursive: true });
  await mkdir(path.join(cliInstallDir, 'bin'), { recursive: true });
  await cp(path.join(cliSourceRoot, 'src'), path.join(cliInstallDir, 'src'), { recursive: true });
  await cp(path.join(cliSourceRoot, 'bin'), path.join(cliInstallDir, 'bin'), { recursive: true });
  await mkdir(path.join(cliInstallDir, 'node_modules'), { recursive: true });
  await cp(path.join(workspaceRoot, 'node_modules', 'diff'), path.join(cliInstallDir, 'node_modules', 'diff'), {
    recursive: true,
  });
  await cp(path.join(workspaceRoot, 'node_modules', 'picocolors'), path.join(cliInstallDir, 'node_modules', 'picocolors'), {
    recursive: true,
  });

  return { installRoot, cliInstallDir };
}

test('init scaffolds a project from workspace sources', async (t) => {
  const tempDir = await createTempDir('turbomini-workspace-');
  t.after(() => rm(tempDir, { recursive: true, force: true }));

  const context = createContext({ cwd: tempDir, logger: noopLogger() });
  await initCommand(context, ['demo-app']);

  const packageJsonPath = path.join(tempDir, 'demo-app', 'package.json');
  const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));
  assert.equal(packageJson.name, 'demo-app');

  const themeCssPath = path.join(tempDir, 'demo-app', 'src', 'styles', 'turbomini', 'theme.css');
  const themeCss = await readFile(themeCssPath, 'utf8');
  assert.ok(themeCss.includes('--tm-color-brand'));
});

test('init works when the CLI is installed via npm', async (t) => {
  const { installRoot, cliInstallDir } = await setupInstalledCli();
  t.after(() => rm(installRoot, { recursive: true, force: true }));

  const contextModule = await import(pathToFileURL(path.join(cliInstallDir, 'src', 'context.js')));
  const initModule = await import(pathToFileURL(path.join(cliInstallDir, 'src', 'commands', 'init.js')));

  const context = contextModule.createContext({ cwd: installRoot, logger: noopLogger() });
  await initModule.initCommand(context, ['installed-app']);

  const packageJsonPath = path.join(installRoot, 'installed-app', 'package.json');
  const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));
  assert.equal(packageJson.name, 'installed-app');

  const themeCssPath = path.join(installRoot, 'installed-app', 'src', 'styles', 'turbomini', 'theme.css');
  const themeCss = await readFile(themeCssPath, 'utf8');
  assert.ok(themeCss.includes('--tm-color-brand'));
});

test('component metadata is available after packaging', async (t) => {
  const { installRoot, cliInstallDir } = await setupInstalledCli();
  t.after(() => rm(installRoot, { recursive: true, force: true }));

  const contextModule = await import(pathToFileURL(path.join(cliInstallDir, 'src', 'context.js')));
  const componentsModule = await import(pathToFileURL(path.join(cliInstallDir, 'src', 'utils', 'components.js')));

  const context = contextModule.createContext({ cwd: installRoot, logger: noopLogger() });
  const component = await componentsModule.loadComponent(context, 'tm-button');
  assert.equal(component.manifest.tag, 'tm-button');
});
