import { TurboMini } from '../shared/turbomini.js';

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
  const app = TurboMini('/theme-switching');
  const store = {
    theme: '',
  };

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

  app.controller('default', () => ({
    theme: store.theme,
    postLoad() {
      if (typeof window === 'undefined') return;
      if (!store.theme) {
        store.theme = applyThemePreference();
        app.invalidate();
      }
      const btn = document.querySelector('[data-toggle]');
      if (!btn || btn.dataset.bound) return;
      btn.dataset.bound = 'true';
      btn.addEventListener('click', () => {
        store.theme = setTheme(toggleTheme(store.theme));
        app.invalidate();
      });
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
