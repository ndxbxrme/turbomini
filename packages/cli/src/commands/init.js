import path from 'node:path';
import pc from 'picocolors';
import { parseCommandArgs } from '../utils/args.js';
import { readBundledRuntime, writeRuntimeFiles } from '../utils/runtime.js';

function normalizeName(input) {
  return (
    input
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'turbomini-app'
  );
}

function createIndexHtml({ projectName, runtimeImport, hasLocalRuntime }) {
  const runtimeComment = hasLocalRuntime
    ? '\n      // Local runtime ships inside src/turbomini.js.'
    : '';

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${projectName}</title>
    <link rel="stylesheet" href="./src/app.css" />
  </head>
  <body>
    <div id="app"></div>
    <script type="module">
      import { TurboMini } from '${runtimeImport}';
      import { start } from './src/main.js';

      start(TurboMini);${runtimeComment}
    </script>
  </body>
</html>
`;
}

function createNotFoundHtml(projectName) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${projectName} • Not found</title>
    <link rel="stylesheet" href="./src/app.css" />
  </head>
  <body>
    <main class="not-found">
      <h1>Not found</h1>
      <p>The requested page could not be located.</p>
      <p><a href="/">Return home</a></p>
    </main>
  </body>
</html>
`;
}

function createMainModule() {
  return `/**
 * TurboMini starter.
 *
 * Export a start() function that receives the TurboMini factory.
 */
export function start(TurboMini) {
  const app = TurboMini('/');

  app.component('app-root', {
    template: \`
      <main class="app-shell">
        <h1>TurboMini</h1>
        <p>Edit <code>src/main.js</code> and restart turbomini serve.</p>
      </main>
    \`,
  });

  app.mount('#app');
}
`;
}

function createStylesheet() {
  return `:root {
  color-scheme: light dark;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

body {
  margin: 0;
  min-height: 100vh;
  background: #f9fafb;
  color: #0f172a;
  display: flex;
  align-items: center;
  justify-content: center;
}

.app-shell {
  width: min(480px, 90vw);
  margin: 4rem auto;
  padding: 2.5rem;
  border-radius: 1rem;
  background: white;
  box-shadow: 0 24px 48px rgba(15, 23, 42, 0.12);
  display: grid;
  gap: 1rem;
}

.app-shell h1 {
  font-size: clamp(2.5rem, 5vw, 3rem);
  margin: 0;
}

.app-shell p {
  margin: 0;
  line-height: 1.6;
}

.app-shell code {
  padding: 0.2em 0.4em;
  border-radius: 0.4em;
  background: rgba(15, 23, 42, 0.08);
}

.not-found {
  min-height: 100vh;
  display: grid;
  place-items: center;
  gap: 1.5rem;
  font-family: inherit;
}

.not-found h1 {
  font-size: clamp(2rem, 4vw, 3rem);
  margin: 0;
}

.not-found a {
  color: inherit;
}
`;
}

function createPackageJson({ projectName, runtimeMode, runtimeVersion, withVite }) {
  const packageJson = {
    name: projectName,
    private: true,
    type: 'module',
    scripts: withVite
      ? {
          dev: 'vite',
          build: 'vite build',
          preview: 'vite preview',
          serve: 'turbomini serve',
        }
      : {
          dev: 'turbomini serve',
          build: 'turbomini build',
        },
  };

  if (runtimeMode === 'managed') {
    packageJson.dependencies = {
      turbomini: `^${runtimeVersion}`,
    };
  }

  if (withVite) {
    packageJson.devDependencies = {
      vite: '^5.2.0',
    };
  }

  return `${JSON.stringify(packageJson, null, 2)}\n`;
}

export async function initCommand(context, args) {
  const { values, positionals } = parseCommandArgs(args, {
    name: { type: 'string' },
    managed: { type: 'boolean' },
    cdn: { type: 'boolean' },
    'with-vite': { type: 'boolean' },
    template: { type: 'string' },
  });

  if (values.template && values.template !== 'default') {
    context.logger.log(pc.yellow('The --template option is deprecated. Using the default starter.'));
  }

  if (values.managed && values.cdn) {
    throw new Error('Choose either --managed or --cdn, not both.');
  }

  const targetArg = positionals[0] ?? '.';
  const targetDir = path.resolve(context.cwd, targetArg);
  const projectName = values.name ?? normalizeName(path.basename(targetDir));
  const runtimeMode = values.managed ? 'managed' : values.cdn ? 'cdn' : 'local';
  const withVite = Boolean(values['with-vite']);

  const runtime = await readBundledRuntime(context);

  const runtimeImport =
    runtimeMode === 'local'
      ? './src/turbomini.js'
      : runtimeMode === 'managed'
      ? 'turbomini'
      : `https://cdn.jsdelivr.net/npm/turbomini@${runtime.version}/+esm`;

  context.logger.log(pc.bold(`Scaffolding TurboMini project in ${context.formatPath(targetDir)}`));
  await context.ensureDir(targetDir);
  await context.ensureDir(path.join(targetDir, 'src'));
  await context.ensureDir(path.join(targetDir, 'src', 'components'));

  const indexHtml = createIndexHtml({
    projectName,
    runtimeImport,
    hasLocalRuntime: runtimeMode === 'local',
  });
  const notFound = createNotFoundHtml(projectName);
  const mainModule = createMainModule();
  const styles = createStylesheet();
  const packageJson = createPackageJson({
    projectName,
    runtimeMode,
    runtimeVersion: runtime.version,
    withVite,
  });

  await context.writeFile(path.join(targetDir, 'index.html'), indexHtml);
  await context.writeFile(path.join(targetDir, '404.html'), notFound);
  await context.writeFile(path.join(targetDir, 'src', 'main.js'), mainModule);
  await context.writeFile(path.join(targetDir, 'src', 'app.css'), styles);
  await context.writeFile(path.join(targetDir, 'package.json'), packageJson);

  if (withVite) {
    const viteConfig = `import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 4173,
  },
});
`;
    await context.writeFile(path.join(targetDir, 'vite.config.js'), viteConfig);
  }

  if (runtimeMode === 'local') {
    await writeRuntimeFiles(context, targetDir, runtime);
  } else {
    const stampPath = path.join(targetDir, '.turbomini.json');
    await context.writeFile(
      stampPath,
      `${JSON.stringify({ runtimeVersion: runtime.version, mode: runtimeMode }, null, 2)}\n`
    );
  }

  context.logger.log(pc.green('Project ready!'));
  if (runtimeMode === 'cdn') {
    context.logger.log(
      pc.dim('Using the CDN runtime. Update the version in index.html to upgrade in the future.')
    );
  }
  if (runtimeMode === 'managed') {
    context.logger.log(pc.dim('Using the managed runtime. Run npm update turbomini to upgrade later.'));
  }
}
