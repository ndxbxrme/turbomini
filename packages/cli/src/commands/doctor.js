import fs from 'node:fs/promises';
import path from 'node:path';
import { diffLines } from 'diff';
import pc from 'picocolors';
import { parseCommandArgs } from '../utils/args.js';

const THEME_FILES = ['theme.css', 'tokens.css', 'tokens.dark.css', 'tokens.json'];

function renderDiff(expected, actual) {
  const diff = diffLines(expected, actual);
  return diff
    .map((part) => {
      const color = part.added ? pc.green : part.removed ? pc.red : pc.dim;
      const prefix = part.added ? '+' : part.removed ? '-' : ' ';
      return part.value
        .split('\n')
        .filter((line) => line.length > 0)
        .map((line) => color(`${prefix} ${line}`))
        .join('\n');
    })
    .filter(Boolean)
    .join('\n');
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, 'utf8'));
}

export async function doctorCommand(context, args) {
  const { values, positionals } = parseCommandArgs(args, {
    dir: { type: 'string' },
  });

  const projectRoot = path.resolve(context.cwd, positionals[0] ?? values.dir ?? '.');
  const packageJsonPath = path.join(projectRoot, 'package.json');

  if (!(await context.fileExists(packageJsonPath))) {
    throw new Error(`No package.json found in ${context.formatPath(projectRoot)}.`);
  }

  context.logger.log(pc.bold(`Running TurboMini doctor in ${context.formatPath(projectRoot)}`));

  const projectPackageJson = await readJson(packageJsonPath);

  const versionChecks = [
    {
      name: 'turbomini',
      source: path.join(context.workspaceRoot, 'packages', 'core', 'package.json'),
    },
    {
      name: '@turbomini/theme-base',
      source: path.join(context.workspaceRoot, 'packages', 'themes', 'base', 'package.json'),
    },
  ];

  const versionIssues = [];
  for (const check of versionChecks) {
    const expected = (await readJson(check.source)).version;
    const declared =
      projectPackageJson.dependencies?.[check.name] ??
      projectPackageJson.devDependencies?.[check.name];

    if (!declared) {
      continue;
    }

    if (!declared.includes(expected)) {
      versionIssues.push({
        name: check.name,
        expected,
        declared,
      });
    }
  }

  const themeIssues = [];
  const themeDir = path.join(projectRoot, 'src', 'styles', 'turbomini');
  const canonicalDir = path.join(context.themesRoot, 'base', 'dist');

  for (const fileName of THEME_FILES) {
    const projectFile = path.join(themeDir, fileName);
    if (!(await context.fileExists(projectFile))) {
      themeIssues.push({
        fileName,
        type: 'missing',
      });
      continue;
    }

    const canonicalFile = path.join(canonicalDir, fileName);
    if (!(await context.fileExists(canonicalFile))) {
      continue;
    }

    const [expected, actual] = await Promise.all([
      fs.readFile(canonicalFile, 'utf8'),
      fs.readFile(projectFile, 'utf8'),
    ]);

    if (expected !== actual) {
      themeIssues.push({
        fileName,
        type: 'diff',
        diff: renderDiff(expected, actual),
      });
    }
  }

  if (versionIssues.length === 0 && themeIssues.length === 0) {
    context.logger.log(pc.green('✓ No drift detected. Tokens and versions look healthy.'));
    return;
  }

  if (versionIssues.length > 0) {
    context.logger.log(pc.yellow(pc.bold('\nVersion drift detected:')));
    for (const issue of versionIssues) {
      context.logger.log(
        pc.yellow(
          `  • ${issue.name} is ${issue.declared}, latest workspace version is ${issue.expected}.`
        )
      );
    }
  }

  if (themeIssues.length > 0) {
    context.logger.log(pc.yellow(pc.bold('\nTheme token drift detected:')));
    for (const issue of themeIssues) {
      if (issue.type === 'missing') {
        context.logger.log(pc.yellow(`  • Missing ${issue.fileName} in ${context.formatPath(themeDir)}.`));
        continue;
      }

      context.logger.log(pc.yellow(`  • ${issue.fileName} differs from base tokens.`));
      if (issue.diff) {
        context.logger.log(issue.diff);
      }
    }
  }

  process.exitCode = 1;
}
