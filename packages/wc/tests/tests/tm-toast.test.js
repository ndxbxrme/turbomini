import { before, after, afterEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { createDom, destroyDom, flushMicrotasks } from './dom-helpers.js';

let dom;
let toastModule;

before(async () => {
  dom = createDom();
  toastModule = await import('../../tm-toast/src/tm-toast.js');
});

afterEach(() => {
  document.body.innerHTML = '';
});

after(() => {
  destroyDom(dom);
  dom = undefined;
});

test('tm-toast queues items and dismisses by id', async () => {
  const host = new toastModule.TmToast();
  document.body.append(host);
  host.connectedCallback?.();
  await flushMicrotasks();

  const closed = [];
  host.addEventListener('tm-close', (event) => closed.push(event.detail));

  const first = host.show({ title: 'First', duration: 0 });
  const second = host.toast({ title: 'Second', variant: 'warning', duration: 0 });
  await flushMicrotasks();

  const items = host.shadowRoot.querySelectorAll('.toast');
  assert.equal(items.length, 2);
  assert.equal(items[0].dataset.id, first);
  assert.equal(items[1].dataset.id, second);

  host.dismiss(first);
  await flushMicrotasks();

  const remaining = host.shadowRoot.querySelectorAll('.toast');
  assert.equal(remaining.length, 1);
  assert.equal(remaining[0].dataset.id, second);
  assert.deepEqual(closed[0], { id: first, reason: 'dismiss' });
});

test('tm-toast handles timeouts and Escape key', async () => {
  const host = new toastModule.TmToast();
  document.body.append(host);
  host.connectedCallback?.();
  await flushMicrotasks();

  const closed = [];
  host.addEventListener('tm-close', (event) => closed.push(event.detail));

  const timed = host.show({ title: 'Timed', duration: 25 });
  await flushMicrotasks();
  await new Promise((resolve) => setTimeout(resolve, 30));
  await flushMicrotasks();

  assert.equal(host.shadowRoot.querySelectorAll('.toast').length, 0);
  assert.equal(closed.at(-1)?.id, timed);
  assert.equal(closed.at(-1)?.reason, 'timeout');

  const escId = host.show({ title: 'Escape', duration: 0 });
  await flushMicrotasks();
  const escEvent = new dom.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
  document.dispatchEvent(escEvent);
  await flushMicrotasks();

  assert.equal(host.shadowRoot.querySelectorAll('.toast').length, 0);
  assert.equal(closed.at(-1)?.id, escId);
  assert.equal(closed.at(-1)?.reason, 'escape');
});
