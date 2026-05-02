import { ensureData } from "../../services/api.js";
const DefaultCtrl = (app => params => {
  const clickHandler = () => {
    controller.name = 'maggie';
    app.refresh();
  }
  console.log(app);
  const controller = {
    name: 'buddy',
    page: app.context.page,
    postLoad: async () => {
      //document.querySelector('.hey').addEventListener('click', clickHandler);
      //document.documentElement.dataset.theme = 'dark';
      await ensureData(controller, app);
    }
  }
  return controller;
});
export {DefaultCtrl};