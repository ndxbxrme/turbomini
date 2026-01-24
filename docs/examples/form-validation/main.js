import { TurboMini } from './turbomini.js';

export function validateEmail(value) {
  if (!value) return 'Email is required.';
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) return 'Enter a valid email.';
  return '';
}

export function applyFormState(controller, email) {
  controller.email = String(email || '');
  controller.error = validateEmail(controller.email);
  controller.submitted = !controller.error;
  return controller;
}

export function createApp() {
  const app = TurboMini('/turbomini/examples/form-validation/');
  const controller = {
    email: '',
    error: '',
    submitted: false,
  };
  let boundForm = null;

  app.template(
    'default',
    `
    <main>
      <h1>Newsletter signup</h1>
      <form data-form>
        <label for="email">Email</label>
        <input id="email" type="email" name="email" value="{{email}}" placeholder="you@example.com" />
        {{#if error}}
          <p class="error">{{error}}</p>
        {{/if}}
        {{#if submitted}}
          <p class="success">Thanks for signing up!</p>
        {{/if}}
        <button type="submit">Join</button>
      </form>
    </main>
    `
  );

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    applyFormState(controller, data.get('email'));
    app.refresh();
  };

  controller.postLoad = () => {
    const form = document.querySelector('[data-form]');
    if (!form || form.dataset.bound) return;
    form.dataset.bound = 'true';
    boundForm = form;
    form.addEventListener('submit', handleSubmit);
  };

  controller.unload = () => {
    if (boundForm) boundForm.removeEventListener('submit', handleSubmit);
    boundForm = null;
  };

  app.controller('default', () => controller);

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
