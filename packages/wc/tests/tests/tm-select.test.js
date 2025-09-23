import { before, after, afterEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { createDom, destroyDom, flushMicrotasks } from './dom-helpers.js';

let dom;
let selectModule;

before(async () => {
  dom = createDom();
  selectModule = await import('../../tm-select/src/tm-select.js');
});

afterEach(() => {
  document.body.innerHTML = '';
});

after(() => {
  destroyDom(dom);
  dom = undefined;
});

test('tm-select renders options and updates selection', async () => {
  const select = new selectModule.TmSelect();
  select.placeholder = 'Pick an option';
  const optionA = document.createElement('tm-select-option');
  optionA.value = 'a';
  optionA.textContent = 'Alpha';
  const optionB = document.createElement('tm-select-option');
  optionB.value = 'b';
  optionB.textContent = 'Bravo';
  const optionC = document.createElement('tm-select-option');
  optionC.value = 'c';
  optionC.textContent = 'Charlie';
  optionC.disabled = true;
  select.append(optionA, optionB, optionC);
  document.body.append(select);
  select.connectedCallback?.();
  await flushMicrotasks();

  const trigger = select.shadowRoot.querySelector('.trigger');
  const label = trigger.querySelector('.trigger-label');
  assert.equal(label.textContent, 'Pick an option');

  select.value = 'b';
  await flushMicrotasks();
  assert.equal(label.textContent, 'Bravo');

  let changeDetail;
  select.addEventListener('tm-change', (event) => {
    changeDetail = event.detail;
  });

  select.open = true;
  await flushMicrotasks();
  const menu = select.shadowRoot.querySelector('.menu');
  assert.equal(menu.dataset.open, 'true');

  menu.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
  await flushMicrotasks();
  menu.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  await flushMicrotasks();

  assert.equal(select.open, false);
  assert.equal(select.value, 'a');
  assert.equal(changeDetail?.value, 'a');
});
