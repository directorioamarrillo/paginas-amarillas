/**
 * server.mjs - Servidor HTTP para Railway
 * Fix: handler de Astro es async, hay que usar await correctamente
 */

import http from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = '0.0.0.0';

// Importar el handler de Astro (modo middleware)
const entry = await import('./dist/server/entry.mjs');
const handler = entry.handler ?? entry.default;

console.log(`✅ [server] Handler cargado. Tipo: ${typeof handler}`);
console.log(`✅ [server] Arrancando en http://${HOST}:${PORT}`);

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
  '.txt': 'text/plain',
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

// ⚠️ CRÍTICO: El handler de Astro es async → usar async/await
const server = http.createServer(async (req, res) => {
  // 1. Archivos estáticos
  if (tryStatic(req, res)) return;

  // 2. Handler de Astro SSR con await
  try {
    await new Promise((resolve, reject) => {
      const result = handler(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
      // Si handler retorna una Promise, esperarla también
      if (result && typeof result.then === 'function') {
        result.then(resolve, reject);
      }
    });

    // Si Astro no envió respuesta (next llamado sin error = 404)
    if (!res.headersSent) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  } catch (err) {
    console.error('[server] Error en handler de Astro:', err?.message || err);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
    }
  }
});

process.on('uncaughtException', (err) => console.error('[uncaughtException]', err));
process.on('unhandledRejection', (r) => console.error('[unhandledRejection]', r));

server.listen(PORT, HOST, () => {
  console.log(`🚀 [server] LISTO → http://${HOST}:${PORT}`);
});
