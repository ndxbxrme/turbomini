import { TurboMiniElement } from '@turbomini/wc-core';

let toastCounter = 0;

const styles = `
:host {
  position: fixed;
  bottom: var(--tm-space-5);
  right: var(--tm-space-5);
  z-index: var(--tm-z-toast);
  display: grid;
  gap: var(--tm-toast-gap);
  pointer-events: none;
  max-width: min(24rem, 90vw);
  --tm-toast-bg: var(--tm-color-surface);
  --tm-toast-fg: var(--tm-color-text);
  --tm-toast-radius: var(--tm-radius-lg);
  --tm-toast-shadow: var(--tm-shadow-lg);
  --tm-toast-gap: var(--tm-space-3);
}

:host([hidden]) {
  display: none;
}

.stack {
  display: grid;
  gap: inherit;
}

.toast {
  pointer-events: auto;
  background-color: var(--tm-toast-bg);
  color: var(--tm-toast-fg);
  border-radius: var(--tm-toast-radius);
  box-shadow: var(--tm-toast-shadow);
  padding: var(--tm-space-4);
  display: grid;
  gap: var(--tm-space-2);
  border-inline-start: 4px solid var(--_accent);
  --_accent: var(--tm-color-info);
}

.toast[data-variant='success'] {
  --_accent: var(--tm-color-success);
}

.toast[data-variant='warning'] {
  --_accent: var(--tm-color-warning);
}

.toast[data-variant='danger'] {
  --_accent: var(--tm-color-danger);
}

.toast__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--tm-space-3);
}

.toast__title[hidden] {
  display: none;
}

.toast__description[hidden] {
  display: none;
}

.toast__actions {
  display: inline-flex;
  align-items: center;
  gap: var(--tm-space-3);
  justify-content: flex-end;
}

.toast__action {
  background: none;
  border: none;
  color: inherit;
  font: inherit;
  cursor: pointer;
  text-decoration: underline;
}

.toast__action:focus-visible,
.toast__close:focus-visible {
  outline: none;
  box-shadow: var(--tm-focus-ring);
}

.toast__close {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: var(--tm-space-1);
  border-radius: var(--tm-radius-full);
}

.toast__close:hover {
  background-color: color-mix(in srgb, currentColor 14%, transparent);
}

@media (prefers-reduced-motion: reduce) {
  :host {
    transition: none;
  }
}
`;

export class TmToast extends TurboMiniElement {
  static tagName = 'tm-toast';
  static props = {
    variant: { type: 'string', default: 'info', reflect: true },
    closable: { type: 'boolean', default: true, reflect: true },
    duration: { type: 'number', default: 4000, reflect: true },
  };
  static styles = styles;

  constructor() {
    super();
    this._toasts = [];
    this._timers = new Map();
    this._onKeyDown = this._onKeyDown.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    if (typeof document !== 'undefined') {
      document.addEventListener('keydown', this._onKeyDown);
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback?.();
    if (typeof document !== 'undefined') {
      document.removeEventListener('keydown', this._onKeyDown);
    }
    this._clearAllTimers();
  }

  render() {
    if (!this._stack) {
      this.shadowRoot.innerHTML = `
        <div class="stack"></div>
      `;
      this._stack = this.shadowRoot.querySelector('.stack');
    }
    this._renderToasts();
  }

  show(options = {}) {
    const {
      title = '',
      description = '',
      variant = this.variant,
      closable = this.closable,
      duration = this.duration,
      action = null,
    } = options;
    const id = `tm-toast-${++toastCounter}`;
    const toast = {
      id,
      title,
      description,
      variant,
      closable,
      duration,
      action,
    };
    this._toasts.push(toast);
    this.requestRender();
    if (duration > 0) {
      const timer = setTimeout(() => {
        this._removeToast(id, 'timeout');
      }, duration);
      this._timers.set(id, timer);
    }
    return id;
  }

  toast(options = {}) {
    return this.show(options);
  }

  dismiss(id, reason = 'dismiss') {
    this._removeToast(id, reason);
  }

  clear() {
    for (const toast of [...this._toasts]) {
      this._removeToast(toast.id, 'dismiss');
    }
  }

  _renderToasts() {
    if (!this._stack) return;
    this._stack.innerHTML = '';
    for (const toast of this._toasts) {
      const item = document.createElement('div');
      item.className = 'toast';
      item.dataset.id = toast.id;
      item.dataset.variant = toast.variant;
      item.setAttribute('part', 'item');
      const role = toast.closable || toast.action ? 'alertdialog' : 'status';
      item.setAttribute('role', role);
      item.setAttribute('aria-live', 'polite');
      item.innerHTML = `
        <div class="toast__header">
          <strong class="toast__title" part="title" ${toast.title ? '' : 'hidden'}>${toast.title}</strong>
          ${toast.closable ? '<button class="toast__close" part="close" type="button" aria-label="Dismiss">×</button>' : ''}
        </div>
        <p class="toast__description" part="description" ${toast.description ? '' : 'hidden'}>${toast.description}</p>
        ${toast.action ? '<div class="toast__actions"></div>' : ''}
      `;
      const closeBtn = item.querySelector('.toast__close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          this._removeToast(toast.id, 'dismiss');
        });
      }
      if (toast.action) {
        const actions = item.querySelector('.toast__actions');
        const actionBtn = document.createElement('button');
        actionBtn.className = 'toast__action';
        actionBtn.setAttribute('part', 'action');
        actionBtn.type = 'button';
        actionBtn.textContent = toast.action.label ?? 'Action';
        actionBtn.addEventListener('click', () => {
          try {
            toast.action?.handler?.(toast);
          } finally {
            this._removeToast(toast.id, 'action');
          }
        });
        actions?.append(actionBtn);
      }
      this._stack.append(item);
    }
  }

  _removeToast(id, reason) {
    const index = this._toasts.findIndex((toast) => toast.id === id);
    if (index === -1) return;
    const [toast] = this._toasts.splice(index, 1);
    const timer = this._timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this._timers.delete(id);
    }
    this.requestRender();
    this.emit('close', { id, reason });
  }

  _clearAllTimers() {
    for (const timer of this._timers.values()) {
      clearTimeout(timer);
    }
    this._timers.clear();
  }

  _onKeyDown(event) {
    if (event.key !== 'Escape') return;
    const last = this._toasts[this._toasts.length - 1];
    if (last) {
      event.stopPropagation();
      this._removeToast(last.id, 'escape');
    }
  }
}

export function defineTmToast() {
  if (typeof window === 'undefined' || !window.customElements) return;
  if (!window.customElements.get(TmToast.tagName)) {
    window.customElements.define(TmToast.tagName, TmToast);
  }
}

if (typeof window !== 'undefined' && window.customElements) {
  defineTmToast();
}
