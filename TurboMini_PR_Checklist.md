# TurboMini PR Checklist

A concise, actionable list the agent can use to polish the repo before the next release. Check items off and commit the file with your PR.

---

## 0) Scope & Metadata
- [ ] Title clearly states scope (e.g., `feat(cli): default add mode to copy`).
- [ ] PR description links to related issues and includes before/after notes or screenshots.
- [ ] Labels set (`feat`, `fix`, `docs`, `chore`, `ci`).

---

## 1) CLI Ergonomics
- [ ] **Default `turbomini add` to copy mode**; message suggests `--mode wc` for package install.
- [ ] Add `--dry-run` to all mutating commands; prints a readable diff.
- [ ] Success output prints next steps (imports, example usage).
- [ ] Introduce `turbomini doctor` (stub is fine) to check: token drift, version mismatches, missing files.
- [ ] CLI help is up-to-date: `turbomini --help` lists all commands & flags.

**Acceptance hints**
```bash
npx turbomini add button         # copies source by default
npx turbomini add button --mode wc  # installs @turbomini/wc-button
```

---

## 2) Package Naming & Tree-Shaking
- [ ] All WC packages use the `@turbomini/wc-*` naming scheme.
- [ ] Each package.json has `name`, `version`, `exports`, `types`, and `"sideEffects": false` (where safe).
- [ ] CSS imports are explicit (don’t rely on side effects).

---

## 3) Web Components Base & Conventions
- [ ] Base element provides **adoptedStyleSheets** with a `<style>` fallback for older Safari/iframes.
- [ ] Event conventions centralized: document `tm-press`, `tm-change`, `tm-select`, `tm-open`, `tm-close` in `/docs/conventions/events.md`.
- [ ] Each component README links to the conventions doc.
- [ ] Each component README includes a table of:
  - Consumed CSS vars (e.g., `--tm-button-bg`, `--tm-button-fg`, padding/radius vars)
  - Exposed `part`s (e.g., `base`, `label`, `icon`, etc.)
- [ ] Components pass keyboard and ARIA checks (see A11y section).

**Fallback snippet (example)**
```ts
const sheet = new CSSStyleSheet();
sheet.replaceSync(styles);
if (this.shadowRoot && 'adoptedStyleSheets' in this.shadowRoot) {
  (this.shadowRoot as any).adoptedStyleSheets = [sheet];
} else {
  const styleEl = document.createElement('style');
  styleEl.textContent = styles;
  this.shadowRoot?.appendChild(styleEl);
}
```

---

## 4) Theming & Tokens
- [ ] Tokens exported as `tokens.css`, `tokens.dark.css`, and `tokens.json`.
- [ ] `[data-theme="dark"]` **and** `.tm-dark` scoping supported and documented.
- [ ] Base utilities reference tokens; no hard-coded colors/sizes in components.
- [ ] `theme create <name>` prompts for primary hue, radius scale, font stack; emits minimal `theme.css` + `<name>.tokens.json` with comments.

---

## 5) Starter & Demos
- [ ] Starter shows **container queries** with a responsive card or grid (resize a parent to see behavior).
- [ ] Starter includes a **theme switcher** (light/dark toggler using `[data-theme]`). 
- [ ] `turbomini add button` injects a demo page/section showcasing variants/sizes and listening to `tm-press`.
- [ ] README includes copy/paste snippets for quick usage.

---

## 6) Accessibility & QA
- [ ] Axe (or similar) a11y checks pass on the starter and component demos.
- [ ] Keyboard navigation: focus-visible rings (tokenized), correct tab order, ESC closes dialog, etc.
- [ ] Prefer-reduced-motion respected via tokens (e.g., disable heavy transitions when set).
- [ ] Visual regression: add 1–2 Playwright snapshots for key states (default/dark/hover/focus).

---

## 7) CI & Releases
- [ ] Add **Changesets** for independent versioning of `@turbomini/cli` and `@turbomini/wc-*`.
- [ ] CI workflow includes: install → build → lint → test (unit + basic e2e) → changeset version/publish (on main).
- [ ] Protect `main` with required checks; publish happens from tags created by Changesets.
- [ ] Document release steps in `/docs/maintainers/release.md`.

**Changesets quickstart**
```bash
pnpm add -D @changesets/cli
pnpm changeset init
# after changes:
pnpm changeset           # add a changeset
pnpm changeset version   # bump versions locally
pnpm -r publish --access public
```

---

## 8) Docs
- [ ] Add `/docs/` (VitePress or plain MD) with:
  - Getting started (CLI + runtime)
  - Theming guide
  - Events & parts conventions
  - Component pages (button first)
- [ ] Link docs from the root README.

---

## 9) Nice-to-haves (optional, but impactful)
- [ ] `turbomini update` prints a colorized diff and offers apply/skip per file.
- [ ] `.turbominirc` supports defaults (e.g., prefer `copy` mode).
- [ ] `turbomini doctor` suggests fixes (e.g., add missing token vars).

---

## 10) Sanity Commands (should all succeed)
```bash
pnpm -w build
pnpm -w test
npx turbomini init demo-app --dry-run
npx turbomini theme init --dry-run
npx turbomini add button --dry-run
```

---

**When this checklist is all green, ship it 🚀**
