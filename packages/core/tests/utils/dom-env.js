import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body><page></page></body></html>');

globalThis.window = dom.window;
globalThis.document = dom.window.document;
// expose minimal globals
Object.assign(globalThis, {
  HTMLElement: dom.window.HTMLElement,
  Node: dom.window.Node,
});

export default dom;
