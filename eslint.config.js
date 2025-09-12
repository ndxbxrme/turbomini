// eslint.config.js
import js from "@eslint/js";
import globals from "globals";

export default [
  // Ignore files/folders (replaces .eslintignore)
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "types/**",
      "test-results/**",
      "docs/**",
      ".playwright/**",
      // 'examples/**',
    ],
  },

  // Source files (browser ESM)
  {
    files: ["src/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      "no-unused-vars": ["warn", { args: "none", ignoreRestSiblings: true }],
      "no-constant-condition": ["warn", { checkLoops: false }],
    },
  },

  // Unit tests (Node)
  {
    files: ["tests/**/*.test.js", "tests/unit/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },
    rules: {
      ...js.configs.recommended.rules,
    },
  },

  // E2E tests (Playwright: Node + some browser globals)
  {
    files: ["tests/**/*.spec.mjs", "tests/e2e/**/*.mjs"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.es2021,
        ...globals.browser, // for document/window occurrences in e2e helpers, if any
      },
    },
    rules: {
      ...js.configs.recommended.rules,
    },
  },
];
