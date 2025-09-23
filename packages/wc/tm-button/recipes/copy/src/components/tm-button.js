import { TurboMiniElement } from './tm-base-element.js';

const styles = `
:host {
  display: inline-block;
  --tm-button-bg: var(--tm-color-brand);
  --tm-button-bg-hover: color-mix(in srgb, var(--tm-color-brand) 95%, black 5%);
  --tm-button-bg-active: color-mix(in srgb, var(--tm-color-brand) 90%, black 10%);
  --tm-button-fg: var(--tm-color-brand-contrast);
  --tm-button-border: color-mix(in srgb, var(--tm-color-brand) 70%, transparent);
  --tm-button-border-hover: color-mix(in srgb, var(--tm-color-brand) 80%, transparent);
  --tm-button-shadow: var(--tm-shadow-sm);
  --tm-button-radius: var(--tm-radius-sm);
  --tm-button-font-weight: 600;
  --tm-button-font-size: var(--tm-font-size-sm);
  --tm-button-pad-y: var(--tm-space-2);
  --tm-button-pad-x: var(--tm-space-4);
  --tm-button-gap: var(--tm-space-2);
  --tm-button-min-height: 2.5rem;
}

:host([hidden]) {
  display: none;
}

:host([variant='soft']) {
  --tm-button-bg: color-mix(in srgb, var(--tm-color-brand-soft) 85%, transparent);
  --tm-button-bg-hover: color-mix(in srgb, var(--tm-color-brand-soft) 92%, var(--tm-color-brand) 8%);
  --tm-button-bg-active: color-mix(in srgb, var(--tm-color-brand-soft) 90%, var(--tm-color-brand) 12%);
  --tm-button-fg: var(--tm-color-brand);
  --tm-button-border: color-mix(in srgb, var(--tm-color-brand) 25%, transparent);
  --tm-button-border-hover: color-mix(in srgb, var(--tm-color-brand) 35%, transparent);
  --tm-button-shadow: none;
}

:host([variant='outline']) {
  --tm-button-bg: transparent;
  --tm-button-bg-hover: color-mix(in srgb, var(--tm-color-brand-soft) 65%, transparent);
  --tm-button-bg-active: color-mix(in srgb, var(--tm-color-brand-soft) 75%, transparent);
  --tm-button-fg: var(--tm-color-brand);
  --tm-button-border: color-mix(in srgb, var(--tm-color-brand) 55%, transparent);
  --tm-button-border-hover: color-mix(in srgb, var(--tm-color-brand) 65%, transparent);
  --tm-button-shadow: none;
}

:host([variant='ghost']) {
  --tm-button-bg: transparent;
  --tm-button-bg-hover: color-mix(in srgb, var(--tm-color-brand-soft) 50%, transparent);
  --tm-button-bg-active: color-mix(in srgb, var(--tm-color-brand-soft) 60%, transparent);
  --tm-button-fg: var(--tm-color-brand);
  --tm-button-border: transparent;
  --tm-button-border-hover: transparent;
  --tm-button-shadow: none;
}

:host([size='sm']) {
  --tm-button-pad-y: calc(var(--tm-space-2) - 0.1rem);
  --tm-button-pad-x: calc(var(--tm-space-3) + 0.1rem);
  --tm-button-font-size: var(--tm-font-size-xs);
  --tm-button-min-height: 2.25rem;
  --tm-button-gap: calc(var(--tm-space-2) - 0.1rem);
}

:host([size='lg']) {
  --tm-button-pad-y: var(--tm-space-3);
  --tm-button-pad-x: calc(var(--tm-space-5) + 0.25rem);
  --tm-button-font-size: var(--tm-font-size-lg);
  --tm-button-min-height: 3rem;
  --tm-button-gap: var(--tm-space-3);
}

:host([disabled]) button,
:host([loading]) button {
  cursor: not-allowed;
  box-shadow: none;
}

:host([loading]) .content {
  opacity: 0.65;
}

button {
  all: unset;
  font: inherit;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--tm-button-gap);
  min-height: var(--tm-button-min-height);
  border-radius: var(--tm-button-radius);
  padding: var(--tm-button-pad-y) var(--tm-button-pad-x);
  font-weight: var(--tm-button-font-weight);
  font-size: var(--tm-button-font-size);
  background-color: var(--tm-button-bg);
  color: var(--tm-button-fg);
  border: 1px solid var(--tm-button-border);
  box-shadow: var(--tm-button-shadow);
  transition:
    background-color var(--tm-motion-duration-fast) var(--tm-motion-ease-out),
    color var(--tm-motion-duration-fast) var(--tm-motion-ease-out),
    border-color var(--tm-motion-duration-fast) var(--tm-motion-ease-out),
    box-shadow var(--tm-motion-duration-fast) var(--tm-motion-ease-out),
    transform 120ms ease;
}

button:hover:not(:disabled) {
  background-color: var(--tm-button-bg-hover);
  border-color: var(--tm-button-border-hover);
}

button:active:not(:disabled) {
  background-color: var(--tm-button-bg-active);
  transform: translateY(0.5px);
}

button:focus-visible {
  outline: none;
  box-shadow: var(--tm-focus-ring);
}

button:disabled {
  opacity: 0.6;
}

.content {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: inherit;
}

.indicator {
  display: none;
  width: 1em;
  height: 1em;
  border-radius: 9999px;
  border: 2px solid currentColor;
  border-bottom-color: transparent;
  border-left-color: transparent;
  animation: tm-button-spin 640ms linear infinite;
}

:host([loading]) .indicator {
  display: inline-block;
}

@keyframes tm-button-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
`;

export class TmButton extends TurboMiniElement {
  static tagName = 'tm-button';
  static props = {
    variant: { type: 'string', default: 'solid', reflect: true },
    size: { type: 'string', default: 'md', reflect: true },
    disabled: { type: 'boolean', reflect: true },
    loading: { type: 'boolean', reflect: true },
    type: { type: 'string', default: 'button', reflect: true },
    value: { type: 'string' }
  };
  static styles = styles;

  constructor() {
    super();
    this._handleClick = this._handleClick.bind(this);
  }

  render() {
    if (!this._button) {
      this.shadowRoot.innerHTML = `
        <button part="base" type="button">
          <span part="content" class="content"><slot></slot></span>
          <span part="indicator" class="indicator" aria-hidden="true"></span>
        </button>
      `;
      this._button = this.shadowRoot.querySelector('button');
      this._button.addEventListener('click', this._handleClick);
    }

    this._button.disabled = Boolean(this.disabled) || Boolean(this.loading);
    this._button.type = this.type ?? 'button';
    this._button.dataset.variant = this.variant ?? 'solid';
    this._button.dataset.size = this.size ?? 'md';
    this._button.dataset.loading = this.loading ? 'true' : 'false';
    this._button.setAttribute('aria-busy', this.loading ? 'true' : 'false');
    this._button.setAttribute('aria-disabled', this.disabled ? 'true' : 'false');

    if (this.value != null) {
      this._button.value = this.value;
    } else {
      this._button.removeAttribute('value');
    }
  }

  _handleClick(event) {
    if (this.disabled || this.loading) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    this.emit('press', { originalEvent: event, value: this.value ?? null });
  }
}

export function defineTmButton() {
  if (typeof window === 'undefined' || !window.customElements) return;
  if (!window.customElements.get(TmButton.tagName)) {
    window.customElements.define(TmButton.tagName, TmButton);
  }
}

if (typeof window !== 'undefined' && window.customElements) {
  defineTmButton();
}
