import { before, after, afterEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { createDom, destroyDom, flushMicrotasks } from './dom-helpers.js';

let dom;
let inputModule;
let switchModule;
let checkboxModule;
let radioModule;
let groupModule;

before(async () => {
  dom = createDom();
  inputModule = await import('../../tm-input/src/tm-input.js');
  switchModule = await import('../../tm-switch/src/tm-switch.js');
  checkboxModule = await import('../../tm-checkbox/src/tm-checkbox.js');
  radioModule = await import('../../tm-radio/src/tm-radio.js');
  groupModule = await import('../../tm-radio-group/src/tm-radio-group.js');
});

afterEach(() => {
  document.body.innerHTML = '';
});

after(() => {
  destroyDom(dom);
  dom = undefined;
});

test('tm-input wires label associations and emits events', async () => {
  const input = new inputModule.TmInput();
  input.innerHTML = `
    <span slot="label">Full name</span>
    <span slot="hint">Required</span>
  `;
  document.body.append(input);
  input.connectedCallback?.();
  await flushMicrotasks();

  const native = input.shadowRoot.querySelector('input');
  const label = input.shadowRoot.querySelector('.label');
  const hint = input.shadowRoot.querySelector('.hint');

  assert.ok(label && !label.hidden, 'label is visible');
  assert.ok(hint && !hint.hidden, 'hint is visible');
  assert.equal(native.getAttribute('aria-labelledby'), label.id);
  const described = native.getAttribute('aria-describedby');
  assert.ok(described && described.includes(hint.id));

  const events = [];
  input.addEventListener('tm-input', (event) => events.push(event.detail.value));
  native.value = 'Ada Lovelace';
  native.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
  await flushMicrotasks();

  assert.equal(input.value, 'Ada Lovelace');
  assert.deepEqual(events, ['Ada Lovelace']);
});

test('tm-switch toggles and emits tm-change', async () => {
  const toggle = new switchModule.TmSwitch();
  document.body.append(toggle);
  toggle.connectedCallback?.();
  await flushMicrotasks();

  const native = toggle.shadowRoot.querySelector('input');
  let detail;
  toggle.addEventListener('tm-change', (event) => {
    detail = event.detail;
  });

  native.click();
  await flushMicrotasks();

  assert.equal(toggle.checked, true);
  assert.equal(detail?.checked, true);
});

test('tm-checkbox toggles value and fires tm-change', async () => {
  const checkbox = new checkboxModule.TmCheckbox();
  checkbox.value = 'accept';
  checkbox.textContent = 'Accept';
  document.body.append(checkbox);
  checkbox.connectedCallback?.();
  await flushMicrotasks();

  const native = checkbox.shadowRoot.querySelector('input');
  let detail;
  checkbox.addEventListener('tm-change', (event) => {
    detail = event.detail;
  });
  native.click();
  await flushMicrotasks();

  assert.equal(checkbox.checked, true);
  assert.equal(detail?.value, 'accept');
});

test('tm-radio-group manages roving selection', async () => {
  const group = new groupModule.TmRadioGroup();
  const radioOne = new radioModule.TmRadio();
  radioOne.value = 'one';
  radioOne.textContent = 'One';
  const radioTwo = new radioModule.TmRadio();
  radioTwo.value = 'two';
  radioTwo.textContent = 'Two';
  group.append(radioOne, radioTwo);
  document.body.append(group);
  group.connectedCallback?.();
  radioOne.connectedCallback?.();
  radioTwo.connectedCallback?.();
  await flushMicrotasks();

  const radios = [radioOne, radioTwo];

  radioTwo.shadowRoot.querySelector('input').click();
  await flushMicrotasks();

  assert.equal(group.value, 'two');
  assert.equal(radios[1].checked, true);
  assert.equal(radios[0].checked, false);
});
