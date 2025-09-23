# `<tm-select>`

Custom select/menu component with keyboard navigation, large dataset support, and themable surfaces.

- Emits `tm-open`, `tm-close`, `tm-change`, and `tm-highlight` (see the [event guide](../../docs/web-components/events.md)).
- Works with native `<option>` elements or `<tm-select-option>` helpers.
- Form-associated: submits the current `value` when used in a form.

## Usage

```html
<tm-select name="country" placeholder="Choose a country">
  <option value="ca">Canada</option>
  <option value="us">United States</option>
  <option value="mx">Mexico</option>
</tm-select>
```

```js
import '@turbomini/wc-select';

document.querySelector('tm-select').addEventListener('tm-change', (event) => {
  console.log('selected value', event.detail.value);
});
```

## Properties

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string` | `null` | Selected option value. |
| `disabled` | `boolean` | `false` | Disables the trigger. |
| `placeholder` | `string` | `""` | Placeholder text when nothing is selected. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Trigger sizing. |
| `name` | `string` | `null` | Form field name. |
| `open` | `boolean` | `false` | Whether the menu is open. |

## Events

| Event | Detail | Description |
| --- | --- | --- |
| `tm-open` | `{ open: boolean }` | Fired when the menu opens. |
| `tm-close` | `{ open: boolean }` | Fired when the menu closes. |
| `tm-change` | `{ value: string \| null, option: { label: string, value: string } }` | Fired when the selection changes. |
| `tm-highlight` | `{ value: string \| null }` | Fired when the highlighted option changes via keyboard/pointer. |

## CSS Custom Properties

| Token | Purpose |
| --- | --- |
| `--tm-select-trigger-bg` | Trigger background color. |
| `--tm-select-trigger-fg` | Trigger text color. |
| `--tm-select-trigger-border` | Trigger border color. |
| `--tm-select-trigger-radius` | Trigger border radius. |
| `--tm-select-trigger-pad` | Trigger padding. |
| `--tm-select-menu-bg` | Menu surface color. |
| `--tm-select-menu-shadow` | Menu elevation/shadow. |
| `--tm-select-menu-border` | Menu border color. |
| `--tm-select-option-bg-hover` | Background when an option is hovered/highlighted. |
| `--tm-select-option-bg-selected` | Background for the selected option. |

## Shadow Parts

| Part | Description |
| --- | --- |
| `trigger` | Button-like trigger element. |
| `icon` | Icon wrapper inside the trigger. |
| `menu` | Menu container (`role="listbox"`). |
| `option` | Individual option row. |
| `option-check` | Checkmark indicator container. |
| `option-label` | Label span within an option. |

## Accessibility

The component renders a `role="listbox"` menu and keeps `aria-expanded`, `aria-activedescendant`, and `aria-disabled` attributes in sync. Keyboard support includes arrow keys, Home/End, Escape, and Enter/Space for selection. The menu clamps to the viewport when positioned.
