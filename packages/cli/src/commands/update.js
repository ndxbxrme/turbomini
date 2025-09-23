import path from 'node:path';
import pc from 'picocolors';
import { parseCommandArgs } from '../utils/args.js';
import { loadComponent, resolveRecipeDir } from '../utils/components.js';

export async function updateCommand(context, args) {
  const { values, positionals } = parseCommandArgs(args, {
    mode: { type: 'string' },
    dir: { type: 'string' },
  });

  if (positionals.length === 0) {
    throw new Error('Please specify which components to update.');
  }

  const mode = values.mode ?? 'copy';
  if (mode !== 'copy') {
    throw new Error('The update command currently supports only copy mode components.');
  }

  const projectRoot = path.resolve(context.cwd, values.dir ?? '.');

  for (const name of positionals) {
    const component = await loadComponent(context, name);
    const recipeDir = resolveRecipeDir(component, 'copy');
    await context.copyDir(recipeDir, projectRoot, { skipIfExists: false });
    context.logger.log(pc.green(`Updated ${component.manifest.tag ?? name} component.`));
  }
}
