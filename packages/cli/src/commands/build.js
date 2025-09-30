import fs from 'node:fs/promises';
import path from 'node:path';
import pc from 'picocolors';
import { parseCommandArgs } from '../utils/args.js';

const DEFAULT_OUT_DIR = 'dist';

async function collectFiles(rootDir) {
  const queue = [rootDir];
  const files = [];

  while (queue.length > 0) {
    const current = queue.pop();
    // eslint-disable-next-line no-await-in-loop
    const entries = await fs.readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const entryPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        queue.push(entryPath);
      } else {
        files.push(entryPath);
      }
    }
  }

  return files;
}

async function maybeMinifyHtml(distDir, logger) {
  try {
    const { minify } = await import('html-minifier-terser');
    const files = await collectFiles(distDir);
    const htmlFiles = files.filter((file) => file.endsWith('.html'));

    for (const file of htmlFiles) {
      // eslint-disable-next-line no-await-in-loop
      const content = await fs.readFile(file, 'utf8');
      // eslint-disable-next-line no-await-in-loop
      const minified = await minify(content, {
        collapseWhitespace: true,
        removeComments: true,
        minifyCSS: true,
        minifyJS: true,
      });
      // eslint-disable-next-line no-await-in-loop
      await fs.writeFile(file, minified, 'utf8');
    }

    if (htmlFiles.length > 0) {
      logger.log(pc.dim(`Minified ${htmlFiles.length} HTML file${htmlFiles.length === 1 ? '' : 's'}.`));
    }
  } catch (error) {
    if (error && error.code === 'ERR_MODULE_NOT_FOUND') {
      return false;
    }
    throw error;
  }
  return true;
}

async function maybeMinifyCss(distDir, logger) {
  try {
    const { transform } = await import('lightningcss');
    const files = await collectFiles(distDir);
    const cssFiles = files.filter((file) => file.endsWith('.css'));

    for (const file of cssFiles) {
      // eslint-disable-next-line no-await-in-loop
      const content = await fs.readFile(file, 'utf8');
      const result = transform({
        filename: file,
        code: Buffer.from(content),
        minify: true,
      });
      // eslint-disable-next-line no-await-in-loop
      await fs.writeFile(file, result.code, 'utf8');
    }

    if (cssFiles.length > 0) {
      logger.log(pc.dim(`Minified ${cssFiles.length} CSS file${cssFiles.length === 1 ? '' : 's'}.`));
    }
  } catch (error) {
    if (error && (error.code === 'ERR_MODULE_NOT_FOUND' || error.code === 'MODULE_NOT_FOUND')) {
      return false;
    }
    throw error;
  }
  return true;
}

export async function buildCommand(context, args) {
  const { values, positionals } = parseCommandArgs(args, {
    dir: { type: 'string' },
    outDir: { type: 'string' },
  });

  const projectRoot = path.resolve(context.cwd, positionals[0] ?? values.dir ?? '.');
  const outDir = path.resolve(projectRoot, values.outDir ?? DEFAULT_OUT_DIR);

  let stats;
  try {
    stats = await fs.stat(projectRoot);
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      throw new Error(`Directory not found: ${context.formatPath(projectRoot)}`);
    }
    throw error;
  }

  if (!stats.isDirectory()) {
    throw new Error(`Not a directory: ${context.formatPath(projectRoot)}`);
  }

  const entries = await fs.readdir(projectRoot, { withFileTypes: true });
  const skipDirs = new Set(['node_modules']);
  const outDirRelative = path.relative(projectRoot, outDir);
  if (outDirRelative && !outDirRelative.startsWith('..')) {
    skipDirs.add(outDirRelative.split(path.sep)[0]);
  }

  await fs.rm(outDir, { recursive: true, force: true });
  await fs.mkdir(outDir, { recursive: true });

  for (const entry of entries) {
    if (entry.name.startsWith('.git')) {
      // skip VCS metadata
      continue;
    }
    if (skipDirs.has(entry.name)) {
      continue;
    }

    const source = path.join(projectRoot, entry.name);
    const target = path.join(outDir, entry.name);
    // eslint-disable-next-line no-await-in-loop
    await fs.cp(source, target, {
      recursive: true,
      force: true,
      filter: (src) => {
        const relative = path.relative(projectRoot, src);
        if (!relative) return true;
        const [topLevel] = relative.split(path.sep);
        if (skipDirs.has(topLevel)) {
          return false;
        }
        if (outDirRelative && relative.startsWith(outDirRelative)) {
          return false;
        }
        if (relative.startsWith('node_modules')) {
          return false;
        }
        return true;
      },
    });
  }

  context.logger.log(pc.green(`Copied project files to ${context.formatPath(outDir)}.`));

  const htmlMinified = await maybeMinifyHtml(outDir, context.logger);
  const cssMinified = await maybeMinifyCss(outDir, context.logger);

  if (!htmlMinified) {
    context.logger.log(pc.dim('Install html-minifier-terser to minify HTML during builds.'));
  }
  if (!cssMinified) {
    context.logger.log(pc.dim('Install lightningcss to minify CSS during builds.'));
  }
}
