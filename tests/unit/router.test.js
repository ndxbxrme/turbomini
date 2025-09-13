// tests/unit/router.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { TurboMini } from '../../src/turbomini.js';

// helper to wait for async navigation to complete
const tick = () => new Promise((r) => setTimeout(r, 0));

test('normalizeRoute mapping / → default', async () => {
  globalThis.location = { pathname: '/', hash: '' };
  globalThis.history = { pushState() {} };
  const app = TurboMini('/');
  await app.start();
  assert.equal(app.context.page, 'default');
});

test('history mode path parsing with basePath trimming', async () => {
  globalThis.location = { pathname: '/app/user/42', hash: '' };
  globalThis.history = { pushState() {} };
  const app = TurboMini('/app');
  await app.start();
  assert.equal(app.context.page, 'user');
  assert.deepEqual(app.context.params, ['42']);
});

test('hash mode path parsing', async () => {
  globalThis.location = { hash: '#/product/99', pathname: '' };
  const app = TurboMini('#');
  await app.start();
  assert.equal(app.context.page, 'product');
  assert.deepEqual(app.context.params, ['99']);
});

test('goto() pushes state and invokes start', async () => {
  const pushes = [];
  globalThis.location = { pathname: '/', hash: '' };
  globalThis.history = {
    pushState: (s, t, p) => {
      pushes.push(p);
      globalThis.location.pathname = p;
    },
  };
  const app = TurboMini('/');
  let controllerCalls = 0;
  app.controller('foo', () => {
    controllerCalls++;
  });
  app.goto('/foo');
  await tick();
  assert.deepEqual(pushes, ['/foo']);
  assert.equal(app.context.page, 'foo');
  assert.equal(controllerCalls, 1);
});

test('goto() prefixes basePath for history mode', async () => {
  const pushes = [];
  globalThis.location = { pathname: '/app', hash: '' };
  globalThis.history = {
    pushState: (s, t, p) => {
      pushes.push(p);
      globalThis.location.pathname = p;
    },
  };
  const app = TurboMini('/app');
  app.controller('foo', () => {});
  app.goto('/foo');
  await tick();
  assert.deepEqual(pushes, ['/app/foo']);
  assert.equal(app.context.page, 'foo');
});

test('middleware executes in order', async () => {
  globalThis.location = { pathname: '/foo', hash: '' };
  globalThis.history = { pushState() {} };
  const app = TurboMini('/');
  const calls = [];
  app.addMiddleware(() => {
    calls.push('mw1');
  });
  app.addMiddleware(() => {
    calls.push('mw2');
  });
  app.controller('foo', () => {
    calls.push('controller');
  });
  await app.start();
  assert.deepEqual(calls, ['mw1', 'mw2', 'controller']);
});

test('middleware returning false cancels controller/render', async () => {
  globalThis.location = { pathname: '/bar', hash: '' };
  globalThis.history = { pushState() {} };
  const app = TurboMini('/');
  const calls = [];
  app.addMiddleware(() => {
    calls.push('mw1');
    return false;
  });
  app.addMiddleware(() => {
    calls.push('mw2');
  });
  app.controller('bar', () => {
    calls.push('controller');
  });
  await app.start();
  assert.deepEqual(calls, ['mw1']);
  assert.equal(app.context.data, null);
});

test('controller return values for sync and async results', async () => {
  globalThis.location = { pathname: '/sync', hash: '' };
  globalThis.history = {
    pushState: (s, t, p) => {
      globalThis.location.pathname = p;
    },
  };
  const app = TurboMini('/');
  app.controller('sync', () => ({ a: 1 }));
  app.controller('async', async () => ({ b: 2 }));
  await app.start();
  assert.deepEqual(app.context.data, { a: 1 });
  app.goto('/async');
  await tick();
  assert.deepEqual(app.context.data, { b: 2 });
});

