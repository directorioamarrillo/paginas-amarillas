/**
 * server.mjs - DIAGNÓSTICO MÍNIMO
 * Solo responde "OK" para saber si Railway puede recibir respuestas.
 * Si esto da 200 → el problema es el handler de Astro.
 * Si esto da 502 → el problema es la configuración de Railway.
 */

import http from 'node:http';

const PORT = parseInt(process.env.PORT || '3000', 10);

const server = http.createServer((req, res) => {
  console.log(`[req] ${req.method} ${req.url}`);
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`
    <html>
      <head><title>Railway Test</title></head>
      <body style="font-family:sans-serif;padding:40px;background:#0f0f0f;color:#fff">
        <h1>✅ Railway funciona!</h1>
        <p>Puerto: ${PORT}</p>
        <p>URL: ${req.url}</p>
        <p>Node: ${process.version}</p>
      </body>
    </html>
  `);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor MÍNIMO en http://0.0.0.0:${PORT}`);
});
