import { composeControllers } from '../lib/compose.js';
import { loadUser, enrichWithFlags } from '../lib/data.js';

const baseUser = async (params) => loadUser(params[0] ?? '42');
const withFlags = async (_params, data) => enrichWithFlags(data);

export const userController = composeControllers(baseUser, withFlags);
