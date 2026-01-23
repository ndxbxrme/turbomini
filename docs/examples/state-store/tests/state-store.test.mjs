import test from 'node:test';
import assert from 'node:assert/strict';
import { applyCounterAction, createStore } from '../main.js';

test('store initializes with count and step', () => {
  const store = createStore();
  assert.equal(store.count, 0);
  assert.equal(store.step, 1);
});

test('applyCounterAction mutates controller state', () => {
  const controller = createStore();
  applyCounterAction(controller, 'inc');
  assert.equal(controller.count, 1);
  applyCounterAction(controller, 'dec');
  assert.equal(controller.count, 0);
  applyCounterAction(controller, 'reset');
  assert.equal(controller.count, 0);
});
