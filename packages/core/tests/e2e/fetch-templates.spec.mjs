// tests/e2e/fetch-templates.spec.mjs
import { test, expect } from '../fixtures/server.fixt.mjs';

test('fetchTemplates renders fetched content', async ({ page, serverURL }) => {
  await page.goto(`${serverURL}/tests/e2e/fetch.html`);
  await page.evaluate(async () => {
    await window.app.fetchTemplates(['x'], '/components/');
    await window.app.start();
  });
  await expect(page.locator('#x')).toHaveText('fetched');
});

test('fetchTemplates surfaces errors for missing files', async ({ page, serverURL }) => {
  await page.goto(`${serverURL}/tests/e2e/fetch.html`);
  const message = await page.evaluate(() =>
    window.app.fetchTemplates(['missing'], '/components/').then(
      () => 'ok',
      (e) => e.message,
    ),
  );
  expect(message).toContain('Failed to fetch template "missing"');
});
