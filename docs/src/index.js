import { TurboMini } from "./turbomini.js";
import './components/tm-animated-logo.js';
const app = TurboMini("/turbomini/");
app.run(async app => {
  console.log('fetching default');
  app.errorHandler = console.log;
  await app.fetchTemplates(['default', 'header'], '/src/components/');
  console.log('fetched');
  app.controller('default', () => {
    return {
      name: 'buddy'
    }
  });
  app.start();
});
