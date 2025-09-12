// tests/utils/serve-static.mjs
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, resolve } from 'node:path';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'text/javascript; charset=utf-8',
  '.mjs':  'text/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg':  'image/svg+xml',
};

export function startStaticServer({ root = '.', defaultPage = '/examples/00-hello-world/index.html' } = {}) {
  return new Promise((resolveServer) => {
    const s = createServer(async (req, res) => {
      try {
        const path = new URL(req.url, 'http://x').pathname;
        const filePath = path === '/' ? defaultPage : path;
        const abs = resolve(process.cwd(), root, '.' + filePath);
        const body = await readFile(abs);
        const type = MIME[extname(abs).toLowerCase()] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': type });
        res.end(body);
      } catch {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('NF');
      }
    }).listen(0, () => resolveServer(s));
  });
}
