import { TurboMini } from './turbomini.js';

export function createApp() {
  const app = TurboMini('/turbomini/examples/layouts-partials/');

  app.template('header', '<header><h2>{{title}}</h2><span>{{tagline}}</span></header>');
  app.template('footer', '<footer><small>{{footer}}</small><span>{{year}}</span></footer>');
  app.template('card', '<li class="card">{{title}} — {{owner}}</li>');
  app.template('layout', '<div class="layout">{{> header title=title tagline=tagline}}<section>{{{body}}}</section>{{> footer .}}</div>');

  app.template(
    'default',
    `
    {{> layout title=title tagline=tagline body=content footer=footer year=year}}
    `
  );

  app.controller('default', () => {
    const cards = [
      { title: 'Theme refresh', owner: 'Design' },
      { title: 'CLI audit', owner: 'Platform' },
      { title: 'Docs sprint', owner: 'DX' },
    ];

    return {
      title: 'Project lineup',
      tagline: 'Reusable layouts + partials',
      footer: 'TurboMini layout example',
      year: '2025',
      content: app.$t('cards', { cards }),
    };
  });

  app.template('cards', '<ul class="cards">{{#each cards as card}}{{> card title=card.title owner=card.owner}}{{/each}}</ul>');

  return app;
}

export function startApp() {
  const app = createApp();
  app.start();
  return app;
}

if (typeof window !== 'undefined') {
  startApp();
}
