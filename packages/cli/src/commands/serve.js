import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import pc from 'picocolors';
import { parseCommandArgs } from '../utils/args.js';

const DEFAULT_PORT = 4173;
const DEFAULT_HOST = '0.0.0.0';
const LIVE_RELOAD_PATH = '/__turbomini_reload';

const CHARSET_TYPES = new Set([
  'text/css',
  'text/html',
  'text/javascript',
  'text/plain',
  'application/javascript',
  'application/json',
  'application/manifest+json',
  'image/svg+xml',
]);

const MIME_TYPES = new Map([
  ['.apng', 'image/apng'],
  ['.avif', 'image/avif'],
  ['.css', 'text/css'],
  ['.gif', 'image/gif'],
  ['.html', 'text/html'],
  ['.ico', 'image/x-icon'],
  ['.jpeg', 'image/jpeg'],
  ['.jpg', 'image/jpeg'],
  ['.js', 'text/javascript'],
  ['.json', 'application/json'],
  ['.map', 'application/json'],
  ['.mjs', 'text/javascript'],
  ['.mp4', 'video/mp4'],
  ['.otf', 'font/otf'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.txt', 'text/plain'],
  ['.wasm', 'application/wasm'],
  ['.webmanifest', 'application/manifest+json'],
  ['.webp', 'image/webp'],
  ['.woff', 'font/woff'],
  ['.woff2', 'font/woff2'],
]);

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeType = MIME_TYPES.get(ext) ?? 'application/octet-stream';

  if (CHARSET_TYPES.has(mimeType)) {
    return `${mimeType}; charset=utf-8`;
  }

  return mimeType;
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
  const liveReload = options.liveReload ?? null;
  const indexPath = path.join(rootDir, 'index.html');
  let indexRealPath = null;

  const server = http.createServer(async (req, res) => {
    if (!req.url) {
      res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Bad Request');
      return;
    }

    const requestUrl = new URL(req.url, 'http://localhost');
    if (liveReload && requestUrl.pathname === LIVE_RELOAD_PATH) {
      liveReload.handleRequest(req, res);
      return;
    }
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
        if (!decodedPathname.endsWith('/')) {
          const location = `${decodedPathname}/` + requestUrl.search;
          res.writeHead(308, { Location: location });
          res.end();
          return;
        }
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
      if (liveReload) {
        const html = fileBuffer.toString('utf8');
        fileBuffer = Buffer.from(liveReload.injectHtml(html));
      }
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache',
      });
      res.end(fileBuffer);
      return;
    }

    const contentType = getContentType(targetPath);
    if (liveReload && contentType.startsWith('text/html')) {
      if (!indexRealPath) {
        try {
          indexRealPath = await fs.realpath(indexPath);
        } catch {
          indexRealPath = indexPath;
        }
      }
      let targetRealPath = targetPath;
      try {
        targetRealPath = await fs.realpath(targetPath);
      } catch {
        // ignore
      }
      if (targetRealPath === indexRealPath) {
        const html = fileBuffer.toString('utf8');
        fileBuffer = Buffer.from(liveReload.injectHtml(html));
      }
    }
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache',
    });
    res.end(fileBuffer);
  });

  return { server, host, port };
}

function createLiveReload(rootDir) {
  const clients = new Set();
  const watchers = new Map();
  let pending = null;

  const isIgnored = (targetPath) => {
    const parts = targetPath.split(path.sep);
    return parts.some((part) =>
      ['node_modules', '.git', '.turbo', '.cache', 'dist', 'build'].includes(part)
    );
  };

  const notify = () => {
    if (pending) return;
    pending = setTimeout(() => {
      pending = null;
      for (const res of clients) {
        res.write('data: reload\n\n');
      }
    }, 60);
  };

  const watchDir = async (dir) => {
    if (watchers.has(dir) || isIgnored(dir)) return;
    const watcher = fsSync.watch(dir, async (eventType, filename) => {
      if (!filename) {
        notify();
        return;
      }
      const name = filename.toString();
      if (isIgnored(name)) return;
      const nextPath = path.join(dir, name);
      if (eventType === 'rename') {
        try {
          const stats = await fs.stat(nextPath);
          if (stats.isDirectory()) {
            await watchDir(nextPath);
          }
        } catch {
          // ignore missing files
        }
      }
      notify();
    });
    watchers.set(dir, watcher);

    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const child = path.join(dir, entry.name);
          if (!isIgnored(child)) {
            await watchDir(child);
          }
        }
      }
    } catch {
      // ignore
    }
  };

  const handleRequest = (req, res) => {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });
    res.write('retry: 1000\n\n');
    clients.add(res);
    req.on('close', () => clients.delete(res));
  };

  const injectHtml = (html) => {
    if (html.includes(LIVE_RELOAD_PATH)) return html;
    const script = `
    <script>
      (function () {
        try {
          const source = new EventSource('${LIVE_RELOAD_PATH}');
          source.onmessage = () => window.location.reload();
        } catch (err) {
          console.warn('[turbomini] Live reload disabled.', err);
        }
      })();
    </script>
    `;
    if (html.includes('</body>')) {
      return html.replace('</body>', `${script}</body>`);
    }
    return `${html}${script}`;
  };

  const start = async () => {
    await watchDir(rootDir);
  };

  const close = () => {
    for (const watcher of watchers.values()) {
      watcher.close();
    }
    watchers.clear();
    for (const res of clients) {
      res.end();
    }
    clients.clear();
    if (pending) clearTimeout(pending);
  };

  return { handleRequest, injectHtml, start, close };
}

export async function serveCommand(context, args) {
  const { values, positionals } = parseCommandArgs(args, {
    port: { type: 'string' },
    host: { type: 'string' },
    reload: { type: 'boolean', default: true },
    'no-reload': { type: 'boolean', default: false },
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

  const enableReload = values.reload && !values['no-reload'];
  const liveReload = enableReload ? createLiveReload(rootDir) : null;
  const { server } = createSpaServer(rootDir, { host, port, liveReload });

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
      if (enableReload) {
        context.logger.log(pc.dim('Live reload enabled.')); 
      }
      context.logger.log(pc.dim('Press Ctrl+C to stop.'));
      resolve();
    });
  });

  if (liveReload) {
    await liveReload.start();
  }

  const shutdown = () => {
    liveReload?.close();
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
