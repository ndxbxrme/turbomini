import { TurboMiniElement } from '@turbomini/wc-core';

const styles = `
:host {
  position: relative;
  display: inline-block;
  --tm-tooltip-bg: color-mix(in srgb, var(--tm-color-text) 88%, transparent);
  --tm-tooltip-fg: var(--tm-color-text-inverse);
  --tm-tooltip-radius: var(--tm-radius-sm);
  --tm-tooltip-pad: var(--tm-space-2) var(--tm-space-3);
  --tm-tooltip-shadow: var(--tm-shadow-md);
}

:host([hidden]) {
  display: none;
}

.tooltip {
  position: fixed;
  z-index: var(--tm-z-tooltip);
  background-color: var(--tm-tooltip-bg);
  color: var(--tm-tooltip-fg);
  padding: var(--tm-tooltip-pad);
  border-radius: var(--tm-tooltip-radius);
  box-shadow: var(--tm-tooltip-shadow);
  font-size: var(--tm-font-size-sm);
  line-height: 1.3;
  pointer-events: none;
  opacity: 0;
  transform: translate(-50%, -100%);
  transition: opacity var(--tm-motion-duration-fast) var(--tm-motion-ease-out),
    transform var(--tm-motion-duration-fast) var(--tm-motion-ease-out);
}

.tooltip[data-open='true'] {
  opacity: 1;
}

.tooltip[data-placement='top'] {
  transform: translate(-50%, -100%);
}

.tooltip[data-placement='bottom'] {
  transform: translate(-50%, 0);
}

.tooltip[data-placement='left'] {
  transform: translate(-100%, -50%);
}

.tooltip[data-placement='right'] {
  transform: translate(0, -50%);
}

.tooltip__content {
  display: inline-flex;
  align-items: center;
  gap: var(--tm-space-2);
}

.tooltip__text[data-empty='true'] {
  display: none;
}

.arrow {
  position: absolute;
  width: 10px;
  height: 10px;
  background-color: inherit;
  transform: rotate(45deg);
}

.tooltip[data-placement='top'] .arrow {
  bottom: -5px;
  left: 50%;
  transform: translate(-50%, 0) rotate(45deg);
}

.tooltip[data-placement='bottom'] .arrow {
  top: -5px;
  left: 50%;
  transform: translate(-50%, 0) rotate(45deg);
}

.tooltip[data-placement='left'] .arrow {
  top: 50%;
  right: -5px;
  transform: translate(0, -50%) rotate(45deg);
}

.tooltip[data-placement='right'] .arrow {
  top: 50%;
  left: -5px;
  transform: translate(0, -50%) rotate(45deg);
}

@media (prefers-reduced-motion: reduce) {
  .tooltip {
    transition: none;
  }
}
`;

export class TmTooltip extends TurboMiniElement {
  static tagName = 'tm-tooltip';
  static props = {
    text: { type: 'string', reflect: true },
    placement: { type: 'string', default: 'top', reflect: true },
    delay: { type: 'number', default: 150 },
    open: { type: 'boolean', reflect: true },
  };
  static styles = styles;

  constructor() {
    super();
    this._onFocusIn = this._onFocusIn.bind(this);
    this._onFocusOut = this._onFocusOut.bind(this);
    this._onPointerEnter = this._onPointerEnter.bind(this);
    this._onPointerLeave = this._onPointerLeave.bind(this);
    this._onKeyDown = this._onKeyDown.bind(this);
    this._onSlotChange = this._onSlotChange.bind(this);
    this._bubbleVisible = false;
    this._tooltipId = `tm-tooltip-${Math.random().toString(36).slice(2, 8)}`;
    this._showTimeout = null;
    this._hideTimeout = null;
    this._raf = null;
    this.addEventListener('focusin', this._onFocusIn);
    this.addEventListener('focusout', this._onFocusOut);
    this.addEventListener('mouseenter', this._onPointerEnter);
    this.addEventListener('mouseleave', this._onPointerLeave);
    this.addEventListener('keydown', this._onKeyDown);
  }

  render() {
    if (!this._bubble) {
      this.shadowRoot.innerHTML = `
        <slot></slot>
        <div class="tooltip" part="content" role="tooltip" aria-hidden="true">
          <div class="tooltip__content">
            <slot name="content"></slot>
            <span class="tooltip__text" data-empty="true"></span>
          </div>
          <span class="arrow" part="arrow" aria-hidden="true"></span>
        </div>
      `;
      this._bubble = this.shadowRoot.querySelector('.tooltip');
      this._textSpan = this.shadowRoot.querySelector('.tooltip__text');
      this._contentSlot = this.shadowRoot.querySelector('slot[name="content"]');
      this._defaultSlot = this.shadowRoot.querySelector('slot:not([name])');
      this._bubble.id = this._tooltipId;
      this._contentSlot.addEventListener('slotchange', this._onSlotChange);
      this._defaultSlot.addEventListener('slotchange', this._onSlotChange);
    }

    this._textSpan.textContent = this.text ?? '';
    this._textSpan.dataset.empty = this.text ? 'false' : 'true';
    this._syncTargets();

    if (this.open) {
      this._showBubble();
    } else {
      this._hideBubble();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback?.();
    this._clearTimers();
    if (this._raf) cancelAnimationFrame(this._raf);
  }

  _onSlotChange() {
    this._syncTargets();
  }

  _syncTargets() {
    const assigned = this._defaultSlot?.assignedElements({ flatten: true }) ?? [];
    if (this._describedTarget && !assigned.includes(this._describedTarget)) {
      const current = this._describedTarget.getAttribute('aria-describedby') || '';
      const filtered = current
        .split(/\s+/)
        .filter((token) => token && token !== this._tooltipId)
        .join(' ');
      if (filtered) {
        this._describedTarget.setAttribute('aria-describedby', filtered);
      } else {
        this._describedTarget.removeAttribute('aria-describedby');
      }
      this._describedTarget = null;
    }

    const target = assigned.find((el) => el instanceof HTMLElement);
    if (target && !this._describedTarget) {
      const current = target.getAttribute('aria-describedby');
      const tokens = new Set((current ?? '').split(/\s+/).filter(Boolean));
      tokens.add(this._tooltipId);
      target.setAttribute('aria-describedby', Array.from(tokens).join(' '));
      this._describedTarget = target;
    }
  }

  _onFocusIn() {
    this._scheduleShow();
  }

  _onFocusOut() {
    this._scheduleHide();
  }

  _onPointerEnter() {
    this._scheduleShow();
  }

  _onPointerLeave() {
    this._scheduleHide();
  }

  _onKeyDown(event) {
    if (event.key === 'Escape' && this.open) {
      this.open = false;
    }
  }

  _scheduleShow() {
    if (this.open || !this._hasTooltipContent()) return;
    this._clearTimers();
    const delay = typeof this.delay === 'number' ? Math.max(0, this.delay) : 150;
    this._showTimeout = setTimeout(() => {
      this._showTimeout = null;
      if (this._hasTooltipContent()) {
        this.open = true;
      }
    }, delay);
  }

  _scheduleHide() {
    this._clearTimers();
    if (!this.open) return;
    this.open = false;
  }

  _clearTimers() {
    if (this._showTimeout) {
      clearTimeout(this._showTimeout);
      this._showTimeout = null;
    }
    if (this._hideTimeout) {
      clearTimeout(this._hideTimeout);
      this._hideTimeout = null;
    }
  }

  _showBubble() {
    if (this._bubbleVisible || !this._hasTooltipContent()) return;
    this._bubbleVisible = true;
    this._bubble.dataset.open = 'true';
    this._bubble.setAttribute('aria-hidden', 'false');
    this._bubble.dataset.placement = this._resolvePlacement(this.placement);
    this.emit('open', { open: true });
    this._updatePosition();
  }

  _hideBubble() {
    if (!this._bubbleVisible) return;
    this._bubbleVisible = false;
    this._bubble.dataset.open = 'false';
    this._bubble.setAttribute('aria-hidden', 'true');
    this.emit('close', { open: false });
  }

  _resolvePlacement(placement) {
    switch (placement) {
      case 'bottom':
      case 'left':
      case 'right':
        return placement;
      default:
        return 'top';
    }
  }

  _hasTooltipContent() {
    const text = (this.text ?? '').trim();
    if (text.length > 0) return true;
    const nodes = this._contentSlot?.assignedNodes({ flatten: true }) ?? [];
    return nodes.some((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        return (node.textContent ?? '').trim().length > 0;
      }
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = /** @type {HTMLElement} */ (node);
        return !el.hidden;
      }
      return false;
    });
  }

  _updatePosition() {
    if (!this._bubbleVisible || !this._bubble) return;
    if (this._raf) cancelAnimationFrame(this._raf);
    this._raf = requestAnimationFrame(() => {
      const target = this._describedTarget || this;
      const rect = target.getBoundingClientRect();
      const placement = this._resolvePlacement(this.placement);
      this._bubble.dataset.placement = placement;
      const spacing = 8;
      const margin = 8;
      this._bubble.style.visibility = 'hidden';
      this._bubble.dataset.open = 'true';
      this._bubble.style.left = '0px';
      this._bubble.style.top = '0px';
      const bubbleRect = this._bubble.getBoundingClientRect();
      let actualPlacement = placement;
      if (placement === 'top' && rect.top - bubbleRect.height - spacing < margin) {
        actualPlacement = 'bottom';
      } else if (placement === 'bottom' && rect.bottom + bubbleRect.height + spacing > window.innerHeight - margin) {
        actualPlacement = 'top';
      } else if (placement === 'left' && rect.left - bubbleRect.width - spacing < margin) {
        actualPlacement = 'right';
      } else if (placement === 'right' && rect.right + bubbleRect.width + spacing > window.innerWidth - margin) {
        actualPlacement = 'left';
      }
      this._bubble.dataset.placement = actualPlacement;
      let x = rect.left + rect.width / 2;
      let y = rect.top - spacing;
      if (actualPlacement === 'bottom') {
        y = rect.bottom + spacing;
      } else if (actualPlacement === 'left') {
        x = rect.left - spacing;
        y = rect.top + rect.height / 2;
      } else if (actualPlacement === 'right') {
        x = rect.right + spacing;
        y = rect.top + rect.height / 2;
      }
      if (actualPlacement === 'top' || actualPlacement === 'bottom') {
        let left = x - bubbleRect.width / 2;
        if (left < margin) {
          x += margin - left;
        } else if (left + bubbleRect.width > window.innerWidth - margin) {
          x -= left + bubbleRect.width - (window.innerWidth - margin);
        }
      } else {
        let top = y - bubbleRect.height / 2;
        if (top < margin) {
          y += margin - top;
        } else if (top + bubbleRect.height > window.innerHeight - margin) {
          y -= top + bubbleRect.height - (window.innerHeight - margin);
        }
      }
      this._bubble.style.left = `${x}px`;
      this._bubble.style.top = `${y}px`;
      this._bubble.style.visibility = 'visible';
    });
  }
}

export function defineTmTooltip() {
  if (typeof window === 'undefined' || !window.customElements) return;
  if (!window.customElements.get(TmTooltip.tagName)) {
    window.customElements.define(TmTooltip.tagName, TmTooltip);
  }
}

if (typeof window !== 'undefined' && window.customElements) {
  defineTmTooltip();
}
