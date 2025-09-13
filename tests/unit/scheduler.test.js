import test from 'node:test';
import assert from 'node:assert/strict';
import { TurboMini } from '../../src/turbomini.js';
import { Worker } from 'node:worker_threads';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const runWorker = (code) =>
  new Promise((resolve, reject) => {
    const worker = new Worker(code, { eval: true, type: 'module' });
    worker.on('message', (msg) => resolve(msg));
    worker.on('error', reject);
    worker.on('exit', (c) => c && reject(new Error(`exit ${c}`)));
  });

test('microtask scheduler coalesces refreshes', async () => {
  const app = TurboMini('/');
  let calls = 0;
  app.refreshNow = () => {
    calls++;
  };
  app.invalidate();
  app.invalidate();
  await wait(0);
  assert.equal(calls, 1);
});

test('raf mode uses requestAnimationFrame', async () => {
  const result = await runWorker(`
    import { parentPort } from 'node:worker_threads';
    globalThis.window = {
      requestAnimationFrame: (cb) => {
        rafCalls++;
        saved = cb;
        return 1;
      },
      cancelAnimationFrame: () => {},
    };
    globalThis.document = { querySelector: () => ({}) };
    let rafCalls = 0;
    let saved;
    const { TurboMini } = await import('./src/turbomini.js');
    const app = TurboMini('/');
    let refreshCalls = 0;
    app.refreshNow = () => {
      refreshCalls++;
    };
    app.setRenderStrategy({ mode: 'raf' });
    app.invalidate();
    saved();
    parentPort.postMessage({ rafCalls, refreshCalls });
  `);
  assert.equal(result.rafCalls, 1);
  assert.equal(result.refreshCalls, 1);
});

test('debounce mode waits for idle period before rendering', async () => {
  const app = TurboMini('/');
  let calls = 0;
  app.refreshNow = () => {
    calls++;
  };
  app.setRenderStrategy({ mode: 'debounce', interval: 20 });
  app.invalidate();
  await wait(10);
  app.invalidate();
  await wait(30);
  assert.equal(calls, 1);
});

test('throttle mode respects interval and leading option', async () => {
  const appA = TurboMini('/');
  let callsA = 0;
  appA.refreshNow = () => {
    callsA++;
  };
  appA.setRenderStrategy({ mode: 'throttle', interval: 20 });
  appA.invalidate();
  appA.invalidate();
  await wait(30);
  assert.equal(callsA, 1);

  const appB = TurboMini('/');
  let callsB = 0;
  appB.refreshNow = () => {
    callsB++;
  };
  appB.setRenderStrategy({ mode: 'throttle', interval: 20, leading: true });
  appB.invalidate();
  assert.equal(callsB, 1); // leading edge
  appB.invalidate();
  await wait(30);
  assert.equal(callsB, 2); // trailing call after interval
});

test('idle mode falls back to microtask when requestIdleCallback missing', async () => {
  const result = await runWorker(`
    import { parentPort } from 'node:worker_threads';
    globalThis.window = { requestAnimationFrame: () => 1, cancelAnimationFrame: () => {} };
    globalThis.document = { querySelector: () => ({}) };
    const { TurboMini } = await import('./src/turbomini.js');
    const app = TurboMini('/');
    let calls = 0;
    app.refreshNow = () => {
      calls++;
    };
    app.setRenderStrategy({ mode: 'idle', interval: 5 });
    app.invalidate();
    await new Promise((r) => setTimeout(r, 0));
    parentPort.postMessage({ calls });
  `);
  assert.equal(result.calls, 1);
});
