import { TurboMiniElement } from './tm-base-element.js';

let idCounter = 0;
function nextId(prefix) {
  idCounter += 1;
  return `${prefix}${idCounter}`;
}

const styles = `
:host {
  display: inline-block;
  max-width: 100%;
  --tm-input-bg: var(--tm-color-surface);
  --tm-input-fg: var(--tm-color-text);
  --tm-input-border: var(--tm-color-border);
  --tm-input-border-focus: var(--tm-color-brand);
  --tm-input-radius: var(--tm-radius-sm);
  --tm-input-pad-x: var(--tm-space-3);
  --tm-input-pad-y: calc(var(--tm-space-2) - 0.1rem);
  --tm-input-shadow-focus: var(--tm-focus-ring);
  color: var(--tm-input-fg);
  font-family: inherit;
}

:host([hidden]) {
  display: none !important;
}

:host([size='sm']) {
  --tm-input-pad-y: calc(var(--tm-space-2) - 0.2rem);
  --tm-input-pad-x: calc(var(--tm-space-2) + 0.05rem);
  font-size: var(--tm-font-size-sm);
}

:host([size='lg']) {
  --tm-input-pad-y: calc(var(--tm-space-3) - 0.05rem);
  --tm-input-pad-x: calc(var(--tm-space-4) + 0.15rem);
  font-size: var(--tm-font-size-lg);
}

.wrapper {
  display: grid;
  gap: var(--tm-space-1);
}

.label {
  font-size: 0.9em;
  font-weight: 600;
  color: var(--tm-color-text);
  cursor: pointer;
}

.label[hidden] {
  display: none;
}

.field {
  position: relative;
  display: inline-flex;
  align-items: center;
  width: 100%;
  border: 1px solid var(--tm-input-border);
  border-radius: var(--tm-input-radius);
  background-color: var(--tm-input-bg);
  transition: border-color var(--tm-motion-duration-fast) var(--tm-motion-ease-out),
    box-shadow var(--tm-motion-duration-fast) var(--tm-motion-ease-out);
}

.field:focus-within {
  border-color: var(--tm-input-border-focus);
  box-shadow: var(--tm-input-shadow-focus);
}

.field[aria-disabled='true'] {
  opacity: 0.65;
  cursor: not-allowed;
}

input {
  all: unset;
  box-sizing: border-box;
  flex: 1 1 auto;
  width: 100%;
  padding: var(--tm-input-pad-y) var(--tm-input-pad-x);
  font: inherit;
  color: inherit;
  background: transparent;
  border-radius: inherit;
}

input::placeholder {
  color: color-mix(in srgb, var(--tm-input-fg) 55%, transparent);
}

.icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: inherit;
}

.icon[hidden] {
  display: none;
}

.icon--start {
  margin-inline-start: var(--tm-input-pad-x);
}

.icon--end {
  margin-inline-end: var(--tm-input-pad-x);
}

.hint,
.error {
  font-size: 0.85em;
  color: var(--tm-color-text-muted);
}

.error {
  color: var(--tm-color-danger);
}

.hint[hidden],
.error[hidden] {
  display: none;
}
`;

export class TmInput extends TurboMiniElement {
  static tagName = 'tm-input';
  static formAssociated = true;
  static props = {
    value: { type: 'string', default: '' },
    type: { type: 'string', default: 'text', reflect: true },
    placeholder: { type: 'string', reflect: true },
    size: { type: 'string', default: 'md', reflect: true },
    disabled: { type: 'boolean', reflect: true },
    required: { type: 'boolean', reflect: true },
    invalid: { type: 'boolean', reflect: true },
    name: { type: 'string', reflect: true },
    autocomplete: { type: 'string', reflect: true },
  };
  static styles = styles;

  constructor() {
    super();
    this._internals = null;
    if (typeof this.attachInternals === 'function') {
      try {
        this._internals = this.attachInternals();
      } catch {
        this._internals = null;
      }
    }
    this._defaultValue = '';
    this._onInput = this._onInput.bind(this);
    this._onChange = this._onChange.bind(this);
    this._onFocus = this._onFocus.bind(this);
    this._onBlur = this._onBlur.bind(this);
    this._handleSlots = this._handleSlots.bind(this);
    this._inputId = nextId('tm-input-');
  }

  connectedCallback() {
    super.connectedCallback();
    if (this._defaultValue === '') {
      this._defaultValue = this.value ?? '';
    }
  }

  render() {
    if (!this._input) {
      this.shadowRoot.innerHTML = `
        <div class="wrapper">
          <label part="label" class="label" hidden>
            <slot name="label"></slot>
          </label>
          <div class="field" part="control" aria-disabled="false">
            <span class="icon icon--start" part="icon-start" hidden>
              <slot name="icon-start"></slot>
            </span>
            <input id="${this._inputId}" />
            <span class="icon icon--end" part="icon-end" hidden>
              <slot name="icon-end"></slot>
            </span>
          </div>
          <div class="hint" part="hint" hidden></div>
          <div class="error" part="error" hidden></div>
        </div>
      `;

      this._wrapper = this.shadowRoot.querySelector('.wrapper');
      this._label = this.shadowRoot.querySelector('.label');
      this._field = this.shadowRoot.querySelector('.field');
      this._input = this.shadowRoot.querySelector('input');
      this._iconStart = this.shadowRoot.querySelector('.icon--start');
      this._iconEnd = this.shadowRoot.querySelector('.icon--end');
      this._hint = this.shadowRoot.querySelector('.hint');
      this._error = this.shadowRoot.querySelector('.error');

      this._input.addEventListener('input', this._onInput);
      this._input.addEventListener('change', this._onChange);
      this._input.addEventListener('focus', this._onFocus);
      this._input.addEventListener('blur', this._onBlur);

      const labelSlot = this.shadowRoot.querySelector('slot[name="label"]');
      const hintSlot = document.createElement('slot');
      hintSlot.name = 'hint';
      const errorSlot = document.createElement('slot');
      errorSlot.name = 'error';
      this._hint.append(hintSlot);
      this._error.append(errorSlot);

      labelSlot.addEventListener('slotchange', this._handleSlots);
      hintSlot.addEventListener('slotchange', this._handleSlots);
      errorSlot.addEventListener('slotchange', this._handleSlots);

      const iconStartSlot = this.shadowRoot.querySelector('slot[name="icon-start"]');
      const iconEndSlot = this.shadowRoot.querySelector('slot[name="icon-end"]');
      iconStartSlot.addEventListener('slotchange', this._handleSlots);
      iconEndSlot.addEventListener('slotchange', this._handleSlots);
    }

    const value = this.value ?? '';
    if (this._input.value !== value) {
      this._input.value = value;
    }

    const type = this.type ?? 'text';
    this._input.type = type;

    if (this.placeholder != null) {
      this._input.placeholder = this.placeholder;
    } else {
      this._input.removeAttribute('placeholder');
    }

    this._input.disabled = Boolean(this.disabled);
    this._input.required = Boolean(this.required);
    this._input.setAttribute('aria-required', this.required ? 'true' : 'false');
    this._field.setAttribute('aria-disabled', this.disabled ? 'true' : 'false');

    if (this.name != null) {
      this._input.name = this.name;
    } else {
      this._input.removeAttribute('name');
    }

    if (this.autocomplete != null) {
      this._input.autocomplete = this.autocomplete;
    } else {
      this._input.removeAttribute('autocomplete');
    }

    this._input.setAttribute('aria-invalid', this.invalid ? 'true' : 'false');

    this._syncSlots();
    this._syncDescribedBy();
    this._syncInternals();
  }

  formAssociatedCallback(form) {
    this._form = form ?? null;
  }

  formResetCallback() {
    this.value = this._defaultValue;
  }

  formStateRestoreCallback(state) {
    if (typeof state === 'string') {
      this.value = state;
    }
  }

  _handleSlots() {
    this._syncSlots();
    this._syncDescribedBy();
  }

  _syncSlots() {
    if (!this.shadowRoot) return;
    const labelSlot = this.shadowRoot.querySelector('slot[name="label"]');
    const hintSlot = this._hint?.querySelector('slot[name="hint"]');
    const errorSlot = this._error?.querySelector('slot[name="error"]');
    const iconStartSlot = this.shadowRoot.querySelector('slot[name="icon-start"]');
    const iconEndSlot = this.shadowRoot.querySelector('slot[name="icon-end"]');

    const hasLabel = labelSlot && labelSlot.assignedNodes({ flatten: true }).some((node) => node.textContent?.trim());
    this._label.hidden = !hasLabel;
    if (hasLabel) {
      if (!this._labelId) this._labelId = nextId('tm-input-label-');
      this._label.id = this._labelId;
      this._label.htmlFor = this._inputId;
      this._input.setAttribute('aria-labelledby', this._labelId);
    } else {
      this._label.removeAttribute('for');
      this._input.removeAttribute('aria-labelledby');
    }

    const hasHint = hintSlot && hintSlot.assignedNodes({ flatten: true }).some((node) => node.textContent?.trim());
    this._hint.hidden = !hasHint;
    const hasError = errorSlot && errorSlot.assignedNodes({ flatten: true }).some((node) => node.textContent?.trim());
    this._error.hidden = !hasError;

    const hasIconStart = iconStartSlot && iconStartSlot.assignedNodes({ flatten: true }).some((node) => node.nodeType === Node.ELEMENT_NODE || (node.textContent ?? '').trim());
    const hasIconEnd = iconEndSlot && iconEndSlot.assignedNodes({ flatten: true }).some((node) => node.nodeType === Node.ELEMENT_NODE || (node.textContent ?? '').trim());
    this._iconStart.hidden = !hasIconStart;
    this._iconEnd.hidden = !hasIconEnd;
  }

  _syncDescribedBy() {
    if (!this._input) return;
    const ids = [];
    if (!this._hint.hidden) {
      if (!this._hintId) {
        this._hintId = nextId('tm-input-hint-');
        this._hint.id = this._hintId;
      }
      ids.push(this._hintId);
    }
    if (!this._error.hidden) {
      if (!this._errorId) {
        this._errorId = nextId('tm-input-error-');
        this._error.id = this._errorId;
      }
      ids.push(this._errorId);
    }
    if (ids.length) {
      this._input.setAttribute('aria-describedby', ids.join(' '));
    } else {
      this._input.removeAttribute('aria-describedby');
    }
  }

  _syncInternals() {
    if (!this._internals || !this._input) return;
    if (this.disabled) {
      this._internals.setFormValue(null);
    } else {
      this._internals.setFormValue(this.value ?? '');
    }

    if (this.invalid) {
      const message = this._input.validationMessage || 'Invalid value';
      this._internals.setValidity({ customError: true }, message, this._input);
      return;
    }

    if (this._input.checkValidity()) {
      this._internals.setValidity({}, '');
    } else {
      const message = this._input.validationMessage || 'Invalid value';
      this._internals.setValidity({ customError: true }, message, this._input);
    }
  }

  _onInput(event) {
    if (this.disabled) return;
    const nextValue = this._input.value;
    if (nextValue !== this.value) {
      this.value = nextValue;
    }
    this.emit('input', { value: nextValue, originalEvent: event });
  }

  _onChange(event) {
    if (this.disabled) return;
    const nextValue = this._input.value;
    if (nextValue !== this.value) {
      this.value = nextValue;
    }
    this.emit('change', { value: nextValue, originalEvent: event });
  }

  _onFocus(event) {
    this.emit('focus', { originalEvent: event });
  }

  _onBlur(event) {
    this.emit('blur', { originalEvent: event });
    this._syncInternals();
  }
}

export function defineTmInput() {
  if (typeof window === 'undefined' || !window.customElements) return;
  if (!window.customElements.get(TmInput.tagName)) {
    window.customElements.define(TmInput.tagName, TmInput);
  }
}

if (typeof window !== 'undefined' && window.customElements) {
  defineTmInput();
}
