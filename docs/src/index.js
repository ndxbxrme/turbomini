import { TurboMini } from "./turbomini.js";
import './components/tm-animated-logo.js';
const app = TurboMini("/turbomini");
const docsBase = '/turbomini';
const examplesBase = `${docsBase}/examples`;
const examples = [
  {
    slug: 'hello-routing',
    title: 'Hello Routing',
    description: 'Basic routing with controllers and templates.',
    meta: 'npm run dev → /examples/hello-routing/',
    href: `${examplesBase}/hello-routing/`,
    target: '_top',
    image: `${docsBase}/assets/examples/hello-routing.png`,
  },
  {
    slug: 'form-validation',
    title: 'Form Validation',
    description: 'Handle form submit + inline validation with postLoad().',
    meta: 'npm test to verify',
    href: `${examplesBase}/form-validation/`,
    target: '_top',
    image: `${docsBase}/assets/examples/form-validation.png`,
  },
  {
    slug: 'data-fetching',
    title: 'Data Fetching',
    description: 'Load JSON data and render lists with {{#each}}.',
    meta: 'npm run dev to run',
    href: `${examplesBase}/data-fetching/`,
    target: '_top',
    image: `${docsBase}/assets/examples/data-fetching.png`,
  },
  {
    slug: 'state-store',
    title: 'State Store',
    description: 'Manual store + app.invalidate() updates.',
    meta: 'npm test to verify',
    href: `${examplesBase}/state-store/`,
    target: '_top',
    image: `${docsBase}/assets/examples/state-store.png`,
  },
  {
    slug: 'controller-patterns',
    title: 'Controller Patterns',
    description: 'Compose controllers with shared data utilities.',
    meta: 'npm run dev to run',
    href: `${examplesBase}/controller-patterns/`,
    target: '_top',
    image: `${docsBase}/assets/examples/controller-patterns.png`,
  },
  {
    slug: 'layouts-partials',
    title: 'Layouts & Partials',
    description: 'Reusable layout wrapper with header/footer partials.',
    meta: 'npm test to verify',
    href: `${examplesBase}/layouts-partials/`,
    target: '_top',
    image: `${docsBase}/assets/examples/layouts-partials.png`,
  },
  {
    slug: 'theme-switching',
    title: 'Theme Switching',
    description: 'System preference + data-theme persistence.',
    meta: 'npm run dev to run',
    href: `${examplesBase}/theme-switching/`,
    target: '_top',
    image: `${docsBase}/assets/examples/theme-switching.png`,
  },
  {
    slug: 'web-components',
    title: 'Web Components',
    description: 'tm-* events, slots, and props in templates.',
    meta: 'npm test to verify',
    href: `${examplesBase}/web-components/`,
    target: '_top',
    image: `${docsBase}/assets/examples/web-components.png`,
  },
  {
    slug: 'real-app-dashboard',
    title: 'Real App Dashboard',
    description: 'Multi-section dashboard with filters + stats.',
    meta: 'npm run dev to run',
    href: `${examplesBase}/real-app-dashboard/`,
    target: '_top',
    image: `${docsBase}/assets/examples/real-app-dashboard.png`,
  },
  {
    slug: 'middleware-guard',
    title: 'Middleware Guard',
    description: 'Cancel routes with app.addMiddleware() guards.',
    meta: 'npm test to verify',
    href: `${examplesBase}/middleware-guard/`,
    target: '_top',
    image: `${docsBase}/assets/examples/middleware-guard.png`,
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
  ], '/turbomini/src/components/');
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
