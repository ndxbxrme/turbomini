import { TurboMiniElement } from '@turbomini/wc-core';
import '@turbomini/wc-radio';

const KEY_PREV = ['ArrowUp', 'ArrowLeft'];
const KEY_NEXT = ['ArrowDown', 'ArrowRight'];

const styles = `
:host {
  display: grid;
  gap: var(--tm-label-gap, var(--tm-space-2));
  color: var(--tm-color-text);
  font: inherit;
}

:host([hidden]) {
  display: none;
}

.label {
  font-weight: 600;
  color: var(--tm-color-text);
}

.label[hidden] {
  display: none;
}

.base {
  display: inline-flex;
  flex-wrap: wrap;
  gap: var(--tm-space-3);
}
`;

export class TmRadioGroup extends TurboMiniElement {
  static tagName = 'tm-radio-group';
  static formAssociated = true;
  static props = {
    name: { type: 'string', reflect: true },
    value: { type: 'string', reflect: true },
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
    this._onSlotChange = this._onSlotChange.bind(this);
    this._onKeyDown = this._onKeyDown.bind(this);
    this._defaultValue = this.value ?? null;
  }

  render() {
    if (!this._base) {
      this.shadowRoot.innerHTML = `
        <div class="wrapper">
          <span part="label" class="label" hidden><slot name="label"></slot></span>
          <div part="base" class="base" role="radiogroup">
            <slot></slot>
          </div>
        </div>
      `;
      this._labelEl = this.shadowRoot.querySelector('.label');
      this._base = this.shadowRoot.querySelector('.base');
      const defaultSlot = this.shadowRoot.querySelector('slot:not([name])');
      const labelSlot = this.shadowRoot.querySelector('slot[name="label"]');
      defaultSlot.addEventListener('slotchange', this._onSlotChange);
      labelSlot.addEventListener('slotchange', () => this._syncLabel());
      this._base.addEventListener('keydown', this._onKeyDown);
    }

    this._syncLabel();
    this._collectRadios();
    this._applyName();
    this._applyValue();
    this._syncTabOrder();
    this._syncInternals();
  }

  formResetCallback() {
    this.value = this._defaultValue ?? null;
    this._applyValue();
  }

  formStateRestoreCallback(state) {
    if (typeof state === 'string') {
      this.value = state;
    } else {
      this.value = null;
    }
    this._applyValue();
  }

  _onSlotChange() {
    this._collectRadios();
    this._applyName();
    this._applyValue();
    this._syncTabOrder();
  }

  _syncLabel() {
    if (!this._labelEl) return;
    const labelSlot = this.shadowRoot.querySelector('slot[name="label"]');
    const hasContent = labelSlot
      .assignedNodes({ flatten: true })
      .some((node) => (node.textContent ?? '').trim().length || node.nodeType === Node.ELEMENT_NODE);
    this._labelEl.hidden = !hasContent;
    if (hasContent) {
      this._base?.setAttribute('aria-labelledby', this._ensureLabelId());
    } else {
      this._base?.removeAttribute('aria-labelledby');
    }
  }

  _ensureLabelId() {
    if (!this._labelId) {
      this._labelId = `tm-radio-group-label-${Math.random().toString(36).slice(2, 8)}`;
      this._labelEl.id = this._labelId;
    }
    return this._labelId;
  }

  _collectRadios() {
    const slot = this.shadowRoot.querySelector('slot:not([name])');
    const assigned = slot ? slot.assignedElements({ flatten: true }) : [];
    this._radios = assigned.filter((el) => el.tagName?.toLowerCase() === 'tm-radio');
    if (!this._radioChangeHandlers) this._radioChangeHandlers = new Map();
    for (const radio of this._radios) {
      if (!this._radioChangeHandlers.has(radio)) {
        const handler = (event) => {
          event.stopPropagation();
          if (radio.disabled) return;
          this._handleRadioChecked(radio, event);
        };
        radio.addEventListener('tm-change', handler);
        this._radioChangeHandlers.set(radio, handler);
      }
    }
    for (const [radio, handler] of this._radioChangeHandlers.entries()) {
      if (!this._radios.includes(radio)) {
        radio.removeEventListener('tm-change', handler);
        this._radioChangeHandlers.delete(radio);
      }
    }
  }

  _applyName() {
    const name = this.name ?? this._generatedName ?? `tm-radio-group-${Math.random().toString(36).slice(2, 8)}`;
    if (!this.name) {
      this._generatedName = name;
    }
    for (const radio of this._radios) {
      radio.name = name;
    }
  }

  _applyValue() {
    let matched = false;
    for (const radio of this._radios) {
      const shouldCheck = this.value != null && radio.value === this.value;
      radio.checked = shouldCheck;
      if (shouldCheck) matched = true;
    }
    if (!matched && this.value != null) {
      this.value = null;
    }
  }

  _syncTabOrder() {
    const activeIndex = this._getActiveIndex();
    this._radios.forEach((radio, index) => {
      radio.setTabIndex(index === activeIndex ? 0 : -1);
    });
  }

  _getActiveIndex() {
    const checkedIndex = this._radios.findIndex((radio) => radio.checked && !radio.disabled);
    if (checkedIndex !== -1) return checkedIndex;
    const firstEnabled = this._radios.findIndex((radio) => !radio.disabled);
    return firstEnabled === -1 ? 0 : firstEnabled;
  }

  _onKeyDown(event) {
    if (KEY_PREV.includes(event.key)) {
      event.preventDefault();
      this._moveFocus(-1);
    } else if (KEY_NEXT.includes(event.key)) {
      event.preventDefault();
      this._moveFocus(1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      this._focusIndex(this._findNextEnabled(0, 1, true));
    } else if (event.key === 'End') {
      event.preventDefault();
      this._focusIndex(this._findNextEnabled(this._radios.length - 1, -1, true));
    }
  }

  _moveFocus(step) {
    const currentIndex = this._getActiveIndex();
    const nextIndex = this._findNextEnabled(currentIndex + step, step);
    this._focusIndex(nextIndex);
  }

  _focusIndex(index) {
    if (index == null || index < 0 || index >= this._radios.length) return;
    const radio = this._radios[index];
    if (radio.disabled) return;
    radio.focus();
    this._setCheckedRadio(radio, { focus: true });
  }

  _findNextEnabled(start, step, clamp = false) {
    if (!this._radios.length) return null;
    let index = start;
    while (index >= 0 && index < this._radios.length) {
      const radio = this._radios[index];
      if (radio && !radio.disabled) return index;
      index += step;
    }
    if (!clamp) {
      index = step > 0 ? 0 : this._radios.length - 1;
      while (index >= 0 && index < this._radios.length) {
        const radio = this._radios[index];
        if (radio && !radio.disabled) return index;
        index += step;
      }
    }
    return null;
  }

  _handleRadioChecked(radio, event) {
    this._setCheckedRadio(radio, { originalEvent: event });
  }

  _setCheckedRadio(radio, meta = {}) {
    if (!radio || radio.disabled) return;
    for (const other of this._radios) {
      other.checked = other === radio;
    }
    this.value = radio.value ?? null;
    this._syncTabOrder();
    this._syncInternals();
    this.emit('change', { value: this.value, originalEvent: meta.originalEvent ?? null });
  }

  _syncInternals() {
    if (!this._internals) return;
    if (this.value == null) {
      this._internals.setFormValue(null);
    } else {
      this._internals.setFormValue(this.value);
    }
    this._internals.setValidity({}, '');
  }
}

export function defineTmRadioGroup() {
  if (typeof window === 'undefined' || !window.customElements) return;
  if (!window.customElements.get(TmRadioGroup.tagName)) {
    window.customElements.define(TmRadioGroup.tagName, TmRadioGroup);
  }
}

if (typeof window !== 'undefined' && window.customElements) {
  defineTmRadioGroup();
}
