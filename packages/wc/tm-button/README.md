# `<tm-button>`

Accessible button web component that consumes TurboMini design tokens and exposes slots/parts for advanced styling.

- Variants: `solid` (default), `soft`, `outline`, `ghost`
- Sizes: `sm`, `md`, `lg`
- Events: emits [`tm-press`](../../docs/web-components/events.md#standard-events) when activated

## Token contract

The component relies on the following CSS custom properties. Each token has sensible defaults wired up to
`@turbomini/theme-base`, but you can override them at any scope.

| Token | Purpose |
| --- | --- |
| `--tm-button-bg` | Background color for the button surface. |
| `--tm-button-bg-hover` | Background color when hovered. |
| `--tm-button-bg-active` | Background color when pressed. |
| `--tm-button-fg` | Foreground text/icon color. |
| `--tm-button-border` | Border color in the default state. |
| `--tm-button-border-hover` | Border color on hover. |
| `--tm-button-shadow` | Box shadow used to elevate the button. |
| `--tm-button-radius` | Corner radius. |
| `--tm-button-font-weight` | Font weight applied to the label. |
| `--tm-button-font-size` | Base font size. |
| `--tm-button-pad-y` | Vertical padding. |
| `--tm-button-pad-x` | Horizontal padding. |
| `--tm-button-gap` | Gap between icon/label content. |
| `--tm-button-min-height` | Minimum inline-size/height the button should maintain. |

## Shadow parts

| Part | Description |
| --- | --- |
| `base` | The native `<button>` element that handles focus and interaction. |
| `content` | Wrapper around the default slot, useful for spacing overrides. |
| `indicator` | Loading spinner element that appears when `loading` is true. |

## Usage

```js
import '@turbomini/wc-button';

document.body.innerHTML = `
  <tm-button variant="soft" size="lg">Action</tm-button>
`;
```

The button inherits tokens from light or dark themes automatically. Apply `[data-theme="dark"]` or `.tm-dark` to scope dark
mode overrides to a container instead of the entire document when needed.
