# Server rendering & island architectures

TurboMini is small enough to render entire pages on the server or hydrate individual islands on demand. The runtime ships zero
assumptions about the rendering environment—everything is declarative and opt-in.

## Defer web component registration

When streaming HTML from the server you can defer custom-element registration until the browser takes over. Every TurboMini web
component exports a `define*` helper in addition to side-effectful registration. Call it when the island mounts:

```js
import { defineTmButton } from '@turbomini/wc-button';

if (typeof window !== 'undefined') {
  defineTmButton();
}
```

This keeps SSR-friendly hydration fast while still allowing eager registration in fully client-side builds via
`import '@turbomini/wc-button';`.

## Provide light DOM fallbacks

Because TurboMini components use slots and parts, you can render accessible HTML directly in the server response. Once the
component definition loads, the light DOM will be projected into the shadow DOM.

```html
<button data-tm-upgrade="tm-button" class="tm-surface tm-pad-sm">
  <span class="tm-inline-flex tm-gap-xs">
    <svg aria-hidden="true" focusable="false">…</svg>
    <span>Checkout</span>
  </span>
</button>
```

Later, enhance the fallback when the island hydrates:

```js
import '@turbomini/wc-button';

const upgrade = document.querySelector('[data-tm-upgrade="tm-button"]');
if (upgrade && !upgrade.matches('tm-button')) {
  const button = document.createElement('tm-button');
  button.append(...upgrade.childNodes);
  upgrade.replaceWith(button);
}
```

This pattern plays nicely with Astro, Remix, Next.js, and other SSR frameworks—render semantic HTML on the server, then swap in
TurboMini components only where needed.
