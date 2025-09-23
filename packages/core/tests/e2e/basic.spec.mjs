// tests/e2e/basic.spec.mjs
import { test, expect } from '../fixtures/server.fixt.mjs';

test('hello renders', async ({ page, serverURL }) => {
  await page.goto(`${serverURL}/`);
  await expect(page.locator('h1')).toHaveText('Hello TurboMini');
});

test('default route under examples path', async ({ page, serverURL }) => {
  await page.goto(`${serverURL}/examples/00-hello-world/index.html`);
  await page.evaluate(() => {
    history.pushState({}, '', '/examples/00-hello-world/');
    window.app.start();
  });
  await expect(page.locator('h1')).toHaveText('Hello TurboMini');
});