import { before, after, afterEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { createDom, destroyDom, flushMicrotasks } from './dom-helpers.js';

let dom;
let cardModule;

before(async () => {
  dom = createDom();
  cardModule = await import('../../tm-card/src/tm-card.js');
});

afterEach(() => {
  document.body.innerHTML = '';
});

after(() => {
  destroyDom(dom);
  dom = undefined;
});

test('tm-card interactive state emits tm-press and manages roles', async () => {
  const card = new cardModule.TmCard();
  card.interactive = true;
  card.innerHTML = `
    <span slot="header">Header</span>
    <p>Body</p>
  `;
  document.body.append(card);
  card.connectedCallback?.();
  await flushMicrotasks();

  const base = card.shadowRoot.querySelector('.card');
  assert.equal(base.getAttribute('role'), 'button');
  assert.equal(base.tabIndex, 0);

  let presses = 0;
  card.addEventListener('tm-press', () => {
    presses += 1;
  });

  base.click();
  await flushMicrotasks();
  base.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: ' ', bubbles: true }));
  await flushMicrotasks();

  assert.equal(presses, 2);

  card.interactive = false;
  await flushMicrotasks();
  assert.equal(base.tabIndex, -1);
  const previous = presses;
  base.click();
  await flushMicrotasks();
  assert.equal(presses, previous);
});
