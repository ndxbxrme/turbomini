import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applySearchFilter,
  createController,
  loadDashboardData,
  setDashboardData,
} from '../main.js';

test('loadDashboardData returns user and activity', async () => {
  const data = await loadDashboardData();
  assert.ok(data.user);
  assert.ok(Array.isArray(data.activity));
});

test('applySearchFilter matches title and summary', () => {
  const activity = [
    { title: 'Ship', summary: 'Delivered docs' },
    { title: 'Plan', summary: 'Roadmap update' },
  ];
  const filtered = applySearchFilter(activity, 'docs');
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].title, 'Ship');
});

test('setDashboardData populates controller flags', () => {
  const controller = createController();
  const data = {
    user: { name: 'Test', role: 'Dev', team: 'Core' },
    stats: [],
    activity: [{ title: 'One', summary: 'Two', time: 'now' }],
    announcements: [],
  };
  setDashboardData(controller, data);
  assert.equal(controller.loaded, true);
  assert.equal(controller.hasResults, true);
  assert.equal(controller.showEmpty, false);
});
