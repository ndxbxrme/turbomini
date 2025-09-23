import { TurboMiniElement } from '@turbomini/wc-core';

let switchId = 0;
function nextId() {
  switchId += 1;
  return `tm-switch-${switchId}`;
}

const styles = `
:host {
  display: inline-flex;
  align-items: center;
  --tm-switch-track-bg: var(--tm-color-border);
  --tm-switch-track-bg-checked: var(--tm-color-brand);
  --tm-switch-thumb-bg: var(--tm-color-surface);
  --tm-switch-radius: var(--tm-radius-full);
  --tm-switch-gap: var(--tm-space-2);
  cursor: pointer;
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
  gap: var(--tm-switch-gap);
  cursor: inherit;
}

.control {
  position: absolute;
  opacity: 0;
  pointer-events: none;
  width: 0;
  height: 0;
}

.track {
  --_height: 1.25rem;
  --_width: calc(var(--_height) * 1.75);
  position: relative;
  display: inline-flex;
  align-items: center;
  width: var(--_width);
  height: var(--_height);
  border-radius: var(--tm-switch-radius);
  background-color: var(--tm-switch-track-bg);
  transition: background-color var(--tm-motion-duration-fast) var(--tm-motion-ease-out);
}

:host([size='sm']) .track {
  --_height: 1rem;
}

:host([size='lg']) .track {
  --_height: 1.5rem;
}

.thumb {
  position: absolute;
  inset-inline-start: 0.15rem;
  width: calc(var(--_height) - 0.3rem);
  height: calc(var(--_height) - 0.3rem);
  border-radius: var(--tm-radius-full);
  background-color: var(--tm-switch-thumb-bg);
  transition: transform var(--tm-motion-duration-fast) var(--tm-motion-ease-out);
  box-shadow: var(--tm-shadow-sm);
}

:host([checked]) .track {
  background-color: var(--tm-switch-track-bg-checked);
}

:host([checked]) .thumb {
  transform: translateX(calc(var(--_width) - var(--_height)));
}

:host([disabled]) .track {
  box-shadow: none;
}

.base:focus-within .track {
  outline: none;
  box-shadow: var(--tm-focus-ring);
}

.label {
  color: var(--tm-color-text);
  font-size: 0.95em;
}

.label[hidden] {
  display: none;
}
`;

export class TmSwitch extends TurboMiniElement {
  static tagName = 'tm-switch';
  static formAssociated = true;
  static props = {
    checked: { type: 'boolean', reflect: true },
    disabled: { type: 'boolean', reflect: true },
    name: { type: 'string', reflect: true },
    value: { type: 'string' },
    size: { type: 'string', default: 'md', reflect: true },
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
          <input class="control" type="checkbox" role="switch" />
          <span part="track" class="track">
            <span part="thumb" class="thumb"></span>
          </span>
          <span part="label" class="label" hidden><slot></slot></span>
        </label>
      `;

      this._labelEl = this.shadowRoot.querySelector('.label');
      this._input = this.shadowRoot.querySelector('input');
      this._track = this.shadowRoot.querySelector('.track');
      const slot = this.shadowRoot.querySelector('slot');
      this._input.id = this._id;
      this._input.addEventListener('change', this._onChange);
      slot.addEventListener('slotchange', this._onSlotChange);
    }

    this._input.checked = Boolean(this.checked);
    this._input.disabled = Boolean(this.disabled);
    this._input.setAttribute('aria-checked', this.checked ? 'true' : 'false');
    this._track.setAttribute('aria-hidden', 'true');

    if (this.name != null) {
      this._input.name = this.name;
    } else {
      this._input.removeAttribute('name');
    }

    if (this.value != null) {
      this._input.value = this.value;
    } else {
      this._input.value = 'on';
    }

    this._syncLabel();
    this._syncInternals();
  }

  formResetCallback() {
    this.checked = false;
  }

  formStateRestoreCallback(state) {
    this.checked = state === true || state === 'true';
  }

  _onChange(event) {
    if (this.disabled) {
      event.preventDefault();
      return;
    }
    const nextChecked = this._input.checked;
    if (nextChecked !== this.checked) {
      this.checked = nextChecked;
    }
    this.emit('change', {
      checked: this.checked,
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

export function defineTmSwitch() {
  if (typeof window === 'undefined' || !window.customElements) return;
  if (!window.customElements.get(TmSwitch.tagName)) {
    window.customElements.define(TmSwitch.tagName, TmSwitch);
  }
}

if (typeof window !== 'undefined' && window.customElements) {
  defineTmSwitch();
}
