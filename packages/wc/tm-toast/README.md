# `<tm-toast>`

Toast manager that queues notifications, auto-dismisses after a configurable duration, and exposes an imperative `show()` API.

- Emits `tm-close` with the toast id and reason (see the [event guide](../../docs/web-components/events.md)).
- Supports action buttons, close buttons, and Escape dismissal.
- Positioned bottom-right by default; override via CSS if needed.

## Usage

```html
<tm-toast id="toaster"></tm-toast>
<tm-button id="notify">Notify</tm-button>

<script type="module">
  import '@turbomini/wc-toast';
  import '@turbomini/wc-button';

  const toaster = document.querySelector('#toaster');
  document.querySelector('#notify').addEventListener('click', () => {
    toaster.show({
      title: 'Saved',
      description: 'Profile changes stored successfully.',
      variant: 'success',
    });
  });
</script>
```

## Properties

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `variant` | `'info' \| 'success' \| 'warning' \| 'danger'` | `'info'` | Default variant applied to new toasts. |
| `closable` | `boolean` | `true` | Whether toasts include a close button by default. |
| `duration` | `number` | `4000` | Auto-dismiss duration (ms). Use `0` to disable. |

## Methods

| Method | Description |
| --- | --- |
| `show(options)` | Displays a toast. Options: `title`, `description`, `variant`, `closable`, `duration`, `action` ({ label, handler }). Returns the toast id. |
| `dismiss(id, reason?)` | Removes a toast manually. |
| `clear()` | Clears all toasts. |

## Events

| Event | Detail | Description |
| --- | --- | --- |
| `tm-close` | `{ id: string, reason: 'timeout' \| 'action' \| 'dismiss' \| 'escape' }` | Fired when a toast leaves the queue. |

## CSS Custom Properties

| Token | Purpose |
| --- | --- |
| `--tm-toast-bg` | Toast background color. |
| `--tm-toast-fg` | Toast foreground color. |
| `--tm-toast-radius` | Corner radius. |
| `--tm-toast-shadow` | Elevation/shadow. |
| `--tm-toast-gap` | Gap between stacked toasts. |
| `--tm-z-toast` | Stacking context z-index. |

## Shadow Parts

| Part | Description |
| --- | --- |
| `item` | Wrapper for the toast surface. |
| `title` | Title heading element. |
| `description` | Description paragraph. |
| `action` | Action button container. |
| `close` | Close button. |

## Accessibility

Toasts use `role="status"` by default or `role="alertdialog"` when interactive. ESC closes the most recent toast. Provide concise titles/descriptions so screen readers announce them quickly.
