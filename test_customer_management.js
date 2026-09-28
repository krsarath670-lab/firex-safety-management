// test_customer_management.js
const http = require('http');

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = data ? JSON.parse(data) : null;
          resolve({ status: res.statusCode, headers: res.headers, body: json });
        } catch (e) {
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

async function runTests() {
  console.log('=== STARTING CUSTOMER MANAGEMENT API TEST SUITE ===\n');
  let passed = 0;
  let failed = 0;

  function assert(desc, condition, details = '') {
    if (condition) {
      console.log(`[PASS] ${desc}`);
      passed++;
    } else {
      console.error(`[FAIL] ${desc} - ${details}`);
      failed++;
    }
  }

  try {
    // Test 1: Technician access control (should be 403 Forbidden)
    console.log('--- Test 1: Role Access Control ---');
    const techRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/customers',
      method: 'GET',
      headers: { 'x-user-role': 'Technician', 'x-user-id': 'usr-tech-1' }
    });
    assert('Technician blocked from full customer management (403)', techRes.status === 403, `Got ${techRes.status}`);

    const salesRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/customers',
      method: 'GET',
      headers: { 'x-user-role': 'Sales', 'x-user-id': 'usr-sales-1' }
    });
    assert('Sales permitted to access customer management (200)', salesRes.status === 200, `Got ${salesRes.status}`);

    // Test 2: Verify Customer List & Test Customer Seeding
    console.log('\n--- Test 2: Customer List & Seed Data Verification ---');
    const gmRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/customers',
      method: 'GET',
      headers: { 'x-user-role': 'GM', 'x-user-id': 'usr-gm' }
    });
    assert('GM receives 200 OK for customer list', gmRes.status === 200);
    const customers = gmRes.body;
    assert('Customer list is an array with items', Array.isArray(customers) && customers.length > 0, `Count: ${customers.length}`);

    const seefCust = customers.find(c => c.cr_no === '96850 1' || c.vat_no === '220006271900002');
    assert('Seeded test customer exists with CR 96850 1', !!seefCust, JSON.stringify(seefCust));
    if (seefCust) {
      assert('Test customer has VAT No: 220006271900002', seefCust.vat_no === '220006271900002');
      assert('Test customer has Building 2373', seefCust.building_no === '2373');
      assert('Test customer has Road 2831', seefCust.road_no === '2831');
      assert('Test customer has Block 428', seefCust.block_no === '428');
      assert('Test customer has Area Al Seef', seefCust.area === 'Al Seef');
      assert('Test customer has sites_count calculated', typeof seefCust.sites_count === 'number' && seefCust.sites_count >= 1);
      assert('Test customer has active_amc_count calculated', typeof seefCust.active_amc_count === 'number');
      assert('NO Civil Defence field in customer record', seefCust.civil_defence === undefined && seefCust.civil_defense === undefined);
    }

    // Test 3: Customer Details Drawer Endpoint
    console.log('\n--- Test 3: Customer Details Aggregation (8 Sections) ---');
    if (seefCust) {
      const detailsRes = await request({
        hostname: 'localhost',
        port: 5000,
        path: `/api/customers/${seefCust.id}/details`,
        method: 'GET',
        headers: { 'x-user-role': 'GM', 'x-user-id': 'usr-gm' }
      });
      assert('Customer details returns 200 OK', detailsRes.status === 200);
      const d = detailsRes.body;
      assert('Details has customer overview', !!d.customer && d.customer.id === seefCust.id);
      assert('Details has linked sites array', Array.isArray(d.sites) && d.sites.length >= 2, `Sites count: ${d.sites?.length}`);
      assert('Details has linked amcContracts array', Array.isArray(d.amcContracts));
      assert('Details has linked jobs array', Array.isArray(d.jobs));
      assert('Details has linked faults array', Array.isArray(d.faults));
      assert('Details has linked reports array', Array.isArray(d.reports));
      assert('Details has linked quotations array', Array.isArray(d.quotations));
      assert('Details has linked history audit array', Array.isArray(d.history));
    }

    // Test 4: Editable CR No. and VAT No. via PUT
    console.log('\n--- Test 4: Editable CR No. and VAT No. Verification ---');
    if (seefCust) {
      const updatedRemarks = `Updated test remarks on ${new Date().toISOString()}`;
      const updateRes = await request({
        hostname: 'localhost',
        port: 5000,
        path: `/api/customers/${seefCust.id}`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'Supervisor',
          'x-user-id': 'usr-sup'
        }
      }, {
        name: seefCust.name,
        cr_no: '96850 1', // Must remain fully editable
        vat_no: '220006271900002', // Must remain fully editable
        building_no: '2373',
        road_no: '2831',
        block_no: '428',
        area: 'Al Seef',
        country: 'Bahrain',
        phone: '+973 1758 0001',
        email: 'info@seef-firesafety.bh',
        contact_person: 'Mr. Tariq Al-Seef',
        contact_person_mobile: '+973 3944 1122',
        remarks: updatedRemarks,
        status: 'Active'
      });
      assert('PUT /api/customers/:id returns 200 OK', updateRes.status === 200);
      assert('CR No. preserved/editable as 96850 1', updateRes.body?.customer?.cr_no === '96850 1');
      assert('VAT No. preserved/editable as 220006271900002', updateRes.body?.customer?.vat_no === '220006271900002');
      assert('Remarks updated properly', updateRes.body?.customer?.remarks === updatedRemarks);
    }

    // Test 5: Duplicate Customer Check Endpoint
    console.log('\n--- Test 5: Duplicate Detection Logic ---');
    const dupCheck1 = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/customers/check-duplicate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': 'Sales',
        'x-user-id': 'usr-sales-1'
      }
    }, {
      cr_no: '96850-1' // Normalized match test
    });
    assert('Duplicate check detects matching CR No.', dupCheck1.status === 200 && dupCheck1.body?.hasDuplicates === true);
    assert('Duplicate match reason lists CR No.', dupCheck1.body?.duplicates?.[0]?.matchReasons?.some(r => r.includes('CR')));

    const dupCheck2 = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/customers/check-duplicate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': 'Sales',
        'x-user-id': 'usr-sales-1'
      }
    }, {
      vat_no: '220006271900002'
    });
    assert('Duplicate check detects matching VAT No.', dupCheck2.status === 200 && dupCheck2.body?.hasDuplicates === true);

    // Test 6: Create Customer with Duplicate Prevention and Conflict Handling
    console.log('\n--- Test 6: Customer Creation & Duplicate Conflict Handling ---');
    const conflictCreate = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/customers',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': 'Sales',
        'x-user-id': 'usr-sales-1'
      }
    }, {
      name: 'Al Seef Fire & Safety Duplicate Company',
      cr_no: '96850 1',
      vat_no: '220006271900002'
    });
    assert('POST /api/customers with duplicate CR returns 409 Conflict', conflictCreate.status === 409);
    assert('Conflict response includes duplicates array', Array.isArray(conflictCreate.body?.duplicates));

    // Now create a brand new distinct customer with force or unique values
    const uniqueSuffix = Date.now().toString().slice(-4);
    const validCreate = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/customers',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': 'Sales',
        'x-user-id': 'usr-sales-1'
      }
    }, {
      name: `Bahrain Petrochemical Towers ${uniqueSuffix}`,
      cr_no: `77889 ${uniqueSuffix}`,
      vat_no: `2000998877000${uniqueSuffix}`,
      villa_flat: 'Suite 401',
      building_no: '1040',
      road_no: '3618',
      block_no: '336',
      area: 'Adliya',
      country: 'Bahrain',
      phone: `+973 1772 ${uniqueSuffix}`,
      email: `contact@bpt${uniqueSuffix}.bh`,
      contact_person: 'Fatima Al-Ansari',
      contact_person_mobile: `+973 3922 ${uniqueSuffix}`,
      remarks: 'Primary energy sector headquarters',
      status: 'Active',
      site_name: 'Main Petrochemical Tower Complex'
    });
    assert('POST /api/customers creates new customer (201 Created)', validCreate.status === 201);
    const newCust = validCreate.body;
    assert('New customer has auto-generated code', !!newCust?.code && newCust.code.startsWith('CUST-BH-'));
    assert('New customer has combined formatted address', newCust?.address?.includes('Adliya') && newCust?.address?.includes('Block 336'));
    assert('New customer created initial site', !!newCust?.primary_site_id);

    // Verify search endpoint works with new customer code, CR, area
    console.log('\n--- Test 7: Search Filtering Across Required Fields ---');
    const searchRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/customers?q=${encodeURIComponent(newCust.code)}`,
      method: 'GET',
      headers: { 'x-user-role': 'GM', 'x-user-id': 'usr-gm' }
    });
    assert('Search by Customer Code returns newly created customer', searchRes.status === 200 && searchRes.body?.some(c => c.id === newCust.id));

    const searchAreaRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/customers?q=Adliya`,
      method: 'GET',
      headers: { 'x-user-role': 'GM', 'x-user-id': 'usr-gm' }
    });
    assert('Search by Area returns matching customers', searchAreaRes.status === 200 && searchAreaRes.body?.length > 0);

  } catch (err) {
    console.error('Unexpected test execution error:', err);
    failed++;
  }

  console.log(`\n=== TEST RESULTS: ${passed} PASSED, ${failed} FAILED ===`);
  if (failed > 0) process.exit(1);
}

runTests();
