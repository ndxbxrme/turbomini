import { JSDOM } from 'jsdom';

export function createDom() {
  const dom = new JSDOM('<!doctype html><html><body></body></html>', {
    url: 'http://localhost',
    pretendToBeVisual: true,
  });
  const { window } = dom;
  globalThis.window = window;
  globalThis.document = window.document;
  globalThis.HTMLElement = window.HTMLElement;
  globalThis.customElements = window.customElements;
  globalThis.Node = window.Node;
  const handleError = (event) => {
    event.preventDefault();
  };
  window.addEventListener('error', handleError);
  dom._tmErrorHandler = handleError;
  globalThis.Event = window.Event;
  globalThis.CustomEvent = window.CustomEvent;
  if (!window.ResizeObserver) {
    window.ResizeObserver = class {
      constructor(callback = () => {}) {
        this._callback = callback;
      }

      observe(target) {
        this._callback([{ target }]);
      }

      unobserve() {}

      disconnect() {}
    };
  }
  globalThis.ResizeObserver = window.ResizeObserver;
  globalThis.getComputedStyle = window.getComputedStyle.bind(window);
  globalThis.requestAnimationFrame = window.requestAnimationFrame.bind(window);
  globalThis.cancelAnimationFrame = window.cancelAnimationFrame.bind(window);
  globalThis.MutationObserver = window.MutationObserver;
  if (!window.Element.prototype.scrollIntoView) {
    window.Element.prototype.scrollIntoView = () => {};
  }
  return dom;
}

export function destroyDom(dom) {
  if (!dom) return;
  dom.window.close();
  if (dom._tmErrorHandler) {
    try {
      dom.window.removeEventListener('error', dom._tmErrorHandler);
    } catch {}
    dom._tmErrorHandler = undefined;
  }
  delete globalThis.window;
  delete globalThis.document;
  delete globalThis.HTMLElement;
  delete globalThis.customElements;
  delete globalThis.Node;
  delete globalThis.Event;
  delete globalThis.CustomEvent;
  delete globalThis.ResizeObserver;
  delete globalThis.getComputedStyle;
  delete globalThis.requestAnimationFrame;
  delete globalThis.cancelAnimationFrame;
  delete globalThis.MutationObserver;
}

export async function flushMicrotasks() {
  await Promise.resolve();
  await Promise.resolve();
  await new Promise((resolve) => setTimeout(resolve, 0));
}
