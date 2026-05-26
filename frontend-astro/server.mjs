/**
 * server.mjs - Servidor HTTP personalizado para Railway
 *
 * Usa @astrojs/node en modo "middleware" para obtener el handler de Astro,
 * y crea un servidor HTTP que EXPLÍCITAMENTE escucha en 0.0.0.0 (todas las interfaces).
 *
 * Esto resuelve el problema de que @astrojs/node en modo standalone
 * siempre se enlaza a localhost, haciendo que Railway no pueda alcanzarlo.
 */

import http from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

// Handler de Astro (modo middleware exporta esta función)
const { handler } = await import('./dist/server/entry.mjs');

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const clientDir = join(__dirname, 'dist', 'client');

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = '0.0.0.0'; // Siempre escuchar en todas las interfaces

// Tipos MIME básicos para servir assets estáticos
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.webp': 'image/webp',
  '.txt': 'text/plain',
};

/**
 * Intenta servir un archivo estático desde dist/client/
 * Retorna true si lo sirvió, false si debe continuar al siguiente handler.
 */
function tryServeStatic(req, res) {
  try {
    const urlPath = new URL(req.url || '/', 'http://localhost').pathname;
    const filePath = join(clientDir, urlPath);

    if (existsSync(filePath) && statSync(filePath).isFile()) {
      const ext = extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      res.setHeader('Content-Type', contentType);

      // Assets con hash (ej: /_astro/...) se cachean por 1 año
      if (urlPath.startsWith('/_astro/')) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }

      createReadStream(filePath).pipe(res);
      return true;
    }
  } catch {
    // Si falla, continúa al siguiente handler
  }
  return false;
}

const server = http.createServer((req, res) => {
  // 1. Intentar servir archivo estático
  if (tryServeStatic(req, res)) return;

  // 2. Dejar que Astro maneje la request (SSR)
  handler(req, res, (err) => {
    if (err) {
      console.error('[server] Error en handler de Astro:', err);
      res.writeHead(500);
      res.end('Internal Server Error');
    } else {
      res.writeHead(404);
      res.end('Not Found');
    }
  });
});

server.listen(PORT, HOST, () => {
  console.log(`🚀 [server] Escuchando en http://${HOST}:${PORT}`);
});

server.on('error', (err) => {
  console.error('[server] Error crítico:', err);
  process.exit(1);
});
