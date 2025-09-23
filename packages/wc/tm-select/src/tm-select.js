import { TurboMiniElement } from '@turbomini/wc-core';

class TmSelectOption extends HTMLElement {
  static get observedAttributes() {
    return ['value', 'disabled'];
  }

  connectedCallback() {
    this.setAttribute('slot', 'options');
    this.hidden = true;
  }

  attributeChangedCallback() {
    this.hidden = true;
  }

  get value() {
    return this.getAttribute('value') ?? this.textContent?.trim() ?? '';
  }

  set value(val) {
    if (val == null) {
      this.removeAttribute('value');
    } else {
      this.setAttribute('value', val);
    }
  }

  get disabled() {
    return this.hasAttribute('disabled');
  }

  set disabled(val) {
    if (val) {
      this.setAttribute('disabled', '');
    } else {
      this.removeAttribute('disabled');
    }
  }
}

if (typeof window !== 'undefined' && window.customElements && !window.customElements.get('tm-select-option')) {
  window.customElements.define('tm-select-option', TmSelectOption);
}

const styles = `
:host {
  position: relative;
  display: inline-block;
  width: 100%;
  max-width: 100%;
  --tm-select-trigger-bg: var(--tm-color-surface);
  --tm-select-trigger-fg: var(--tm-color-text);
  --tm-select-trigger-border: var(--tm-color-border);
  --tm-select-trigger-radius: var(--tm-radius-sm);
  --tm-select-trigger-pad: var(--tm-space-3);
  --tm-select-menu-bg: var(--tm-color-surface);
  --tm-select-menu-shadow: var(--tm-shadow-md);
  --tm-select-menu-border: var(--tm-color-border);
  --tm-select-option-bg-hover: color-mix(in srgb, var(--tm-color-border) 22%, transparent);
  --tm-select-option-bg-selected: color-mix(in srgb, var(--tm-color-brand-soft) 70%, transparent);
  --tm-select-max-height: 18rem;
}

:host([hidden]) {
  display: none;
}

:host([size='sm']) {
  --tm-select-trigger-pad: calc(var(--tm-space-2) + 0.1rem);
}

:host([size='lg']) {
  --tm-select-trigger-pad: calc(var(--tm-space-4) - 0.1rem);
}

.trigger {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  background-color: var(--tm-select-trigger-bg);
  color: var(--tm-select-trigger-fg);
  border: 1px solid var(--tm-select-trigger-border);
  border-radius: var(--tm-select-trigger-radius);
  padding: var(--tm-select-trigger-pad);
  gap: var(--tm-space-2);
  cursor: pointer;
  font: inherit;
  line-height: 1.4;
  transition: border-color var(--tm-motion-duration-fast) var(--tm-motion-ease-out),
    box-shadow var(--tm-motion-duration-fast) var(--tm-motion-ease-out);
}

.trigger[data-disabled="true"] {
  cursor: not-allowed;
  opacity: 0.6;
}

.trigger:focus-visible {
  outline: none;
  box-shadow: var(--tm-focus-ring);
}

.trigger-label {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: inherit;
}

.menu {
  position: absolute;
  inset-inline-start: 0;
  margin-top: var(--tm-space-2);
  min-width: 100%;
  max-height: var(--tm-select-max-height);
  background-color: var(--tm-select-menu-bg);
  border: 1px solid var(--tm-select-menu-border);
  border-radius: var(--tm-select-trigger-radius);
  box-shadow: var(--tm-select-menu-shadow);
  display: none;
  overflow: auto;
  z-index: var(--tm-z-dropdown);
}

.menu[data-open="true"] {
  display: block;
}

.option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--tm-space-3);
  padding: calc(var(--tm-select-trigger-pad) - 0.1rem) var(--tm-select-trigger-pad);
  cursor: pointer;
  font: inherit;
  color: var(--tm-color-text);
}

.option[data-disabled="true"] {
  cursor: not-allowed;
  opacity: 0.55;
}

.option[data-highlight="true"] {
  background-color: var(--tm-select-option-bg-hover);
}

.option[data-selected="true"] {
  background-color: var(--tm-select-option-bg-selected);
}

.option-check {
  width: 1.1rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
}

.option[data-selected="true"] .option-check {
  opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
  .trigger,
  .menu {
    transition: none;
  }
}
`;

export class TmSelect extends TurboMiniElement {
  static tagName = 'tm-select';
  static formAssociated = true;
  static props = {
    value: { type: 'string', reflect: true },
    disabled: { type: 'boolean', reflect: true },
    placeholder: { type: 'string', reflect: true },
    size: { type: 'string', default: 'md', reflect: true },
    name: { type: 'string', reflect: true },
    open: { type: 'boolean', reflect: true },
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
    this._items = [];
    this._highlightIndex = -1;
    this._triggerId = `tm-select-trigger-${Math.random().toString(36).slice(2, 8)}`;
    this._onTriggerClick = this._onTriggerClick.bind(this);
    this._onTriggerKeyDown = this._onTriggerKeyDown.bind(this);
    this._onMenuKeyDown = this._onMenuKeyDown.bind(this);
    this._onDocumentPointerDown = this._onDocumentPointerDown.bind(this);
    this._onSlotChange = this._onSlotChange.bind(this);
    this._onOptionPointerEnter = this._onOptionPointerEnter.bind(this);
    this._onOptionClick = this._onOptionClick.bind(this);
  }

  render() {
    if (!this._trigger) {
      this.shadowRoot.innerHTML = `
        <button part="trigger" class="trigger" type="button" aria-haspopup="listbox" aria-expanded="false">
          <span class="trigger-label"></span>
          <span part="icon" class="icon" aria-hidden="true">▾</span>
        </button>
        <div part="menu" class="menu" role="listbox"></div>
        <slot name="options" hidden></slot>
      `;
      this._trigger = this.shadowRoot.querySelector('.trigger');
      this._label = this.shadowRoot.querySelector('.trigger-label');
      this._icon = this.shadowRoot.querySelector('.icon');
      this._menu = this.shadowRoot.querySelector('.menu');
      this._optionsSlot = this.shadowRoot.querySelector('slot[name="options"]');
      this._trigger.addEventListener('click', this._onTriggerClick);
      this._trigger.addEventListener('keydown', this._onTriggerKeyDown);
      this._menu.addEventListener('keydown', this._onMenuKeyDown);
      this._optionsSlot.addEventListener('slotchange', this._onSlotChange);
    }

    this._trigger.id = this._triggerId;
    this._menu.setAttribute('aria-labelledby', this._triggerId);

    this._trigger.dataset.disabled = this.disabled ? 'true' : 'false';
    this._trigger.setAttribute('aria-expanded', this.open ? 'true' : 'false');
    this._trigger.setAttribute('aria-disabled', this.disabled ? 'true' : 'false');
    this._trigger.tabIndex = this.disabled ? -1 : 0;

    this._collectOptions();
    this._renderOptions();
    this._updateLabel();

    if (this.open) {
      this._openMenu();
    } else {
      this._closeMenu();
    }

    this._syncInternals();
  }

  formResetCallback() {
    this.value = null;
  }

  formStateRestoreCallback(state) {
    this.value = typeof state === 'string' ? state : null;
  }

  disconnectedCallback() {
    super.disconnectedCallback?.();
    if (typeof document !== 'undefined') {
      document.removeEventListener('pointerdown', this._onDocumentPointerDown);
    }
  }

  _collectOptions() {
    const optionElements = [
      ...Array.from(this.querySelectorAll('option')),
      ...Array.from(this.querySelectorAll('tm-select-option'))
    ];
    const items = [];
    optionElements.forEach((el) => {
      const element = el;
      if (!element.hasAttribute('slot')) {
        element.setAttribute('slot', 'options');
      }
      element.hidden = true;
      const value = element.value ?? element.getAttribute('value') ?? element.textContent?.trim() ?? '';
      const label = element.textContent?.trim() ?? value;
      const disabled = element.disabled ?? element.hasAttribute?.('disabled');
      items.push({ value, label, disabled: !!disabled, element });
    });
    this._items = items;
  }

  _renderOptions() {
    const existing = Array.from(this._menu.children);
    const needed = this._items.length;
    if (existing.length > needed) {
      existing.slice(needed).forEach((node) => node.remove());
    }
    this._items.forEach((item, index) => {
      let optionEl = existing[index];
      if (!optionEl) {
        optionEl = document.createElement('div');
        optionEl.className = 'option';
        optionEl.setAttribute('part', 'option');
        optionEl.setAttribute('role', 'option');
        optionEl.innerHTML = `
          <span part="option-label" class="option-label"></span>
          <span part="option-check" class="option-check" aria-hidden="true">✓</span>
        `;
        optionEl.addEventListener('pointerenter', this._onOptionPointerEnter);
        optionEl.addEventListener('click', this._onOptionClick);
        this._menu.append(optionEl);
      }
      optionEl.dataset.index = String(index);
      optionEl.dataset.disabled = item.disabled ? 'true' : 'false';
      const labelEl = optionEl.querySelector('.option-label');
      if (labelEl) labelEl.textContent = item.label;
      optionEl.setAttribute('aria-disabled', item.disabled ? 'true' : 'false');
      optionEl.setAttribute('aria-selected', this.value === item.value ? 'true' : 'false');
      optionEl.dataset.selected = this.value === item.value ? 'true' : 'false';
      if (item.disabled) {
        optionEl.tabIndex = -1;
      }
    });

    if (this._items.length) {
      const selectedIndex = this._items.findIndex((item) => item.value === this.value);
      if (selectedIndex >= 0) {
        this._setHighlight(selectedIndex, false);
      } else {
        this._setHighlight(this._findNextEnabled(0, 1), false);
      }
    } else {
      this._highlightIndex = -1;
    }
  }

  _updateLabel() {
    const selected = this._items.find((item) => item.value === this.value);
    if (selected) {
      this._label.textContent = selected.label;
      this._label.dataset.placeholder = 'false';
    } else {
      const placeholder = this.placeholder ?? '';
      this._label.textContent = placeholder;
      this._label.dataset.placeholder = 'true';
    }
  }

  _openMenu() {
    if (this.disabled) {
      this.open = false;
      return;
    }
    if (this._menu.dataset.open === 'true') return;
    this._menu.dataset.open = 'true';
    this._menu.setAttribute('tabindex', '-1');
    if (typeof document !== 'undefined') {
      document.addEventListener('pointerdown', this._onDocumentPointerDown);
    }
    queueMicrotask(() => {
      this._menu.focus({ preventScroll: true });
      this.emit('open', { open: true });
    });
  }

  _closeMenu() {
    if (this._menu.dataset.open !== 'true') return;
    this._menu.dataset.open = 'false';
    this._menu.removeAttribute('tabindex');
    if (typeof document !== 'undefined') {
      document.removeEventListener('pointerdown', this._onDocumentPointerDown);
    }
    this.emit('close', { open: false });
  }

  _onTriggerClick() {
    if (this.disabled) return;
    this.open = !this.open;
  }

  _onTriggerKeyDown(event) {
    if (this.disabled) return;
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp':
        event.preventDefault();
        this.open = true;
        break;
      case 'Enter':
      case ' ': {
        event.preventDefault();
        this.open = !this.open;
        break;
      }
      default:
        break;
    }
  }

  _onMenuKeyDown(event) {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this._moveHighlight(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this._moveHighlight(-1);
        break;
      case 'Home':
        event.preventDefault();
        this._setHighlight(this._findNextEnabled(0, 1));
        break;
      case 'End':
        event.preventDefault();
        this._setHighlight(this._findNextEnabled(this._items.length - 1, -1));
        break;
      case 'Enter':
      case ' ': {
        event.preventDefault();
        if (this._highlightIndex >= 0) {
          this._selectIndex(this._highlightIndex);
        }
        break;
      }
      case 'Escape':
        event.preventDefault();
        this.open = false;
        this._trigger.focus();
        break;
      case 'Tab':
        this.open = false;
        break;
      default:
        break;
    }
  }

  _onDocumentPointerDown(event) {
    if (!this.open) return;
    if (this._trigger.contains(event.target) || this._menu.contains(event.target)) {
      return;
    }
    this.open = false;
  }

  _onSlotChange() {
    this.requestRender();
  }

  _onOptionPointerEnter(event) {
    const target = event.currentTarget;
    const index = Number(target.dataset.index);
    if (!Number.isNaN(index) && !this._items[index]?.disabled) {
      this._setHighlight(index, false);
    }
  }

  _onOptionClick(event) {
    const target = event.currentTarget;
    const index = Number(target.dataset.index);
    if (!Number.isNaN(index) && !this._items[index].disabled) {
      this._selectIndex(index);
    }
  }

  _moveHighlight(delta) {
    if (!this._items.length) return;
    const nextIndex = this._findNextEnabled(this._highlightIndex + delta, delta);
    this._setHighlight(nextIndex);
  }

  _findNextEnabled(start, step) {
    if (!this._items.length) return -1;
    let index = start;
    while (index >= 0 && index < this._items.length) {
      if (!this._items[index].disabled) return index;
      index += step;
    }
    index = step > 0 ? 0 : this._items.length - 1;
    while (index >= 0 && index < this._items.length) {
      if (!this._items[index].disabled) return index;
      index += step;
    }
    return -1;
  }

  _setHighlight(index, emit = true) {
    if (index == null || index < 0 || index >= this._items.length) {
      this._highlightIndex = -1;
      this._menu.removeAttribute('aria-activedescendant');
      return;
    }
    if (index === this._highlightIndex) return;
    this._highlightIndex = index;
    const options = this._menu.querySelectorAll('.option');
    options.forEach((el) => {
      el.dataset.highlight = el.dataset.index === String(index) ? 'true' : 'false';
      if (el.dataset.highlight === 'true') {
        this._menu.setAttribute('aria-activedescendant', el.id || this._ensureOptionId(el));
        el.scrollIntoView({ block: 'nearest' });
      }
    });
    if (emit) {
      const highlighted = this._items[index];
      this.emit('highlight', { value: highlighted?.value ?? null });
    }
  }

  _ensureOptionId(el) {
    if (!el.id) {
      el.id = `tm-select-option-${Math.random().toString(36).slice(2, 8)}`;
    }
    return el.id;
  }

  _selectIndex(index) {
    const item = this._items[index];
    if (!item || item.disabled) return;
    const prevValue = this.value;
    if (item.value !== prevValue) {
      this.value = item.value;
      this.emit('change', { value: this.value, option: { label: item.label, value: item.value } });
    }
    this.open = false;
    this._trigger.focus();
  }

  _syncInternals() {
    if (!this._internals) return;
    if (this.disabled || this.value == null) {
      this._internals.setFormValue(null);
    } else {
      this._internals.setFormValue(this.value);
    }
    this._internals.setValidity({}, '');
  }
}

export function defineTmSelect() {
  if (typeof window === 'undefined' || !window.customElements) return;
  if (!window.customElements.get(TmSelect.tagName)) {
    window.customElements.define(TmSelect.tagName, TmSelect);
  }
}

if (typeof window !== 'undefined' && window.customElements) {
  defineTmSelect();
}
