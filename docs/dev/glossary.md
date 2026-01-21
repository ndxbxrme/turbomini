# TurboMini glossary

- Controller: A route handler that returns data (sync or async). Can expose `postLoad()` and `unload()` lifecycle hooks.
- Template: Handlebars-style string registered with `app.template(name, text)` and rendered with data.
- Partial: A template invoked inside another template via `{{> name}}` with explicit arguments.
- Helper: A function registered with `app.registerHelper` and invoked as `{{helper arg}}`.
- Context: `app.context` object containing `page`, `params`, and `data`.
- Render strategy: The scheduling mode for renders (`microtask`, `raf`, `throttle`, `debounce`, `idle`).
- Theme tokens: Design tokens expressed as CSS variables and JSON (`tokens.css`, `tokens.dark.css`, `tokens.json`).
- Theme override: Custom theme CSS/JSON created under `src/styles/themes/<name>`.
- Web component: A custom element in `@turbomini/wc-*` built on `TurboMiniElement`.
- Event convention: Custom events prefixed with `tm-` (e.g., `tm-press`).

