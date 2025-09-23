# `<tm-card>`

Layout surface with header/media/body/footer slots, responsive padding, and optional interactivity.

- Props toggle elevation (`elevated`), interactivity (`interactive`), and compact padding (`inset`).
- Provides CSS tokens for background, borders, shadows, and radius.
- Acts like a block-level container—place any markup in the default slot.

## Usage

```html
<tm-card elevated interactive>
  <div slot="header">Weekly summary</div>
  <img slot="media" src="/chart.png" alt="Revenue chart" />
  <p>Revenue increased 12% WoW with strong retention in paid plans.</p>
  <div slot="footer">
    <tm-button variant="ghost">View report</tm-button>
  </div>
</tm-card>
```

```js
import '@turbomini/wc-card';
```

## Properties

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `elevated` | `boolean` | `false` | Adds box shadow and removes the border. |
| `interactive` | `boolean` | `false` | Makes the card focusable (`tabindex="0"`) with hover/focus affordances. |
| `inset` | `boolean` | `false` | Uses slightly tighter padding. |

## CSS Custom Properties

| Token | Purpose |
| --- | --- |
| `--tm-card-bg` | Card background color. |
| `--tm-card-fg` | Foreground color. |
| `--tm-card-border` | Border color. |
| `--tm-card-radius` | Corner radius. |
| `--tm-card-pad` | Internal padding. |
| `--tm-card-shadow` | Elevation used when `elevated` or `interactive`. |

## Shadow Parts

| Part | Description |
| --- | --- |
| `header` | Header section (slot `header`). |
| `media` | Media container (slot `media`). |
| `body` | Default slot container. |
| `footer` | Footer section (slot `footer`). |

## Accessibility

Interactive cards expose `role="button"` and respond to focus/keyboard navigation. Provide headings inside the card to convey structure and ensure media elements include alt text.
