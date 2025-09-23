# `<tm-tooltip>`

Lightweight tooltip that opens on hover/focus and clamps to the viewport.

- Emits optional `tm-open`/`tm-close` events (see the [event guide](../../docs/web-components/events.md)).
- `text` property for simple labels or use the `content` slot for rich markup.
- Supports `top`, `bottom`, `left`, `right` placements with viewport clamping.

## Usage

```html
<tm-tooltip text="Removes the item" placement="top">
  <button id="delete-btn">Delete</button>
  <span slot="content">This action cannot be undone.</span>
</tm-tooltip>
```

```js
import '@turbomini/wc-tooltip';
```

> Tip: wrap the trigger inside the tooltip. The component automatically associates `aria-describedby` with the tooltip content.

## Properties

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `text` | `string` | `null` | Simple text label for the tooltip. |
| `placement` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'` | Preferred placement around the trigger. |
| `delay` | `number` | `150` | Delay (ms) before opening on hover/focus. |
| `open` | `boolean` | `false` | Controls visibility programmatically. |

## Events

| Event | Detail | Description |
| --- | --- | --- |
| `tm-open` | `{ open: boolean }` | Fired after the tooltip opens. |
| `tm-close` | `{ open: boolean }` | Fired after the tooltip closes. |

## CSS Custom Properties

| Token | Purpose |
| --- | --- |
| `--tm-tooltip-bg` | Tooltip background color. |
| `--tm-tooltip-fg` | Tooltip text color. |
| `--tm-tooltip-radius` | Corner radius. |
| `--tm-tooltip-pad` | Padding for the content. |
| `--tm-tooltip-shadow` | Drop shadow. |

## Shadow Parts

| Part | Description |
| --- | --- |
| `content` | Tooltip bubble container. |
| `arrow` | Arrow element pointing to the trigger. |

## Accessibility

The tooltip assigns `aria-describedby` to the slotted trigger and hides when focus leaves or Escape is pressed. Use concise copy for the `text` or `content` slot so screen readers announce it quickly.
