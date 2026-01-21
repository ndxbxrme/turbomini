import test from 'node:test';
import assert from 'node:assert/strict';
import { userController } from '../controllers/user.js';
import { teamController } from '../controllers/team.js';

test('user controller composes data', async () => {
  const data = await userController(['42']);
  assert.equal(data.name, 'Ada Lovelace');
  assert.equal(data.summary, 'Ada Lovelace (#42)');
});

test('team controller composes data', async () => {
  const data = await teamController([]);
  assert.equal(data.name, 'Design Systems');
  assert.equal(data.summary, 'Design Systems (#team)');
});
