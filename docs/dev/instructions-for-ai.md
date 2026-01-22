# Instructions for AI agents (TurboMini)

This guide tells an AI coding agent how to build TurboMini apps in this repo.

## Core conventions
- Use `TurboMini(basePath)` to create the app. Prefer a base path that matches the deployed subfolder (e.g. `/examples/hello-routing`).
- Register templates before routing. Routing resolves by matching template names against the URL.
- Controllers return plain data objects; attach `postLoad()` for DOM wiring and `unload()` for cleanup.
- Use `app.refresh()` (or `app.invalidate()`) after any state mutation to trigger a re-render.
- For navigation, prefer `<a href="/route">` or `app.goto('/route')`.

## Scaffolding
- CLI quick start:
  - `npx turbomini init my-app`
  - `cd my-app && npm install`
  - `npm run dev` (or `turbomini serve` for no-build setups)
- Theme tokens:
  - `npx turbomini theme init`
  - `npx turbomini theme create brand`

## Project layout (recommended)
- Small apps:
  - `src/main.js`, `src/app.css`
- Medium apps:
  - `src/controllers/`, `src/templates/`, `src/styles/`, `src/main.js`
- Large apps:
  - `src/features/<feature>/controller.js`
  - `src/features/<feature>/templates.js`
  - `src/shared/components/`, `src/shared/styles/`

## Templates
- Escaped output: `{{name}}`.
- Raw output: `{{{html}}}` (use sparingly).
- Each blocks: `{{#each items as item}}...{{/each}}` with `index` available.
- If blocks: `{{#if condition}}...{{/if}}`.
- Partials: `{{> card title=card.title}}` or `{{> layout .}}`.
- Helpers: register with `app.registerHelper('upper', fn)` and use as `{{upper name}}`.

## Controllers
- Return data synchronously or asynchronously.
- Use `postLoad()` for DOM event wiring and to avoid re-binding listeners. Add guards with `data-*` flags.
- Use `unload()` to clean up timers, global listeners, or subscriptions.
- Middleware (`app.addMiddleware`) runs before navigation; return `false` to cancel routing.

## Themes
- Base tokens live under `packages/themes/base/dist`.
- `theme.css` imports `tokens.css` and `tokens.dark.css` and defines utilities.
- Dark mode selectors: `[data-theme='dark']` and `.tm-dark`.
- Prefer toggling `document.documentElement.dataset.theme` and persisting to `localStorage`.

## Web components
- Use `@turbomini/wc-*` packages or copy-mode components.
- Components emit `tm-*` events (e.g. `tm-press`, `tm-change`).
- Props reflect to attributes via `TurboMiniElement`; prefer passing data via `value`.
- Wire component events in `postLoad()` and call `app.invalidate()` on state change.

## Testing
- Root checks:
  - `npm test` runs core + CLI + web component tests.
  - `npm run examples:check` runs all example tests.
- Example tests are Node-based; set `globalThis.location` and `globalThis.history` for routing tests.
- For DOM tests, use `createDom()` from `packages/wc/tests/tests/dom-helpers.js`.

## Common pitfalls
- Missing template for a route means routing falls back to `default`.
- `postLoad()` runs after render; `unload()` runs before the next route loads.
- Partials do not inherit outer data unless you pass `.` or explicit args.
- In Node tests, `document` and `window` do not exist unless you create a DOM.
- When served from a subfolder, set the base path to match (e.g. `/examples/foo`).

## Reference examples
- `/examples/hello-routing` - routing and controllers.
- `/examples/controller-patterns` - controller composition.
- `/examples/layouts-partials` - partials and layout composition.
- `/examples/theme-switching` - theme persistence.
- `/examples/web-components` - tm-* events and slots.
- `/examples/middleware-guard` - route guards.
