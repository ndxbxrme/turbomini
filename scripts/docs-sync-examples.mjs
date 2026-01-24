import { cp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
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

const entries = await readdir(targetDir, { withFileTypes: true });
for (const entry of entries) {
  if (!entry.isDirectory()) continue;
  if (entry.name === 'shared') continue;
  const exampleMain = path.join(targetDir, entry.name, 'main.js');
  const exampleIndex = path.join(targetDir, entry.name, 'index.html');
  const exampleSrc = await readFile(exampleMain, 'utf8');
  const exampleNext = exampleSrc.replace(
    /TurboMini\(['"]\/['"]\)/g,
    `TurboMini('/turbomini/examples/${entry.name}/')`
  );
  await writeFile(exampleMain, exampleNext);

  const indexSrc = await readFile(exampleIndex, 'utf8');
  if (!indexSrc.includes('../src/styles/app.css')) {
    const indexNext = indexSrc.replace(
      '<link rel="stylesheet" href="../shared/theme/theme.css" />',
      '<link rel="stylesheet" href="../shared/theme/theme.css" />\n    <link rel="stylesheet" href="../src/styles/app.css" />'
    );
    await writeFile(exampleIndex, indexNext);
  }
}

console.log('Docs examples synced.');
