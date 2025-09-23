import { before, after, afterEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { createDom, destroyDom, flushMicrotasks } from './dom-helpers.js';

let dom;
let dialogModule;

before(async () => {
  dom = createDom();
  dialogModule = await import('../../tm-dialog/src/tm-dialog.js');
});

afterEach(() => {
  document.body.innerHTML = '';
});

after(() => {
  destroyDom(dom);
  dom = undefined;
});

test('tm-dialog opens, focuses initial element, and closes on overlay click', async () => {
  const dialog = new dialogModule.TmDialog();
  dialog.initialFocus = '[data-primary]';
  dialog.innerHTML = `
    <span slot="title">Example</span>
    <button data-primary type="button">Confirm</button>
  `;
  const confirmButton = dialog.querySelector('[data-primary]');
  document.body.append(dialog);
  dialog.connectedCallback?.();
  await flushMicrotasks();

  let openDetail;
  dialog.addEventListener('tm-open', (event) => {
    openDetail = event.detail;
  });

  dialog.show();
  await flushMicrotasks();

  assert.equal(dialog.open, true);
  assert.deepEqual(openDetail, { modal: true });
  assert.equal(document.activeElement, confirmButton);

  let closeDetail;
  dialog.addEventListener('tm-close', (event) => {
    closeDetail = event.detail;
  });

  const overlay = dialog.shadowRoot.querySelector('.overlay');
  overlay.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
  await flushMicrotasks();

  assert.equal(dialog.open, false);
  assert.equal(closeDetail?.reason, 'overlay');
});

test('tm-dialog closes on Escape and restores prior focus', async () => {
  const before = document.createElement('button');
  before.type = 'button';
  before.textContent = 'focus me';
  document.body.append(before);
  before.focus();

  const dialog = new dialogModule.TmDialog();
  dialog.initialFocus = 'button';
  dialog.innerHTML = `
    <button type="button">Action</button>
  `;
  document.body.append(dialog);
  dialog.connectedCallback?.();
  await flushMicrotasks();

  const reasons = [];
  dialog.addEventListener('tm-close', (event) => {
    reasons.push(event.detail.reason);
  });

  dialog.show();
  await flushMicrotasks();

  assert.equal(dialog.open, true);
  assert.equal(document.activeElement?.tagName, 'BUTTON');

  const esc = new dom.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
  document.dispatchEvent(esc);
  await flushMicrotasks();

  assert.equal(dialog.open, false);
  assert.equal(reasons.at(-1), 'escape');
  assert.equal(document.activeElement, before);
});
