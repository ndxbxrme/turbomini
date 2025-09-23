// tests/e2e/lifecycle.spec.mjs
import { test, expect } from '../fixtures/server.fixt.mjs';

test('postLoad runs after render and unload runs before route change', async ({ page, serverURL }) => {
  await page.goto(`${serverURL}/tests/e2e/lifecycle.html`);
  await expect(page.locator('#focusme')).toBeFocused();
  await page.click('#to-second');
  await expect(page.locator('#status')).toHaveText('true');
});
