import test from 'node:test';
import assert from 'node:assert/strict';
import { applyFormState, validateEmail } from '../main.js';

test('validateEmail rejects empty and malformed values', () => {
  assert.equal(validateEmail(''), 'Email is required.');
  assert.equal(validateEmail('not-an-email'), 'Enter a valid email.');
  assert.equal(validateEmail('dev@example.com'), '');
});

test('applyFormState updates controller fields', () => {
  const controller = { email: '', error: '', submitted: false };
  applyFormState(controller, 'bad');
  assert.equal(controller.error, 'Enter a valid email.');
  assert.equal(controller.submitted, false);

  applyFormState(controller, 'ok@example.com');
  assert.equal(controller.error, '');
  assert.equal(controller.submitted, true);
});
