/**
 * server.mjs - Servidor HTTP personalizado para Railway
 * Diagnóstico: muestra los exports disponibles de entry.mjs y hace fallback robusto
 */

import http from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = '0.0.0.0';

console.log(`[server] Iniciando en ${HOST}:${PORT}`);
console.log(`[server] NODE_VERSION: ${process.version}`);
console.log(`[server] NODE_ENV: ${process.env.NODE_ENV}`);

// Importar el handler de Astro (modo middleware)
let handler;
try {
  const entry = await import('./dist/server/entry.mjs');
  console.log('[server] entry.mjs exports:', Object.keys(entry));
  handler = entry.handler ?? entry.default;
  console.log('[server] handler type:', typeof handler);
} catch (err) {
  console.error('[server] ERROR al importar entry.mjs:', err.message);
}

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const clientDir = join(__dirname, 'dist', 'client');

const MIME = {
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.css': 'text/css',
  '.html': 'text/html',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
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
  // 1. Archivos estáticos
  if (tryStatic(req, res)) return;

  // 2. Si Astro no cargó, mostrar error diagnóstico
  if (typeof handler !== 'function') {
    res.writeHead(503, { 'Content-Type': 'text/plain' });
    res.end('[ERROR] handler de Astro no disponible. Revisa los Deploy Logs.');
    return;
  }

  // 3. Handler de Astro SSR
  try {
    handler(req, res, (err) => {
      if (err) {
        console.error('[server] Error Astro handler:', err);
        if (!res.headersSent) { res.writeHead(500); res.end('Error interno'); }
      } else {
        if (!res.headersSent) { res.writeHead(404); res.end('Not Found'); }
      }
    });
  } catch (err) {
    console.error('[server] Excepción en handler:', err);
    if (!res.headersSent) { res.writeHead(500); res.end('Error interno'); }
  }
});

process.on('uncaughtException', (err) => {
  console.error('[server] uncaughtException:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('[server] unhandledRejection:', reason);
});

server.listen(PORT, HOST, () => {
  console.log(`✅ [server] LISTO en http://${HOST}:${PORT}`);
});
