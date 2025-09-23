# `<tm-tabs>`

Accessible tab system with keyboard navigation, indicator animation, and support for vertical layouts.

- Emits `tm-change` when a new tab is activated (see the [event guide](../../docs/web-components/events.md)).
- Roving tabindex with arrow-key, Home/End navigation.
- Works with slotted tab/panel markup: assign `slot="tab"` and `slot="panel"` with matching `value` attributes.

## Usage

```html
<tm-tabs value="overview">
  <button slot="tab" value="overview">Overview</button>
  <button slot="tab" value="usage">Usage</button>
  <section slot="panel" value="overview">
    <p>Overview content…</p>
  </section>
  <section slot="panel" value="usage">
    <p>Usage content…</p>
  </section>
</tm-tabs>
```

```js
import '@turbomini/wc-tabs';
```

## Properties

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string` | `null` | Currently selected tab value. Defaults to the first tab. |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Lays out the tablist accordingly. |
| `fitted` | `boolean` | `false` | Distributes tabs evenly across the available width/height. |

## Events

| Event | Detail | Description |
| --- | --- | --- |
| `tm-change` | `{ value: string }` | Fired after selection changes. |

## CSS Custom Properties

| Token | Purpose |
| --- | --- |
| `--tm-tabs-border` | Border separating the tablist from content. |
| `--tm-tabs-accent` | Indicator color. |
| `--tm-tabs-gap` | Gap between the tablist and panels. |
| `--tm-tab-pad` | Tab padding. |
| `--tm-tab-radius` | Tab corner radius. |
| `--tm-tab-fg` | Inactive tab foreground color. |
| `--tm-tab-fg-active` | Active tab foreground color. |
| `--tm-tab-bg` | Inactive tab background. |
| `--tm-tab-bg-active` | Active tab background. |

## Shadow Parts

| Part | Description |
| --- | --- |
| `list` | Tab list container. |
| `tab-indicator` | Animated selection indicator. |
| `tab` | Applied to slotted tab nodes. |
| `panel` | Applied to slotted panel nodes. |

## Accessibility

The component sets `role="tablist"`/`role="tab"`/`role="tabpanel"`, keeps `aria-selected`/`aria-controls` synchronized, and manages focus when users navigate with the keyboard. Panels hide automatically when inactive.
