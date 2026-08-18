# TurboMini

Tiny dependency-free SPA micro-framework with CLI tooling.

TurboMini gives you a small runtime for templates, routing, controllers, and lifecycle hooks. The published `turbomini` package also exposes the `turbomini` CLI, so `npm install turbomini` and `npx turbomini ...` use the same command surface.

## Install

```bash
npm install turbomini
```

## Scaffold A Project

```bash
npx turbomini init my-app
cd my-app
npm run dev
```

## Runtime Usage

```html
<!doctype html>
<html lang="en">
  <body>
    <page></page>
    <script type="module">
      import { TurboMini } from 'turbomini';

      const app = TurboMini('/');
      app.template('home', '<h1>Hello {{name}}</h1>');
      app.controller('home', () => ({ name: 'TurboMini' }));
      app.start();
    </script>
  </body>
</html>
```

## CLI Commands

```bash
npx turbomini --help
npx turbomini theme init
npx turbomini add tm-button
npx turbomini doctor
```

## Links

- Docs: https://ndxbxrme.github.io/turbomini/
- Repository: https://github.com/ndxbxrme/turbomini
- Issues: https://github.com/ndxbxrme/turbomini/issues
