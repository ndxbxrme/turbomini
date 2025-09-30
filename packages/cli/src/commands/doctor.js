import fs from 'node:fs/promises';
import path from 'node:path';
import pc from 'picocolors';
import { parseCommandArgs } from '../utils/args.js';
import { readBundledRuntime, readStamp } from '../utils/runtime.js';

async function readJson(filePath) {
  try {
    return JSON.parse(await fs.readFile(filePath, 'utf8'));
  } catch {
    return null;
  }
}

async function detectCdnVersion(indexHtmlPath) {
  try {
    const html = await fs.readFile(indexHtmlPath, 'utf8');
    const match = html.match(/turbomini@([^/'"\s]+)/i);
    return match ? match[1] : null;
  } catch {
    return null;
  }
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

  const runtime = await readBundledRuntime(context);
  const stamp = await readStamp(projectRoot);
  const runtimePath = path.join(projectRoot, 'src', 'turbomini.js');
  const runtimeExists = await context.fileExists(runtimePath);
  const packageJson = await readJson(packageJsonPath);

  const notes = [];
  let hasIssues = false;

  if (!runtimeExists) {
    if (stamp?.mode === 'cdn') {
      const cdnVersion = await detectCdnVersion(path.join(projectRoot, 'index.html'));
      if (cdnVersion && cdnVersion !== runtime.version) {
        notes.push(pc.yellow(`• CDN runtime pinned to ${cdnVersion}. Latest CLI version is ${runtime.version}.`));
        hasIssues = true;
      } else {
        notes.push(pc.green('• CDN runtime detected. Remember to bump the URL in index.html when upgrading.'));
      }
    } else if (stamp?.mode === 'managed') {
      const declared =
        packageJson?.dependencies?.turbomini ?? packageJson?.devDependencies?.turbomini ?? null;
      if (!declared) {
        notes.push(pc.yellow('• Managed runtime detected but turbomini is missing from package.json dependencies.'));
        hasIssues = true;
      } else if (!declared.includes(runtime.version)) {
        notes.push(
          pc.yellow(
            `• Managed runtime uses ${declared}. Latest CLI runtime is ${runtime.version}. Run npm update turbomini.`
          )
        );
        hasIssues = true;
      } else {
        notes.push(pc.green('• Managed runtime dependency is up to date.'));
      }
    } else {
      notes.push(pc.yellow('• No src/turbomini.js found. Run turbomini update to install the bundled runtime.'));
      hasIssues = true;
    }
  } else {
    const localCode = await fs.readFile(runtimePath, 'utf8');
    const isModified = localCode !== runtime.code;
    const runtimeVersion = stamp?.runtimeVersion ?? null;

    if (!runtimeVersion) {
      notes.push(pc.yellow('• Missing .turbomini.json stamp. Run turbomini update to regenerate it.'));
      hasIssues = true;
    } else if (runtimeVersion !== runtime.version) {
      notes.push(
        pc.yellow(
          `• Runtime version ${runtimeVersion} detected. CLI bundles ${runtime.version}. Run turbomini update.`
        )
      );
      hasIssues = true;
    }

    if (isModified) {
      notes.push(pc.yellow(`• ${context.formatPath(runtimePath)} differs from the bundled runtime.`));
      hasIssues = true;
    }

    if (!hasIssues) {
      notes.push(pc.green('• Local TurboMini runtime matches the CLI bundle.'));
    }
  }

  for (const note of notes) {
    context.logger.log(note);
  }

  if (!hasIssues) {
    context.logger.log(pc.green('✓ TurboMini doctor found no issues.'));
    return;
  }

  context.logger.log(pc.yellow('⚠️  TurboMini doctor detected issues. See notes above.'));
  process.exitCode = 1;
}
