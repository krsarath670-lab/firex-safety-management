const https = require('https');

function post(url, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, res => {
      let resp = '';
      res.on('data', c => resp += c);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(resp) }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function verifyNewTunnel() {
  const baseUrl = 'https://geneva-tricks-connected-designs.trycloudflare.com';
  console.log('Verifying new tunnel:', baseUrl);

  const res = await post(`${baseUrl}/api/auth/login`, {
    role: 'GM',
    password: '1234'
  });
  console.log('Login result:', res.status, res.body.user?.name, res.body.user?.role);
}

verifyNewTunnel().catch(console.error);
