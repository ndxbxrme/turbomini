// tests/e2e/basic.spec.mjs
import { test, expect } from '../fixtures/server.fixt.mjs';

test('hello renders', async ({ page, serverURL }) => {
  await page.goto(`${serverURL}/`);
  await expect(page.locator('h1')).toHaveText('Hello TurboMini');
});