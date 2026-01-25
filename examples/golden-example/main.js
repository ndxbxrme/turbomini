import { TurboMini } from './turbomini.js';
if (typeof window !== 'undefined') {
  await import('../shared/components/tm-button.js');
  await import('../shared/components/tm-input.js');
  await import('../shared/components/tm-dialog.js');
}

const STORAGE_KEY = 'tm-golden-theme';

export async function loadDashboardData() {
  const url = new URL('./data.json', import.meta.url);
  if (typeof window !== 'undefined' && typeof fetch === 'function') {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to load dashboard data');
    return res.json();
  }

  const { readFile } = await import('node:fs/promises');
  const raw = await readFile(url, 'utf8');
  return JSON.parse(raw);
}

export function applySearchFilter(activity, query) {
  const normalized = query?.trim().toLowerCase();
  if (!normalized) return activity;
  return activity.filter((item) => {
    const haystack = `${item.title} ${item.summary}`.toLowerCase();
    return haystack.includes(normalized);
  });
}

export function createController() {
  return {
    theme: '',
    search: '',
    stats: [],
    activity: [],
    filteredActivity: [],
    announcements: [],
    user: null,
    lastUpdated: '',
    loaded: false,
    refreshing: false,
    hasResults: false,
    showEmpty: false,
  };
}

export function setDashboardData(controller, data) {
  controller.user = data.user;
  controller.stats = data.stats ?? [];
  controller.activity = data.activity ?? [];
  controller.announcements = data.announcements ?? [];
  controller.filteredActivity = applySearchFilter(controller.activity, controller.search);
  controller.hasResults = controller.filteredActivity.length > 0;
  controller.showEmpty = !controller.hasResults;
  controller.lastUpdated = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
  controller.loaded = true;
}

export async function refreshDashboardData(controller) {
  const data = await loadDashboardData();
  setDashboardData(controller, data);
}

export function applyThemePreference({ storageKey = STORAGE_KEY, defaultTheme = 'system' } = {}) {
  if (typeof window === 'undefined') {
    return defaultTheme === 'system' ? 'light' : defaultTheme;
  }
  const stored = window.localStorage.getItem(storageKey);
  let theme = stored || defaultTheme;
  if (theme === 'system') {
    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  document.documentElement.dataset.theme = theme;
  return theme;
}

export function setTheme(theme, storageKey = STORAGE_KEY) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(storageKey, theme);
    document.documentElement.dataset.theme = theme;
  }
  return theme;
}

export function toggleTheme(current) {
  return current === 'dark' ? 'light' : 'dark';
}

export async function ensureData(controller) {
  if (controller.loaded) return controller;
  await refreshDashboardData(controller);
  return controller;
}

export function createApp() {
  const app = TurboMini('/');
  const controller = createController();
  let searchInput = null;
  let themeButton = null;
  let refreshButton = null;
  let openDialogButtons = [];
  let closeDialogButton = null;
  let dialog = null;

  const homeTemplate = `
    <main class="layout">
      <header class="panel hero">
        <div>
          <p class="eyebrow">Golden example</p>
          <h2>TurboMini end-to-end walkthrough</h2>
          <p class="muted">Routes, async controllers, templates, themes, and web components in one place.</p>
        </div>
        <nav class="nav">
          <a href="/home">Overview</a>
          <a href="/profile">Profile</a>
          <a href="/settings">Settings</a>
        </nav>
      </header>

      <section class="panel">
        <div class="panel-title">
          <h3>Async dashboard</h3>
          <span class="badge">API data</span>
        </div>
        <div class="stats">
          {{#each stats as stat}}
            <div class="stat">
              <p class="stat-label">{{stat.label}}</p>
              <p class="stat-value">{{stat.value}}</p>
            </div>
          {{/each}}
        </div>
        <div class="toolbar">
          <tm-input data-search value="{{search}}">
            <span slot="label">Filter activity</span>
            <span slot="hint">Type to filter async data.</span>
          </tm-input>
          <div class="actions">
            <tm-button value="primary" data-refresh>Refresh</tm-button>
            <tm-button variant="ghost" data-theme-toggle>Theme: {{theme}}</tm-button>
            <tm-button variant="outline" data-open-dialog>Guide</tm-button>
          </div>
        </div>
        <p class="meta">Last updated: {{lastUpdated}}</p>
        {{#if refreshing}}
          <p class="meta">Refreshing...</p>
        {{/if}}
        {{#if hasResults}}
          <ul class="activity">
            {{#each filteredActivity as item}}
              <li>
                <p class="activity-title">{{item.title}}</p>
                <p class="activity-summary">{{item.summary}}</p>
                <span class="activity-time">{{item.time}}</span>
              </li>
            {{/each}}
          </ul>
        {{/if}}
        {{#if showEmpty}}
          <p class="empty">No activity matches that filter.</p>
        {{/if}}
      </section>

      <section class="panel">
        <div class="panel-title">
          <h3>Announcements</h3>
          <span class="badge">Templates</span>
        </div>
        <ul class="list">
          {{#each announcements as note}}
            <li>
              <p class="activity-title">{{note.title}}</p>
              <p class="activity-summary">{{note.body}}</p>
            </li>
          {{/each}}
        </ul>
      </section>

      <section class="panel">
        <div class="panel-title">
          <h3>Component dialog</h3>
          <span class="badge">tm-dialog</span>
        </div>
        <p class="muted">This dialog is a TurboMini web component wired in postLoad().</p>
        <tm-button variant="outline" data-open-dialog>Open dialog</tm-button>
        <tm-dialog closable data-dialog>
          <span slot="title">Quick tips</span>
          <p>Use async controllers for data, and call <strong>app.refresh()</strong> after state changes.</p>
          <div slot="footer" class="actions">
            <tm-button variant="ghost" data-close-dialog>Close</tm-button>
          </div>
        </tm-dialog>
      </section>
    </main>
    `;

  app.template('default', homeTemplate);
  app.template('home', homeTemplate);

  app.template(
    'profile',
    `
    <main class="layout">
      <header class="panel hero">
        <div>
          <p class="eyebrow">Profile</p>
          <h2>Async controller, same data</h2>
          <p class="muted">Direct links still await data before rendering.</p>
        </div>
        <nav class="nav">
          <a href="/home">Overview</a>
          <a href="/profile">Profile</a>
          <a href="/settings">Settings</a>
        </nav>
      </header>

      <section class="panel">
        <div class="panel-title">
          <h3>Account</h3>
          <span class="badge">Controller data</span>
        </div>
        <p class="activity-title">{{user.name}}</p>
        <p class="muted">{{user.role}} · {{user.team}}</p>
        <p class="meta">Last updated: {{lastUpdated}}</p>
      </section>
    </main>
    `
  );

  app.template(
    'settings',
    `
    <main class="layout">
      <header class="panel hero">
        <div>
          <p class="eyebrow">Settings</p>
          <h2>Theme + component controls</h2>
          <p class="muted">Theme preferences are stored in localStorage.</p>
        </div>
        <nav class="nav">
          <a href="/home">Overview</a>
          <a href="/profile">Profile</a>
          <a href="/settings">Settings</a>
        </nav>
      </header>

      <section class="panel">
        <div class="panel-title">
          <h3>Appearance</h3>
          <span class="badge">Theme</span>
        </div>
        <p class="muted">Current theme: <strong>{{theme}}</strong></p>
        <tm-button value="primary" data-theme-toggle>Toggle theme</tm-button>
      </section>
    </main>
    `
  );

  const handleSearch = (event) => {
    controller.search = event.detail?.value ?? searchInput?.value ?? '';
    controller.filteredActivity = applySearchFilter(controller.activity, controller.search);
    controller.hasResults = controller.filteredActivity.length > 0;
    controller.showEmpty = !controller.hasResults;
    app.refresh();
  };

  const handleThemeToggle = () => {
    controller.theme = setTheme(toggleTheme(controller.theme));
    app.refresh();
  };

  const handleRefresh = async () => {
    if (controller.refreshing) return;
    controller.refreshing = true;
    app.refresh();
    await refreshDashboardData(controller);
    controller.refreshing = false;
    app.refresh();
  };

  const handleOpenDialog = () => dialog?.show();
  const handleCloseDialog = () => dialog?.close('button');

  controller.postLoad = () => {
    if (typeof window === 'undefined') return;
    if (!controller.theme) {
      controller.theme = applyThemePreference();
      app.refresh();
    }

    searchInput = document.querySelector('[data-search]');
    if (searchInput && !searchInput.dataset.bound) {
      searchInput.dataset.bound = 'true';
      searchInput.addEventListener('tm-input', handleSearch);
    }

    themeButton = document.querySelector('[data-theme-toggle]');
    if (themeButton && !themeButton.dataset.bound) {
      themeButton.dataset.bound = 'true';
      themeButton.addEventListener('tm-press', handleThemeToggle);
    }

    refreshButton = document.querySelector('[data-refresh]');
    if (refreshButton && !refreshButton.dataset.bound) {
      refreshButton.dataset.bound = 'true';
      refreshButton.addEventListener('tm-press', handleRefresh);
    }

    dialog = document.querySelector('[data-dialog]');
    openDialogButtons = Array.from(document.querySelectorAll('[data-open-dialog]'));
    closeDialogButton = document.querySelector('[data-close-dialog]');
    if (dialog && openDialogButtons.length && !dialog.dataset.bound) {
      dialog.dataset.bound = 'true';
      openDialogButtons.forEach((button) => button.addEventListener('tm-press', handleOpenDialog));
      closeDialogButton?.addEventListener('tm-press', handleCloseDialog);
    }
  };

  controller.unload = () => {
    searchInput?.removeEventListener('tm-input', handleSearch);
    themeButton?.removeEventListener('tm-press', handleThemeToggle);
    refreshButton?.removeEventListener('tm-press', handleRefresh);
    openDialogButtons.forEach((button) => button.removeEventListener('tm-press', handleOpenDialog));
    closeDialogButton?.removeEventListener('tm-press', handleCloseDialog);
    searchInput = null;
    themeButton = null;
    refreshButton = null;
    openDialogButtons = [];
    closeDialogButton = null;
    dialog = null;
  };

  const loadController = async () => {
    await ensureData(controller);
    return controller;
  };

  app.controller('default', loadController);
  app.controller('home', loadController);
  app.controller('profile', loadController);
  app.controller('settings', loadController);

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
