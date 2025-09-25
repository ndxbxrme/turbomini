import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { copyRuntimeAssets } from './copy-runtime-assets.js';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(scriptDir, '..');
const workspaceRoot = path.resolve(packageRoot, '..', '..');

await copyRuntimeAssets({ sourceRoot: workspaceRoot, targetRoot: packageRoot });
