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
    window.app.state.count = 1;
    window.app.state.count = 2;
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
        window.app.state.count = 3;
        window.app.state.count = 4;
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
