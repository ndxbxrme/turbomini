import test from 'node:test';
import assert from 'node:assert/strict';
import { createStore } from '../main.js';

test('store initializes with count and step', () => {
  const store = createStore();
  assert.equal(store.count, 0);
  assert.equal(store.step, 1);
});
