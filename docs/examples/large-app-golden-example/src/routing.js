import {DefaultCtrl} from './components/default.ctrl.js';
import { ensureUser } from './services/api.js';
const initRoutes = async (app) => {
  await app.fetchTemplates(['default', 'profile', 'settings', 'admin/users', 'nav'], '/src/components/')
  app.controller('default', DefaultCtrl(app));
  app.controller('profile', DefaultCtrl(app));
  app.controller('settings', DefaultCtrl(app));
  app.controller('admin/users', DefaultCtrl(app));
  const middleWareController = {};
  app.addMiddleware(async ctx => {
    const user = await ensureUser(app);
    console.log('middleware called', user, ctx);
    if(ctx.page.startsWith("admin") && !user.loggedIn) {
      alert('you must be logged in');
      return false;
    }
  });
}
export {initRoutes};