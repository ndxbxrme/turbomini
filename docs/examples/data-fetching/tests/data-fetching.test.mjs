import test from 'node:test';
import assert from 'node:assert/strict';
import { loadItems } from '../main.js';

test('loadItems returns items from data.json', async () => {
  const items = await loadItems();
  assert.equal(items.length, 3);
  assert.equal(items[0].title, 'TurboMini Primer');
});
