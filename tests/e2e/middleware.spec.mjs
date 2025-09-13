// tests/e2e/middleware.spec.mjs
import { test, expect } from '../fixtures/server.fixt.mjs';

// Test that middleware can block routes

test('middleware blocks admin route', async ({ page, serverURL }) => {
  await page.goto(`${serverURL}/tests/e2e/middleware.html`);
  await page.click('#admin-link');
  await expect(page).toHaveURL(`${serverURL}/tests/e2e/middleware.html`);
  await expect(page.locator('#home')).toHaveText('Home');
});

// Test that async middleware delays navigation

test('async middleware delays navigation', async ({ page, serverURL }) => {
  await page.goto(`${serverURL}/tests/e2e/middleware.html`);
  await page.evaluate(() => (window.startTime = performance.now()));
  await page.click('#delay-link');
  await expect(page.locator('#delayed')).toHaveText('Delayed');
  const elapsed = await page.evaluate(() => performance.now() - window.startTime);
  expect(elapsed).toBeGreaterThanOrEqual(250);
});
