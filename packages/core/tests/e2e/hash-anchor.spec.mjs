import { test, expect } from '../fixtures/server.fixt.mjs';

test('history mode anchor links scroll without re-render', async ({ page, serverURL }) => {
  await page.goto(`${serverURL}/tests/e2e/hash-anchor.html`);
  await expect(page.locator('#home')).toHaveText('Home');

  await page.click('#jump');
  await expect.poll(() => page.evaluate(() => window.location.hash)).toBe('#section-2');

  const initialScroll = await page.evaluate(() => window.scrollY);
  expect(initialScroll).toBeGreaterThan(600);

  await page.waitForTimeout(200);
  const laterScroll = await page.evaluate(() => window.scrollY);
  expect(laterScroll).toBeGreaterThan(600);

  await expect(page.locator('#section-2 h2')).toHaveText('Section 2');
});
