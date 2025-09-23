# `<tm-checkbox>`

Custom checkbox that mirrors native behavior while exposing TurboMini theming hooks.

- Emits `tm-change` when toggled (see the [event guide](../../docs/web-components/events.md)).
- Form-associated: participates in submission and constraint validation.
- Supports the indeterminate visual state.

## Usage

```html
<tm-checkbox name="features" value="analytics">Enable analytics</tm-checkbox>
```

```js
import '@turbomini/wc-checkbox';

document.querySelector('tm-checkbox').indeterminate = true;
```

## Properties

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `checked` | `boolean` | `false` | Whether the checkbox is checked. |
| `indeterminate` | `boolean` | `false` | Puts the control into the mixed state. Clears automatically when the user toggles. |
| `disabled` | `boolean` | `false` | Disables interaction. |
| `name` | `string` | `null` | Form field name. |
| `value` | `string` | `'on'` | Submitted value when checked. |

## Events

| Event | Detail | Description |
| --- | --- | --- |
| `tm-change` | `{ checked: boolean, indeterminate: boolean, value: string, originalEvent: Event }` | Fires when the state changes. |

## CSS Custom Properties

| Token | Purpose |
| --- | --- |
| `--tm-control-size` | Size of the control box. |
| `--tm-control-bg` | Background color when unchecked. |
| `--tm-control-border` | Border color when unchecked. |
| `--tm-control-checked-bg` | Background color when checked. |
| `--tm-control-radius` | Corner radius of the control. |
| `--tm-label-gap` | Gap between the control and label. |

## Shadow Parts

| Part | Description |
| --- | --- |
| `base` | Wrapper containing the control and label. |
| `control` | Visual box rendered behind the checkbox. |
| `indicator` | Checkmark/indeterminate indicator. |
| `label` | Label span wrapping the default slot. |

## Accessibility

The component renders a native `<input type="checkbox">` so it inherits browser semantics, keyboard handling, and form behavior.
