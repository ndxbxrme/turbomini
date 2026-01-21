# TurboMini docs style guide

## Voice and tone
- Friendly, concise, and direct.
- Use short sentences and avoid filler.
- Explain the “why” and call out gotchas.

## Writing patterns
- Start each page with a fast example.
- Follow with explanation and variants.
- Use checklists for setup steps.

## Code conventions
- Prefer ES modules.
- Use `app.template`, `app.controller`, `app.start` in examples.
- Use `app.invalidate()` for state updates.
- Use `postLoad()` for DOM wiring and `unload()` for cleanup.

## Formatting
- Use fenced code blocks with language tags.
- Keep code blocks short; link to example repos if long.
- Put “What it demonstrates” in every example README.

## Terminology
- “Template” for TurboMini templating strings.
- “Controller” for route controller functions.
- “Theme tokens” for CSS variable JSON/CSS sources.
- “Web components” for `@turbomini/wc-*` packages.

## Navigation structure
- Landing → Getting Started → Concepts → Guides → Examples → API/CLI.
- Keep the left nav under 8 primary groups.

## Do/Don’t
- Do show one working snippet early.
- Do mention required files and paths.
- Don’t claim features that aren’t verified by tests or examples.
- Don’t assume a build step unless the example uses one.

