import test from 'node:test';
import assert from 'node:assert/strict';
import { TurboMini } from '../../src/turbomini.js';

test('app has no state property', () => {
  const app = TurboMini('/');
  assert.equal('state' in app, false);
});

test('inspect lists registered routes, templates, helpers and default mode', () => {
  const app = TurboMini('/');
  app.controller('home', () => {});
  app.template('tpl', '<p></p>');
  app.registerHelper('noop', (v) => v);
  const info = app.inspect();
  assert.ok(info.routes.includes('home'));
  assert.ok('tpl' in info.templates);
  assert.ok(info.helpers.includes('noop'));
  assert.equal(info.mode, 'history');
});

test('inspect reports hash router mode', () => {
  const app = TurboMini('#');
  app.controller('hash', () => {});
  app.template('t', '<p></p>');
  app.registerHelper('h', (v) => v);
  const info = app.inspect();
  assert.ok(info.routes.includes('hash'));
  assert.ok('t' in info.templates);
  assert.ok(info.helpers.includes('h'));
  assert.equal(info.mode, 'hash');
});
