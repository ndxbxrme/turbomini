import { TurboMiniElement } from '@turbomini/wc-core';

let checkboxIds = 0;
function nextId() {
  checkboxIds += 1;
  return `tm-checkbox-${checkboxIds}`;
}

const styles = `
:host {
  display: inline-flex;
  align-items: center;
  --tm-control-size: 1.05rem;
  --tm-control-bg: var(--tm-color-surface);
  --tm-control-border: var(--tm-color-border);
  --tm-control-checked-bg: var(--tm-color-brand);
  --tm-control-radius: var(--tm-radius-sm);
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
  transition: background-color var(--tm-motion-duration-fast) var(--tm-motion-ease-out),
    border-color var(--tm-motion-duration-fast) var(--tm-motion-ease-out);
}

:host([checked]) .control {
  background-color: var(--tm-control-checked-bg);
  border-color: var(--tm-control-checked-bg);
  color: var(--tm-color-brand-contrast);
}

.indicator {
  width: 60%;
  height: 60%;
  border-radius: calc(var(--tm-control-radius) * 0.6);
  transform: scale(0);
  opacity: 0;
  background-color: currentColor;
  transition: transform var(--tm-motion-duration-fast) var(--tm-motion-ease-out),
    opacity var(--tm-motion-duration-fast) var(--tm-motion-ease-out);
}

:host([checked]) .indicator {
  transform: scale(1);
  opacity: 1;
}

:host([indeterminate]) .indicator {
  width: 70%;
  height: 2px;
  border-radius: var(--tm-radius-xs);
  transform: scale(1);
  opacity: 1;
}

.label[hidden] {
  display: none;
}
`;

export class TmCheckbox extends TurboMiniElement {
  static tagName = 'tm-checkbox';
  static formAssociated = true;
  static props = {
    checked: { type: 'boolean', reflect: true },
    indeterminate: { type: 'boolean', reflect: true },
    disabled: { type: 'boolean', reflect: true },
    name: { type: 'string', reflect: true },
    value: { type: 'string', default: 'on' },
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
          <input class="native" type="checkbox" />
          <span part="control" class="control">
            <span part="indicator" class="indicator"></span>
          </span>
          <span part="label" class="label"><slot></slot></span>
        </label>
      `;
      this._input = this.shadowRoot.querySelector('input');
      this._labelEl = this.shadowRoot.querySelector('.label');
      this._control = this.shadowRoot.querySelector('.control');
      this._input.id = this._id;
      this._input.addEventListener('change', this._onChange);
      const slot = this.shadowRoot.querySelector('slot');
      slot.addEventListener('slotchange', this._onSlotChange);
    }

    this._input.checked = Boolean(this.checked);
    this._input.disabled = Boolean(this.disabled);
    this._input.indeterminate = Boolean(this.indeterminate);

    if (this.name != null) {
      this._input.name = this.name;
    } else {
      this._input.removeAttribute('name');
    }

    this._input.value = this.value ?? 'on';

    this._syncLabel();
    this._syncInternals();
  }

  formResetCallback() {
    this.checked = false;
    this.indeterminate = false;
  }

  formStateRestoreCallback(state) {
    if (typeof state === 'string') {
      this.checked = state === this.value;
    } else if (state === true) {
      this.checked = true;
    } else {
      this.checked = false;
    }
  }

  _onChange(event) {
    if (this.disabled) {
      event.preventDefault();
      return;
    }
    const isChecked = this._input.checked;
    this.checked = isChecked;
    this.indeterminate = this._input.indeterminate;
    this.emit('change', {
      checked: this.checked,
      indeterminate: this.indeterminate,
      value: this.value ?? 'on',
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

export function defineTmCheckbox() {
  if (typeof window === 'undefined' || !window.customElements) return;
  if (!window.customElements.get(TmCheckbox.tagName)) {
    window.customElements.define(TmCheckbox.tagName, TmCheckbox);
  }
}

if (typeof window !== 'undefined' && window.customElements) {
  defineTmCheckbox();
}
