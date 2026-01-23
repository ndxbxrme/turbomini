import { test, expect } from '../fixtures/server.fixt.mjs';

test('hello routing navigates between home and about', async ({ page, serverURL }) => {
  await page.goto(`${serverURL}/tests/e2e/hello-routing.html`);

  await expect(page.locator('#home')).toHaveText('Hello TurboMini');

  await page.click('#to-about');
  await expect(page.locator('#about')).toHaveText('About');
  await expect(page.locator('#about-copy')).toHaveText('Routing works by matching template names.');

  await page.click('#back-home');
  await expect(page.locator('#home')).toHaveText('Hello TurboMini');
});
