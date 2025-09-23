# `<tm-radio-group>`

Coordinated set of `<tm-radio>` controls with roving tabindex, arrow-key navigation, and form integration.

- Emits `tm-change` when selection changes (see the [event guide](../../docs/web-components/events.md)).
- Applies roving tabindex and `aria-orientation` based on usage.
- Form-associated: the group's `value` is submitted under its `name` attribute.

## Usage

```html
<tm-radio-group name="plan" value="starter">
  <span slot="label">Choose a plan</span>
  <tm-radio value="starter">Starter</tm-radio>
  <tm-radio value="growth">Growth</tm-radio>
  <tm-radio value="enterprise" disabled>Enterprise</tm-radio>
</tm-radio-group>
```

```js
import '@turbomini/wc-radio-group';
```

## Properties

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `name` | `string` | `null` | Form field name for submissions. |
| `value` | `string` | `null` | Value of the selected radio. |

## Events

| Event | Detail | Description |
| --- | --- | --- |
| `tm-change` | `{ value: string \| null, originalEvent: Event \| null }` | Fires when a new radio is selected. |

## Shadow Parts

| Part | Description |
| --- | --- |
| `list` | Container holding the radio tablist. |
| `label` | Optional label wrapper (slot `label`). |

## Accessibility

The group sets `role="radiogroup"`, manages `aria-labelledby`, and keeps focus within the selected radio using roving `tabindex`. Arrow keys cycle through enabled options. Use the `label` slot to provide a visible caption.
