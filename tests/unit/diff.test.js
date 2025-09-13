import test from 'node:test';
import assert from 'node:assert/strict';
import '../utils/dom-env.js';
import { TurboMini } from '../../src/turbomini.js';

// Helper to render current template into <page> using refreshNow
const setupApp = (tmpl) => {
  const app = TurboMini('/');
  app.template('main', tmpl);
  app.context.page = 'main';
  document.querySelector('page').innerHTML = '';
  app.refreshNow();
  return app;
};

test('attribute sync preserves input value/checked', () => {
  let app = setupApp('<input id="a" value="start" checked>');
  const input = document.getElementById('a');
  input.value = 'user';
  input.checked = false;
  app.template('main', '<input id="a" class="new">');
  app.refreshNow();
  const updated = document.getElementById('a');
  assert.equal(updated.value, 'user');
  assert.equal(updated.checked, false);
});

test('child walk recurses on matching tag sequences', () => {
  let app = setupApp('<div><p id="a"></p><p id="b"></p></div>');
  const b = document.getElementById('b');
  b.custom = 42; // mark existing element
  app.template('main', '<div><p id="a" class="x"></p><p id="b"></p></div>');
  app.refreshNow();
  const bAfter = document.getElementById('b');
  assert.equal(bAfter.custom, 42); // same element preserved

  // mismatched tag sequence replaces innerHTML
  bAfter.custom = 99;
  app.template('main', '<div><span id="a"></span><p id="b"></p></div>');
  app.refreshNow();
  const bReplace = document.getElementById('b');
  assert.ok(bReplace.custom === undefined);
});

test('rendering avoids eval/with/new Function', () => {
  const app = TurboMini('/');
  const origEval = global.eval;
  const origFunction = global.Function;
  global.eval = () => { throw new Error('eval called'); };
  global.Function = function () { throw new Error('Function ctor called'); };
  try {
    app.template('tpl', '<p>{{msg}}</p>');
    app.$t('tpl', { msg: 'hi' });
    const fnSrc = app.templates['tpl'].toString();
    assert.ok(!/\bwith\b/.test(fnSrc));
    assert.ok(!/\beval\b/.test(fnSrc));
    assert.ok(!/Function\(/.test(fnSrc));
  } finally {
    global.eval = origEval;
    global.Function = origFunction;
  }
});
