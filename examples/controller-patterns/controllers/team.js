import { composeControllers } from '../lib/compose.js';
import { loadTeam, enrichWithFlags } from '../lib/data.js';

const baseTeam = async () => loadTeam();
const withFlags = async (_params, data) => enrichWithFlags(data);

export const teamController = composeControllers(baseTeam, withFlags);
