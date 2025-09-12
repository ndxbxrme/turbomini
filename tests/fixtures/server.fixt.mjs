// tests/fixtures/server.fixt.mjs
import base from '@playwright/test';
import { startStaticServer } from '../utils/serve-static.mjs';

export const test = base.extend({
  serverURL: async ({}, use) => {
    const server = await startStaticServer();
    const { port } = server.address();
    try {
      await use(`http://localhost:${port}`);
    } finally {
      server.close();
    }
  }
});
export const expect = test.expect;