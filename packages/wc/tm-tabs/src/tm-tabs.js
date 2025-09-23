import { TurboMiniElement } from '@turbomini/wc-core';

const styles = `
:host {
  display: block;
  --tm-tabs-border: 1px solid var(--tm-color-border);
  --tm-tabs-accent: var(--tm-color-brand);
  --tm-tabs-gap: var(--tm-space-4);
  --tm-tab-pad: var(--tm-space-3);
  --tm-tab-radius: var(--tm-radius-sm);
  --tm-tab-fg: var(--tm-color-text-muted);
  --tm-tab-fg-active: var(--tm-color-text);
  --tm-tab-bg: transparent;
  --tm-tab-bg-active: color-mix(in srgb, var(--tm-color-brand-soft) 55%, transparent);
  position: relative;
}

:host([hidden]) {
  display: none;
}

.container {
  display: flex;
  flex-direction: column;
  gap: var(--tm-tabs-gap);
}

.container[data-orientation='vertical'] {
  flex-direction: row;
}

.list {
  position: relative;
  display: inline-flex;
  border-bottom: var(--tm-tabs-border);
  gap: var(--tm-space-2);
}

.container[data-orientation='vertical'] .list {
  flex-direction: column;
  border-bottom: none;
  border-inline-start: var(--tm-tabs-border);
}

:host([fitted]) .list {
  width: 100%;
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
}

.container[data-orientation='vertical'] :host([fitted]) .list {
  grid-auto-flow: row;
  grid-auto-rows: 1fr;
}

::slotted([slot='tab']) {
  all: unset;
  cursor: pointer;
  padding: var(--tm-tab-pad);
  border-radius: var(--tm-tab-radius);
  color: var(--tm-tab-fg);
  background-color: var(--tm-tab-bg);
  font: inherit;
  line-height: 1.3;
  transition: color var(--tm-motion-duration-fast) var(--tm-motion-ease-out),
    background-color var(--tm-motion-duration-fast) var(--tm-motion-ease-out);
}

::slotted([slot='tab'][data-selected='true']) {
  color: var(--tm-tab-fg-active);
  background-color: var(--tm-tab-bg-active);
}

::slotted([slot='tab']:focus-visible) {
  outline: none;
  box-shadow: var(--tm-focus-ring);
}

.indicator {
  position: absolute;
  background-color: var(--tm-tabs-accent);
  border-radius: var(--tm-tab-radius);
  transition: transform var(--tm-motion-duration-normal) var(--tm-motion-ease-out),
    width var(--tm-motion-duration-normal) var(--tm-motion-ease-out),
    height var(--tm-motion-duration-normal) var(--tm-motion-ease-out);
  pointer-events: none;
}

.container[data-orientation='horizontal'] .indicator {
  bottom: -1px;
  height: 3px;
  transform: translateX(var(--_indicator-offset, 0));
  width: var(--_indicator-size, 0);
}

.container[data-orientation='vertical'] .indicator {
  left: -1px;
  width: 3px;
  transform: translateY(var(--_indicator-offset, 0));
  height: var(--_indicator-size, 0);
}

@media (prefers-reduced-motion: reduce) {
  .indicator {
    transition: none;
  }
}

.panels {
  display: block;
}

::slotted([slot='panel']) {
  display: none;
}

::slotted([slot='panel'][data-active='true']) {
  display: block;
}
`;

export class TmTabs extends TurboMiniElement {
  static tagName = 'tm-tabs';
  static props = {
    value: { type: 'string', reflect: true },
    orientation: { type: 'string', default: 'horizontal', reflect: true },
    fitted: { type: 'boolean', reflect: true },
  };
  static styles = styles;

  constructor() {
    super();
    this._onTabSlotChange = this._onTabSlotChange.bind(this);
    this._onPanelSlotChange = this._onPanelSlotChange.bind(this);
    this._onKeyDown = this._onKeyDown.bind(this);
    this._onTabClick = this._onTabClick.bind(this);
    this._resizeObserver = null;
    this._indicatorFrame = null;
  }

  render() {
    if (!this._container) {
      this.shadowRoot.innerHTML = `
        <div class="container" data-orientation="horizontal">
          <div class="list" part="list" role="tablist" aria-orientation="horizontal">
            <slot name="tab"></slot>
            <div class="indicator" part="tab-indicator"></div>
          </div>
          <div class="panels">
            <slot name="panel"></slot>
          </div>
        </div>
      `;
      this._container = this.shadowRoot.querySelector('.container');
      this._list = this.shadowRoot.querySelector('.list');
      this._indicator = this.shadowRoot.querySelector('.indicator');
      this._panelsWrapper = this.shadowRoot.querySelector('.panels');
      this._tabSlot = this.shadowRoot.querySelector('slot[name="tab"]');
      this._panelSlot = this.shadowRoot.querySelector('slot[name="panel"]');
      this._tabSlot.addEventListener('slotchange', this._onTabSlotChange);
      this._panelSlot.addEventListener('slotchange', this._onPanelSlotChange);
      this._list.addEventListener('keydown', this._onKeyDown);
      this._resizeObserver = new ResizeObserver(() => this._updateIndicator());
      this._resizeObserver.observe(this._list);
    }

    this._container.dataset.orientation = this.orientation === 'vertical' ? 'vertical' : 'horizontal';
    this._list.setAttribute('aria-orientation', this._container.dataset.orientation);

    this._collectTabs();
    this._collectPanels();
    this._syncSelection();
  }

  disconnectedCallback() {
    super.disconnectedCallback?.();
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    }
  }

  _onTabSlotChange() {
    this._collectTabs();
    this._syncSelection();
  }

  _onPanelSlotChange() {
    this._collectPanels();
    this._syncSelection();
  }

  _collectTabs() {
    const assigned = this._tabSlot?.assignedElements({ flatten: true }) ?? [];
    this._tabs = assigned.filter((el) => el.getAttribute?.('value'));
    this._tabs.forEach((tab, index) => {
      tab.setAttribute('role', 'tab');
      tab.dataset.index = String(index);
      tab.tabIndex = -1;
      if (!tab.id) tab.id = `tm-tab-${Math.random().toString(36).slice(2, 8)}`;
      if (!this._tabHandlers) this._tabHandlers = new Map();
      if (!this._tabHandlers.has(tab)) {
        const handler = this._onTabClick;
        tab.addEventListener('click', handler);
        this._tabHandlers.set(tab, handler);
      }
    });
    if (this._tabHandlers) {
      for (const [tab, handler] of this._tabHandlers.entries()) {
        if (!this._tabs.includes(tab)) {
          tab.removeEventListener('click', handler);
          this._tabHandlers.delete(tab);
        }
      }
    }
  }

  _collectPanels() {
    const assigned = this._panelSlot?.assignedElements({ flatten: true }) ?? [];
    this._panels = assigned.filter((el) => el.getAttribute?.('value'));
    this._panels.forEach((panel) => {
      panel.setAttribute('role', 'tabpanel');
      panel.tabIndex = 0;
    });
  }

  _syncSelection() {
    if (!this._tabs?.length) return;
    let currentValue = this.value;
    if (!currentValue || !this._tabs.some((tab) => tab.getAttribute('value') === currentValue)) {
      currentValue = this._tabs[0].getAttribute('value');
      this.value = currentValue;
    }

    this._tabs.forEach((tab) => {
      const value = tab.getAttribute('value');
      const selected = value === currentValue;
      tab.dataset.selected = selected ? 'true' : 'false';
      tab.setAttribute('aria-selected', selected ? 'true' : 'false');
      tab.tabIndex = selected ? 0 : -1;
    });

    if (this._tabs.length) {
      const activeTab = this._tabs.find((tab) => tab.getAttribute('value') === currentValue);
      if (activeTab) activeTab.tabIndex = 0;
    }

    this._panels?.forEach((panel) => {
      const value = panel.getAttribute('value');
      const tab = this._tabs.find((t) => t.getAttribute('value') === value);
      const selected = value === currentValue;
      panel.dataset.active = selected ? 'true' : 'false';
      panel.toggleAttribute('hidden', !selected);
      if (tab) {
        panel.setAttribute('aria-labelledby', tab.id);
      }
    });

    this._updateIndicator();
  }

  _onTabClick(event) {
    const tab = event.currentTarget;
    if (!tab || tab.dataset.selected === 'true') return;
    const value = tab.getAttribute('value');
    if (value == null) return;
    this.value = value;
    this.emit('change', { value });
    this._syncSelection();
  }

  _onKeyDown(event) {
    if (!this._tabs?.length) return;
    const orientation = this.orientation === 'vertical' ? 'vertical' : 'horizontal';
    const currentIndex = this._tabs.findIndex((tab) => tab.dataset.selected === 'true');
    let nextIndex = currentIndex;
    switch (event.key) {
      case 'ArrowRight':
        if (orientation === 'horizontal') {
          event.preventDefault();
          nextIndex = this._nextEnabledIndex(currentIndex + 1, 1);
        }
        break;
      case 'ArrowLeft':
        if (orientation === 'horizontal') {
          event.preventDefault();
          nextIndex = this._nextEnabledIndex(currentIndex - 1, -1);
        }
        break;
      case 'ArrowDown':
        if (orientation === 'vertical') {
          event.preventDefault();
          nextIndex = this._nextEnabledIndex(currentIndex + 1, 1);
        }
        break;
      case 'ArrowUp':
        if (orientation === 'vertical') {
          event.preventDefault();
          nextIndex = this._nextEnabledIndex(currentIndex - 1, -1);
        }
        break;
      case 'Home':
        event.preventDefault();
        nextIndex = this._nextEnabledIndex(0, 1, true);
        break;
      case 'End':
        event.preventDefault();
        nextIndex = this._nextEnabledIndex(this._tabs.length - 1, -1, true);
        break;
      case 'Enter':
      case ' ': {
        event.preventDefault();
        const active = this._tabs[currentIndex];
        active?.click();
        return;
      }
      default:
        return;
    }

    if (nextIndex !== currentIndex && nextIndex >= 0) {
      const tab = this._tabs[nextIndex];
      tab?.focus();
      tab?.click();
    }
  }

  _nextEnabledIndex(start, step, clamp = false) {
    let index = start;
    while (index >= 0 && index < this._tabs.length) {
      const tab = this._tabs[index];
      if (!tab?.hasAttribute('disabled')) return index;
      index += step;
    }
    if (clamp) return Math.max(0, Math.min(this._tabs.length - 1, start));
    index = step > 0 ? 0 : this._tabs.length - 1;
    while (index >= 0 && index < this._tabs.length) {
      const tab = this._tabs[index];
      if (!tab?.hasAttribute('disabled')) return index;
      index += step;
    }
    return start;
  }

  _updateIndicator() {
    if (!this._tabs?.length || !this._indicator) return;
    if (this._indicatorFrame) cancelAnimationFrame(this._indicatorFrame);
    this._indicatorFrame = requestAnimationFrame(() => {
      const selected = this._tabs.find((tab) => tab.dataset.selected === 'true');
      if (!selected) return;
      const rect = selected.getBoundingClientRect();
      const listRect = this._list.getBoundingClientRect();
      if (this.orientation === 'vertical') {
        const offset = rect.top - listRect.top;
        this._indicator.style.setProperty('--_indicator-offset', `${offset}px`);
        this._indicator.style.setProperty('--_indicator-size', `${rect.height}px`);
      } else {
        const offset = rect.left - listRect.left;
        this._indicator.style.setProperty('--_indicator-offset', `${offset}px`);
        this._indicator.style.setProperty('--_indicator-size', `${rect.width}px`);
      }
    });
  }
}

export function defineTmTabs() {
  if (typeof window === 'undefined' || !window.customElements) return;
  if (!window.customElements.get(TmTabs.tagName)) {
    window.customElements.define(TmTabs.tagName, TmTabs);
  }
}

if (typeof window !== 'undefined' && window.customElements) {
  defineTmTabs();
}
