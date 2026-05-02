/**
 * TurboMini starter.
 */
import { TurboMini } from './turbomini.js';
import { initRoutes } from './routing.js';
import { ensureUser } from './services/api.js';
const app = TurboMini('/');
app.run( async app => {
  await initRoutes(app);
  const globalClickHandler = (evt) => {
    const el = evt.target.closest('[data-action');
    if(el) {
      const action = el.dataset.action;
      switch(action) {
        case 'log-in-toggle':
          console.log('log in toggle');
          break;
      }
    }
  }
  console.log('chance', chance.name());
  document.body.addEventListener('click', globalClickHandler);
  app.start();
})