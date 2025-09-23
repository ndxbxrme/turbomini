import { TurboMiniElement } from '@turbomini/wc-core';

const styles = `
:host {
  position: fixed;
  inset: 0;
  z-index: var(--tm-z-dialog, var(--tm-z-overlay));
  display: block;
  pointer-events: none;
  --tm-dialog-bg: var(--tm-color-surface);
  --tm-dialog-fg: var(--tm-color-text);
  --tm-dialog-radius: var(--tm-radius-xl);
  --tm-dialog-shadow: var(--tm-shadow-lg);
  --tm-dialog-pad: var(--tm-space-6);
  --tm-overlay-bg: var(--tm-color-backdrop);
}

:host([hidden]) {
  display: none;
}

.overlay {
  position: fixed;
  inset: 0;
  background-color: var(--tm-overlay-bg);
  opacity: 0;
  visibility: hidden;
  transition: opacity var(--tm-motion-duration-normal) var(--tm-motion-ease-out);
}

:host([open]) .overlay {
  visibility: visible;
  opacity: 1;
}

.overlay[data-non-modal="true"] {
  background-color: transparent;
  pointer-events: none;
}

.wrapper {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  padding: var(--tm-space-6);
  pointer-events: none;
}

:host([open]) .wrapper {
  pointer-events: auto;
}

.dialog {
  position: relative;
  max-width: min(40rem, 90vw);
  max-height: 90vh;
  overflow: hidden auto;
  border-radius: var(--tm-dialog-radius);
  background-color: var(--tm-dialog-bg);
  color: var(--tm-dialog-fg);
  box-shadow: var(--tm-dialog-shadow);
  padding: var(--tm-dialog-pad);
  display: grid;
  gap: var(--tm-space-4);
  transform: translateY(12px);
  opacity: 0;
  transition:
    opacity var(--tm-motion-duration-normal) var(--tm-motion-ease-out),
    transform var(--tm-motion-duration-normal) var(--tm-motion-ease-out);
}

:host([open]) .dialog {
  transform: translateY(0);
  opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
  .overlay,
  .dialog {
    transition: none;
  }
}

.title {
  font-size: var(--tm-font-size-lg);
  font-weight: 600;
  color: inherit;
}

.title[hidden],
.footer[hidden] {
  display: none;
}

.close {
  position: absolute;
  top: var(--tm-space-3);
  right: var(--tm-space-3);
  border: none;
  background: none;
  color: inherit;
  font: inherit;
  cursor: pointer;
  padding: var(--tm-space-1);
  border-radius: var(--tm-radius-full);
  line-height: 1;
}

.close:hover {
  background-color: color-mix(in srgb, currentColor 12%, transparent);
}

.close:focus-visible {
  outline: none;
  box-shadow: var(--tm-focus-ring);
}

.body {
  display: block;
  color: inherit;
}

.footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--tm-space-3);
}

.sentinel {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}
`;

let scrollLocks = 0;
let previousOverflow = '';

function lockScroll() {
  if (typeof document === 'undefined') return;
  if (scrollLocks === 0) {
    const target = document.documentElement;
    previousOverflow = target.style.overflow;
    target.style.overflow = 'hidden';
  }
  scrollLocks += 1;
}

function unlockScroll() {
  if (typeof document === 'undefined') return;
  scrollLocks = Math.max(0, scrollLocks - 1);
  if (scrollLocks === 0) {
    document.documentElement.style.overflow = previousOverflow;
  }
}

export class TmDialog extends TurboMiniElement {
  static tagName = 'tm-dialog';
  static props = {
    open: { type: 'boolean', reflect: true },
    modal: { type: 'boolean', reflect: true, default: true },
    closable: { type: 'boolean', reflect: true, default: true },
    initialFocus: { type: 'string', reflect: true },
  };
  static styles = styles;

  constructor() {
    super();
    this._onOverlayClick = this._onOverlayClick.bind(this);
    this._onKeyDown = this._onKeyDown.bind(this);
    this._onFocusIn = this._onFocusIn.bind(this);
    this._onCloseClick = this._onCloseClick.bind(this);
    this._onSlotChange = this._onSlotChange.bind(this);
    this._previousFocus = null;
    this._isRendering = false;
  }

  render() {
    if (!this._overlay) {
      this.shadowRoot.innerHTML = `
        <div class="overlay" part="overlay"></div>
        <div class="wrapper">
          <span class="sentinel" tabindex="0" data-sentinel="start"></span>
          <div class="dialog" part="content" role="dialog" aria-modal="true" aria-hidden="true">
            <header class="title" part="title" hidden>
              <slot name="title"></slot>
            </header>
            <button class="close" part="close" type="button" aria-label="Close"></button>
            <div class="body" part="body">
              <slot></slot>
            </div>
            <footer class="footer" part="footer" hidden>
              <slot name="footer"></slot>
            </footer>
          </div>
          <span class="sentinel" tabindex="0" data-sentinel="end"></span>
        </div>
      `;
      this._overlay = this.shadowRoot.querySelector('.overlay');
      this._wrapper = this.shadowRoot.querySelector('.wrapper');
      this._dialog = this.shadowRoot.querySelector('.dialog');
      this._title = this.shadowRoot.querySelector('.title');
      this._footer = this.shadowRoot.querySelector('.footer');
      this._closeButton = this.shadowRoot.querySelector('.close');
      this._defaultSlot = this.shadowRoot.querySelector('slot:not([name])');
      this._titleSlot = this.shadowRoot.querySelector('slot[name="title"]');
      this._footerSlot = this.shadowRoot.querySelector('slot[name="footer"]');
      this._overlay.addEventListener('click', this._onOverlayClick);
      this._closeButton.addEventListener('click', this._onCloseClick);
      this._titleSlot.addEventListener('slotchange', this._onSlotChange);
      this._footerSlot.addEventListener('slotchange', this._onSlotChange);
      this._wrapper.style.display = 'none';
      this._overlay.style.display = 'none';
      const sentinels = this.shadowRoot.querySelectorAll('.sentinel');
      sentinels.forEach((sentinel) => {
        sentinel.addEventListener('focus', () => {
          this._focusWithin(sentinel.dataset.sentinel === 'start' ? 'end' : 'start');
        });
      });
    }

    this._closeButton.hidden = !this.closable;
    this._closeButton.setAttribute('aria-hidden', this.closable ? 'false' : 'true');
    this._closeButton.tabIndex = this.closable ? 0 : -1;
    this._overlay.dataset.nonModal = this.modal ? 'false' : 'true';

    this._syncSlots();

    if (this.open) {
      this._show();
    } else {
      this._hide();
    }
  }

  show() {
    if (!this.open) {
      this.open = true;
    }
  }

  close(reason = 'method') {
    if (this.open) {
      this._closeReason = reason;
      this.open = false;
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback?.();
    this._removeGlobalListeners();
    if (this.open) {
      unlockScroll();
    }
  }

  _syncSlots() {
    const hasTitle = this._titleSlot
      .assignedNodes({ flatten: true })
      .some((node) => (node.textContent ?? '').trim().length || node.nodeType === Node.ELEMENT_NODE);
    this._title.hidden = !hasTitle;

    const hasFooter = this._footerSlot
      .assignedNodes({ flatten: true })
      .some((node) => (node.textContent ?? '').trim().length || node.nodeType === Node.ELEMENT_NODE);
    this._footer.hidden = !hasFooter;
  }

  _show() {
    if (this._isRendering) return;
    this._isRendering = true;
    this._dialog.setAttribute('aria-hidden', 'false');
    this._dialog.setAttribute('aria-modal', this.modal ? 'true' : 'false');
    this._overlay.style.display = 'block';
    this._wrapper.style.display = 'grid';
    if (this.modal) lockScroll();
    this._previousFocus = typeof document !== 'undefined' ? document.activeElement : null;
    this._addGlobalListeners();
    queueMicrotask(() => {
      this._focusInitial();
      this.emit('open', { modal: !!this.modal });
      this._isRendering = false;
    });
  }

  _hide() {
    if (this._isRendering) return;
    this._isRendering = true;
    this._dialog.setAttribute('aria-hidden', 'true');
    this._wrapper.style.display = 'none';
    this._overlay.style.display = 'none';
    this._removeGlobalListeners();
    unlockScroll();
    queueMicrotask(() => {
      if (this._previousFocus && typeof this._previousFocus.focus === 'function') {
        this._previousFocus.focus();
      }
      const reason = this._closeReason ?? 'method';
      this._closeReason = undefined;
      this.emit('close', { reason });
      this._isRendering = false;
    });
  }

  _onOverlayClick(event) {
    if (!this.modal || !this.closable) return;
    if (event.target === this._overlay) {
      this._closeReason = 'overlay';
      this.open = false;
    }
  }

  _onCloseClick() {
    if (!this.closable) return;
    this.close('close-button');
  }

  _onKeyDown(event) {
    if (!this.closable) return;
    if (event.key === 'Escape') {
      event.stopPropagation();
      this.close('escape');
    }
  }

  _onFocusIn(event) {
    if (!this.modal) return;
    if (!this.contains(event.target) && !this.shadowRoot.contains(event.target)) {
      this._focusInitial();
    }
  }

  _onSlotChange() {
    this._syncSlots();
  }

  _addGlobalListeners() {
    if (typeof document === 'undefined') return;
    document.addEventListener('keydown', this._onKeyDown, true);
    document.addEventListener('focusin', this._onFocusIn, true);
  }

  _removeGlobalListeners() {
    if (typeof document === 'undefined') return;
    document.removeEventListener('keydown', this._onKeyDown, true);
    document.removeEventListener('focusin', this._onFocusIn, true);
  }

  _focusInitial() {
    const targetSelector = this.initialFocus;
    let target = null;
    if (targetSelector) {
      target = this.querySelector(targetSelector) || this.shadowRoot.querySelector(targetSelector);
    }
    if (!target) {
      target = this._findFocusable()[0] ?? this._closeButton;
    }
    target?.focus?.();
  }

  _focusWithin(position) {
    const focusable = this._findFocusable();
    if (!focusable.length) return;
    const node = position === 'start' ? focusable[0] : focusable[focusable.length - 1];
    node?.focus?.();
  }

  _findFocusable() {
    const focusableSelectors = [
      'button:not([disabled])',
      '[href]',
      'input:not([disabled]):not([type="hidden"])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ];
    const nodes = [
      ...Array.from(this.shadowRoot.querySelectorAll(focusableSelectors.join(','))),
      ...Array.from(this.querySelectorAll(focusableSelectors.join(',')))
    ];
    return nodes.filter((node) => {
      const el = node;
      const style = typeof window !== 'undefined' && window.getComputedStyle ? window.getComputedStyle(el) : null;
      return !style || style.visibility !== 'hidden' && style.display !== 'none';
    });
  }
}

export function defineTmDialog() {
  if (typeof window === 'undefined' || !window.customElements) return;
  if (!window.customElements.get(TmDialog.tagName)) {
    window.customElements.define(TmDialog.tagName, TmDialog);
  }
}

if (typeof window !== 'undefined' && window.customElements) {
  defineTmDialog();
}
