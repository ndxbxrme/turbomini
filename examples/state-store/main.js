import { TurboMini } from '../shared/turbomini.js';

export function createStore() {
  return {
    count: 0,
    step: 1,
  };
}

export function createApp() {
  const app = TurboMini('/state-store');
  const store = createStore();

  app.template(
    'default',
    `
    <main class="counter">
      <h1>Counter: {{count}}</h1>
      <p>Step size: {{step}}</p>
      <div class="controls">
        <button type="button" data-action="dec">-</button>
        <button type="button" data-action="inc">+</button>
        <button type="button" data-action="reset">Reset</button>
      </div>
    </main>
    `
  );

  app.controller('default', () => ({
    count: store.count,
    step: store.step,
    postLoad() {
      const root = document.querySelector('.counter');
      if (!root || root.dataset.bound) return;
      root.dataset.bound = 'true';

      root.addEventListener('click', (event) => {
        const action = event.target?.dataset?.action;
        if (!action) return;
        if (action === 'inc') store.count += store.step;
        if (action === 'dec') store.count -= store.step;
        if (action === 'reset') store.count = 0;
        app.refresh();
      });
    }
  }));

  return { app, store };
}

export function startApp() {
  const { app } = createApp();
  app.start();
  return app;
}

if (typeof window !== 'undefined') {
  startApp();
}
