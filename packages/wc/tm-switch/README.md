# `<tm-switch>`

Accessible toggle switch backed by a native checkbox. Supports keyboard activation, form submission, and theming via CSS variables.

- Sizes: `sm`, `md`, `lg`
- Emits the standard `tm-change` event (see the [event guide](../../docs/web-components/events.md)).
- Slots: default slot renders a label adjacent to the control.

## Usage

```html
<tm-switch name="notifications" value="email">Email notifications</tm-switch>
```

```js
import '@turbomini/wc-switch';

document.querySelector('tm-switch').addEventListener('tm-change', (event) => {
  console.log('checked?', event.detail.checked);
});
```

## Properties

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `checked` | `boolean` | `false` | Whether the switch is on. |
| `disabled` | `boolean` | `false` | Prevents user interaction. |
| `name` | `string` | `null` | Form field name when used inside a `<form>`. |
| `value` | `string` | `null` | Submitted value when checked. Defaults to `'on'`. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Visual size of the switch. |

## Events

| Event | Detail | Description |
| --- | --- | --- |
| `tm-change` | `{ checked: boolean, value: string \| null, originalEvent: Event }` | Fires when the switch toggles. |

## CSS Custom Properties

| Token | Purpose |
| --- | --- |
| `--tm-switch-track-bg` | Background color of the track when unchecked. |
| `--tm-switch-track-bg-checked` | Track background when checked. |
| `--tm-switch-thumb-bg` | Thumb (handle) color. |
| `--tm-switch-radius` | Track border radius. |
| `--tm-switch-gap` | Gap between the control and label. |

## Shadow Parts

| Part | Description |
| --- | --- |
| `base` | Wrapper around the control and label. |
| `track` | Visual track element. |
| `thumb` | Thumb/handle element. |
| `label` | Label span containing the default slot. |

## Accessibility

The component renders a native checkbox with `role="switch"` and keeps `aria-checked` in sync. It is form-associated so the value participates in form submissions.
