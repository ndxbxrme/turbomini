let data = null;
let user = null;
const fetchData = async () => {
  const res = await fetch('/src/data.json');
  if(res) {
    console.log(6);
    data = await res.json();
  }
}
const applySearchFilter = async (activity, query) => {
  const normalized = query?.trim().toLowerCase();
  if (!normalized) return activity;
  return activity.filter((item) => {
    const haystack = `${item.title} ${item.summary}`.toLowerCase();
    return haystack.includes(normalized);
  });
}
const ensureData = async (controller, app) => {
  if(!data) await fetchData();
  controller.user = data.user;
  controller.stats = data.stats ?? [];
  controller.activity = data.activity ?? [];
  controller.announcements = data.announcements ?? [];
  controller.filteredActivity = await applySearchFilter(controller.activity, controller.search);
  controller.hasResults = controller.filteredActivity.length > 0;
  controller.showEmpty = !controller.hasResults;
  controller.lastUpdated = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
  controller.loaded = true;
  app.refresh();
}
const ensureUser = async (app) => {
  if(!user) await fetchData();
  user = data.user;
  return user;
}
const initAPI = async (app) => {

}
const joinFeed = (name, id, sortField, sortDir, offset, limit) => {

}
export {ensureData, ensureUser};