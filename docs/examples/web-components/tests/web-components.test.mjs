import test from 'node:test';
import assert from 'node:assert/strict';
import { createDom, destroyDom, flushMicrotasks } from '../../../packages/wc/tests/tests/dom-helpers.js';

const dom = createDom();

const { TmButton } = await import('../../shared/components/tm-button.js');
if (!customElements.get('tm-button')) {
  customElements.define('tm-button', TmButton);
}

test('tm-button emits tm-press events', async () => {
  const button = new TmButton();
  button.textContent = 'Click';
  document.body.append(button);
  await flushMicrotasks();

  let pressed = false;
  button.addEventListener('tm-press', () => {
    pressed = true;
  });

  const shadowButton = button.shadowRoot.querySelector('button');
  shadowButton.dispatchEvent(new dom.window.Event('click', { bubbles: true }));
  assert.equal(pressed, true);
});

test.after(() => {
  destroyDom(dom);
});
