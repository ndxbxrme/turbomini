import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { removeRuntimeAssets } from './copy-runtime-assets.js';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(scriptDir, '..');

await removeRuntimeAssets(packageRoot);
