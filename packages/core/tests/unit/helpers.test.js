import test from 'node:test';
import assert from 'node:assert/strict';
import { TurboMini } from '../../src/turbomini.js';

test('helpers: register, unregister and list', () => {
  const app = TurboMini('/');
  app.registerHelper('upper', (v) => String(v).toUpperCase());
  assert.ok(app.listHelpers().includes('upper'));
  app.template('t', '{{upper name}}');
  assert.equal(app.$t('t', { name: 'bob' }), 'BOB');
  app.unregisterHelper('upper');
  assert.ok(!app.listHelpers().includes('upper'));
  assert.throws(() => app.$t('t', { name: 'bob' }), /Unknown helper: upper/);
});

test('helpers: unknown helper throws', () => {
  const app = TurboMini('/');
  app.template('bad', '{{missing x}}');
  assert.throws(() => app.$t('bad', { x: 1 }), /Unknown helper: missing/);
});

test('helpers: per-render override shadows global', () => {
  const app = TurboMini('/');
  app.registerHelper('upper', (v) => String(v).toUpperCase());
  app.template('tpl', '{{upper name}}');
  assert.equal(app.$t('tpl', { name: 'Bob' }), 'BOB');
  const out = app.$t('tpl', { name: 'Bob' }, { helpers: { upper: (v) => v.toLowerCase() } });
  assert.equal(out, 'bob');
  assert.equal(app.$t('tpl', { name: 'Bob' }), 'BOB');
});

