# Agent notes (discovery)

## Commands run
- `npm install` (workspace root) - up to date.
- `npm test` - failed in `packages/core`: `node --test tests/unit` reported `Cannot find module '/home/kieron/code/turbomini/packages/core/tests/unit'`.
- `npm run build` - `packages/core` types build succeeded.

## Repository map (current)
- `packages/core` - TurboMini runtime (`src/turbomini.js`) + unit/e2e tests.
- `packages/cli` - CLI commands (`init`, `theme init/create`, `add`, etc.).
- `packages/themes/base` - base theme tokens + dist CSS/JSON.
- `packages/wc/*` - web components + shared `TurboMiniElement`.
- `templates/starter/spa` - Vite starter with web component demos.
- `templates/examples/*` - older runnable HTML demos (no tests).
- `docs/` - static docs site (HTML + `docs/src` templates/components).

## Runtime structure (packages/core/src/turbomini.js)
- `TurboMini(basePath)` returns the app API. `basePath` can be `/` (history), `#` (hash), or a sub-path.
- Routing: the current route is matched against template names (longest names first). The match uses `raw.indexOf(key) === 1` and then normalizes the path into params.
- Controllers: `app.controller(name, fn)` registers route controller. Controller return value becomes `ctx.data` and is passed to templates. `ctx.data?.unload?.()` runs before navigation, `ctx.data?.postLoad?.()` runs after render.
- Render: `app.refreshNow()` (immediate) or `app.refresh()` (scheduled). `app.setRenderStrategy({ mode, interval, leading })` supports `microtask`, `raf`, `throttle`, `debounce`, `idle`.
- Templating helpers: `app.registerHelper(name, fn)` and built-ins `json`, `classList`, `date`, `number`.

## Templating syntax (confirmed in runtime + tests)
- Escaped output: `{{path}}`.
- Raw output: `{{{path}}}`.
- Each blocks: `{{#each items as item}}...{{/each}}` with `index` injected; `{{#each items}}` uses `this`.
- If blocks: `{{#if condition}}...{{/if}}`.
- Partials: `{{> partialName}}`, with args like `{{> item user=u}}` or `{{> item .}}`.
- Helpers: `{{helper arg}}` with args as paths (`{{number total}}`).

## Theming system
- Base tokens live in `packages/themes/base/dist` (`tokens.css`, `tokens.dark.css`, `theme.css`, `tokens.json`).
- CLI: `turbomini theme init` copies base tokens into `src/styles/turbomini`.
- CLI: `turbomini theme create <name>` creates `src/styles/themes/<name>/tokens.json` and `theme.css` that `@import`s `../turbomini/theme.css` and scopes overrides under `[data-theme="<name>"]`.
- Dark mode tokens are scoped by `[data-theme='dark']` or `.tm-dark` in base assets.

## Web components
- Shared base: `packages/wc/shared/base-element.js` exposes `TurboMiniElement`.
- Features: prop/attribute reflection (type coercion), microtask render scheduling, `emit` helper prefixes `tm-`, and support for adopted stylesheets with fallbacks.
- Each component has a README with props/events references (e.g. `packages/wc/tm-button/README.md`).

## CLI templates/scaffolding
- `turbomini init` scaffolds a minimal app by writing `index.html`, `src/main.js`, `src/app.css`, and optionally `vite.config.js` (no reliance on `templates/starter/spa`).
- `templates/starter/spa` is a Vite starter with web-component demos and expects `src/styles/turbomini/theme.css` to exist (usually created via `turbomini theme init`).
- `templates/examples/*` are old HTML-based examples (no tests; `package.json` scripts mostly `python -m http.server`).

## Docs site
- Current docs are static HTML under `docs/` with a separate `docs/src` TurboMini-powered entry. The docs site uses `TurboMini('/turbomini/')` and `fetchTemplates` from `docs/src/components`.
- There is no dedicated docs build script in the workspace right now.

## Unclear / needs validation
- `node --test tests/unit` failure in `packages/core` despite existing tests directory.
- Intended canonical project structure (CLI scaffolding vs `templates/starter/spa`).
- How docs are meant to be built/deployed (current `docs/` mixes static HTML and TurboMini templates).
- Theme persistence + system preference handling (no explicit implementation found yet).
- SSR guidance exists (`docs/ssr.md`) but needs validation against actual runtime behavior.

## Experiments planned (agent-lab)
- Controller lifecycle: verify `postLoad` and `unload` ordering with navigation and data changes.
- Template composition: partials + `{{#each}}` with aliases and `.` data passing.
- Theme switching: `[data-theme]` + `.tm-dark` handling, and token override order.
- Web components: prop/attribute reflection, event naming, and interop with TurboMini templates.

