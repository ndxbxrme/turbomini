import { TurboMini } from 'turbomini';
import '@turbomini/wc-button';
import '@turbomini/wc-input';
import '@turbomini/wc-switch';
import '@turbomini/wc-checkbox';
import '@turbomini/wc-radio';
import '@turbomini/wc-radio-group';
import '@turbomini/wc-dialog';
import '@turbomini/wc-select';
import '@turbomini/wc-tabs';
import '@turbomini/wc-tooltip';
import '@turbomini/wc-toast';
import '@turbomini/wc-card';
import './styles/turbomini/theme.css';
import './styles/app.css';

const app = TurboMini('/');

app.template(
  'default',
  `
  <main class="tm-fluid tm-stack-xl">
    <header class="tm-stack">
      <p class="tm-text-muted">Welcome to</p>
      <h1>{{title}}</h1>
      <p>{{tagline}}</p>
      <nav class="tm-inline tm-gap-sm">
        <a href="https://github.com/ndxbxrme/turbomini" target="_blank" rel="noreferrer">GitHub</a>
        <a href="https://www.npmjs.com/package/turbomini" target="_blank" rel="noreferrer">npm</a>
      </nav>
    </header>
    <section class="tm-grid-responsive">
      {{#each features}}
        <article class="tm-surface tm-pad-md tm-stack">
          <h2>{{title}}</h2>
          <p class="tm-text-muted">{{description}}</p>
        </article>
      {{/each}}
    </section>
    <section class="tm-container-demo">
      <div class="tm-container-demo__grid">
        <div class="tm-container-demo__content tm-stack">
          <h2>{{containerDemo.title}}</h2>
          <p class="tm-text-muted">{{containerDemo.description}}</p>
          <button type="button" class="tm-container-demo__cta">{{containerDemo.cta}}</button>
        </div>
        <div class="tm-container-demo__metric" aria-label="{{containerDemo.metricLabel}}">
          <span class="tm-container-demo__metric-label">{{containerDemo.metricLabel}}</span>
          <span class="tm-container-demo__chip">{{containerDemo.metricValue}}</span>
        </div>
      </div>
    </section>
    <section class="tm-component-demos tm-stack-lg">
      <div class="tm-component-demos__intro tm-stack">
        <h2>Component playground</h2>
        <p class="tm-text-muted">Try the Wave 1 TurboMini web components with sensible defaults.</p>
      </div>
      <div class="tm-component-demos__grid">
        <!-- tm-starter-demo:start -->
        <article class="tm-demo" data-demo="forms">
          <div class="tm-demo__header">
            <h3>Form controls</h3>
            <p class="tm-text-muted">Accessible inputs, switches, checkboxes, radios, and select.</p>
          </div>
          <div class="tm-demo__body tm-demo__form-grid">
            <tm-input name="fullName" required>
              <span slot="label">Full name</span>
              <span slot="hint">Use your legal name.</span>
            </tm-input>
            <tm-input name="email" type="email" placeholder="you@example.com">
              <span slot="label">Email address</span>
              <span slot="hint">We never share this.</span>
            </tm-input>
            <div class="tm-demo__form-row">
              <tm-switch name="newsletter" value="weekly">
                Weekly newsletter
              </tm-switch>
              <tm-checkbox name="terms" value="accepted">
                Accept terms
              </tm-checkbox>
            </div>
            <tm-radio-group name="plan" data-demo-radio>
              <span slot="label">Plan</span>
              <tm-radio value="starter">Starter</tm-radio>
              <tm-radio value="pro">Pro</tm-radio>
              <tm-radio value="enterprise" disabled>Enterprise</tm-radio>
            </tm-radio-group>
            <tm-select placeholder="Choose a city" name="city" data-demo-select></tm-select>
            <p class="tm-demo__hint tm-text-muted">The select menu renders a 50 item dataset to exercise scrolling.</p>
          </div>
        </article>

        <article class="tm-demo" data-demo="dialog">
          <div class="tm-demo__header">
            <h3>Dialog Playground</h3>
            <p class="tm-text-muted">Modal dialog with focus trapping and overlay support.</p>
          </div>
          <div class="tm-demo__body tm-inline tm-gap-sm">
            <tm-button data-demo-dialog-open>Open dialog</tm-button>
            <tm-dialog closable initial-focus="[data-dialog-confirm]" data-demo-dialog>
              <span slot="title">Dialog Playground</span>
              <p>Try pressing Escape, clicking the overlay, or using the buttons below.</p>
              <div slot="footer" class="tm-inline tm-gap-sm">
                <tm-button variant="ghost" data-dialog-cancel>Cancel</tm-button>
                <tm-button data-dialog-confirm>Confirm</tm-button>
              </div>
            </tm-dialog>
          </div>
        </article>

        <article class="tm-demo" data-demo="tabs">
          <div class="tm-demo__header">
            <h3>Tabs</h3>
            <p class="tm-text-muted">Arrow keys, Home/End, and animated indicator.</p>
          </div>
          <div class="tm-demo__body">
            <tm-tabs value="design" fitted data-demo-tabs>
              <button slot="tab" value="design">Design tokens</button>
              <button slot="tab" value="accessibility">Accessibility</button>
              <button slot="tab" value="usage">Usage</button>
              <section slot="panel" value="design">
                <p>Theme tokens drive every component for fast theming.</p>
              </section>
              <section slot="panel" value="accessibility">
                <p>Semantic roles and keyboard navigation come by default.</p>
              </section>
              <section slot="panel" value="usage">
                <p>Mix web components with utility classes for rapid builds.</p>
              </section>
            </tm-tabs>
          </div>
        </article>

        <article class="tm-demo" data-demo="tooltip">
          <div class="tm-demo__header">
            <h3>Tooltip</h3>
            <p class="tm-text-muted">Shows on hover and focus, hides on blur or Escape.</p>
          </div>
          <div class="tm-demo__body">
            <tm-tooltip placement="bottom" text="Save changes">
              <tm-button variant="ghost">Hover or focus me</tm-button>
              <span slot="content">Keyboard focus also reveals this tooltip.</span>
            </tm-tooltip>
          </div>
        </article>

        <article class="tm-demo" data-demo="toast">
          <div class="tm-demo__header">
            <h3>Toast notifications</h3>
            <p class="tm-text-muted">Queued toasts with ESC handling and auto-dismiss.</p>
          </div>
          <div class="tm-demo__body tm-inline tm-gap-sm">
            <tm-button data-demo-toast>Show success toast</tm-button>
            <tm-button variant="outline" data-demo-toast-alt>Show warning toast</tm-button>
          </div>
          <tm-toast></tm-toast>
        </article>

        <article class="tm-demo" data-demo="card">
          <div class="tm-demo__header">
            <h3>Card layouts</h3>
            <p class="tm-text-muted">Elevated and inset surfaces that respond to interaction.</p>
          </div>
          <div class="tm-demo__body tm-demo__cards">
            <tm-card interactive elevated data-demo-card-primary>
              <span slot="header">Analytics</span>
              <span slot="media">
                <svg class="tm-demo__sparkline" viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <defs>
                    <linearGradient id="tm-card-spark" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="var(--tm-color-brand)" stop-opacity="0.75" />
                      <stop offset="100%" stop-color="var(--tm-color-brand)" stop-opacity="0.05" />
                    </linearGradient>
                  </defs>
                  <polyline points="0,45 20,20 40,32 60,15 80,30 100,12 120,28" fill="url(#tm-card-spark)" opacity="0.35" />
                  <path d="M0,45 L20,20 L40,32 L60,15 L80,30 L100,12 L120,28" stroke="var(--tm-color-brand)" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </span>
              <p>Interactive cards emit <code>tm-press</code> for custom handlers.</p>
              <span slot="footer" class="tm-text-muted">Last updated 2 minutes ago</span>
            </tm-card>
            <tm-card inset>
              <span slot="header">Project summary</span>
              <p>The inset style keeps sections padded while aligning to edges.</p>
              <span slot="footer">View all activity →</span>
            </tm-card>
          </div>
          <p class="tm-demo__hint tm-text-muted" data-demo-card-status>Press the analytics card to emit <code>tm-press</code>.</p>
        </article>
        <!-- tm-starter-demo:end -->
      </div>
    </section>
  </main>
`
);

app.controller('default', () => ({
  title: 'TurboMini Starter',
  tagline: 'Ship micro front-ends with themable, web-component friendly utilities.',
  features: [
    {
      title: 'Lightweight runtime',
      description: 'Progressive enhancement friendly, dependency-free, and easy to reason about.'
    },
    {
      title: 'Design tokens first',
      description: 'Customize colors, spacing, and typography using a single source of truth.'
    },
    {
      title: 'Composable components',
      description: 'Install web components or copy source into your project with the CLI.'
    }
  ],
  containerDemo: {
    title: 'Container-aware layout',
    description: 'Resize this panel and the metric snaps into place with CSS container queries.',
    cta: 'Explore theming docs',
    metricLabel: 'Breakpoint',
    metricValue: '≥ 42rem'
  },
  selectOptions: Array.from({ length: 50 }, (_, index) => {
    const number = String(index + 1).padStart(2, '0');
    return { value: `city-${number}`, label: `City ${number}` };
  }),
  cardStatusDefault: 'Press the analytics card to emit tm-press.',
  // tm-starter-demo:data
  postLoad() {
    const root = document;

    const select = root.querySelector('[data-demo-select]');
    if (select && !select.dataset.demoInit) {
      select.dataset.demoInit = 'true';
      if (!select.querySelector('tm-select-option')) {
        (this.selectOptions ?? []).forEach((option) => {
          const node = document.createElement('tm-select-option');
          node.value = option.value;
          node.textContent = option.label;
          select.append(node);
        });
      }
    }

    const radioGroup = root.querySelector('[data-demo-radio]');
    if (radioGroup && !radioGroup.dataset.demoInit) {
      radioGroup.dataset.demoInit = 'true';
      radioGroup.value = 'starter';
    }

    const dialog = root.querySelector('tm-dialog[data-demo-dialog]');
    const dialogTrigger = root.querySelector('[data-demo-dialog-open]');
    if (dialog && dialogTrigger && !dialog.dataset.demoInit) {
      dialog.dataset.demoInit = 'true';
      dialogTrigger.addEventListener('click', () => dialog.show());
      dialog.querySelector('[data-dialog-cancel]')?.addEventListener('click', () => dialog.close('cancel'));
      dialog.querySelector('[data-dialog-confirm]')?.addEventListener('click', () => dialog.close('confirm'));
    }

    const toastArticle = root.querySelector('[data-demo="toast"]');
    const toastHost = toastArticle?.querySelector('tm-toast');
    if (toastHost && !toastHost.dataset.demoInit) {
      toastHost.dataset.demoInit = 'true';
      const spawn = (config) => {
        toastHost.toast({
          closable: true,
          duration: 4000,
          ...config,
        });
      };
      toastArticle.querySelector('[data-demo-toast]')?.addEventListener('click', () => {
        spawn({
          variant: 'success',
          title: 'Deployment complete',
          description: 'All services synced successfully.'
        });
      });
      toastArticle.querySelector('[data-demo-toast-alt]')?.addEventListener('click', () => {
        spawn({
          variant: 'warning',
          title: 'Queued for review',
          description: 'Security review pending approval.'
        });
      });
    }

    const cardArticle = root.querySelector('[data-demo="card"]');
    const primaryCard = cardArticle?.querySelector('tm-card[data-demo-card-primary]');
    const status = cardArticle?.querySelector('[data-demo-card-status]');
    if (primaryCard && status && !primaryCard.dataset.demoInit) {
      primaryCard.dataset.demoInit = 'true';
      status.textContent = this.cardStatusDefault;
      primaryCard.addEventListener('tm-press', () => {
        status.textContent = 'Last action: analytics card pressed.';
        setTimeout(() => {
          status.textContent = this.cardStatusDefault;
        }, 3200);
      });
    }
    // tm-starter-demo:setup
  }
}));

app.start();
