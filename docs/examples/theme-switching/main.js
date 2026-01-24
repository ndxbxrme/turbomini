import { TurboMini } from './turbomini.js';

const STORAGE_KEY = 'tm-theme';

export function applyThemePreference({ storageKey = STORAGE_KEY, defaultTheme = 'system' } = {}) {
  const stored = window.localStorage.getItem(storageKey);
  let theme = stored || defaultTheme;
  if (theme === 'system') {
    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  document.documentElement.dataset.theme = theme;
  return theme;
}

export function setTheme(theme, storageKey = STORAGE_KEY) {
  window.localStorage.setItem(storageKey, theme);
  document.documentElement.dataset.theme = theme;
  return theme;
}

export function toggleTheme(current) {
  return current === 'dark' ? 'light' : 'dark';
}

export function createApp() {
  const app = TurboMini('/turbomini/examples/theme-switching/');
  const controller = {
    theme: '',
  };
  let boundButton = null;

  app.template(
    'default',
    `
    <main class="theme-card">
      <h1>Theme switching</h1>
      <p>Current theme: <span class="badge">{{theme}}</span></p>
      <button type="button" data-toggle>Toggle theme</button>
      <p class="tm-text-muted">Preference is stored in localStorage.</p>
    </main>
    `
  );

  const handleToggle = () => {
    controller.theme = setTheme(toggleTheme(controller.theme));
    app.refresh();
  };

  controller.postLoad = () => {
    if (typeof window === 'undefined') return;
    if (!controller.theme) {
      controller.theme = applyThemePreference();
      app.refresh();
    }
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
