/**
 * server.mjs - Servidor de producción para Railway
 *
 * Usa @astrojs/node en modo "middleware".
 * IMPORTANTE: No fijar PORT aquí — Railway inyecta el suyo y este script lo lee.
 */

import http from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

// Railway inyecta PORT automáticamente — NO sobrescribir en variables de servicio
const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = '0.0.0.0';

console.log(`[server] NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`[server] PORT: ${PORT}  (desde process.env.PORT = ${process.env.PORT})`);

// Handler de Astro
const { handler } = await import('./dist/server/entry.mjs');
console.log(`[server] Handler Astro listo: ${typeof handler}`);

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const clientDir = join(__dirname, 'dist', 'client');

const MIME = {
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.css': 'text/css',
  '.html': 'text/html; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.webp': 'image/webp',
};

function tryStatic(req, res) {
  try {
    const urlPath = new URL(req.url || '/', 'http://localhost').pathname;
    const file = join(clientDir, urlPath);
    if (existsSync(file) && statSync(file).isFile()) {
      const ext = extname(file).toLowerCase();
      res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');
      if (urlPath.startsWith('/_astro/')) {
        res.setHeader('Cache-Control', 'public,max-age=31536000,immutable');
      }
      createReadStream(file).pipe(res);
      return true;
    }
  } catch {}
  return false;
}

const server = http.createServer((req, res) => {
  // 1. Archivos estáticos de dist/client/
  if (tryStatic(req, res)) return;

  // 2. SSR con Astro
  try {
    handler(req, res, (err) => {
      if (err) {
        console.error('[server] Error en handler:', err.message || err);
        if (!res.headersSent) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Internal Server Error');
        }
      } else {
        if (!res.headersSent) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Not Found');
        }
      }
    });
  } catch (err) {
    console.error('[server] Excepción síncrona:', err.message || err);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
    }
  }
});

process.on('uncaughtException', (err) => console.error('[uncaughtException]', err));
process.on('unhandledRejection', (r) => console.error('[unhandledRejection]', r));

server.listen(PORT, HOST, () => {
  console.log(`✅ [server] Corriendo en http://${HOST}:${PORT}`);
});
