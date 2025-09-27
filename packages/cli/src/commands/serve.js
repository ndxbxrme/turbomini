import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import pc from 'picocolors';
import { parseCommandArgs } from '../utils/args.js';

const DEFAULT_PORT = 4173;
const DEFAULT_HOST = '0.0.0.0';

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.html':
      return 'text/html; charset=utf-8';
    case '.css':
      return 'text/css; charset=utf-8';
    case '.js':
    case '.mjs':
    case '.cjs':
      return 'text/javascript; charset=utf-8';
    case '.json':
      return 'application/json; charset=utf-8';
    case '.svg':
      return 'image/svg+xml';
    case '.png':
      return 'image/png';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.gif':
      return 'image/gif';
    case '.webp':
      return 'image/webp';
    case '.ico':
      return 'image/x-icon';
    case '.txt':
      return 'text/plain; charset=utf-8';
    case '.map':
      return 'application/json; charset=utf-8';
    default:
      return 'application/octet-stream';
  }
}

async function readFileSafe(filePath) {
  try {
    return await fs.readFile(filePath);
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

function createSpaServer(rootDir, options = {}) {
  const host = options.host ?? DEFAULT_HOST;
  const port = options.port ?? DEFAULT_PORT;
  const indexPath = path.join(rootDir, 'index.html');

  const server = http.createServer(async (req, res) => {
    if (!req.url) {
      res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Bad Request');
      return;
    }

    const requestUrl = new URL(req.url, 'http://localhost');
    let decodedPathname;
    try {
      decodedPathname = decodeURIComponent(requestUrl.pathname);
    } catch {
      res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Bad Request');
      return;
    }
    const relativePath = decodedPathname.startsWith('/')
      ? decodedPathname.slice(1)
      : decodedPathname;
    const normalizedPath = path.normalize(relativePath);
    const candidatePath = path.resolve(rootDir, normalizedPath);
    const relativeToRoot = path.relative(rootDir, candidatePath);

    if (relativeToRoot.startsWith('..') || path.isAbsolute(relativeToRoot)) {
      res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Forbidden');
      return;
    }

    let targetPath = candidatePath;

    try {
      const stats = await fs.stat(candidatePath);
      if (stats.isDirectory()) {
        targetPath = path.join(candidatePath, 'index.html');
      }
    } catch (error) {
      if (!(error && error.code === 'ENOENT')) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Internal Server Error');
        return;
      }
    }

    let fileBuffer = await readFileSafe(targetPath);

    if (!fileBuffer) {
      fileBuffer = await readFileSafe(indexPath);
      if (!fileBuffer) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Not Found');
        return;
      }
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache',
      });
      res.end(fileBuffer);
      return;
    }

    res.writeHead(200, {
      'Content-Type': getContentType(targetPath),
      'Cache-Control': 'no-cache',
    });
    res.end(fileBuffer);
  });

  return { server, host, port };
}

export async function serveCommand(context, args) {
  const { values, positionals } = parseCommandArgs(args, {
    port: { type: 'string' },
    host: { type: 'string' },
  });

  const rootDir = path.resolve(context.cwd, positionals[0] ?? '.');
  const host = values.host ?? DEFAULT_HOST;
  const portValue = values.port ?? String(DEFAULT_PORT);
  const port = Number.parseInt(portValue, 10);

  if (Number.isNaN(port) || port < 0 || port > 65535) {
    throw new Error(`Invalid port: ${portValue}`);
  }

  let stats;
  try {
    stats = await fs.stat(rootDir);
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      throw new Error(`Directory not found: ${context.formatPath(rootDir)}`);
    }
    throw error;
  }

  if (!stats.isDirectory()) {
    throw new Error(`Not a directory: ${context.formatPath(rootDir)}`);
  }

  const { server } = createSpaServer(rootDir, { host, port });

  await new Promise((resolve, reject) => {
    server.once('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        reject(new Error(`Port ${port} is already in use. Use --port to pick a different port.`));
        return;
      }
      reject(error);
    });

    server.listen({ port, host }, () => {
      const displayHost = host === '0.0.0.0' ? 'localhost' : host;
      const url = `http://${displayHost}:${server.address().port}`;
      context.logger.log(pc.green(`Serving ${context.formatPath(rootDir)} at ${url}`));
      context.logger.log(pc.dim('Press Ctrl+C to stop.'));
      resolve();
    });
  });

  const shutdown = () => {
    server.close(() => {
      process.exit(0);
    });
  };

  const removeSignalHandlers = () => {
    process.removeListener('SIGINT', shutdown);
    process.removeListener('SIGTERM', shutdown);
  };

  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
  server.once('close', removeSignalHandlers);

  return server;
}

export { createSpaServer };
