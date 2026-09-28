const http = require('http');

function post(path, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const req = http.request({
      hostname: '127.0.0.1',
      port: 5000,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        ...headers
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function get(path, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port: 5000,
      path,
      method: 'GET',
      headers
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function run() {
  console.log('--- 1. Testing GET /api/auth/users-list (should be empty) ---');
  const initialUsers = await get('/api/auth/users-list');
  console.log('Status:', initialUsers.status, 'Users:', initialUsers.body);

  console.log('\n--- 2. Testing Setup GM Account: POST /api/auth/setup-first-user ---');
  const setupRes = await post('/api/auth/setup-first-user', {
    name: 'Mohamed Hweidi Test',
    phone: '+973 17162240',
    email: 'gm.test@firexbahrain.com',
    password: 'testpassword123'
  });
  console.log('Status:', setupRes.status, 'Message:', setupRes.body.message);
  console.log('Created User Role:', setupRes.body.user?.role, 'Permissions:', Object.keys(setupRes.body.permissions || {}));

  const gmId = setupRes.body.user?.id;
  const gmRole = setupRes.body.user?.role;

  console.log('\n--- 3. Testing GM Adding an Engineer: POST /api/users ---');
  const addStaffRes = await post('/api/users', {
    name: 'Test Engineer',
    role: 'Engineer',
    phone: '+973 3999 1111',
    password: '4321',
    designation: 'Lead Fire Protection Engineer'
  }, {
    'x-user-id': gmId,
    'x-user-role': gmRole
  });
  console.log('Status:', addStaffRes.status, 'Created Staff:', addStaffRes.body.name, 'Role:', addStaffRes.body.role);

  console.log('\n--- 4. Testing Login with New Staff Credentials ---');
  const loginRes = await post('/api/auth/login', {
    userId: addStaffRes.body.id,
    password: '4321'
  });
  console.log('Status:', loginRes.status, 'Login Welcome:', loginRes.body.message);

  console.log('\n--- 5. Clearing Staff Again to Leave 100% Clean State for User ---');
  require('./clear-all-staff');

  const finalUsers = await get('/api/auth/users-list');
  console.log('Final Users Count in DB:', finalUsers.body.length);
  if (finalUsers.body.length === 0) {
    console.log('SUCCESS: System is 100% clean and ready for user initial setup!');
  } else {
    console.error('ERROR: Users not cleared!');
  }
}

run().catch(console.error);
