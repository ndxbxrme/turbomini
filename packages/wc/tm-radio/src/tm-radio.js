import { TurboMiniElement } from '@turbomini/wc-core';

let radioIds = 0;
function nextId() {
  radioIds += 1;
  return `tm-radio-${radioIds}`;
}

const styles = `
:host {
  display: inline-flex;
  align-items: center;
  --tm-control-size: 1.05rem;
  --tm-control-bg: var(--tm-color-surface);
  --tm-control-border: var(--tm-color-border);
  --tm-control-checked-bg: var(--tm-color-brand);
  --tm-control-radius: var(--tm-radius-full);
  --tm-label-gap: var(--tm-space-2);
  color: var(--tm-color-text);
  font: inherit;
}

:host([hidden]) {
  display: none;
}

:host([disabled]) {
  opacity: 0.6;
  cursor: not-allowed;
}

.base {
  display: inline-flex;
  align-items: center;
  gap: var(--tm-label-gap);
  cursor: pointer;
}

.base:focus-within .control {
  box-shadow: var(--tm-focus-ring);
}

input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
  width: 0;
  height: 0;
}

.control {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--tm-control-size);
  height: var(--tm-control-size);
  border-radius: var(--tm-control-radius);
  border: 1px solid var(--tm-control-border);
  background-color: var(--tm-control-bg);
  transition: border-color var(--tm-motion-duration-fast) var(--tm-motion-ease-out);
}

:host([checked]) .control {
  border-color: var(--tm-control-checked-bg);
}

.indicator {
  width: 55%;
  height: 55%;
  border-radius: var(--tm-radius-full);
  background-color: var(--tm-control-checked-bg);
  transform: scale(0);
  opacity: 0;
  transition: transform var(--tm-motion-duration-fast) var(--tm-motion-ease-out),
    opacity var(--tm-motion-duration-fast) var(--tm-motion-ease-out);
}

:host([checked]) .indicator {
  transform: scale(1);
  opacity: 1;
}

.label[hidden] {
  display: none;
}
`;

export class TmRadio extends TurboMiniElement {
  static tagName = 'tm-radio';
  static formAssociated = true;
  static props = {
    checked: { type: 'boolean', reflect: true },
    disabled: { type: 'boolean', reflect: true },
    name: { type: 'string', reflect: true },
    value: { type: 'string' },
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
    this._onChange = this._onChange.bind(this);
    this._onSlotChange = this._onSlotChange.bind(this);
    this._id = nextId();
  }

  render() {
    if (!this._input) {
      this.shadowRoot.innerHTML = `
        <label part="base" class="base">
          <input class="native" type="radio" />
          <span part="control" class="control">
            <span part="indicator" class="indicator"></span>
          </span>
          <span part="label" class="label"><slot></slot></span>
        </label>
      `;
      this._input = this.shadowRoot.querySelector('input');
      this._labelEl = this.shadowRoot.querySelector('.label');
      this._input.id = this._id;
      this._input.addEventListener('change', this._onChange);
      const slot = this.shadowRoot.querySelector('slot');
      slot.addEventListener('slotchange', this._onSlotChange);
    }

    this._input.checked = Boolean(this.checked);
    this._input.disabled = Boolean(this.disabled);

    if (this.name != null) {
      this._input.name = this.name;
    } else {
      this._input.removeAttribute('name');
    }

    if (this.value != null) {
      this._input.value = this.value;
    } else {
      this._input.removeAttribute('value');
    }

    this._syncLabel();
    this._syncInternals();
  }

  focus(options) {
    this._input?.focus(options);
  }

  setTabIndex(value) {
    if (this._input) {
      this._input.tabIndex = value;
    }
  }

  formResetCallback() {
    this.checked = false;
  }

  formStateRestoreCallback(state) {
    if (typeof state === 'string') {
      this.checked = state === this.value;
    } else {
      this.checked = Boolean(state);
    }
  }

  _onChange(event) {
    if (this.disabled) {
      event.preventDefault();
      return;
    }
    if (!this.checked) {
      this.checked = true;
    }
    this.emit('change', {
      checked: this.checked,
      value: this.value ?? null,
      originalEvent: event,
    });
    this._syncInternals();
  }

  _onSlotChange() {
    this._syncLabel();
  }

  _syncLabel() {
    if (!this._labelEl) return;
    const slot = this.shadowRoot.querySelector('slot');
    const hasContent = slot
      .assignedNodes({ flatten: true })
      .some((node) => (node.textContent ?? '').trim().length || node.nodeType === Node.ELEMENT_NODE);
    this._labelEl.hidden = !hasContent;
  }

  _syncInternals() {
    if (!this._internals) return;
    if (this.disabled || !this.checked) {
      this._internals.setFormValue(null);
    } else {
      this._internals.setFormValue(this.value ?? 'on');
    }
    this._internals.setValidity({}, '');
  }
}

export function defineTmRadio() {
  if (typeof window === 'undefined' || !window.customElements) return;
  if (!window.customElements.get(TmRadio.tagName)) {
    window.customElements.define(TmRadio.tagName, TmRadio);
  }
}

if (typeof window !== 'undefined' && window.customElements) {
  defineTmRadio();
}
