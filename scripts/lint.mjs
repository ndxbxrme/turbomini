#!/usr/bin/env node
import { ESLint } from "eslint";

async function main() {
  const eslint = new ESLint({ fix: true }); // auto-fix where possible
  const results = await eslint.lintFiles([
    "src/**/*.js",
    "tests/**/*.js",
    "tests/**/*.mjs",
  ]);

  // Apply fixes to disk
  await ESLint.outputFixes(results);

  // Format results for console
  const formatter = await eslint.loadFormatter("stylish");
  const output = formatter.format(results);

  if (output) console.log(output);

  // Exit with non-zero if errors
  const hasErrors = results.some((r) => r.errorCount > 0);
  process.exitCode = hasErrors ? 1 : 0;
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
