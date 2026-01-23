import { readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const rootDir = new URL('..', import.meta.url).pathname;
const sourcePath = path.join(rootDir, 'packages', 'core', 'src', 'turbomini.js');
const examplesDir = path.join(rootDir, 'examples');

const checkOnly = process.argv.includes('--check');

const source = await readFile(sourcePath, 'utf8');
let dirty = false;

const targets = [
  path.join(rootDir, 'docs', 'src', 'turbomini.js'),
  path.join(rootDir, 'examples', 'shared', 'turbomini.js'),
];

const entries = await readdir(examplesDir, { withFileTypes: true });
for (const entry of entries) {
  if (!entry.isDirectory()) continue;
  if (entry.name === 'shared') continue;
  targets.push(path.join(examplesDir, entry.name, 'turbomini.js'));
}

for (const target of targets) {
  let current = '';
  try {
    current = await readFile(target, 'utf8');
  } catch {
    current = '';
  }

  if (current !== source) {
    dirty = true;
    if (checkOnly) {
      console.error(`Runtime out of sync: ${path.relative(rootDir, target)}`);
    } else {
      await writeFile(target, source);
      console.log(`Updated runtime: ${path.relative(rootDir, target)}`);
    }
  }
}

if (checkOnly && dirty) {
  process.exit(1);
}

if (!dirty) {
  console.log('Runtime sync complete.');
}
