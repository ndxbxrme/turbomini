// tests/e2e/navigation.spec.mjs
import { test, expect } from '../fixtures/server.fixt.mjs';

test('history navigation updates URL and supports back/forward', async ({ page, serverURL }) => {
  await page.goto(`${serverURL}/tests/e2e/history.html`);
  await page.click('#go');
  await expect(page).toHaveURL(`${serverURL}/tests/e2e/history.html/second`);
  await expect(page.locator('#second')).toHaveText('Second');
  await page.goBack();
  await expect(page.locator('#home')).toHaveText('Home');
  await page.goForward();
  await expect(page.locator('#second')).toHaveText('Second');
});

test('hash navigation updates hash and supports back/forward', async ({ page, serverURL }) => {
  await page.goto(`${serverURL}/tests/e2e/hash.html`);
  await page.click('#hash-link');
  await expect(page).toHaveURL(`${serverURL}/tests/e2e/hash.html#/second`);
  await expect(page.locator('#hash-second')).toHaveText('Second');
  await page.goBack();
  await expect(page.locator('#home')).toHaveText('Home');
  await page.goForward();
  await expect(page.locator('#hash-second')).toHaveText('Second');
});

test('hash navigation trims trailing slashes', async ({ page, serverURL }) => {
  await page.goto(`${serverURL}/tests/e2e/hash.html`);

  await page.evaluate(() => window.app.goto('/second/'));
  await expect(page.locator('#hash-second')).toHaveText('Second');

  await page.evaluate(() => window.app.goto('/'));
  await expect(page.locator('#home')).toHaveText('Home');
});
