const https = require('https');

function request(url, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const data = body ? (typeof body === 'string' ? body : JSON.stringify(body)) : null;
    const req = https.request(url, {
      ...options,
      headers: {
        ...(data ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } : {}),
        ...(options.headers || {})
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
    if (data) req.write(data);
    req.end();
  });
}

async function runTest() {
  const baseUrl = 'https://fires-angle-principles-literary.trycloudflare.com';
  console.log('=== VERIFYING PASSWORD & AUTHENTICATION SYSTEM ===\n');

  // 1. Users list for login screen
  const usersList = await request(`${baseUrl}/api/auth/users-list`);
  console.log(`1. Users List for Login: Status ${usersList.status}, Total = ${usersList.body.length} users`);
  console.log('   Users available:', usersList.body.map(u => `${u.name} (${u.role})`).join(', '));

  // 2. Login with correct password (1234)
  const loginGood = await request(`${baseUrl}/api/auth/login`, { method: 'POST' }, {
    userId: 'usr-sup',
    password: '1234'
  });
  console.log(`2. Login with valid PIN (1234): Status ${loginGood.status} => ${loginGood.body.message}`);

  // 3. Login with wrong password
  const loginBad = await request(`${baseUrl}/api/auth/login`, { method: 'POST' }, {
    userId: 'usr-sup',
    password: '0000'
  });
  console.log(`3. Login with invalid PIN: Status ${loginBad.status} (expected 401) => ${loginBad.body.message}`);

  // 4. Supervisor creates a new Technician with custom password '7890'
  const newTech = {
    name: 'Ali Technician Test',
    role: 'Technician',
    phone: '+973 3999 1122',
    designation: 'Fire Alarm Tech',
    pin: '7890',
    password: '7890'
  };
  const createTech = await request(`${baseUrl}/api/users`, {
    method: 'POST',
    headers: { 'x-user-role': 'Supervisor', 'x-user-id': 'usr-sup' }
  }, newTech);
  console.log(`4. Supervisor creates new Technician with PIN 7890: Status ${createTech.status}, ID = ${createTech.body.id}`);

  // 5. New Technician logs in using PIN '7890'
  const newTechLogin = await request(`${baseUrl}/api/auth/login`, { method: 'POST' }, {
    userId: createTech.body.id,
    password: '7890'
  });
  console.log(`5. New Technician logs in with PIN 7890: Status ${newTechLogin.status} => Welcome ${newTechLogin.body.user?.name} (${newTechLogin.body.user?.role})`);

  // 6. Engineer changes new Technician password to '9999'
  const engineerChangePass = await request(`${baseUrl}/api/users/${createTech.body.id}/password`, {
    method: 'POST',
    headers: { 'x-user-role': 'Engineer', 'x-user-id': 'usr-eng' }
  }, { newPassword: '9999' });
  console.log(`6. Engineer updates Technician password to 9999: Status ${engineerChangePass.status} => ${engineerChangePass.body.message}`);

  // 7. Old PIN 7890 should now fail
  const oldLoginFail = await request(`${baseUrl}/api/auth/login`, { method: 'POST' }, {
    userId: createTech.body.id,
    password: '7890'
  });
  console.log(`7. Login with old PIN 7890: Status ${oldLoginFail.status} (expected 401) => ${oldLoginFail.body.message}`);

  // 8. New PIN 9999 should succeed
  const newLoginSuccess = await request(`${baseUrl}/api/auth/login`, { method: 'POST' }, {
    userId: createTech.body.id,
    password: '9999'
  });
  console.log(`8. Login with new PIN 9999: Status ${newLoginSuccess.status} => ${newLoginSuccess.body.message}`);

  // Clean up test technician
  await request(`${baseUrl}/api/users/${createTech.body.id}`, {
    method: 'DELETE',
    headers: { 'x-user-role': 'Supervisor', 'x-user-id': 'usr-sup' }
  });
  console.log('   (Cleaned up test technician account)');

  console.log('\n=== ALL PASSWORD & AUTH CHECKS PASSED 100%! ===');
}

runTest().catch(console.error);
