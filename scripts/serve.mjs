// Lokalny podgląd dist/ (npm run dev) — naśladuje Netlify:
// ładne adresy (/dziekujemy → dziekujemy.html), 404.html, oraz POST formularza
// → przekierowanie na /dziekujemy (bez zapisu; prawdziwe zgłoszenia działają tylko na Netlify).

import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const PORT = Number(process.env.PORT) || 8888;
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
};

async function tryFile(p) {
  try {
    const stat = await fs.stat(p);
    return stat.isFile() ? p : null;
  } catch {
    return null;
  }
}

http
  .createServer(async (req, res) => {
    const url = new URL(req.url, `http://localhost:${PORT}`);

    if (req.method === 'POST') {
      let body = '';
      for await (const chunk of req) body += chunk;
      console.log('[form] POST', url.pathname, Object.fromEntries(new URLSearchParams(body)));
      res.writeHead(303, { Location: url.pathname });
      return res.end();
    }

    const clean = path.normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, '');
    const base = path.join(DIST, clean);
    const file =
      (await tryFile(base)) || (await tryFile(path.join(base, 'index.html'))) || (await tryFile(`${base}.html`));

    if (!file) {
      res.writeHead(404, { 'Content-Type': TYPES['.html'] });
      return res.end(await fs.readFile(path.join(DIST, '404.html')));
    }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] ?? 'application/octet-stream' });
    res.end(await fs.readFile(file));
  })
  .listen(PORT, () => console.log(`Podgląd: http://localhost:${PORT}`));
