import { TurboMini } from "./turbomini.js";
const app = TurboMini("/turbomini/");
app.template('default', '<h1>Hello {{name}}</h1>');
app.controller('default', () => ({ name: 'TurboMini' }));
app.start();