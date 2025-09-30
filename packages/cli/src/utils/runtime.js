import fs from 'node:fs/promises';
import path from 'node:path';
import pc from 'picocolors';

export async function readBundledRuntime(context) {
  const { runtimeAssets } = context;
  const [script, types, metaRaw] = await Promise.all([
    fs.readFile(runtimeAssets.script, 'utf8'),
    fs.readFile(runtimeAssets.types, 'utf8').catch(() => null),
    fs.readFile(runtimeAssets.meta, 'utf8'),
  ]);

  let meta;
  try {
    meta = JSON.parse(metaRaw);
  } catch (error) {
    throw new Error('Unable to parse TurboMini runtime metadata bundled with the CLI.');
  }

  return {
    code: script,
    types,
    version: meta.version,
  };
}

export async function writeRuntimeFiles(context, projectRoot, { code, types, version }) {
  const runtimePath = path.join(projectRoot, 'src', 'turbomini.js');
  const typesPath = path.join(projectRoot, 'src', 'turbomini.d.ts');
  const stampPath = path.join(projectRoot, '.turbomini.json');

  await context.writeFile(runtimePath, code);
  if (types) {
    await context.writeFile(typesPath, types, { skipIfExists: false });
  }
  await context.writeFile(
    stampPath,
    `${JSON.stringify({ runtimeVersion: version, mode: 'local' }, null, 2)}\n`
  );

  return { runtimePath, typesPath, stampPath };
}

export async function readStamp(projectRoot) {
  try {
    const stamp = await fs.readFile(path.join(projectRoot, '.turbomini.json'), 'utf8');
    return JSON.parse(stamp);
  } catch {
    return null;
  }
}

export function formatRuntimeReport({
  runtimeVersion,
  bundledVersion,
  isModified,
  runtimePath,
}) {
  const parts = [];

  if (!runtimeVersion) {
    parts.push(pc.yellow('• Missing .turbomini.json stamp.'));
  } else if (runtimeVersion !== bundledVersion) {
    parts.push(
      pc.yellow(
        `• Runtime version ${runtimeVersion} detected, CLI bundles ${bundledVersion}. Run "turbomini update".`
      )
    );
  }

  if (isModified) {
    parts.push(pc.yellow(`• ${runtimePath} differs from the bundled runtime.`));
  }

  return parts;
}
