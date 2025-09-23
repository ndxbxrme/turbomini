import { before, after, afterEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { createDom, destroyDom, flushMicrotasks } from './dom-helpers.js';

let dom;
let tabsModule;

before(async () => {
  dom = createDom();
  tabsModule = await import('../../tm-tabs/src/tm-tabs.js');
});

afterEach(() => {
  document.body.innerHTML = '';
});

after(() => {
  destroyDom(dom);
  dom = undefined;
});

test('tm-tabs manages selection and keyboard navigation', async () => {
  const tabs = new tabsModule.TmTabs();
  tabs.innerHTML = `
    <button slot="tab" value="overview">Overview</button>
    <button slot="tab" value="usage">Usage</button>
    <button slot="tab" value="api" disabled>API</button>
    <section slot="panel" value="overview">Overview content</section>
    <section slot="panel" value="usage">Usage content</section>
    <section slot="panel" value="api">API content</section>
  `;
  document.body.append(tabs);
  tabs.connectedCallback?.();
  await flushMicrotasks();

  const tablist = tabs.shadowRoot.querySelector('.list');
  assert.equal(tablist.getAttribute('aria-orientation'), 'horizontal');

  const tabButtons = tabs.querySelectorAll('button[slot="tab"]');
  assert.equal(tabButtons.length, 3);
  const panels = tabs.querySelectorAll('section[slot="panel"]');
  assert.equal(panels.length, 3);

  assert.equal(tabs.value, 'overview');
  assert.equal(tabButtons[0].dataset.selected, 'true');
  assert.equal(panels[0].dataset.active, 'true');

  const changes = [];
  tabs.addEventListener('tm-change', (event) => changes.push(event.detail.value));

  tabButtons[0].focus();
  tabButtons[0].dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
  await flushMicrotasks();

  assert.equal(tabs.value, 'usage');
  assert.equal(tabButtons[1].dataset.selected, 'true');
  assert.equal(panels[1].dataset.active, 'true');

  tabButtons[1].dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
  await flushMicrotasks();

  assert.equal(tabs.value, 'overview');
  assert.equal(tabButtons[0].dataset.selected, 'true');

  tabs.orientation = 'vertical';
  await flushMicrotasks();
  assert.equal(tablist.getAttribute('aria-orientation'), 'vertical');

  tabButtons[0].focus();
  tabButtons[0].dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
  await flushMicrotasks();

  assert.equal(tabs.value, 'usage');
  assert.deepEqual(changes, ['usage', 'overview', 'usage']);
});
