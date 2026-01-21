import { TurboMini } from '../shared/turbomini.js';

export function createApp() {
  const app = TurboMini('/middleware-guard');
  const store = {
    loggedIn: false,
  };

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

  app.controller('default', () => ({
    loggedIn: store.loggedIn,
    postLoad() {
      if (typeof window === 'undefined') return;
      const btn = document.querySelector('[data-toggle]');
      if (!btn || btn.dataset.bound) return;
      btn.dataset.bound = 'true';
      btn.addEventListener('click', () => {
        store.loggedIn = !store.loggedIn;
        app.invalidate();
      });
    },
  }));

  app.controller('admin', () => ({}));

  app.addMiddleware((ctx) => {
    if (ctx.page === 'admin' && !store.loggedIn) return false;
  });

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
