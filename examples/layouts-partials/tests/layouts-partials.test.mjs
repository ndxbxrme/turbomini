import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../main.js';

test('partials render with explicit args', () => {
  const app = createApp();
  const html = app.$t('cards', {
    cards: [{ title: 'One', owner: 'Team' }],
  });
  assert.match(html, /One/);
  assert.match(html, /Team/);
});
