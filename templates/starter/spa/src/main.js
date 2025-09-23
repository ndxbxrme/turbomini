import { TurboMini } from 'turbomini';
import './styles/turbomini/theme.css';
import './styles/app.css';

const app = TurboMini('/');

app.template(
  'default',
  `
  <main class="tm-fluid tm-stack-lg">
    <header class="tm-stack">
      <p class="tm-text-muted">Welcome to</p>
      <h1>{{title}}</h1>
      <p>{{tagline}}</p>
      <nav class="tm-inline tm-gap-sm">
        <a href="https://github.com/ndxbxrme/turbomini" target="_blank" rel="noreferrer">GitHub</a>
        <a href="https://www.npmjs.com/package/turbomini" target="_blank" rel="noreferrer">npm</a>
      </nav>
    </header>
    <section class="tm-grid-responsive">
      {{#each features}}
        <article class="tm-surface tm-pad-md tm-stack">
          <h2>{{title}}</h2>
          <p class="tm-text-muted">{{description}}</p>
        </article>
      {{/each}}
    </section>
    <section class="tm-container-demo">
      <div class="tm-container-demo__grid">
        <div class="tm-container-demo__content tm-stack">
          <h2>{{containerDemo.title}}</h2>
          <p class="tm-text-muted">{{containerDemo.description}}</p>
          <button type="button" class="tm-container-demo__cta">{{containerDemo.cta}}</button>
        </div>
        <div class="tm-container-demo__metric" aria-label="{{containerDemo.metricLabel}}">
          <span class="tm-container-demo__metric-label">{{containerDemo.metricLabel}}</span>
          <span class="tm-container-demo__chip">{{containerDemo.metricValue}}</span>
        </div>
      </div>
    </section>
  </main>
`
);

app.controller('default', () => ({
  title: 'TurboMini Starter',
  tagline: 'Ship micro front-ends with themable, web-component friendly utilities.',
  features: [
    {
      title: 'Lightweight runtime',
      description: 'Progressive enhancement friendly, dependency-free, and easy to reason about.'
    },
    {
      title: 'Design tokens first',
      description: 'Customize colors, spacing, and typography using a single source of truth.'
    },
    {
      title: 'Composable components',
      description: 'Install web components or copy source into your project with the CLI.'
    }
  ],
  containerDemo: {
    title: 'Container-aware layout',
    description: 'Resize this panel and the metric snaps into place with CSS container queries.',
    cta: 'Explore theming docs',
    metricLabel: 'Breakpoint',
    metricValue: '≥ 42rem'
  }
}));

app.start();
