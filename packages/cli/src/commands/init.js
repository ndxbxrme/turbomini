import path from 'node:path';
import pc from 'picocolors';
import { parseCommandArgs } from '../utils/args.js';
import { initThemeAssets } from './theme.js';

function normalizeName(input) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    || 'turbomini-app';
}

export async function initCommand(context, args) {
  const { values, positionals } = parseCommandArgs(args, {
    template: { type: 'string' },
    name: { type: 'string' },
    theme: { type: 'string' },
  });

  const targetArg = positionals[0] ?? '.';
  const targetDir = path.resolve(context.cwd, targetArg);
  const templateName = values.template ?? 'starter/spa';
  const templateDir = path.join(context.templatesRoot, templateName);

  if (!(await context.fileExists(templateDir))) {
    throw new Error(`Unknown template "${templateName}"`);
  }

  const packageName = values.name ?? normalizeName(path.basename(targetDir));

  context.logger.log(pc.bold(`Scaffolding TurboMini project in ${context.formatPath(targetDir)}`));
  await context.ensureDir(targetDir);

  await context.copyDir(templateDir, targetDir, {
    replacements: {
      APP_NAME: packageName,
      PROJECT_NAME: packageName,
    },
    skipIfExists: false,
  });

  const themeChoice = values.theme ?? 'base';
  if (themeChoice !== 'none') {
    await initThemeAssets(context, {
      projectRoot: targetDir,
      theme: themeChoice,
      skipExisting: true,
    });
  }

  context.logger.log(pc.green('Project ready!'));
}
