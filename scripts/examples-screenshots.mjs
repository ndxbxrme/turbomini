import { mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
import { execSync } from 'node:child_process';

const rootDir = new URL('..', import.meta.url).pathname;
const examplesDir = path.join(rootDir, 'examples');
const docsDir = path.join(rootDir, 'docs');
const outputDir = path.join(rootDir, 'docs', 'assets', 'examples');
const portBase = 4400;
const checkMode = process.argv.includes('--check');

execSync('npm run docs:prepare', { stdio: 'inherit' });

async function waitForServer(child, timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      child.kill('SIGTERM');
      reject(new Error('Timed out waiting for server'));
    }, timeoutMs);

    const onData = (data) => {
      const text = data.toString();
      if (text.includes('Serving')) {
        clearTimeout(timeout);
        child.stdout.off('data', onData);
        resolve();
      }
    };

    child.stdout.on('data', onData);
    child.stderr.on('data', (data) => {
      const text = data.toString();
      if (text.includes('Error')) {
        clearTimeout(timeout);
        child.kill('SIGTERM');
        reject(new Error(text.trim()));
      }
    });
  });
}

async function stopServer(child) {
  if (!child || child.killed) return;
  child.kill('SIGTERM');
  await new Promise((resolve) => {
    child.on('exit', resolve);
  });
}

await mkdir(outputDir, { recursive: true });

const entries = (await readdir(examplesDir, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory() && entry.name !== 'shared')
  .map((entry) => entry.name)
  .sort();

const browser = await chromium.launch();

for (let i = 0; i < entries.length; i += 1) {
  const name = entries[i];
  const port = portBase + i;
  const exampleDir = docsDir;
  const outputFile = path.join(outputDir, `${name}.png`);

  const server = spawn(
    'node',
    ['../packages/cli/src/index.js', 'serve', '--port', String(port)],
    { cwd: exampleDir, stdio: ['ignore', 'pipe', 'pipe'] }
  );

  try {
    await waitForServer(server);
    const page = await browser.newPage({ viewport: { width: 960, height: 720 } });
    await page.goto(`http://localhost:${port}/examples/${name}/`, { waitUntil: 'networkidle' });
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation: none !important;
          transition: none !important;
        }
      `,
    });
    await page.waitForTimeout(300);
    await page.screenshot({ path: outputFile });
    await page.close();
  } finally {
    await stopServer(server);
  }
}

await browser.close();

if (checkMode) {
  const status = execSync('git status --porcelain docs/assets/examples').toString().trim();
  if (status) {
    console.error('Example screenshots are out of date. Run npm run examples:screenshots.');
    process.exit(1);
  }
}

console.log('Example screenshots captured.');
