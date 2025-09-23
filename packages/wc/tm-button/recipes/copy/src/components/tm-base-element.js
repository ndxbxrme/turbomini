const toKebabCase = (value) => value.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

export class TurboMiniElement extends HTMLElement {
  static props = {};
  static styles;

  static prepareProps() {
    if (this._propMeta) return this._propMeta;
    const entries = Object.entries(this.props ?? {}).map(([name, config = {}]) => {
      const attr = config.attribute ?? toKebabCase(name);
      const type = config.type ?? 'string';
      const reflect = config.reflect !== false;
      const def = config.default;
      return { name, attr, type, reflect, default: def };
    });

    for (const entry of entries) {
      if (!Object.prototype.hasOwnProperty.call(this.prototype, entry.name)) {
        Object.defineProperty(this.prototype, entry.name, {
          get() {
            return this.getProp(entry.name);
          },
          set(value) {
            this.setProp(entry.name, value);
          },
        });
      }
    }

    this._propMeta = {
      entries,
      byAttr: Object.fromEntries(entries.map((entry) => [entry.attr, entry])),
      byName: Object.fromEntries(entries.map((entry) => [entry.name, entry])),
    };

    return this._propMeta;
  }

  static get observedAttributes() {
    return this.prepareProps().entries.map((entry) => entry.attr);
  }

  constructor() {
    super();
    this._props = Object.create(null);
    this._renderPending = false;
    const shadowOptions = this.constructor.shadowRootOptions ?? { mode: 'open' };
    this.attachShadow(shadowOptions);
    this._applyStyles();
    this._initProps();
  }

  connectedCallback() {
    this.requestRender();
  }

  getProp(name) {
    const meta = this.constructor.prepareProps();
    return this._props[name] ?? meta.byName[name]?.default;
  }

  setProp(name, value) {
    const meta = this.constructor.prepareProps();
    const entry = meta.byName[name];
    if (!entry) {
      this[name] = value;
      return;
    }

    const coerced = this._coerce(value, entry.type);
    if (this._props[name] === coerced) return;
    this._props[name] = coerced;

    if (entry.reflect) {
      const attrValue = this._toAttribute(coerced, entry.type);
      if (attrValue === null) {
        if (this.hasAttribute(entry.attr)) this.removeAttribute(entry.attr);
      } else if (this.getAttribute(entry.attr) !== attrValue) {
        this.setAttribute(entry.attr, attrValue);
      }
    }

    this.requestRender();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    const meta = this.constructor.prepareProps();
    const entry = meta.byAttr[name];
    if (!entry) return;
    this._props[entry.name] = this._fromAttribute(newValue, entry.type);
    this.requestRender();
  }

  requestRender() {
    if (this._renderPending) return;
    this._renderPending = true;
    queueMicrotask(() => {
      this._renderPending = false;
      if (typeof this.render === 'function') {
        this.render();
      }
    });
  }

  emit(name, detail = {}, options = {}) {
    const eventName = name.startsWith('tm-') ? name : `tm-${name}`;
    const event = new CustomEvent(eventName, {
      detail,
      bubbles: true,
      composed: true,
      cancelable: false,
      ...options,
    });
    this.dispatchEvent(event);
    return event;
  }

  _initProps() {
    const meta = this.constructor.prepareProps();
    for (const entry of meta.entries) {
      if (this._props[entry.name] !== undefined) continue;
      if (this.hasAttribute(entry.attr)) {
        this._props[entry.name] = this._fromAttribute(this.getAttribute(entry.attr), entry.type);
      } else if (entry.default !== undefined) {
        const value = typeof entry.default === 'function'
          ? entry.default.call(this)
          : entry.default;
        this._props[entry.name] = value;
        if (entry.reflect) {
          const attrValue = this._toAttribute(value, entry.type);
          if (attrValue === null) {
            if (this.hasAttribute(entry.attr)) this.removeAttribute(entry.attr);
          } else if (this.getAttribute(entry.attr) !== attrValue) {
            this.setAttribute(entry.attr, attrValue);
          }
        }
      }
    }
  }

  _applyStyles() {
    const styles = this.constructor.styles;
    if (!styles) return;
    const list = Array.isArray(styles) ? styles : [styles];
    const adoptable = [];
    const adoptableFallback = [];
    const inline = [];

    for (const item of list) {
      if (!item) continue;
      if (typeof CSSStyleSheet !== 'undefined' && item instanceof CSSStyleSheet) {
        adoptable.push(item);
        let cssText = '';
        try {
          cssText = Array.from(item.cssRules ?? []).map((rule) => rule.cssText).join('\n');
        } catch {
          cssText = '';
        }
        adoptableFallback.push(cssText || null);
        continue;
      }

      if (typeof item === 'string' && typeof CSSStyleSheet !== 'undefined' && 'replaceSync' in CSSStyleSheet.prototype) {
        const sheet = new CSSStyleSheet();
        sheet.replaceSync(item);
        adoptable.push(sheet);
        adoptableFallback.push(item);
        continue;
      }

      inline.push(item);
    }

    let adopted = false;
    if (adoptable.length && this.shadowRoot.adoptedStyleSheets !== undefined) {
      try {
        const current = this.shadowRoot.adoptedStyleSheets || [];
        this.shadowRoot.adoptedStyleSheets = [...current, ...adoptable];
        adopted = true;
      } catch {
        adopted = false;
      }
    }

    if (!adopted) {
      for (const cssText of adoptableFallback) {
        if (!cssText) continue;
        const styleEl = document.createElement('style');
        styleEl.textContent = cssText;
        this.shadowRoot.append(styleEl);
      }
    }

    for (const item of inline) {
      const cssText = typeof item === 'string' ? item : String(item);
      const styleEl = document.createElement('style');
      styleEl.textContent = cssText;
      this.shadowRoot.append(styleEl);
    }
  }

  _coerce(value, type) {
    if (type === 'boolean') return Boolean(value);
    if (type === 'number') return value == null ? undefined : Number(value);
    return value;
  }

  _fromAttribute(value, type) {
    if (type === 'boolean') {
      if (value === null) return false;
      if (value === '') return true;
      return value !== 'false';
    }
    if (type === 'number') return value == null ? undefined : Number(value);
    return value;
  }

  _toAttribute(value, type) {
    if (type === 'boolean') {
      return value ? '' : null;
    }
    if (value === undefined || value === null) return null;
    return String(value);
  }
}
