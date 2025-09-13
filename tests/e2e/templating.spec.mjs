// tests/e2e/templating.spec.mjs
import { test, expect } from '../fixtures/server.fixt.mjs';

test('partials render and #each updates DOM', async ({ page, serverURL }) => {
  await page.goto(`${serverURL}/tests/e2e/templating.html`);
  const items = page.locator('#list li');
  await expect(items).toHaveText(['a', 'b']);
  await page.evaluate(() => {
    window.app.state.items = [...window.app.state.items, 'c'];
  });
  await expect(items).toHaveText(['a', 'b', 'c']);
});

test('json helper feeds component and classList toggles classes', async ({ page, serverURL }) => {
  await page.goto(`${serverURL}/tests/e2e/helpers.html`);
  const raw = await page.locator('#comp').innerHTML();
  const decoded = await page.evaluate((s) => {
    const div = document.createElement('div');
    div.innerHTML = s;
    const once = div.textContent;
    div.innerHTML = once;
    return div.textContent;
  }, raw);
  expect(decoded).toBe('{"name":"Alice & Bob"}');
  const box = page.locator('#box');
  await expect(box).not.toHaveClass(/active/);
  await page.evaluate(() => {
    window.app.state.boxClasses = { ...window.app.state.boxClasses, active: true };
  });
  await expect(box).toHaveClass(/active/);
});
