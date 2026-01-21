import test from 'node:test';
import assert from 'node:assert/strict';
import { validateEmail } from '../main.js';

test('validateEmail rejects empty and malformed values', () => {
  assert.equal(validateEmail(''), 'Email is required.');
  assert.equal(validateEmail('not-an-email'), 'Enter a valid email.');
  assert.equal(validateEmail('dev@example.com'), '');
});
