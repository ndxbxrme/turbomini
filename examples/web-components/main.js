import { TurboMini } from './turbomini.js';
import '../shared/components/tm-button.js';
import '../shared/components/tm-input.js';
import '../shared/components/tm-dialog.js';

export function createApp() {
  const app = TurboMini('/');
  const controller = {
    pressCount: 0,
    lastName: '',
  };
  let pressButton = null;
  let input = null;
  let dialog = null;
  let openButton = null;
  let closeButton = null;

  app.template(
    'default',
    `
    <main class="grid">
      <section class="panel">
        <h2>Component mini-set</h2>
        <p>Local copy-mode components wired into TurboMini templates.</p>
      </section>
      <section class="panel">
        <h2>Buttons + events</h2>
        <div class="inline">
          <tm-button value="primary" data-press>Press me</tm-button>
          <span class="status">Presses: {{pressCount}}</span>
        </div>
      </section>
      <section class="panel">
        <h2>Inputs + props</h2>
        <tm-input name="fullName" value="{{lastName}}" data-input>
          <span slot="label">Full name</span>
          <span slot="hint">Typing updates the template state.</span>
        </tm-input>
        {{#if lastName}}
          <p class="status">Latest: {{lastName}}</p>
        {{/if}}
      </section>
      <section class="panel">
        <h2>Dialog</h2>
        <tm-button variant="outline" data-open>Open dialog</tm-button>
        <tm-dialog closable data-dialog>
          <span slot="title">Demo dialog</span>
          <p>This dialog comes from the TurboMini web component set.</p>
          <div slot="footer" class="inline">
            <tm-button variant="ghost" data-close>Close</tm-button>
          </div>
        </tm-dialog>
      </section>
    </main>
    `
  );

  const handlePress = () => {
    controller.pressCount += 1;
    app.refresh();
  };

  const handleInput = (event) => {
    controller.lastName = event.detail?.value ?? input?.value ?? '';
    app.refresh();
  };

  const handleOpen = () => dialog?.show();
  const handleClose = () => dialog?.close('button');

  controller.postLoad = () => {
    pressButton = document.querySelector('[data-press]');
    if (pressButton && !pressButton.dataset.bound) {
      pressButton.dataset.bound = 'true';
      pressButton.addEventListener('tm-press', handlePress);
    }

    input = document.querySelector('[data-input]');
    if (input && !input.dataset.bound) {
      input.dataset.bound = 'true';
      input.addEventListener('tm-input', handleInput);
    }

    dialog = document.querySelector('[data-dialog]');
    openButton = document.querySelector('[data-open]');
    closeButton = document.querySelector('[data-close]');
    if (dialog && openButton && !dialog.dataset.bound) {
      dialog.dataset.bound = 'true';
      openButton.addEventListener('tm-press', handleOpen);
      closeButton?.addEventListener('tm-press', handleClose);
    }
  };

  controller.unload = () => {
    pressButton?.removeEventListener('tm-press', handlePress);
    input?.removeEventListener('tm-input', handleInput);
    openButton?.removeEventListener('tm-press', handleOpen);
    closeButton?.removeEventListener('tm-press', handleClose);
    pressButton = null;
    input = null;
    dialog = null;
    openButton = null;
    closeButton = null;
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
