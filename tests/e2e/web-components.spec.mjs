// tests/e2e/web-components.spec.mjs
import { test, expect } from '../fixtures/server.fixt.mjs';

test('auto-upgrades custom elements after template insertion', async ({ page, serverURL }) => {
  await page.goto(`${serverURL}/tests/e2e/web-components.html`);
  const el = page.locator('#upgrade');
  await expect(el).toHaveText('');
  await page.evaluate(() => {
    customElements.define('my-el', class extends HTMLElement {
      connectedCallback() { this.textContent = 'upgraded'; }
    });
  });
  await expect(el).toHaveText('upgraded');
});

test('attribute-driven re-render updates custom element', async ({ page, serverURL }) => {
  await page.goto(`${serverURL}/tests/e2e/web-components.html`);
  const counter = page.locator('#counter');
  await expect(counter).toHaveText('0');
  await page.evaluate(() => {
    window.store.count = 1;
    window.app.invalidate();
  });
  await expect(counter).toHaveText('1');
});

test('components parse optional JSON script child', async ({ page, serverURL }) => {
  await page.goto(`${serverURL}/tests/e2e/web-components.html`);
  const withData = page.locator('#json');
  const withoutData = page.locator('#json-empty');
  await expect(withData).toHaveText('Alice');
  await expect(withoutData).toHaveText('no-data');
});
