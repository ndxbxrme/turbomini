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

  const nestedResponse = await fetch(`${baseUrl}/nested/`);
  assert.equal(nestedResponse.status, 200);
  assert.equal(await nestedResponse.text(), '<!doctype html><p>Nested</p>');

  const fallbackResponse = await fetch(`${baseUrl}/missing/page`);
  assert.equal(fallbackResponse.status, 200);
  assert.equal(
    await fallbackResponse.text(),
    '<!doctype html><html><body><h1>Hello SPA</h1></body></html>'
  );

  const forbiddenResponse = await fetch(`${baseUrl}/..%2Findex.html`);
  assert.equal(forbiddenResponse.status, 403);
});
