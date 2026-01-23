import { TurboMini } from './turbomini.js';

export function createApp() {
  const app = TurboMini('/');
  const controller = {
    loggedIn: false,
  };
  let boundButton = null;

  app.template(
    'default',
    `
    <main class="card">
      <h1>Dashboard</h1>
      <p>Status: {{loggedIn ? "Logged in" : "Logged out"}}</p>
      <nav>
        <a href="/admin">Admin</a>
        <a href="/">Home</a>
      </nav>
      <button type="button" data-toggle>Toggle login</button>
    </main>
    `
  );

  app.template(
    'admin',
    `
    <main class="card">
      <h1>Admin</h1>
      <p>Restricted area for signed-in users.</p>
      <nav>
        <a href="/">Back to home</a>
      </nav>
    </main>
    `
  );

  const handleToggle = () => {
    controller.loggedIn = !controller.loggedIn;
    app.refresh();
  };

  controller.postLoad = () => {
    if (typeof window === 'undefined') return;
    const btn = document.querySelector('[data-toggle]');
    if (!btn || btn.dataset.bound) return;
    btn.dataset.bound = 'true';
    boundButton = btn;
    btn.addEventListener('click', handleToggle);
  };

  controller.unload = () => {
    if (boundButton) boundButton.removeEventListener('click', handleToggle);
    boundButton = null;
  };

  app.controller('default', () => controller);

  app.controller('admin', () => ({}));

  app.addMiddleware((ctx) => {
    if (ctx.page === 'admin' && !controller.loggedIn) return false;
  });

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
