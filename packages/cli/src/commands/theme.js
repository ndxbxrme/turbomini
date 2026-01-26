import path from 'node:path';
import pc from 'picocolors';
import { parseCommandArgs } from '../utils/args.js';

const DEFAULT_THEME = 'base';
const THEME_IMPORT = '@import "./styles/turbomini/theme.css";';

function toKebabCase(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function toTitleCase(value) {
  return value
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ');
}

export async function initThemeAssets(context, options = {}) {
  const { projectRoot = context.cwd, theme = DEFAULT_THEME, skipExisting = false } = options;
  const themeDir = path.join(context.themesRoot, theme);
  const distDir = path.join(themeDir, 'dist');

  if (!(await context.fileExists(distDir))) {
    throw new Error(`Theme assets not found for "${theme}"`);
  }

  const targetDir = path.join(projectRoot, 'src', 'styles', 'turbomini');
  context.logger.log(pc.bold(`Installing ${theme} theme tokens in ${context.formatPath(targetDir)}`));
  await context.copyDir(distDir, targetDir, { skipIfExists: skipExisting });
}

export async function createThemeAssets(context, options = {}) {
  const { projectRoot = context.cwd, name } = options;

  if (!name) {
    throw new Error('Theme name is required, e.g. `turbomini theme create brand`');
  }

  const kebabName = toKebabCase(name);
  const themeDir = path.join(projectRoot, 'src', 'styles', 'themes', kebabName);
  const displayName = toTitleCase(name);

  const tokensJson = {
    name: displayName,
    extends: DEFAULT_THEME,
    tokens: {
      color: {
        '--tm-color-brand': '#2563eb',
        '--tm-color-brand-contrast': '#ffffff',
      },
    },
  };

  const brandColor = tokensJson.tokens.color['--tm-color-brand'];
  const brandContrast = tokensJson.tokens.color['--tm-color-brand-contrast'];
  const themeCss = `@import '../turbomini/theme.css';\n\n[data-theme="${kebabName}"] {\n  --tm-color-brand: ${brandColor};\n  --tm-color-brand-contrast: ${brandContrast};\n}\n`;

  await context.writeFile(
    path.join(themeDir, 'tokens.json'),
    `${JSON.stringify(tokensJson, null, 2)}\n`,
    { skipIfExists: true }
  );

  await context.writeFile(path.join(themeDir, 'theme.css'), themeCss, { skipIfExists: true });

  context.logger.log(pc.green(`Created theme scaffold at ${context.formatPath(themeDir)}`));
}

async function injectThemeImport(context, projectRoot) {
  const cssPath = path.join(projectRoot, 'src', 'app.css');
  const existing = await context.readFile(cssPath);

  if (!existing) {
    context.logger.log(
      pc.yellow('No src/app.css found. Add @import "./styles/turbomini/theme.css" manually.')
    );
    return;
  }

  if (existing.includes(THEME_IMPORT) || existing.includes('turbomini/theme.css')) {
    context.logger.log(pc.dim('Theme import already present in src/app.css.'));
    return;
  }

  const next = `${THEME_IMPORT}\n\n${existing.trimStart()}`;
  await context.writeFile(cssPath, next);
}

export async function handleThemeCommand(context, args) {
  if (!args.length) {
    throw new Error('Missing theme command. Use `init` or `create`.');
  }

  const [subCommand, ...rest] = args;

  switch (subCommand) {
    case 'init': {
      const { values, positionals } = parseCommandArgs(rest, {
        theme: { type: 'string' },
        force: { type: 'boolean' },
        dir: { type: 'string' },
        apply: { type: 'boolean', default: true },
        'no-apply': { type: 'boolean', default: false },
      });

      const projectRoot = path.resolve(context.cwd, positionals[0] ?? values.dir ?? '.');
      await initThemeAssets(context, {
        projectRoot,
        theme: values.theme ?? DEFAULT_THEME,
        skipExisting: !values.force,
      });
      const shouldApply = values.apply && !values['no-apply'];
      if (shouldApply) {
        await injectThemeImport(context, projectRoot);
      }
      break;
    }

    case 'create': {
      const { values, positionals } = parseCommandArgs(rest, {
        dir: { type: 'string' },
      });

      const name = positionals[0];
      if (!name) {
        throw new Error('Please provide a theme name, e.g. `turbomini theme create brand`.');
      }

      const projectRoot = path.resolve(context.cwd, values.dir ?? '.');
      await createThemeAssets(context, { projectRoot, name });
      break;
    }

    default:
      throw new Error(`Unknown theme command "${subCommand}"`);
  }
}
