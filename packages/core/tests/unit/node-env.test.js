// tests/unit/node-env.test.js
import test from 'node:test';
import assert from 'node:assert/strict';

test('importing framework without window/document does not crash', { concurrency: false }, async () => {
  const prevWindow = globalThis.window;
  const prevDocument = globalThis.document;
  try {
    delete globalThis.window;
    delete globalThis.document;
    const mod = await import('../../src/turbomini.js');
    assert.equal(typeof mod.TurboMini, 'function');
  } finally {
    if (prevWindow !== undefined) globalThis.window = prevWindow; else delete globalThis.window;
    if (prevDocument !== undefined) globalThis.document = prevDocument; else delete globalThis.document;
  }
});

test('refresh() in Node is a no-op', { concurrency: false }, async () => {
  const { TurboMini } = await import('../../src/turbomini.js');
  const app = TurboMini('/');

  const prevWindow = globalThis.window;
  const prevDocument = globalThis.document;
  let winAccess = 0;
  let docAccess = 0;
  try {
    globalThis.window = new Proxy({}, { get: () => { winAccess++; return () => {}; } });
    globalThis.document = new Proxy({}, { get: () => { docAccess++; return () => {}; } });
    const ret = app.refresh();
    assert.equal(ret, undefined);
    await Promise.resolve();
    assert.equal(winAccess, 0);
    assert.equal(docAccess, 0);
  } finally {
    if (prevWindow !== undefined) globalThis.window = prevWindow; else delete globalThis.window;
    if (prevDocument !== undefined) globalThis.document = prevDocument; else delete globalThis.document;
  }
});
