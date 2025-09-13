import test from 'node:test';
import assert from 'node:assert/strict';
import { TurboMini } from '../../src/turbomini.js';

test('fetchTemplates: successful fetch stores compiled templates', async () => {
  const app = TurboMini('/');
  const originalFetch = global.fetch;
  global.fetch = async () => ({
    ok: true,
    text: async () => '<p>{{msg}}</p>',
  });
  try {
    await app.fetchTemplates(['tpl'], '/');
  } finally {
    global.fetch = originalFetch;
  }
  const out = app.$t('tpl', { msg: 'hi' });
  assert.equal(out, '<p>hi</p>');
});

test('fetchTemplates: non-OK responses throw with status text', async () => {
  const app = TurboMini('/');
  const originalFetch = global.fetch;
  global.fetch = async () => ({
    ok: false,
    status: 500,
    statusText: 'Oops',
  });
  try {
    await assert.rejects(
      app.fetchTemplates(['bad'], '/'),
      /Failed to fetch template "bad": 500 Oops/
    );
  } finally {
    global.fetch = originalFetch;
  }
});
