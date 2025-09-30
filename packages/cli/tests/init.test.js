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

async function readRuntimeVersion(context) {
  const runtimeMeta = await readFile(context.runtimeAssets.meta, 'utf8');
  return JSON.parse(runtimeMeta).version;
}

test('init scaffolds a project with embedded runtime', async (t) => {
  const tempDir = await createTempDir('turbomini-workspace-');
  t.after(() => rm(tempDir, { recursive: true, force: true }));

  const context = createContext({ cwd: tempDir, logger: noopLogger() });
  await initCommand(context, ['demo-app']);

  const projectRoot = path.join(tempDir, 'demo-app');
  const packageJson = JSON.parse(await readFile(path.join(projectRoot, 'package.json'), 'utf8'));
  assert.equal(packageJson.name, 'demo-app');
  assert.equal(packageJson.scripts.dev, 'turbomini serve');
  assert.equal(packageJson.scripts.build, 'turbomini build');

  const indexHtml = await readFile(path.join(projectRoot, 'index.html'), 'utf8');
  assert.match(indexHtml, /import \{ TurboMini \} from '\.\/src\/turbomini\.js'/);

  const runtimeCode = await readFile(path.join(projectRoot, 'src', 'turbomini.js'), 'utf8');
  const bundledCode = await readFile(context.runtimeAssets.script, 'utf8');
  assert.equal(runtimeCode, bundledCode);

  const stamp = JSON.parse(await readFile(path.join(projectRoot, '.turbomini.json'), 'utf8'));
  const bundledVersion = await readRuntimeVersion(context);
  assert.equal(stamp.runtimeVersion, bundledVersion);
  assert.equal(stamp.mode, 'local');
});

test('init works when the CLI is installed via npm', async (t) => {
  const { installRoot, cliInstallDir } = await setupInstalledCli();
  t.after(() => rm(installRoot, { recursive: true, force: true }));

  const contextModule = await import(pathToFileURL(path.join(cliInstallDir, 'src', 'context.js')));
  const initModule = await import(pathToFileURL(path.join(cliInstallDir, 'src', 'commands', 'init.js')));
  const runtimeModule = await import(pathToFileURL(path.join(cliInstallDir, 'src', 'utils', 'runtime.js')));

  const context = contextModule.createContext({ cwd: installRoot, logger: noopLogger() });
  await initModule.initCommand(context, ['installed-app']);

  const projectRoot = path.join(installRoot, 'installed-app');
  const packageJson = JSON.parse(await readFile(path.join(projectRoot, 'package.json'), 'utf8'));
  assert.equal(packageJson.name, 'installed-app');

  const indexHtml = await readFile(path.join(projectRoot, 'index.html'), 'utf8');
  assert.match(indexHtml, /import \{ TurboMini \} from '\.\/src\/turbomini\.js'/);

  const runtimeFiles = await runtimeModule.readBundledRuntime(context);
  const runtimeCode = await readFile(path.join(projectRoot, 'src', 'turbomini.js'), 'utf8');
  assert.equal(runtimeCode, runtimeFiles.code);
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
