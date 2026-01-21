import { cp, rm } from 'node:fs/promises';
import path from 'node:path';

const rootDir = new URL('..', import.meta.url).pathname;
const sourceDir = path.join(rootDir, 'examples');
const targetDir = path.join(rootDir, 'docs', 'examples');

await rm(targetDir, { recursive: true, force: true });
await cp(sourceDir, targetDir, {
  recursive: true,
  filter: (src) => {
    const rel = path.relative(sourceDir, src);
    return !rel.includes('node_modules');
  },
});

console.log('Docs examples synced.');
