import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';

import { createContext } from '../src/context.js';
import { serveCommand } from '../src/commands/serve.js';

function noopLogger() {
  return {
    log: () => {},
  };
}

async function createTempDir(prefix) {
  return mkdtemp(path.join(tmpdir(), prefix));
}

test('serveCommand hosts static files with SPA fallback', async (t) => {
  const tempDir = await createTempDir('turbomini-serve-');
  let server;

  t.after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    await rm(tempDir, { recursive: true, force: true });
  });

  await writeFile(
    path.join(tempDir, 'index.html'),
    '<!doctype html><html><body><h1>Hello SPA</h1></body></html>'
  );
  await writeFile(path.join(tempDir, 'style.css'), 'body { color: red; }');
  await writeFile(path.join(tempDir, 'script.js'), 'export const value = 42;');
  await writeFile(path.join(tempDir, 'data.json'), '{"hello":"world"}');
  await writeFile(
    path.join(tempDir, 'icon.svg'),
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"></svg>'
  );
  await writeFile(path.join(tempDir, 'font.woff2'), Buffer.from([0, 1, 2, 3]));
  await mkdir(path.join(tempDir, 'nested'), { recursive: true });
  await writeFile(
    path.join(tempDir, 'nested', 'index.html'),
    '<!doctype html><p>Nested</p>'
  );

  const context = createContext({ cwd: tempDir, logger: noopLogger() });
  server = await serveCommand(context, ['--port', '0']);

  const address = server.address();
  assert.ok(address && typeof address === 'object' && 'port' in address);
  const baseUrl = `http://127.0.0.1:${address.port}`;

  const indexResponse = await fetch(`${baseUrl}/`);
  assert.equal(indexResponse.status, 200);
  assert.equal(
    await indexResponse.text(),
    '<!doctype html><html><body><h1>Hello SPA</h1></body></html>'
  );

  const assetResponse = await fetch(`${baseUrl}/style.css`);
  assert.equal(assetResponse.status, 200);
  assert.equal(assetResponse.headers.get('content-type'), 'text/css; charset=utf-8');
  assert.equal((await assetResponse.text()).trim(), 'body { color: red; }');

  const scriptResponse = await fetch(`${baseUrl}/script.js`);
  assert.equal(scriptResponse.status, 200);
  assert.equal(
    scriptResponse.headers.get('content-type'),
    'text/javascript; charset=utf-8'
  );
  assert.equal((await scriptResponse.text()).trim(), 'export const value = 42;');

  const jsonResponse = await fetch(`${baseUrl}/data.json`);
  assert.equal(jsonResponse.status, 200);
  assert.equal(
    jsonResponse.headers.get('content-type'),
    'application/json; charset=utf-8'
  );
  assert.equal((await jsonResponse.text()).trim(), '{"hello":"world"}');

  const svgResponse = await fetch(`${baseUrl}/icon.svg`);
  assert.equal(svgResponse.status, 200);
  assert.equal(
    svgResponse.headers.get('content-type'),
    'image/svg+xml; charset=utf-8'
  );

  const fontResponse = await fetch(`${baseUrl}/font.woff2`);
  assert.equal(fontResponse.status, 200);
  assert.equal(fontResponse.headers.get('content-type'), 'font/woff2');

  const nestedResponse = await fetch(`${baseUrl}/nested/`);
  assert.equal(nestedResponse.status, 200);
  assert.equal(await nestedResponse.text(), '<!doctype html><p>Nested</p>');

  const redirectResponse = await fetch(`${baseUrl}/nested`, { redirect: 'manual' });
  assert.equal(redirectResponse.status, 308);
  assert.equal(redirectResponse.headers.get('location'), '/nested/');

  const fallbackResponse = await fetch(`${baseUrl}/missing/page`);
  assert.equal(fallbackResponse.status, 200);
  assert.equal(
    await fallbackResponse.text(),
    '<!doctype html><html><body><h1>Hello SPA</h1></body></html>'
  );

  const forbiddenResponse = await fetch(`${baseUrl}/..%2Findex.html`);
  assert.equal(forbiddenResponse.status, 403);
});
