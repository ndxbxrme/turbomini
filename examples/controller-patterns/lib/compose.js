export const composeControllers = (...steps) => async (params) => {
  let data = {};
  for (const step of steps) {
    const result = await step(params, data);
    if (result && typeof result === 'object') {
      data = { ...data, ...result };
    }
  }
  return data;
};
