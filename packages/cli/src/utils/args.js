import { parseArgs } from 'node:util';

export function parseCommandArgs(args = [], options = {}) {
  return parseArgs({
    args,
    options,
    allowPositionals: true,
  });
}

export function extractCommand(rest) {
  if (rest.length === 0) {
    return { command: undefined, args: [] };
  }

  const [command, ...args] = rest;
  return { command, args };
}
