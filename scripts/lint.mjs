#!/usr/bin/env node
import { ESLint } from "eslint";

async function lintPattern(eslint, pattern) {
  try {
    return await eslint.lintFiles([pattern]);
  } catch (error) {
    if (error?.messageTemplate === "file-not-found") {
      return [];
    }
    throw error;
  }
}

async function main() {
  const eslint = new ESLint({ fix: true });
  const patterns = [
    "packages/**/*.js",
    "packages/**/*.mjs",
    "templates/**/*.js",
    "templates/**/*.mjs"
  ];

  const results = [];
  for (const pattern of patterns) {
    const subset = await lintPattern(eslint, pattern);
    results.push(...subset);
  }

  await ESLint.outputFixes(results);

  const formatter = await eslint.loadFormatter("stylish");
  const output = formatter.format(results);

  if (output) console.log(output);

  const hasErrors = results.some((r) => r.errorCount > 0);
  process.exitCode = hasErrors ? 1 : 0;
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
