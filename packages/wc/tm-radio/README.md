# `<tm-radio>`

Single radio control used inside and outside `<tm-radio-group>`. Mirrors native radio behavior while exposing styling hooks.

- Emits `tm-change` when selected (see the [event guide](../../docs/web-components/events.md)).
- Works standalone or in tandem with `<tm-radio-group>` for managed selection.

## Usage

```html
<tm-radio name="plan" value="starter">Starter</tm-radio>
<tm-radio name="plan" value="pro">Pro</tm-radio>
```

```js
import '@turbomini/wc-radio';
```

## Properties

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `checked` | `boolean` | `false` | Whether the radio is selected. |
| `disabled` | `boolean` | `false` | Disables interaction. |
| `name` | `string` | `null` | Shared group name for form submissions. |
| `value` | `string` | `null` | Submitted value when selected. |

## Events

| Event | Detail | Description |
| --- | --- | --- |
| `tm-change` | `{ checked: boolean, value: string \| null, originalEvent: Event }` | Fires when the radio is selected. |

## CSS Custom Properties

Shares the same control tokens as `<tm-checkbox>`:

| Token | Purpose |
| --- | --- |
| `--tm-control-size` | Size of the control. |
| `--tm-control-bg` | Background color when unchecked. |
| `--tm-control-border` | Border color when unchecked. |
| `--tm-control-checked-bg` | Fill color for the inner dot. |
| `--tm-control-radius` | Corner radius (defaults to full for radios). |
| `--tm-label-gap` | Gap between the control and label. |

## Shadow Parts

| Part | Description |
| --- | --- |
| `base` | Wrapper containing the control and label. |
| `control` | Visual radio outline. |
| `indicator` | Inner dot displayed when selected. |
| `label` | Label span wrapping the default slot. |

## Accessibility

The component renders a native `<input type="radio">`, ensuring browser-level semantics and form participation. Combine with `<tm-radio-group>` for roving focus and single-selection management.
