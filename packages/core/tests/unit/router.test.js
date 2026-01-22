// tests/unit/router.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { TurboMini } from '../../src/turbomini.js';

// helper to wait for async navigation to complete
const tick = () => new Promise((r) => setTimeout(r, 0));

const createDomStub = () => {
  const handlers = {};
  const pageEl = {
    innerHTML: '',
    children: [],
    attributes: [],
    setAttribute() {},
    removeAttribute() {},
  };
  const doc = {
    querySelector: (sel) => (sel === 'page' ? pageEl : null),
    createElement: () => ({
      innerHTML: '',
      children: [],
      attributes: [],
      setAttribute() {},
      removeAttribute() {},
    }),
    body: {
      scrollIntoView() {},
    },
  };
  const win = {
    addEventListener: (type, handler) => {
      handlers[type] = handler;
    },
    removeEventListener: (type) => {
      delete handlers[type];
    },
    requestAnimationFrame: (fn) => setTimeout(fn, 0),
    cancelAnimationFrame: (id) => clearTimeout(id),
  };
  return {
    handlers,
    pageEl,
    install() {
      globalThis.window = win;
      globalThis.document = doc;
    },
    restore() {
      delete globalThis.window;
      delete globalThis.document;
    },
  };
};

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
  app.template('user', '<h1>User</h1>');
  await app.start();
  assert.equal(app.context.page, 'user');
  assert.deepEqual(app.context.params, ['42']);
});

test('hash mode path parsing', async () => {
  globalThis.location = { hash: '#/product/99', pathname: '' };
  const app = TurboMini('#');
  app.template('product', '<h1>Product</h1>');
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
  app.template('foo', '<h1>Foo</h1>');
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
  app.template('foo', '<h1>Foo</h1>');
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
  app.template('foo', '<h1>Foo</h1>');
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
  app.template('sync', '<h1>Sync</h1>');
  app.template('async', '<h1>Async</h1>');
  await app.start();
  assert.deepEqual(app.context.data, { a: 1 });
  app.goto('/async');
  await tick();
  assert.deepEqual(app.context.data, { b: 2 });
});

test('hashchange is ignored in history mode', async () => {
  const dom = createDomStub();
  dom.install();

  globalThis.location = { pathname: '/home', hash: '#section' };
  globalThis.history = { pushState() {} };

  const app = TurboMini('/');
  app.template('home', '<h1>Home</h1>');
  let calls = 0;
  app.controller('home', () => {
    calls += 1;
    return {};
  });

  await app.start();
  assert.equal(calls, 1);
  assert.ok(dom.handlers.hashchange);

  dom.handlers.hashchange();
  await tick();
  assert.equal(calls, 1);

  dom.restore();
});
