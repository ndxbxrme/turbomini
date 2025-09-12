// playwright.config.mjs
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: /.*\.spec\.mjs$/,
  use: { headless: true },
});
