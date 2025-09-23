import test from 'node:test';
import { writeFileSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { createRequire } from 'node:module';

// Ensure the type definitions export TurboMini and TurboMiniApp
// by compiling a small TypeScript usage sample with tsc --noEmit.
test('types export TurboMini and TurboMiniApp', () => {
  const tsFile = join(process.cwd(), 'tests', 'unit', `types-${process.pid}.ts`);
  writeFileSync(
    tsFile,
    "import TurboMini, { TurboMiniApp } from '../../types/turbomini';\n" +
      "const app: TurboMiniApp = TurboMini('/');\n"
  );
  const require = createRequire(import.meta.url);
  const tscPath = require.resolve('typescript/bin/tsc');
  try {
    execFileSync(process.execPath, [tscPath, '--noEmit', tsFile], {
      stdio: 'pipe',
    });
  } finally {
    rmSync(tsFile);
  }
});
