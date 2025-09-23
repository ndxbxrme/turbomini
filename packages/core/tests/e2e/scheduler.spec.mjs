// tests/e2e/scheduler.spec.mjs
import { test, expect } from '../fixtures/server.fixt.mjs';

test('microtask coalescing batches renders', async ({ page, serverURL }) => {
  await page.goto(`${serverURL}/tests/e2e/scheduler.html`);
  const renders = await page.evaluate(async () => {
    let count = 0;
    const observer = new MutationObserver(() => count++);
    observer.observe(document.querySelector('page'), {
      childList: true,
      subtree: true,
      characterData: true,
    });
    window.store.count = 1;
    window.app.invalidate();
    window.store.count = 2;
    window.app.invalidate();
    await new Promise((r) => setTimeout(r, 0));
    observer.disconnect();
    return count;
  });
  expect(renders).toBe(1);
});

test('raf mode batches multiple writes in one frame', async ({ page, serverURL }) => {
  await page.goto(`${serverURL}/tests/e2e/scheduler.html`);
  const renders = await page.evaluate(async () => {
    window.app.setRenderStrategy({ mode: 'raf' });
    let count = 0;
    const observer = new MutationObserver(() => count++);
    observer.observe(document.querySelector('page'), {
      childList: true,
      subtree: true,
      characterData: true,
    });
    await new Promise((resolve) => {
      requestAnimationFrame(() => {
        window.store.count = 3;
        window.app.invalidate();
        window.store.count = 4;
        window.app.invalidate();
        requestAnimationFrame(() => {
          resolve();
        });
      });
    });
    observer.disconnect();
    return count;
  });
  expect(renders).toBe(1);
});
