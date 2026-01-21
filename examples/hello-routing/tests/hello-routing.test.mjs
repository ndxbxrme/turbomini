import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../main.js';

const tick = () => new Promise((r) => setTimeout(r, 0));

test('routes resolve to templates and controllers', async () => {
  globalThis.location = { pathname: '/hello-routing/home', hash: '' };
  globalThis.history = {
    pushState: (s, t, p) => {
      globalThis.location.pathname = p;
    },
  };

  const app = createApp();
  await app.start();

  assert.equal(app.context.page, 'home');
  assert.equal(app.context.data.title, 'Hello TurboMini');

  app.goto('/about');
  await tick();
  assert.equal(app.context.page, 'about');
  assert.equal(app.context.data.message, 'Routing works by matching template names against the URL path.');
});
