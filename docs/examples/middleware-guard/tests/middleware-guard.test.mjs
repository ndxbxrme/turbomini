import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../main.js';

const tick = () => new Promise((r) => setTimeout(r, 0));

test('middleware cancels admin route when logged out', async () => {
  globalThis.location = { pathname: '/middleware-guard/admin', hash: '' };
  globalThis.history = { pushState() {} };

  const { app, controller } = createApp();
  await app.start();

  assert.equal(app.context.page, 'admin');
  assert.equal(app.context.data, null);

  controller.loggedIn = true;
  app.goto('/admin');
  await tick();
  assert.equal(app.context.page, 'admin');
  assert.deepEqual(app.context.data, {});
});
