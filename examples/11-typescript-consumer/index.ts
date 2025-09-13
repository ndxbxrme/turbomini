import { TurboMini } from 'turbomini';
const app = TurboMini('/examples/11-typescript-consumer');
app.template('default', '<h1>TS Consumer</h1>');
app.controller('default', () => ({}));
app.start();
(window as any).app = app;
