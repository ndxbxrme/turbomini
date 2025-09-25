import fs from 'node:fs/promises';
import path from 'node:path';

const DEFAULT_FILTER = (source) => {
  const basename = path.basename(source);
  return basename !== 'node_modules' && basename !== '.git';
};

async function ensureSourceExists(source) {
  try {
    await fs.access(source);
  } catch {
    throw new Error(`Missing asset directory: ${source}`);
  }
}

async function copyDirectory(source, target) {
  await ensureSourceExists(source);
  await fs.rm(target, { recursive: true, force: true });
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.cp(source, target, {
    recursive: true,
    filter: (src) => DEFAULT_FILTER(src),
  });
}

export async function copyRuntimeAssets({ sourceRoot, targetRoot }) {
  const entries = [
    { from: path.join(sourceRoot, 'templates'), to: path.join(targetRoot, 'templates') },
    { from: path.join(sourceRoot, 'packages', 'themes'), to: path.join(targetRoot, 'packages', 'themes') },
    { from: path.join(sourceRoot, 'packages', 'wc'), to: path.join(targetRoot, 'packages', 'wc') },
  ];

  for (const entry of entries) {
    await copyDirectory(entry.from, entry.to);
  }
}

export async function removeRuntimeAssets(targetRoot) {
  const targets = [
    path.join(targetRoot, 'templates'),
    path.join(targetRoot, 'packages', 'themes'),
    path.join(targetRoot, 'packages', 'wc'),
  ];

  await Promise.all(targets.map((target) => fs.rm(target, { recursive: true, force: true })));
}
