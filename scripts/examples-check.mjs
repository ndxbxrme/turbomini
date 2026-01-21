import { readdir } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import path from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const examplesDir = path.join(root, 'examples');

const entries = await readdir(examplesDir, { withFileTypes: true });
const exampleDirs = entries
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .filter((name) => name !== 'shared');

if (!exampleDirs.length) {
  console.log('No examples found.');
  process.exit(0);
}

const run = (dir) =>
  new Promise((resolve, reject) => {
    const child = spawn('npm', ['test'], {
      cwd: path.join(examplesDir, dir),
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Examples test failed in ${dir}`));
    });
  });

for (const dir of exampleDirs) {
  console.log(`\nRunning example tests: ${dir}`);
  await run(dir);
}

console.log('\nAll example tests passed.');
