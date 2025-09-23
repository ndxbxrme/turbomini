# `<tm-dialog>`

Accessible dialog component with focus management, ESC/overlay dismissal, and configurable modality.

- Emits `tm-open`/`tm-close` when toggled (see the [event guide](../../docs/web-components/events.md)).
- Focus trap, scroll locking, and focus restoration built in.
- Supports programmatic control via `show()`/`close()`.

## Usage

```html
<tm-dialog id="settings" closable>
  <h2 slot="title">Settings</h2>
  <p>Adjust the application configuration below.</p>
  <div slot="footer">
    <tm-button variant="soft" id="close-settings">Close</tm-button>
  </div>
</tm-dialog>

<script type="module">
  import '@turbomini/wc-dialog';
  import '@turbomini/wc-button';

  document.querySelector('#open-settings').addEventListener('click', () => {
    document.querySelector('#settings').show();
  });
  document.querySelector('#close-settings').addEventListener('click', () => {
    document.querySelector('#settings').close();
  });
</script>
```

## Properties

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `open` | `boolean` | `false` | Controls whether the dialog is shown. |
| `modal` | `boolean` | `true` | When `true`, blocks background interaction and locks scroll. |
| `closable` | `boolean` | `true` | Shows the close button and allows overlay/Escape dismissal. |
| `initialFocus` | `string` | `null` | CSS selector to focus when the dialog opens. |

## Methods

| Method | Description |
| --- | --- |
| `show()` | Opens the dialog (equivalent to setting `open = true`). |
| `close()` | Closes the dialog (equivalent to setting `open = false`). |

## Events

| Event | Detail | Description |
| --- | --- | --- |
| `tm-open` | `{ modal: boolean }` | Fired after the dialog opens. |
| `tm-close` | `{ reason: 'close-button' \| 'overlay' \| 'escape' \| 'method' }` | Fired after the dialog closes. |

## CSS Custom Properties

| Token | Purpose |
| --- | --- |
| `--tm-dialog-bg` | Dialog background color. |
| `--tm-dialog-fg` | Foreground color. |
| `--tm-dialog-radius` | Corner radius of the content surface. |
| `--tm-dialog-shadow` | Box shadow/elevation. |
| `--tm-dialog-pad` | Internal padding. |
| `--tm-overlay-bg` | Backdrop color. |

## Shadow Parts

| Part | Description |
| --- | --- |
| `overlay` | Backdrop element. |
| `content` | Dialog container. |
| `title` | Title/header region (slot `title`). |
| `body` | Main body slot. |
| `footer` | Footer slot for actions. |
| `close` | Close button. |

## Accessibility

The component sets `role="dialog"`, traps focus while open, and restores focus to the triggering element on close. Escape and overlay clicks (when `closable`) dismiss the dialog. Provide a descriptive heading via the `title` slot for screen readers.
