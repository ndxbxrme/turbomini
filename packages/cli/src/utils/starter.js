import fs from 'node:fs/promises';
import path from 'node:path';

const MARKERS = {
  templateStart: '<!-- tm-starter-demo:start -->',
  templateEnd: '<!-- tm-starter-demo:end -->',
  data: '// tm-starter-demo:data',
  setup: '// tm-starter-demo:setup',
};

const formsTemplate = `        <article class="tm-demo" data-demo="forms">
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
`;

const dialogTemplate = `        <article class="tm-demo" data-demo="dialog">
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
`;

const tabsTemplate = `        <article class="tm-demo" data-demo="tabs">
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
`;

const tooltipTemplate = `        <article class="tm-demo" data-demo="tooltip">
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
`;

const toastTemplate = `        <article class="tm-demo" data-demo="toast">
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
`;

const cardTemplate = `        <article class="tm-demo" data-demo="card">
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
`;

const STARTER_SNIPPETS = {
  'tm-input': {
    template: formsTemplate,
    data: `selectOptions: Array.from({ length: 50 }, (_, index) => {\n    const number = String(index + 1).padStart(2, '0');\n    return { value: \`city-\${number}\`, label: \`City \${number}\` };\n  }),`,
    setup: `const select = root.querySelector('[data-demo-select]');\n    if (select && !select.dataset.demoInit) {\n      select.dataset.demoInit = 'true';\n      if (!select.querySelector('tm-select-option')) {\n        (this.selectOptions ?? []).forEach((option) => {\n          const node = document.createElement('tm-select-option');\n          node.value = option.value;\n          node.textContent = option.label;\n          select.append(node);\n        });\n      }\n    }\n\n    const radioGroup = root.querySelector('[data-demo-radio]');\n    if (radioGroup && !radioGroup.dataset.demoInit) {\n      radioGroup.dataset.demoInit = 'true';\n      radioGroup.value = 'starter';\n    }`,
  },
  'tm-switch': { template: formsTemplate },
  'tm-checkbox': { template: formsTemplate },
  'tm-radio': { template: formsTemplate },
  'tm-radio-group': { template: formsTemplate },
  'tm-select': { template: formsTemplate },
  'tm-dialog': {
    template: dialogTemplate,
    setup: `const dialog = root.querySelector('tm-dialog[data-demo-dialog]');\n    const dialogTrigger = root.querySelector('[data-demo-dialog-open]');\n    if (dialog && dialogTrigger && !dialog.dataset.demoInit) {\n      dialog.dataset.demoInit = 'true';\n      dialogTrigger.addEventListener('click', () => dialog.show());\n      dialog.querySelector('[data-dialog-cancel]')?.addEventListener('click', () => dialog.close('cancel'));\n      dialog.querySelector('[data-dialog-confirm]')?.addEventListener('click', () => dialog.close('confirm'));\n    }`,
  },
  'tm-tabs': { template: tabsTemplate },
  'tm-tooltip': { template: tooltipTemplate },
  'tm-toast': {
    template: toastTemplate,
    setup: `const toastArticle = root.querySelector('[data-demo="toast"]');\n    const toastHost = toastArticle?.querySelector('tm-toast');\n    if (toastHost && !toastHost.dataset.demoInit) {\n      toastHost.dataset.demoInit = 'true';\n      const spawn = (config) => {\n        toastHost.toast({\n          closable: true,\n          duration: 4000,\n          ...config,\n        });\n      };\n      toastArticle.querySelector('[data-demo-toast]')?.addEventListener('click', () => {\n        spawn({\n          variant: 'success',\n          title: 'Deployment complete',\n          description: 'All services synced successfully.'\n        });\n      });\n      toastArticle.querySelector('[data-demo-toast-alt]')?.addEventListener('click', () => {\n        spawn({\n          variant: 'warning',\n          title: 'Queued for review',\n          description: 'Security review pending approval.'\n        });\n      });\n    }`,
  },
  'tm-card': {
    template: cardTemplate,
    data: `cardStatusDefault: 'Press the analytics card to emit tm-press.',`,
    setup: `const cardArticle = root.querySelector('[data-demo="card"]');\n    const primaryCard = cardArticle?.querySelector('tm-card[data-demo-card-primary]');\n    const status = cardArticle?.querySelector('[data-demo-card-status]');\n    if (primaryCard && status && !primaryCard.dataset.demoInit) {\n      primaryCard.dataset.demoInit = 'true';\n      status.textContent = this.cardStatusDefault;\n      primaryCard.addEventListener('tm-press', () => {\n        status.textContent = 'Last action: analytics card pressed.';\n        setTimeout(() => {\n          status.textContent = this.cardStatusDefault;\n        }, 3200);\n      });\n    }`,
  },
};

['tm-switch', 'tm-checkbox', 'tm-radio', 'tm-radio-group', 'tm-select'].forEach((tag) => {
  STARTER_SNIPPETS[tag] = { ...STARTER_SNIPPETS[tag], data: STARTER_SNIPPETS['tm-input'].data, setup: STARTER_SNIPPETS['tm-input'].setup };
});

async function insertTemplate(content, snippet) {
  const insertAt = content.indexOf(MARKERS.templateEnd);
  if (insertAt === -1) return { content, changed: false };
  const before = content.slice(0, insertAt);
  const after = content.slice(insertAt);
  return {
    content: `${before}${snippet}${after.startsWith('\n') ? '' : '\n'}${after}`,
    changed: true,
  };
}

function insertBlock(content, marker, block, indent) {
  if (!block) return { content, changed: false };
  if (!content.includes(marker)) return { content, changed: false };
  if (content.includes(block.trim())) return { content, changed: false };
  const formatted = block
    .split('\n')
    .filter((line) => line.length > 0)
    .map((line) => `${indent}${line}`)
    .join('\n');
  return { content: content.replace(marker, `${marker}\n${formatted}`), changed: true };
}

export async function applyStarterDemo(context, component, projectRoot) {
  const snippet = STARTER_SNIPPETS[component.manifest.tag];
  if (!snippet) return;

  const mainPath = path.join(projectRoot, 'src', 'main.js');
  if (!(await context.fileExists(mainPath))) return;

  let content = await fs.readFile(mainPath, 'utf8');
  let changed = false;

  if (snippet.template && !content.includes(snippet.template.trim())) {
    const result = await insertTemplate(content, snippet.template);
    content = result.content;
    changed = changed || result.changed;
  }

  const dataResult = insertBlock(content, MARKERS.data, snippet.data, '  ');
  content = dataResult.content;
  changed = changed || dataResult.changed;

  const setupResult = insertBlock(content, MARKERS.setup, snippet.setup, '    ');
  content = setupResult.content;
  changed = changed || setupResult.changed;

  if (changed) {
    await context.writeFile(mainPath, content);
  }
}
