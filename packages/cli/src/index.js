import pc from 'picocolors';
import { createContext } from './context.js';
import { initCommand } from './commands/init.js';
import { handleThemeCommand } from './commands/theme.js';
import { addCommand } from './commands/add.js';
import { updateCommand } from './commands/update.js';
import { doctorCommand } from './commands/doctor.js';
import { serveCommand } from './commands/serve.js';
import { buildCommand } from './commands/build.js';

function parseGlobalArgs(argv) {
  const options = { dryRun: false, help: false };
  const rest = [];

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--dry-run') {
      options.dryRun = true;
      continue;
    }

    if (token === '--help' || token === '-h') {
      options.help = true;
      continue;
    }

    rest.push(token);
  }

  return { options, rest };
}

function printHelp() {
  const lines = [
    pc.bold('TurboMini CLI'),
    '',
    'Usage:',
    '  turbomini <command> [options]',
    '',
    'Commands:',
    '  init [dir]           Scaffold a new TurboMini project',
    '  theme init [dir]     Add base theme tokens to a project',
    '  theme create <name>  Create a new theme override',
    '  add <component>      Install a component (copy or web component)',
    '  build [dir]          Copy project files into dist for deployment',
    '  update [dir]         Refresh src/turbomini.js with the bundled runtime',
    '  update <component>   Refresh local component recipes',
    '  doctor [dir]         Check runtime drift and dependency versions',
    '  serve [dir]          Serve static files with an SPA fallback',
    '',
    'Options:',
    '  --dry-run            Preview changes without writing to disk',
    '  -h, --help           Show this help message',
  ];

  for (const line of lines) {
    console.log(line);
  }
}

async function run() {
  const argv = process.argv.slice(2);
  const { options, rest } = parseGlobalArgs(argv);

  const context = createContext({ dryRun: options.dryRun });

  if (options.help || rest.length === 0) {
    printHelp();
    process.exit(options.help ? 0 : 1);
  }

  const [command, ...args] = rest;

  try {
    switch (command) {
      case 'init':
        await initCommand(context, args);
        break;
      case 'theme':
        await handleThemeCommand(context, args);
        break;
      case 'add':
        await addCommand(context, args);
        break;
      case 'update':
        await updateCommand(context, args);
        break;
      case 'doctor':
        await doctorCommand(context, args);
        break;
      case 'serve':
        await serveCommand(context, args);
        break;
      case 'build':
        await buildCommand(context, args);
        break;
      default:
        console.error(pc.red(`Unknown command: ${command}`));
        printHelp();
        process.exitCode = 1;
    }
  } catch (error) {
    console.error(pc.red(error instanceof Error ? error.message : String(error)));
    if (error?.stack) {
      console.error(pc.dim(error.stack));
    }
    process.exitCode = 1;
  }
}

run();
