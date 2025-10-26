import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { diffLines } from 'diff';
import pc from 'picocolors';

function dirname(url) {
  return path.dirname(fileURLToPath(url));
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readFileIfExists(filePath) {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch {
    return null;
  }
}

function renderDiff(oldContent, newContent) {
  const diff = diffLines(oldContent, newContent);
  return diff
    .map((part) => {
      const color = part.added
        ? pc.green
        : part.removed
        ? pc.red
        : pc.dim;
      const prefix = part.added ? '+' : part.removed ? '-' : ' ';
      return part.value
        .split('\n')
        .filter((line) => line.length > 0)
        .map((line) => `${color(prefix + ' ' + line)}`)
        .join('\n');
    })
    .filter(Boolean)
    .join('\n');
}

export function createContext(options = {}) {
  const { dryRun = false, cwd = process.cwd(), logger = console } = options;
  const contextDir = dirname(import.meta.url); // packages/cli/src
  const cliRoot = path.resolve(contextDir, '..');
  const workspaceRoot = path.resolve(cliRoot, '..', '..');

  function resolveFirstExistingPath(...candidates) {
    for (const candidate of candidates) {
      if (fsSync.existsSync(candidate)) {
        return candidate;
      }
    }

    return candidates[candidates.length - 1];
  }

  function resolveRuntimePath(...segments) {
    return resolveFirstExistingPath(
      path.resolve(cliRoot, ...segments),
      path.resolve(workspaceRoot, ...segments)
    );
  }

  const templatesRoot = resolveRuntimePath('templates');
  const componentsRoot = resolveRuntimePath('packages', 'wc');
  const themesRoot = resolveRuntimePath('packages', 'themes');
  const assetsRoot = resolveRuntimePath('assets');
  const runtimeAssets = {
    script: resolveFirstExistingPath(
      path.join(cliRoot, 'assets', 'turbomini.js'),
      path.join(workspaceRoot, 'packages', 'core', 'src', 'turbomini.js')
    ),
    types: resolveFirstExistingPath(
      path.join(cliRoot, 'assets', 'turbomini.d.ts'),
      path.join(workspaceRoot, 'packages', 'core', 'types', 'turbomini.d.ts')
    ),
    meta: resolveFirstExistingPath(
      path.join(cliRoot, 'assets', 'runtime.json'),
      path.join(workspaceRoot, 'packages', 'core', 'package.json')
    ),
  };

  function formatPath(targetPath) {
    const rel = path.relative(cwd, targetPath);
    return rel === '' ? '.' : rel;
  }

  async function ensureDir(dirPath) {
    if (dryRun) {
      logger.log(pc.dim(`[dry-run] mkdir ${formatPath(dirPath)}`));
      return;
    }

    await fs.mkdir(dirPath, { recursive: true });
  }

  async function writeFile(filePath, content, options = {}) {
    const { skipIfExists = false } = options;
    const existing = await readFileIfExists(filePath);

    if (existing !== null) {
      if (skipIfExists) {
        logger.log(pc.yellow(`skip ${formatPath(filePath)} (already exists)`));
        return false;
      }

      if (existing === content) {
        logger.log(pc.dim(`unchanged ${formatPath(filePath)}`));
        return false;
      }
    }

    if (dryRun) {
      logger.log(pc.dim(`[dry-run] write ${formatPath(filePath)}`));
      const diffOutput = renderDiff(existing ?? '', content);
      if (diffOutput) {
        logger.log(diffOutput);
      }
      return true;
    }

    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, content, 'utf8');
    logger.log(pc.green(`write ${formatPath(filePath)}`));
    return true;
  }

  async function copyDir(sourceDir, targetDir, options = {}) {
    const {
      filter,
      rename,
      replacements,
      transform,
      skipIfExists = false,
    } = options;

    const entries = await fs.readdir(sourceDir, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(sourceDir, entry.name);
      const nextName = rename ? rename(entry) : entry.name;
      const destPath = path.join(targetDir, nextName);

      if (filter && !filter(entry)) {
        continue;
      }

      if (entry.isDirectory()) {
        await copyDir(srcPath, destPath, {
          filter,
          rename,
          replacements,
          transform,
          skipIfExists,
        });
        continue;
      }

      let content = await fs.readFile(srcPath, 'utf8');

      if (replacements) {
        for (const [key, value] of Object.entries(replacements)) {
          const token = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
          content = content.replace(token, value);
        }
      }

      if (transform) {
        content = await transform({
          entry,
          sourcePath: srcPath,
          targetPath: destPath,
          content,
        });
      }

      await writeFile(destPath, content, { skipIfExists });
    }
  }

  async function modifyJson(filePath, mutate) {
    const exists = await fileExists(filePath);
    const current = exists ? JSON.parse(await fs.readFile(filePath, 'utf8')) : {};
    const next = await mutate(structuredClone(current));

    if (!next) {
      return false;
    }

    const content = `${JSON.stringify(next, null, 2)}\n`;
    return writeFile(filePath, content);
  }

  return {
    dryRun,
    cwd,
    cliRoot,
    workspaceRoot,
    templatesRoot,
    componentsRoot,
    themesRoot,
    logger,
    ensureDir,
    writeFile,
    copyDir,
    modifyJson,
    formatPath,
    fileExists,
    renderDiff,
    assetsRoot,
    runtimeAssets,
  };
}
