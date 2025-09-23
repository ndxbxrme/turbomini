import path from 'node:path';
import pc from 'picocolors';
import { parseCommandArgs } from '../utils/args.js';
import { loadComponent, resolvePackageSpec, resolveRecipeDir } from '../utils/components.js';
import { applyStarterDemo } from '../utils/starter.js';

const DEFAULT_MODE = 'copy';

export async function addCommand(context, args) {
  const { values, positionals } = parseCommandArgs(args, {
    mode: { type: 'string' },
    dir: { type: 'string' },
    force: { type: 'boolean' },
  });

  if (positionals.length === 0) {
    throw new Error('Please specify the component(s) to add, e.g. `turbomini add tm-button`.');
  }

  const projectRoot = path.resolve(context.cwd, values.dir ?? '.');
  const mode = values.mode ?? DEFAULT_MODE;

  for (const name of positionals) {
    const component = await loadComponent(context, name);
    const tag = component.manifest.tag ?? name;

    switch (mode) {
      case 'copy': {
        const recipeDir = resolveRecipeDir(component, 'copy');
        await context.copyDir(recipeDir, projectRoot, {
          skipIfExists: !values.force,
        });
        await applyStarterDemo(context, component, projectRoot);
        context.logger.log(pc.green(`Installed ${tag} (copy mode).`));
        if (values.mode == null) {
          context.logger.log(
            pc.dim(`Install ${tag} as a web component with: turbomini add ${name} --mode wc`)
          );
        }
        break;
      }
      case 'wc': {
        const pkg = resolvePackageSpec(component);
        const packageJsonPath = path.join(projectRoot, 'package.json');
        const changed = await context.modifyJson(packageJsonPath, (pkgJson = {}) => {
          const next = pkgJson;
          next.dependencies = next.dependencies ?? {};
          if (next.dependencies[pkg.name] === pkg.version) {
            return next;
          }
          next.dependencies[pkg.name] = pkg.version;
          return next;
        });

        if (changed) {
          context.logger.log(pc.green(`Added ${pkg.name}@${pkg.version} to dependencies.`));
          context.logger.log(pc.yellow('Install dependencies with your package manager to finish.'));
        } else {
          context.logger.log(pc.dim(`${pkg.name} already present in dependencies.`));
        }
        break;
      }
      default:
        throw new Error(`Unknown add mode "${mode}". Use "copy" or "wc".`);
    }
  }
}
