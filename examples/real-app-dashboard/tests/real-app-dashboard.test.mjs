import test from 'node:test';
import assert from 'node:assert/strict';
import { createDom, destroyDom } from '../../../packages/wc/tests/tests/dom-helpers.js';
import { createApp } from '../main.js';

const dom = createDom();
document.body.innerHTML = '<page></page>';

const tick = () => new Promise((r) => setTimeout(r, 0));

test('dashboard data reflects active filter', async () => {
  globalThis.location = { pathname: '/real-app-dashboard/', hash: '' };
  globalThis.history = { pushState() {} };

  const { app, store } = createApp();
  await app.start();

  assert.equal(app.context.data.stats[0].value, '4');
  assert.equal(app.context.data.visibleOrders.length, 4);

  store.filter = 'active';
  await app.start();
  await tick();
  assert.equal(app.context.data.visibleOrders.length, 2);
});

test.after(() => {
  destroyDom(dom);
});
