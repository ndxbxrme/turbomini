import fs from 'node:fs/promises';
import path from 'node:path';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import pc from 'picocolors';
import { parseCommandArgs } from '../utils/args.js';
import { loadComponent, resolveRecipeDir } from '../utils/components.js';
import { readBundledRuntime, readStamp, writeRuntimeFiles } from '../utils/runtime.js';

async function handleComponentUpdate(context, projectRoot, positionals, mode) {
  if (mode !== 'copy') {
    throw new Error('The update command currently supports only copy mode components.');
  }

  for (const name of positionals) {
    const component = await loadComponent(context, name);
    const recipeDir = resolveRecipeDir(component, 'copy');
    await context.copyDir(recipeDir, projectRoot, { skipIfExists: false });
    context.logger.log(pc.green(`Updated ${component.manifest.tag ?? name} component.`));
  }
}

async function promptForAction(diffOutput) {
  if (!output.isTTY) {
    return 'overwrite';
  }

  const rl = readline.createInterface({ input, output });
  try {
    if (diffOutput) {
      output.write(`${diffOutput}\n`);
    }

    const answer = await rl.question(
      'src/turbomini.js has local changes. [o]verwrite, [k]eep local, [b]ackup & overwrite? '
    );
    const normalized = answer.trim().toLowerCase();
    if (normalized === 'k' || normalized === 'keep') return 'keep';
    if (normalized === 'b' || normalized === 'backup') return 'backup';
    return 'overwrite';
  } finally {
    rl.close();
  }
}

async function backupRuntime(runtimePath) {
  const dir = path.dirname(runtimePath);
  const baseName = 'turbomini.local';
  let counter = 0;
  while (true) {
    const suffix = counter === 0 ? '' : `.${counter}`;
    const candidate = path.join(dir, `${baseName}${suffix}.js`);
    // eslint-disable-next-line no-await-in-loop
    if (!(await fs.stat(candidate).catch(() => false))) {
      return candidate;
    }
    counter += 1;
  }
}

export async function updateCommand(context, args) {
  const { values, positionals } = parseCommandArgs(args, {
    mode: { type: 'string' },
    dir: { type: 'string' },
    force: { type: 'boolean' },
  });

  const projectRoot = path.resolve(context.cwd, values.dir ?? '.');

  if (positionals.length > 0) {
    const mode = values.mode ?? 'copy';
    await handleComponentUpdate(context, projectRoot, positionals, mode);
    return;
  }

  const runtimePath = path.join(projectRoot, 'src', 'turbomini.js');
  const runtimeExists = await context.fileExists(runtimePath);
  const stamp = await readStamp(projectRoot);

  if (!runtimeExists) {
    if (stamp?.mode === 'cdn') {
      context.logger.log(
        pc.yellow(
          'This project uses the CDN runtime. Update the URL in index.html to upgrade TurboMini.'
        )
      );
      return;
    }
    if (stamp?.mode === 'managed') {
      context.logger.log(pc.yellow('This project uses the managed runtime. Run npm update turbomini.'));
      return;
    }
    throw new Error('No src/turbomini.js found. Run turbomini init first or provide a project directory.');
  }

  const runtime = await readBundledRuntime(context);
  const existingCode = await fs.readFile(runtimePath, 'utf8');

  if (existingCode === runtime.code) {
    if (stamp?.runtimeVersion === runtime.version) {
      context.logger.log(pc.green('TurboMini runtime is already up to date.'));
      return;
    }

    await writeRuntimeFiles(context, projectRoot, runtime);
    context.logger.log(pc.green('TurboMini runtime code matches. Stamp refreshed.'));
    return;
  }

  const diffOutput = context.renderDiff(existingCode, runtime.code);
  const action = values.force ? 'overwrite' : await promptForAction(diffOutput);

  if (action === 'keep') {
    context.logger.log(pc.yellow('Keeping local runtime changes.'));
    return;
  }

  if (action === 'backup') {
    const backupPath = await backupRuntime(runtimePath);
    await fs.writeFile(backupPath, existingCode, 'utf8');
    context.logger.log(pc.dim(`Saved local copy to ${context.formatPath(backupPath)}.`));
  }

  await writeRuntimeFiles(context, projectRoot, runtime);
  context.logger.log(pc.green(`TurboMini runtime updated to ${runtime.version}.`));
}
