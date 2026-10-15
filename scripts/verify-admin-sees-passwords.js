const https = require('https');

function postJson(url, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const u = new URL(url);
    const req = https.request({
      hostname: u.hostname,
      port: 443,
      path: u.pathname,
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
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function getJson(url, headers) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.request({
      hostname: u.hostname,
      port: 443,
      path: u.pathname,
      method: 'GET',
      headers: headers
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function verify() {
  console.log('1. Logging in as Admin (admin / FX7B2K)...');
  const loginRes = await postJson('https://firex-safety-management.onrender.com/api/auth/login', {
    identifier: 'admin',
    password: 'FX7B2K'
  });

  if (loginRes.status !== 200) {
    console.error('Login failed:', loginRes);
    return;
  }
  console.log('Admin logged in successfully! User ID:', loginRes.data.user.id);

  console.log('2. Fetching /api/users with Admin credentials...');
  const usersRes = await getJson('https://firex-safety-management.onrender.com/api/users', {
    'x-user-id': loginRes.data.user.id,
    'x-user-role': loginRes.data.user.role
  });

  if (usersRes.status !== 200) {
    console.error('Failed fetching users:', usersRes);
    return;
  }

  const users = usersRes.data;
  console.log(`\nVerified ${users.length} staff records returned to Admin:`);
  console.log('-----------------------------------------------------------------------------------------');
  console.log('Name'.padEnd(25) + 'Username'.padEnd(20) + 'Role'.padEnd(22) + 'Password'.padEnd(12) + 'Status');
  console.log('-----------------------------------------------------------------------------------------');
  for (const u of users) {
    const pass = u.assigned_password || u.password || u.pin || 'NOT_FOUND';
    console.log(
      (u.name || '').padEnd(25) +
      ('@' + (u.username || u.id)).padEnd(20) +
      (u.role || '').padEnd(22) +
      pass.padEnd(12) +
      (u.status || 'Active')
    );
  }
  console.log('-----------------------------------------------------------------------------------------');
}

verify().catch(console.error);
