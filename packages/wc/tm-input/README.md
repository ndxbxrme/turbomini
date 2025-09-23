# `<tm-input>`

Accessible text input with label, hint, and error slots. The control uses native `<input>` semantics and exposes styling hooks via CSS variables and shadow parts.

- Sizes: `sm`, `md` (default), `lg`
- Emits standard `tm-input`, `tm-change`, `tm-focus`, and `tm-blur` events (see the [event guide](../../docs/web-components/events.md)).
- Slots for start/end icons, descriptive text, and labels.

## Usage

```html
<tm-input name="email" type="email" placeholder="you@example.com">
  <span slot="label">Email</span>
  <span slot="hint">We'll never share your address.</span>
</tm-input>
```

```js
import '@turbomini/wc-input';

document.querySelector('tm-input').addEventListener('tm-change', (event) => {
  console.log(event.detail.value);
});
```

## Properties

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string` | `""` | Current value of the input. |
| `type` | `string` | `"text"` | Input type (`text`, `email`, `password`, etc.). |
| `placeholder` | `string` | `""` | Placeholder text when empty. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Visual size of the control. |
| `disabled` | `boolean` | `false` | Disables interaction and form submission. |
| `required` | `boolean` | `false` | Marks the field as required. |
| `invalid` | `boolean` | `false` | Forces the invalid state and `aria-invalid`. |
| `name` | `string` | `null` | Form name when used in a `<form>`. |
| `autocomplete` | `string` | `null` | Native `autocomplete` hint. |

## Events

| Event | Detail | Description |
| --- | --- | --- |
| `tm-input` | `{ value: string, originalEvent: InputEvent }` | Fires on each keystroke/change. |
| `tm-change` | `{ value: string, originalEvent: Event }` | Fires when the value is committed (blur or Enter). |
| `tm-focus` | `{ originalEvent: FocusEvent }` | Fires when the input gains focus. |
| `tm-blur` | `{ originalEvent: FocusEvent }` | Fires when the input loses focus. |

## CSS Custom Properties

| Token | Purpose |
| --- | --- |
| `--tm-input-bg` | Background color for the input surface. |
| `--tm-input-fg` | Text color inside the control. |
| `--tm-input-border` | Default border color. |
| `--tm-input-border-focus` | Border color when focused. |
| `--tm-input-radius` | Corner radius. |
| `--tm-input-pad-x` | Horizontal padding. |
| `--tm-input-pad-y` | Vertical padding. |
| `--tm-input-shadow-focus` | Box shadow applied on focus. |

## Shadow Parts

| Part | Description |
| --- | --- |
| `label` | Wrapper around the label slot. |
| `control` | The `<input>` element. |
| `hint` | Container for hint content. |
| `error` | Container for error content. |
| `icon-start` | Wrapper for the leading icon slot. |
| `icon-end` | Wrapper for the trailing icon slot. |

## Accessibility

`<tm-input>` keeps its label, hint, and error content associated via `aria-labelledby`/`aria-describedby`. When placed inside a form it participates in submission using form-associated custom element internals.
