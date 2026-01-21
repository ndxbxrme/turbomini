import test from 'node:test';
import assert from 'node:assert/strict';
import { createDom, destroyDom } from '../../../packages/wc/tests/tests/dom-helpers.js';

const dom = createDom();

globalThis.location = { pathname: '/theme-switching', hash: '' };
globalThis.history = { pushState() {} };
document.body.innerHTML = '<page></page>';

window.matchMedia = (query) => ({
  matches: query.includes('dark'),
  media: query,
  addEventListener() {},
  removeEventListener() {},
});

const { applyThemePreference, setTheme, toggleTheme } = await import('../main.js');

test('applyThemePreference uses system preference', () => {
  const theme = applyThemePreference();
  assert.equal(theme, 'dark');
  assert.equal(document.documentElement.dataset.theme, 'dark');
});

test('setTheme persists and updates data-theme', () => {
  const theme = setTheme('light');
  assert.equal(theme, 'light');
  assert.equal(window.localStorage.getItem('tm-theme'), 'light');
  assert.equal(document.documentElement.dataset.theme, 'light');
});

test('toggleTheme flips between light and dark', () => {
  assert.equal(toggleTheme('dark'), 'light');
  assert.equal(toggleTheme('light'), 'dark');
});

test.after(() => {
  destroyDom(dom);
});
