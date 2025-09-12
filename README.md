# TurboMini

A tiny, dependency-free SPA micro-framework.  
Designed for small projects that want routing, templates, and state without pulling in React/Vue/Angular.

---

## Features

- **Routing** – history API or hash-based.
- **Templates** – minimal mustache-style with `{{var}}`.
- **Controllers** – per-page data providers.
- **State** – reactive proxy object (auto-refresh).
- **Middleware** – run before route changes.
- **Components** – combine templates + controllers.
- **Tiny footprint** – one file, no deps.

---

## Quick Start

Include a `<page>` element in your HTML:

```html
<!doctype html>
<html>
  <body>
    <page></page>
    <script type="module">
      import { TurboMini } from "./src/turbomini.js";

      const app = TurboMini("/");

      app.template("home", "<h1>Hello {{name}}</h1>");
      app.controller("home", () => ({ name: "TurboMini" }));

      app.start();
    </script>
  </body>
</html>
```

Navigate to `/home` (or `#/home` if using hash mode).

---

## Core API

### `app.template(name, text)`

Register a template.

```js
app.template("profile", "<div>{{user}}</div>");
```

### `app.controller(name, fn)`

Register a controller (data provider).

```js
app.controller("profile", () => ({ user: "Alice" }));
```

### `app.start()`

Boot the router and render the current route.

### `app.goto(route)`

Programmatically change routes.

```js
app.goto("/profile");
```

### `app.state`

Reactive object. Any writes trigger a re-render.

```js
app.state.count = 1;
```

### `app.refresh()`

Force a re-render manually.

### `app.addMiddleware(fn)`

Run logic before route changes. Return `false` to cancel.

```js
app.addMiddleware((ctx) => {
  if (ctx.page === "admin" && !loggedIn()) return false;
});
```

### `app.defineComponent(name, { template, controller })`

Bundle template + controller.

```js
app.defineComponent("card", {
  template: "<div>{{title}}</div>",
  controller: () => ({ title: "Hello" }),
});
```

### `app.fetchTemplates(names, path?)`

Load external HTML templates.

```js
await app.fetchTemplates(["header", "footer"], "/partials/");
```

### `app.prefetchTemplates(names)`

Alias for `fetchTemplates`.

### `app.inspect()`

Debug info: routes + templates.

```js
console.log(app.inspect());
```

---

## Example: Counter

```js
const app = TurboMini("/");
app.template(
  "counter",
  `
  <button id="inc">+</button>
  <div>Count: {{count}}</div>
`,
);
app.controller("counter", () => app.state);

app.start();

document.addEventListener("click", (e) => {
  if (e.target.id === "inc") app.state.count++;
});
```

---

## Development

### Run examples

Start a local server and open [http://localhost:8055/examples/00-hello-world/](http://localhost:8055/examples/00-hello-world/):

```bash
npm run examples
```

### Run unit tests

Use Node’s built-in test runner:

```bash
npm test
```

### Run end-to-end tests

Run Playwright against the examples:

```bash
npm run test:e2e
```

### Code quality

Format and lint:

```bash
npm run format
npm run lint
```

---

## Notes

- Routes are based on the first path segment (`/home`, `/about`).
- The root path `/` (or `#/` in hash mode) resolves to the `default` template/controller.
- Use hash routing (`TurboMini('#')`) for static hosting.
- State writes are batched, but you can always call `app.refresh()` explicitly.
