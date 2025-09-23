# TurboMini Event Naming

TurboMini web components namespace all custom events with the `tm-` prefix so they are easy to filter and avoid collisions with
host application events.

## Core rules

- Always emit events using the `tm-` prefix. For example, use `tm-press` instead of `press`.
- Favor the shared verbs listed below so consumers can rely on consistent semantics across components.
- Dispatch events from the component instance (`this.emit(...)`) so they bubble and are composed by default.

## Standard events

| Event name | When to use it |
| --- | --- |
| `tm-press` | A component was activated via click, keyboard, or pointer input. |
| `tm-change` | A value changed (inputs, toggles, radio groups). |
| `tm-select` | A choice from a list or menu was chosen. |
| `tm-open` | A disclosure element (dialog, drawer, dropdown) opened. |
| `tm-close` | A disclosure element closed. |

The [`TurboMiniElement`](../../packages/wc/shared/base-element.js) helper automatically prefixes events passed to
`this.emit(name, detail)`. Passing `tm-press` keeps the prefix, while passing `press` will be converted to `tm-press` for you.

When documenting a component, link back to this guide and list the specific events it emits so application developers can bind
listeners with confidence.
