// tests/unit/core.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { TurboMini } from '../../src/turbomini.js';

test('template: registers and renders', () => {
  const app = TurboMini('/');
  app.template('greet', '<h1>Hello {{name}}</h1>');
  const out = app.$t('greet', { name: 'Turbomini' });
  assert.equal(out, '<h1>Hello Turbomini</h1>');
});

test('template: missing template throws', () => {
  const app = TurboMini('/');
  assert.throws(() => app.$t('nope', {}), /Template "nope" not found/);
});

