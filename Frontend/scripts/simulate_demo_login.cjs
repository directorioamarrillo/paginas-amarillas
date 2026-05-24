const http = require('http');
const https = require('https');
const { URL } = require('url');
const fs = require('fs');

// Load .env
const envPath = require('path').resolve(__dirname, '..', '.env');
const env = fs.existsSync(envPath)
  ? fs.readFileSync(envPath, 'utf8').split(/\r?\n/).reduce((acc, line) => {
      const m = line.match(/^\s*([A-Za-z0-9_]+)=(.*)$/);
      if (m) acc[m[1]] = m[2];
      return acc;
    }, {})
  : {};

const backend = env.PUBLIC_BACKEND_URL || 'http://localhost:8000';
const forceDemo = (env.PUBLIC_FORCE_DEMO === 'true');

console.log('PUBLIC_BACKEND_URL=', backend);
console.log('PUBLIC_FORCE_DEMO=', forceDemo);

async function trySignin() {
  const url = new URL('/api/signin', backend).toString();
  const payload = JSON.stringify({ correo: 'admin@paginas360.com', password: 'secret' });

  const lib = url.startsWith('https') ? https : http;

  return new Promise((resolve) => {
    const req = lib.request(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }, timeout: 5000 }, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (c) => body += c);
      res.on('end', () => resolve({ ok: true, status: res.statusCode, body }));
    });
    req.on('error', (err) => resolve({ ok: false, error: err }));
    req.on('timeout', () => { req.destroy(); resolve({ ok: false, error: new Error('timeout') }); });
    req.write(payload);
    req.end();
  });
}

(async () => {
  console.log('Simulating client signin...');
  const result = await trySignin();
  if (result.ok) {
    console.log('Backend responded:', result.status);
    console.log('Response body:', result.body);
    console.log('Client would store real cookies from response.');
    process.exit(0);
  }

  console.log('Backend did not respond or error:', result.error && result.error.message);
  if (forceDemo) {
    console.log('Force demo is enabled -> simulating successful signin.');
    const fakeData = { access_token: 'fake-token-12345', rol: 'user', id_usuario: 9999 };
    console.log('Simulated cookies to set:');
    console.log('token=', fakeData.access_token);
    console.log('rol=', fakeData.rol);
    console.log('id_usuario=', fakeData.id_usuario);
    console.log('Client would redirect to /');
    process.exit(0);
  }

  console.log('Force demo not enabled; client would show network error.');
  process.exit(2);
})();