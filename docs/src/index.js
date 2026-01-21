import { TurboMini } from "./turbomini.js";
import './components/tm-animated-logo.js';
const app = TurboMini("/turbomini");
const examples = [
  {
    title: 'Hello Routing',
    description: 'Basic routing with controllers and templates.',
    meta: 'npm run dev → /examples/hello-routing/',
    href: '../examples/hello-routing/',
  },
  {
    title: 'Form Validation',
    description: 'Handle form submit + inline validation with postLoad().',
    meta: 'npm test to verify',
    href: '../examples/form-validation/',
  },
  {
    title: 'Data Fetching',
    description: 'Load JSON data and render lists with {{#each}}.',
    meta: 'npm run dev to run',
    href: '../examples/data-fetching/',
  },
  {
    title: 'State Store',
    description: 'Manual store + app.invalidate() updates.',
    meta: 'npm test to verify',
    href: '../examples/state-store/',
  },
  {
    title: 'Controller Patterns',
    description: 'Compose controllers with shared data utilities.',
    meta: 'npm run dev to run',
    href: '../examples/controller-patterns/',
  },
  {
    title: 'Layouts & Partials',
    description: 'Reusable layout wrapper with header/footer partials.',
    meta: 'npm test to verify',
    href: '../examples/layouts-partials/',
  },
  {
    title: 'Theme Switching',
    description: 'System preference + data-theme persistence.',
    meta: 'npm run dev to run',
    href: '../examples/theme-switching/',
  },
  {
    title: 'Web Components',
    description: 'tm-* events, slots, and props in templates.',
    meta: 'npm test to verify',
    href: '../examples/web-components/',
  },
  {
    title: 'Real App Dashboard',
    description: 'Multi-section dashboard with filters + stats.',
    meta: 'npm run dev to run',
    href: '../examples/real-app-dashboard/',
  },
  {
    title: 'Middleware Guard',
    description: 'Cancel routes with app.addMiddleware() guards.',
    meta: 'npm test to verify',
    href: '../examples/middleware-guard/',
  },
];
app.run(async app => {
  console.log('fetching default');
  app.errorHandler = console.log;
  await app.fetchTemplates([
    'default',
    'header',
    'examples',
    'getting-started',
    'concepts',
    'guides',
    'guides/project-organization',
    'guides/controllers',
    'guides/templating',
    'guides/themes',
    'guides/web-components',
    'api-reference',
  ], '/src/components/');
  console.log('fetched');
  app.controller('default', () => {
    return {
      name: 'buddy',
      examples,
    }
  });
  app.controller('examples', () => {
    return {
      name: 'examples',
      examples,
    }
  });
  app.controller('getting-started', () => {
    return {
      name: 'getting-started',
    }
  });
  app.controller('concepts', () => {
    return {
      name: 'concepts',
    }
  });
  app.controller('guides', () => {
    return {
      name: 'guides',
    }
  });
  app.controller('guides/project-organization', () => {
    return {
      name: 'guides',
    }
  });
  app.controller('guides/controllers', () => {
    return {
      name: 'guides',
    }
  });
  app.controller('guides/templating', () => {
    return {
      name: 'guides',
    }
  });
  app.controller('guides/themes', () => {
    return {
      name: 'guides',
    }
  });
  app.controller('guides/web-components', () => {
    return {
      name: 'guides',
    }
  });
  app.controller('api-reference', () => {
    return {
      name: 'api-reference',
    }
  });
  app.start();
});
