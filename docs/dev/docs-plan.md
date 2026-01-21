# TurboMini docs plan

## Goals
- Get a new user productive in under 30 minutes.
- Provide patterns, recipes, and reference for experienced users.
- Every documented feature maps to working code in this repo.

## Navigation (proposed)
1. Landing
2. Getting Started
3. Concepts
4. Guides (Best Practices)
5. Examples
6. API Reference
7. CLI Reference
8. Web Components
9. Theming
10. Contributing

## Page list and intent

### Landing
- What TurboMini is, why it exists, and where it fits.
- One fast example, link to Getting Started.

### Getting Started
- Install, scaffold, run (CLI + manual minimal HTML).
- Project structure and where files live.
- First controller + template + navigation.

### Concepts
- Runtime architecture (routing, controllers, templates, render scheduler).
- Data flow and lifecycle (`postLoad`, `unload`, middleware).
- Templates: escaping, helpers, partials, control flow.
- Concepts page now live at `/concepts` in the docs app.

### Guides (Best Practices)
- Project organization (small / medium / large).
- Controllers (conventions, file layout, lifecycle, composition, testing).
- Templating (partials, slots, composition, escaping, data flow).
- Themes (tokens, customization, light/dark, persistence).
- Web components (props/attributes, events, composition, SSR notes).
- Guides index now live at `/guides` in the docs app.

### Examples
- Gallery with cards + short copy + one command to run.
- Render examples from a shared data array in `docs/src/index.js`.
- Each example has: README with “What it demonstrates”, test, CLI template tie-in.

### API Reference
- Runtime API (`TurboMini`), methods, and types.
- Helper APIs and render strategy.

### CLI Reference
- `init`, `theme init`, `theme create`, `add`, `update`, `doctor`, `serve`.
- Flags, examples, and output expectations.

### Web Components
- Core patterns (events, props, styling, slots).
- Per-component docs generated from READMEs.

### Theming
- Token system, dark mode selectors, and theme overrides.
- Theme switching and persistence recipes.

### Contributing
- Local dev, testing, release flow, and repo conventions.

## Source of truth mapping
- Runtime: `packages/core/src/turbomini.js` + tests under `packages/core/tests`.
- CLI: `packages/cli/src/commands`.
- Themes: `packages/themes/base/dist` and CLI theme commands.
- Web components: `packages/wc/*` and `packages/wc/shared/base-element.js`.
- Starter template: `templates/starter/spa`.
- Legacy examples: `templates/examples/*` (migrate to `/examples`).

## Build strategy (docs site)
- Build docs with TurboMini itself under a dedicated docs site directory.
- Content stays in Markdown or HTML templates fetched by `app.fetchTemplates`.
- Build scripts should validate links and render output.
