const http = require('http');

const options = {
  hostname: 'localhost',
  port: 8000,
  path: '/api/signin',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    if (!json.access_token) {
        console.error("Login failed:", json);
        return;
    }
    const token = json.access_token;
    
    // Fetch empresas
    http.get({
      hostname: 'localhost',
      port: 8000,
      path: '/api/empresas/?limit=10',
      headers: { 'Authorization': `Bearer ${token}` }
    }, (res2) => {
      let data2 = '';
      res2.on('data', chunk => data2 += chunk);
      res2.on('end', () => {
        const empresas = JSON.parse(data2);
        console.log("Total empresas:", empresas.length);
        const e10 = empresas.find(e => e.id === 10);
        console.log("Empresa 10:", e10);
      });
    });
  });
});

req.write('username=admin@admin.com&password=12345678');
req.end();
