const https = require('https');

function post(url, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        ...headers
      }
    }, res => {
      let resp = '';
      res.on('data', c => resp += c);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(resp) });
        } catch {
          resolve({ status: res.statusCode, body: resp });
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function testPasswordPerms() {
  const baseUrl = 'https://fires-angle-principles-literary.trycloudflare.com';

  // 1. Supervisor changes Technician password to 5555
  const supChange = await post(`${baseUrl}/api/users/usr-tech/password`, {
    newPassword: '5555'
  }, { 'x-user-role': 'Supervisor', 'x-user-id': 'usr-sup' });
  console.log('1. Supervisor sets Tech password:', supChange.status, supChange.body.message);

  // 2. Tech logs in with 5555
  const techLogin = await post(`${baseUrl}/api/auth/login`, {
    userId: 'usr-tech',
    password: '5555'
  });
  console.log('2. Tech login with new password 5555:', techLogin.status, techLogin.body.user?.name);

  // 3. Tech tries to change GM password (must be 403)
  const techHacksGM = await post(`${baseUrl}/api/users/usr-gm/password`, {
    newPassword: '9999'
  }, { 'x-user-role': 'Technician', 'x-user-id': 'usr-tech' });
  console.log('3. Tech tries to change GM password (should be 403):', techHacksGM.status, techHacksGM.body.error);

  // 4. GM resets Tech password back to 1234
  const gmReset = await post(`${baseUrl}/api/users/usr-tech/password`, {
    newPassword: '1234'
  }, { 'x-user-role': 'GM', 'x-user-id': 'usr-gm' });
  console.log('4. GM resets Tech password back to 1234:', gmReset.status, gmReset.body.message);
}

testPasswordPerms().catch(console.error);
