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

async function testAuth() {
  const baseUrl = 'https://fires-angle-principles-literary.trycloudflare.com';
  console.log('Testing Authentication on:', baseUrl);

  // 1. Correct Password
  const good = await post(`${baseUrl}/api/auth/login`, {
    role: 'Technician',
    password: '1234'
  });
  console.log('Good login:', good.status, good.body.user?.name, good.body.user?.role);

  // 2. Wrong Password
  const bad = await post(`${baseUrl}/api/auth/login`, {
    role: 'Technician',
    password: 'wrongpassword'
  });
  console.log('Bad login (should be 401):', bad.status, bad.body.error, bad.body.message);

  // 3. GM Login
  const gm = await post(`${baseUrl}/api/auth/login`, {
    role: 'GM',
    password: '1234'
  });
  console.log('GM login:', gm.status, gm.body.user?.name, gm.body.user?.role);
}

testAuth().catch(console.error);
