const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: body ? JSON.parse(body) : null });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING STAFF & APP ACCESS MANAGEMENT TESTS ---');

  // Test 1: GET /api/users role permissions
  console.log('\n[1] Testing GET /api/users permissions across roles:');
  
  // GM
  const gmGet = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/users',
    method: 'GET',
    headers: { 'x-user-role': 'GM', 'x-user-id': 'usr-gm' }
  });
  if (gmGet.status !== 200) throw new Error(`GM should be allowed to view users, got ${gmGet.status}`);
  console.log('✓ GM can view staff directory (200 OK)');

  // Engineer
  const engGet = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/users',
    method: 'GET',
    headers: { 'x-user-role': 'Engineer', 'x-user-id': 'usr-eng' }
  });
  if (engGet.status !== 200) throw new Error(`Engineer should be allowed to view users, got ${engGet.status}`);
  console.log('✓ Engineer can view staff directory (200 OK)');

  // Supervisor
  const supGet = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/users',
    method: 'GET',
    headers: { 'x-user-role': 'Supervisor', 'x-user-id': 'usr-sup' }
  });
  if (supGet.status !== 200) throw new Error(`Supervisor should be allowed to view users, got ${supGet.status}`);
  console.log('✓ Supervisor can view staff directory (200 OK)');

  // Technician (Forbidden)
  const techGet = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/users',
    method: 'GET',
    headers: { 'x-user-role': 'Technician', 'x-user-id': 'usr-tech' }
  });
  if (techGet.status !== 403) throw new Error(`Technician must NOT be allowed to view users, got ${techGet.status}`);
  console.log('✓ Technician is forbidden from staff directory (403 Forbidden)');

  // Sales (Forbidden)
  const salesGet = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/users',
    method: 'GET',
    headers: { 'x-user-role': 'Sales', 'x-user-id': 'usr-sales-1' }
  });
  if (salesGet.status !== 403) throw new Error(`Sales must NOT be allowed to view users, got ${salesGet.status}`);
  console.log('✓ Sales is forbidden from staff directory (403 Forbidden)');


  // Test 2: Supervisor creating a Technician
  console.log('\n[2] Testing Supervisor creating a new Technician:');
  const supCreateTech = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/users',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-role': 'Supervisor',
      'x-user-id': 'usr-sup'
    }
  }, {
    name: 'Ali Al-Hassan',
    email: 'ali.tech@firexbahrain.com',
    role: 'Technician',
    phone: '+973 3922 4455',
    designation: 'Certified Fire Alarm Specialist',
    pin: '2345',
    status: 'Active'
  });
  if (supCreateTech.status !== 201) throw new Error(`Supervisor failed to create Technician: ${supCreateTech.status}`);
  const createdTech = supCreateTech.data;
  console.log(`✓ Supervisor successfully created Technician: ${createdTech.name} (ID: ${createdTech.id})`);


  // Test 3: Engineer creating a Salesperson
  console.log('\n[3] Testing Engineer creating a new Salesperson:');
  const engCreateSales = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/users',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-role': 'Engineer',
      'x-user-id': 'usr-eng'
    }
  }, {
    name: 'Maryam Ebrahim',
    email: 'maryam.sales@firexbahrain.com',
    role: 'Sales',
    phone: '+973 3933 7788',
    designation: 'Commercial Sales Executive',
    pin: '5678',
    status: 'Active'
  });
  if (engCreateSales.status !== 201) throw new Error(`Engineer failed to create Sales: ${engCreateSales.status}`);
  const createdSales = engCreateSales.data;
  console.log(`✓ Engineer successfully created Salesperson: ${createdSales.name} (ID: ${createdSales.id})`);


  // Test 4: Supervisor trying to create a GM (Forbidden)
  console.log('\n[4] Testing Supervisor restriction when trying to create a GM role:');
  const supCreateGM = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/users',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-role': 'Supervisor',
      'x-user-id': 'usr-sup'
    }
  }, {
    name: 'Unauthorized GM Test',
    role: 'GM'
  });
  if (supCreateGM.status !== 403) throw new Error(`Supervisor should NOT be allowed to create GM, got ${supCreateGM.status}`);
  console.log('✓ Supervisor blocked from creating GM account (403 Forbidden as expected)');


  // Test 5: Supervisor updating Technician details
  console.log('\n[5] Testing Supervisor updating Technician details:');
  const supUpdateTech = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/users/${createdTech.id}`,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-user-role': 'Supervisor',
      'x-user-id': 'usr-sup'
    }
  }, {
    phone: '+973 3922 9999',
    status: 'Inactive'
  });
  if (supUpdateTech.status !== 200) throw new Error(`Supervisor failed to update Technician: ${supUpdateTech.status}`);
  console.log('✓ Supervisor updated Technician phone and status successfully');


  // Test 6: Deleting the test accounts
  console.log('\n[6] Testing Supervisor & Engineer deleting the test accounts:');
  const supDeleteTech = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/users/${createdTech.id}`,
    method: 'DELETE',
    headers: {
      'x-user-role': 'Supervisor',
      'x-user-id': 'usr-sup'
    }
  });
  if (supDeleteTech.status !== 200) throw new Error(`Supervisor failed to delete test Technician: ${supDeleteTech.status}`);
  console.log('✓ Supervisor successfully deleted test Technician');

  const engDeleteSales = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/users/${createdSales.id}`,
    method: 'DELETE',
    headers: {
      'x-user-role': 'Engineer',
      'x-user-id': 'usr-eng'
    }
  });
  if (engDeleteSales.status !== 200) throw new Error(`Engineer failed to delete test Sales: ${engDeleteSales.status}`);
  console.log('✓ Engineer successfully deleted test Sales');

  console.log('\n--- ALL STAFF & APP ACCESS MANAGEMENT TESTS PASSED! ---');
}

runTests().catch(err => {
  console.error('\n❌ Test failed:', err.message);
  process.exit(1);
});
