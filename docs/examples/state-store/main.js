import { TurboMini } from './turbomini.js';

export function createStore() {
  return {
    count: 0,
    step: 1,
  };
}

export function applyCounterAction(controller, action) {
  if (action === 'inc') controller.count += controller.step;
  if (action === 'dec') controller.count -= controller.step;
  if (action === 'reset') controller.count = 0;
  return controller;
}

export function createApp() {
  const app = TurboMini('/turbomini/examples/state-store/');
  const controller = {
    ...createStore(),
  };

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

  const handleClick = (event) => {
    const action = event.target?.closest?.('[data-action]')?.dataset?.action;
    if (!action) return;
    applyCounterAction(controller, action);
    app.refresh();
  };

  controller.postLoad = () => {
    const root = document.querySelector('.counter');
    if (!root || root.dataset.bound) return;
    root.dataset.bound = 'true';
    root.addEventListener('click', handleClick);
  };

  controller.unload = () => {
    const root = document.querySelector('.counter');
    root?.removeEventListener('click', handleClick);
  };

  app.controller('default', () => controller);

  return { app, controller };
}

export function startApp() {
  const { app } = createApp();
  app.start();
  return app;
}

if (typeof window !== 'undefined') {
  startApp();
}
