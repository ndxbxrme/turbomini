import { TurboMini } from './turbomini.js';

export function createApp() {
  const app = TurboMini('/');
  const homeTemplate = `
    <main class="card">
      <h1>{{title}}</h1>
      <p>{{subtitle}}</p>
      <nav>
        <a href="/home">Home</a>
        <a href="/about">About</a>
      </nav>
    </main>
    `;

  app.template('default', homeTemplate);
  app.template('home', homeTemplate);

  app.template(
    'about',
    `
    <main class="card">
      <h1>About this example</h1>
      <p>{{message}}</p>
      <nav>
        <a href="/home">Home</a>
        <a href="/about">About</a>
      </nav>
    </main>
    `
  );

  app.controller('default', () => ({
    title: 'Hello TurboMini',
    subtitle: 'This route is rendered by a controller + template pair.'
  }));

  app.controller('home', () => ({
    title: 'Hello TurboMini',
    subtitle: 'This route is rendered by a controller + template pair.'
  }));

  app.controller('about', () => ({
    message: 'Routing works by matching template names against the URL path.'
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
