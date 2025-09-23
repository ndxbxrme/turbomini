// tests/e2e/robustness.spec.mjs
import { test, expect } from '../fixtures/server.fixt.mjs';

test('logs error when no <page> element exists and app remains usable', async ({ page, serverURL }) => {
  await page.goto(`${serverURL}/tests/e2e/no-page.html`);
  await page.evaluate(() => {
    window.loggedErrors = [];
    const orig = console.error;
    console.error = (...args) => {
      window.loggedErrors.push(args.map(a => String(a)).join(' '));
      orig(...args);
    };
  });
  await page.evaluate(() => window.app.start());
  await expect.poll(() =>
    page.evaluate(() =>
      window.loggedErrors.some(t => t.includes('<page> element not found.')),
    ),
  ).toBe(true);

  await page.evaluate(() => {
    const el = document.createElement('page');
    document.body.appendChild(el);
    window.app.refreshNow();
  });
  await expect(page.locator('#hello')).toHaveText('Hello');
});

test('unknown template navigation logs error without freezing the app', async ({ page, serverURL }) => {
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await page.goto(`${serverURL}/tests/e2e/unknown-template.html`);
  await expect(page.locator('#home')).toHaveText('Home');

  await page.evaluate(() => window.app.goto('/missing'));
  const hasError = errors.some(text => text.includes('Template "missing" not found.'));
  expect(hasError).toBeTruthy();

  await page.evaluate(() => window.app.goto('/'));
  await expect(page.locator('#home')).toHaveText('Home');
});
