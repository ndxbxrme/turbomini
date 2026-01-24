import { TurboMini } from './turbomini.js';

export async function loadItems() {
  const url = new URL('./data.json', import.meta.url);
  if (typeof window !== 'undefined' && typeof fetch === 'function') {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to load data');
    const data = await res.json();
    return data.items ?? [];
  }

  const { readFile } = await import('node:fs/promises');
  const raw = await readFile(url, 'utf8');
  return JSON.parse(raw).items ?? [];
}

export function createApp() {
  const app = TurboMini('/turbomini/examples/data-fetching/');

  app.template(
    'default',
    `
    <main>
      <h2>Library feed</h2>
      <p>Loaded from a local JSON file.</p>
      <ul class="list">
        {{#each items as item}}
          <li>
            <strong>{{item.title}}</strong>
            <p>{{item.summary}}</p>
          </li>
        {{/each}}
      </ul>
    </main>
    `
  );

  app.controller('default', async () => ({
    items: await loadItems(),
  }));

  return app;
}

export function startApp() {
  const app = createApp();
  app.start();
  return app;
}

if (typeof window !== 'undefined') {
  startApp();
}
