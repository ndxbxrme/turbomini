import { TurboMini } from './turbomini.js';
import { userController, teamController } from './controllers/index.js';

export function createApp() {
  const app = TurboMini('/turbomini/examples/controller-patterns/');
  const userTemplate = `
    <main class="panel">
      <h2>User profile</h2>
      <p>Name: {{name}}</p>
      <p>Flags: {{flags}}</p>
      <p>Summary: {{summary}}</p>
      <nav>
        <a href="/user/42">User 42</a>
        <a href="/team">Team</a>
      </nav>
    </main>
    `;

  app.template('default', userTemplate);
  app.template('user', userTemplate);

  app.template(
    'team',
    `
    <main class="panel">
      <h2>Team overview</h2>
      <p>Team: {{name}}</p>
      <p>Members: {{members}}</p>
      <p>Summary: {{summary}}</p>
      <nav>
        <a href="/user/42">User 42</a>
        <a href="/team">Team</a>
      </nav>
    </main>
    `
  );

  app.controller('default', () => userController(['42']));
  app.controller('user', userController);
  app.controller('team', teamController);

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
