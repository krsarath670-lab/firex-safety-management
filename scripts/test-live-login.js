const https = require('https');

function testLogin(username, password) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ identifier: username, password: password });
    const req = https.request('https://firex-safety-management.onrender.com/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function run() {
  console.log('Testing login with admin / FX7B2K...');
  const res = await testLogin('admin', 'FX7B2K');
  console.log('Status:', res.status);
  console.log('Response:', JSON.stringify(res.data || res.raw, null, 2));
}

run().catch(console.error);
