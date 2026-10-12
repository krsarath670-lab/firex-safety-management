const assert = require('assert');
const http = require('http');
const { app } = require('./server/index');
const db = require('./server/db');

console.log('====================================================');
console.log('HTTP API INTEGRATION TESTS FOR ROLE RESTRICTIONS');
console.log('====================================================\n');

function makeRequest(server, options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port: server.address().port,
      ...options
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, body: data });
        }
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runApiTests() {
  const server = app.listen(0);
  await new Promise(resolve => server.on('listening', resolve));

  try {
    // 1. Projects Manager (PM) can view users with full management fields
    const pmGetUsers = await makeRequest(server, {
      path: '/api/users',
      method: 'GET',
      headers: {
        'x-user-role': 'Projects Manager',
        'x-user-id': 'use-1791203919428-75'
      }
    });
    assert.strictEqual(pmGetUsers.status, 200, 'PM must be allowed to get users');
    assert(pmGetUsers.body.length > 0, 'Users array must not be empty');
    assert(pmGetUsers.body[0].created_by_name !== undefined, 'PM must see account creator');
    console.log('[PASS] Projects Manager GET /api/users: 200 OK with full management details');

    // 2. Projects Manager (PM) can create a new staff account
    const pmCreateUser = await makeRequest(server, {
      path: '/api/users',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': 'Projects Manager',
        'x-user-id': 'use-1791203919428-75'
      }
    }, {
      name: 'Test Tech By PM',
      username: 'tech.by.pm.' + Date.now(),
      role: 'Technician',
      password: 'SecurePMSecret123',
      phone: '+973 3999 1111'
    });
    assert.strictEqual(pmCreateUser.status, 201, 'PM must be allowed to create staff');
    assert.strictEqual(pmCreateUser.body.name, 'Test Tech By PM');
    const createdId = pmCreateUser.body.id;
    console.log('[PASS] Projects Manager POST /api/users: 201 Created successfully');

    // 3. CEO can reset password for the new staff
    const ceoReset = await makeRequest(server, {
      path: `/api/users/${createdId}/reset-password`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': 'CEO',
        'x-user-id': 'usr-ceo-test'
      }
    }, { mode: 'temp' });
    assert.strictEqual(ceoReset.status, 200, 'CEO must be allowed to reset password');
    assert(ceoReset.body.tempPassword.startsWith('FX-'), 'Must generate FX temp password');
    console.log('[PASS] CEO POST /api/users/:id/reset-password: 200 OK with temp password');

    // 4. CEO can toggle status (activate / deactivate)
    const ceoToggle = await makeRequest(server, {
      path: `/api/users/${createdId}/reset-password`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': 'CEO',
        'x-user-id': 'usr-ceo-test'
      }
    }, { deactivate: true });
    assert.strictEqual(ceoToggle.status, 200, 'CEO must be allowed to deactivate account');
    assert.strictEqual(ceoToggle.body.user.status, 'Inactive');
    console.log('[PASS] CEO deactivate staff account: 200 OK (Status: Inactive)');

    // 5. Supervisor CANNOT create a staff account -> HTTP 403 Forbidden
    const supCreate = await makeRequest(server, {
      path: '/api/users',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': 'Supervisor',
        'x-user-id': 'use-1791203401122-22'
      }
    }, {
      name: 'Hacker Tech',
      username: 'hacker.tech',
      role: 'Technician',
      password: 'hackerpass123'
    });
    assert.strictEqual(supCreate.status, 403, 'Supervisor MUST be rejected with 403 on POST /api/users');
    console.log('[PASS] Supervisor POST /api/users: 403 Forbidden strictly enforced');

    // 6. Supervisor CANNOT reset another user password -> HTTP 403 Forbidden
    const supReset = await makeRequest(server, {
      path: `/api/users/${createdId}/reset-password`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': 'Supervisor',
        'x-user-id': 'use-1791203401122-22'
      }
    }, { mode: 'temp' });
    assert.strictEqual(supReset.status, 403, 'Supervisor MUST be rejected with 403 on reset-password');
    console.log('[PASS] Supervisor POST /api/users/:id/reset-password: 403 Forbidden strictly enforced');

    // 7. Supervisor CANNOT delete a user -> HTTP 403 Forbidden
    const supDelete = await makeRequest(server, {
      path: `/api/users/${createdId}`,
      method: 'DELETE',
      headers: {
        'x-user-role': 'Supervisor',
        'x-user-id': 'use-1791203401122-22'
      }
    });
    assert.strictEqual(supDelete.status, 403, 'Supervisor MUST be rejected with 403 on DELETE /api/users');
    console.log('[PASS] Supervisor DELETE /api/users/:id: 403 Forbidden strictly enforced');

    // 8. Supervisor CANNOT manage company settings -> HTTP 403 Forbidden
    const supSettings = await makeRequest(server, {
      path: '/api/settings',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': 'Supervisor',
        'x-user-id': 'use-1791203401122-22'
      }
    }, { company_name: 'Hacked Name' });
    assert.strictEqual(supSettings.status, 403, 'Supervisor MUST be rejected with 403 on PUT /api/settings');
    console.log('[PASS] Supervisor PUT /api/settings: 403 Forbidden strictly enforced');

    // 9. Supervisor CAN perform authorized operational tasks: view AMC visits
    const supVisits = await makeRequest(server, {
      path: '/api/amc-visits',
      method: 'GET',
      headers: {
        'x-user-role': 'Supervisor',
        'x-user-id': 'use-1791203401122-22'
      }
    });
    assert.strictEqual(supVisits.status, 200, 'Supervisor must be allowed to view AMC visits');
    console.log(`[PASS] Supervisor GET /api/amc-visits: 200 OK (${supVisits.body.length} visits retrieved)`);

    // 10. Clean up the test user
    const adminDelete = await makeRequest(server, {
      path: `/api/users/${createdId}`,
      method: 'DELETE',
      headers: {
        'x-user-role': 'Admin',
        'x-user-id': 'usr-admin-1'
      }
    });
    assert.strictEqual(adminDelete.status, 200, 'Admin cleanup must succeed');
    console.log('[PASS] Test staff account cleaned up successfully');

    console.log('\n====================================================');
    console.log('ALL HTTP API INTEGRATION TESTS PASSED 100%');
    console.log('====================================================');
  } finally {
    server.close();
  }
}

runApiTests().catch(err => {
  console.error('Test Failed:', err);
  process.exit(1);
});
