import fs from 'node:fs/promises';
import path from 'node:path';

export async function loadComponent(context, name) {
  const componentDir = path.join(context.componentsRoot, name);
  const manifestPath = path.join(componentDir, 'component.json');

  if (!(await context.fileExists(manifestPath))) {
    throw new Error(`Component "${name}" is not available in the TurboMini registry.`);
  }

  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  return { manifest, componentDir };
}

export function resolveRecipeDir(component, mode) {
  const recipe = component.manifest.recipes?.[mode];
  if (!recipe) {
    throw new Error(`Component "${component.manifest.tag ?? 'unknown'}" does not support ${mode} mode yet.`);
  }

  const recipePath = recipe.path ?? `recipes/${mode}`;
  return path.join(component.componentDir, recipePath);
}

export function resolvePackageSpec(component) {
  const pkg = component.manifest.recipes?.wc;
  if (!pkg?.package) {
    throw new Error(`Component "${component.manifest.tag ?? 'unknown'}" is missing its web component package.`);
  }

  return { name: pkg.package, version: pkg.version ?? 'latest' };
}
