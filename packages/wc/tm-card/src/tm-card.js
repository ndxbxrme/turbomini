import { TurboMiniElement } from '@turbomini/wc-core';

const styles = `
:host {
  display: block;
  container-type: inline-size;
  --tm-card-bg: var(--tm-color-surface);
  --tm-card-fg: var(--tm-color-text);
  --tm-card-border: var(--tm-color-border);
  --tm-card-radius: var(--tm-radius-lg);
  --tm-card-pad: var(--tm-space-5);
  --tm-card-shadow: var(--tm-shadow-md);
}

:host([hidden]) {
  display: none;
}

.card {
  background-color: var(--tm-card-bg);
  color: var(--tm-card-fg);
  border: 1px solid var(--tm-card-border);
  border-radius: var(--tm-card-radius);
  padding: var(--tm-card-pad);
  display: grid;
  gap: var(--tm-space-4);
  transition: box-shadow var(--tm-motion-duration-normal) var(--tm-motion-ease-out),
    transform var(--tm-motion-duration-normal) var(--tm-motion-ease-out);
}

:host([inset]) .card {
  padding: 0;
  gap: 0;
  overflow: hidden;
}

:host([inset]) .section {
  padding: calc(var(--tm-card-pad) - var(--tm-space-1)) var(--tm-card-pad);
  border-bottom: 1px solid color-mix(in srgb, var(--tm-card-border) 65%, transparent);
}

:host([inset]) .section:last-of-type {
  border-bottom: none;
}

:host([inset]) .section.media {
  padding: 0;
}

:host([elevated]) .card {
  border-color: transparent;
  box-shadow: var(--tm-card-shadow);
}

:host([interactive]) .card {
  cursor: pointer;
}

:host([interactive]) .card:hover {
  box-shadow: var(--tm-card-shadow);
  transform: translateY(-1px);
}

:host([interactive]) .card:focus-visible {
  outline: none;
  box-shadow: var(--tm-focus-ring);
}

.section[hidden] {
  display: none;
}

.media ::slotted(*) {
  display: block;
  border-radius: calc(var(--tm-card-radius) - var(--tm-space-2));
  width: 100%;
  object-fit: cover;
}

:host([inset]) .media ::slotted(*) {
  border-radius: 0;
}

@container (min-width: 32rem) {
  .card {
    padding: calc(var(--tm-card-pad) + var(--tm-space-2));
  }
}

@container (max-width: 22rem) {
  .card {
    padding: calc(var(--tm-card-pad) - var(--tm-space-1));
  }
}
`;

export class TmCard extends TurboMiniElement {
  static tagName = 'tm-card';
  static props = {
    elevated: { type: 'boolean', reflect: true },
    interactive: { type: 'boolean', reflect: true },
    inset: { type: 'boolean', reflect: true },
  };
  static styles = styles;

  constructor() {
    super();
    this._onSlotChange = this._onSlotChange.bind(this);
    this._onClick = this._onClick.bind(this);
    this._onKeyDown = this._onKeyDown.bind(this);
  }

  render() {
    if (!this._card) {
      this.shadowRoot.innerHTML = `
        <article class="card" part="base">
          <header class="section header" part="header">
            <slot name="header"></slot>
          </header>
          <div class="section media" part="media">
            <slot name="media"></slot>
          </div>
          <div class="section body" part="body">
            <slot></slot>
          </div>
          <footer class="section footer" part="footer">
            <slot name="footer"></slot>
          </footer>
        </article>
      `;
      this._card = this.shadowRoot.querySelector('.card');
      this._header = this.shadowRoot.querySelector('.header');
      this._media = this.shadowRoot.querySelector('.media');
      this._body = this.shadowRoot.querySelector('.body');
      this._footer = this.shadowRoot.querySelector('.footer');
      const slots = this.shadowRoot.querySelectorAll('slot');
      slots.forEach((slot) => slot.addEventListener('slotchange', this._onSlotChange));
      this._card.addEventListener('click', this._onClick);
      this._card.addEventListener('keydown', this._onKeyDown);
    }

    this._card.tabIndex = this.interactive ? 0 : -1;
    const explicitRole = this.getAttribute('role');
    if (explicitRole) {
      this._card.setAttribute('role', explicitRole);
    } else {
      this._card.setAttribute('role', this.interactive ? 'button' : 'group');
    }
    this._card.dataset.inset = this.inset ? 'true' : 'false';
    this._syncSections();
  }

  disconnectedCallback() {
    super.disconnectedCallback?.();
    this._card?.removeEventListener('click', this._onClick);
    this._card?.removeEventListener('keydown', this._onKeyDown);
  }

  _onSlotChange() {
    this._syncSections();
  }

  _syncSections() {
    this._toggleSection(this._header, 'header');
    this._toggleSection(this._media, 'media');
    this._toggleSection(this._body, 'body');
    this._toggleSection(this._footer, 'footer');
  }

  _toggleSection(section, slotName) {
    if (!section) return;
    const slot = section.querySelector(`slot${slotName === 'body' ? ':not([name])' : `[name="${slotName}"]`}`);
    const hasContent = slot
      .assignedNodes({ flatten: true })
      .some((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          return (node.textContent ?? '').trim().length > 0;
        }
        if (node.nodeType === Node.ELEMENT_NODE) {
          const el = /** @type {HTMLElement} */ (node);
          return !el.hidden;
        }
        return false;
      });
    section.hidden = !hasContent;
  }

  _onClick(event) {
    if (!this.interactive) return;
    this.emit('press', { originalEvent: event });
  }

  _onKeyDown(event) {
    if (!this.interactive) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.emit('press', { originalEvent: event });
    }
  }
}

export function defineTmCard() {
  if (typeof window === 'undefined' || !window.customElements) return;
  if (!window.customElements.get(TmCard.tagName)) {
    window.customElements.define(TmCard.tagName, TmCard);
  }
}

if (typeof window !== 'undefined' && window.customElements) {
  defineTmCard();
}
