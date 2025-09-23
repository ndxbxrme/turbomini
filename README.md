# TurboMini Monorepo

TurboMini is a tiny, dependency-free SPA micro-framework with first-class theming and web component support. This repository now hosts the full TurboMini platform: runtime, CLI, theme packs, web components, and starter templates.

## Packages

| Path | Package | Description |
| --- | --- | --- |
| `packages/core` | [`turbomini`](packages/core) | Runtime micro-framework (routing, templates, controllers). |
| `packages/cli` | [`@turbomini/cli`](packages/cli) | Developer tooling for scaffolding apps, themes, and components. |
| `packages/themes/base` | [`@turbomini/theme-base`](packages/themes/base) | Base design tokens, CSS resets, and utility classes. |
| `packages/wc/shared` | [`@turbomini/wc-core`](packages/wc/shared) | Shared base element for TurboMini web components. |
| `packages/wc/tm-button` | [`@turbomini/wc-button`](packages/wc/tm-button) | Accessible `<tm-button>` web component. |
| `templates/starter/spa` | – | Opinionated Vite starter that uses the runtime and base theme. |

## CLI Quick Start

Install dependencies and run the CLI with `npx`:

```bash
npm install
npx turbomini init my-app
```

Available commands:

| Command | Description |
| --- | --- |
| `turbomini init [dir]` | Scaffold a new project (Vite config, starter app, base theme). |
| `turbomini theme init [dir]` | Copy base tokens (`tokens.css`, `tokens.dark.css`, `theme.css`) into `src/styles/turbomini`. |
| `turbomini theme create <name> [--dir .]` | Generate a new theme override folder with editable JSON + CSS. |
| `turbomini add <component> [--mode copy|wc]` | Install a component recipe (`copy`, default) or add the web component package (`wc`). |
| `turbomini update <component>` | Refresh local component recipes from the monorepo (copy mode). |
| `turbomini doctor [dir]` | Check for drift between your tokens/packages and the workspace defaults. |
| All commands support `--dry-run` | Preview file writes with diffs before mutating disk. |

Example usage:

```bash
# Scaffold a project and install the base theme
npx turbomini init awesome-app
cd awesome-app

# Create a brand override theme
turbomini theme create brand

# Install the web component version of tm-button
turbomini add tm-button --mode wc

# Copy the source recipe instead (shadcn-style)
turbomini add tm-button --mode copy
```

## Runtime Usage

TurboMini keeps templating and routing extremely small. Import the runtime from the `turbomini` package and mount a `<page>` element:

```html
<!doctype html>
<html lang="en">
  <body>
    <page></page>
    <script type="module">
      import { TurboMini } from 'turbomini';

      const app = TurboMini('/');
      app.template('home', '<h1>Hello {{name}}</h1>');
      app.controller('home', () => ({ name: 'TurboMini' }));
      app.start();
    </script>
  </body>
</html>
```

Controllers return data objects, templates are handlebars-style, and `app.start()` boots the router. The existing runtime API (templates, controllers, middleware, helpers, stores, etc.) is unchanged—see [`packages/core/src/turbomini.js`](packages/core/src/turbomini.js) for the full documentation comments.

## Theming

The base theme ships design tokens in JSON plus CSS exports:

- `tokens.css` – light-mode CSS variables (`--tm-color-*`, `--tm-space-*`, typography clamp scales, shadows, motion, etc.).
- `tokens.dark.css` – dark mode overrides scoped by `[data-theme='dark']` or `.tm-dark`.
- `theme.css` – reset + typography + spacing utilities + grid/stack helpers using container queries.
- `tokens.json` – machine-readable source of truth for docs and tooling.

`npx turbomini theme init` copies these files into your project at `src/styles/turbomini`. Use `turbomini theme create brand` to scaffold new overrides under `src/styles/themes/<name>` with editable `tokens.json` and `theme.css` shells.

## Web Components

The first component, `<tm-button>`, demonstrates the TurboMini web component pattern:

- Extends the shared `TurboMiniElement` base (props ↔ attributes, events, adopted stylesheets).
- Variants: `solid` (default), `soft`, `outline`, `ghost`.
- Sizes: `sm`, `md`, `lg`.
- Custom events: emits `tm-press` with `{ originalEvent, value }` when activated.
- Accessible by default (uses native `<button>`, focus ring from tokens, `aria-busy` when loading).
- Uses only CSS variables (`--tm-button-*`) so themes can override colors, borders, and spacing.
- Token + parts reference: see [`packages/wc/tm-button/README.md`](packages/wc/tm-button/README.md).
- Event naming follows the [`tm-*` convention](docs/web-components/events.md).

Install via the CLI:

```bash
# Copy recipe into src/components
turbomini add tm-button --mode copy

# The CLI defaults to copy mode and will remind you how to switch to --mode wc.

# or consume the published web component package
turbomini add tm-button --mode wc
```

Importing the web component registers it automatically:

```js
import '@turbomini/wc-button';
```

Then use it in templates or markup:

```html
<tm-button variant="soft" size="lg">Click me</tm-button>
```

## Templates

Starter projects and the previous examples now live under `templates/`:

- `templates/starter/spa` – Vite starter used by the CLI `init` command.
- `templates/examples/*` – historical examples preserved for reference.

The starter includes a responsive feature grid that demonstrates container queries (`src/styles/app.css`).

## Server rendering & islands

TurboMini plays nicely with server rendering or island architectures. See [`docs/ssr.md`](docs/ssr.md) for strategies to
defer web component registration, hydrate progressively, and provide light DOM fallbacks while custom elements load.

## Development

```bash
npm install
npm test             # node --test against packages/core/tests
npm run lint         # ESLint over packages/ and templates/
npm run test:e2e     # Playwright tests (requires browsers installed)
```

To work on the CLI or components, run `npm install` once at the workspace root. Each package has its own `package.json` for publishing metadata, but builds run from the monorepo.

## Contributing

1. Fork + clone the repo.
2. `npm install`
3. Make your changes in the relevant package (`packages/core`, `packages/cli`, etc.).
4. Run tests/lint (`npm test`, `npm run lint`).
5. Submit a PR describing the package(s) touched and commands run.

---

Happy shipping! ✨
