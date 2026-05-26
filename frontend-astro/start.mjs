/**
 * start.mjs - Wrapper para forzar binding a 0.0.0.0
 *
 * @astrojs/node ignora la variable HOST y siempre usa 'localhost'.
 * Este script parchea net.Server.prototype.listen ANTES de importar
 * el servidor de Astro, para que escuche en todas las interfaces.
 */
import net from 'net';

const originalListen = net.Server.prototype.listen;

net.Server.prototype.listen = function (...args) {
  // Formato: listen(port, host?, backlog?, callback?)
  // Si el host es localhost/127.0.0.1, lo cambiamos a 0.0.0.0
  if (typeof args[1] === 'string' && (args[1] === 'localhost' || args[1] === '127.0.0.1')) {
    console.log(`[binding-patch] ${args[1]}:${args[0]} → 0.0.0.0:${args[0]}`);
    args[1] = '0.0.0.0';
  }
  return originalListen.apply(this, args);
};

// Arranca el servidor standalone de Astro
await import('./dist/server/entry.mjs');
