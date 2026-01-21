import { TurboMini } from '../shared/turbomini.js';
import '../shared/components/tm-button.js';
import '../shared/components/tm-input.js';
import '../shared/components/tm-dialog.js';

export function createApp() {
  const app = TurboMini('/web-components');
  const store = {
    pressCount: 0,
    lastName: '',
  };

  app.template(
    'default',
    `
    <main class="grid">
      <section class="panel">
        <h1>Component mini-set</h1>
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

  app.controller('default', () => ({
    pressCount: store.pressCount,
    lastName: store.lastName,
    postLoad() {
      const pressButton = document.querySelector('[data-press]');
      if (pressButton && !pressButton.dataset.bound) {
        pressButton.dataset.bound = 'true';
        pressButton.addEventListener('tm-press', () => {
          store.pressCount += 1;
          app.invalidate();
        });
      }

      const input = document.querySelector('[data-input]');
      if (input && !input.dataset.bound) {
        input.dataset.bound = 'true';
        input.addEventListener('tm-input', (event) => {
          store.lastName = event.detail?.value ?? input.value ?? '';
          app.invalidate();
        });
      }

      const dialog = document.querySelector('[data-dialog]');
      const open = document.querySelector('[data-open]');
      const close = document.querySelector('[data-close]');
      if (dialog && open && !dialog.dataset.bound) {
        dialog.dataset.bound = 'true';
        open.addEventListener('tm-press', () => dialog.show());
        close?.addEventListener('tm-press', () => dialog.close('button'));
      }
    }
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
