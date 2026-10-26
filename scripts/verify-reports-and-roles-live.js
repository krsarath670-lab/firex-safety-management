const https = require('https');

const BASE_URL = 'https://firex-safety-management.onrender.com';

function request(method, path, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${BASE_URL}${path}`);
    const req = https.request(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    }, (res) => {
      let data = [];
      res.on('data', chunk => data.push(chunk));
      res.on('end', () => {
        const text = Buffer.concat(data).toString('utf8');
        let json;
        try { json = JSON.parse(text); } catch (e) { json = text; }
        resolve({ statusCode: res.statusCode, data: json });
      });
    });
    req.on('error', reject);
    if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
    req.end();
  });
}

async function run() {
  console.log('=== Verifying Reports & Role Permissions Live ===');

  // Test 1: Sales user attempting to create an AMC report directly via API
  const salesAttempt = await request('POST', '/api/reports/amc', {
    visit_id: 'test',
    contract_id: 'test'
  }, {
    'x-user-role': 'Sales',
    'x-user-id': 'usr-sales-1'
  });
  console.log('[1/4] Sales access to POST /api/reports/amc:', salesAttempt.statusCode, salesAttempt.data);

  // Test 2: Sales user attempting to create emergency report
  const salesEmgAttempt = await request('POST', '/api/reports/emergency', {
    call_id: 'test'
  }, {
    'x-user-role': 'Sales',
    'x-user-id': 'usr-sales-1'
  });
  console.log('[2/4] Sales access to POST /api/reports/emergency:', salesEmgAttempt.statusCode, salesEmgAttempt.data);

  // Test 3: Authorized Engineer fetching reports list
  const engineerReports = await request('GET', '/api/reports', null, {
    'x-user-role': 'Engineer',
    'x-user-id': 'usr-eng'
  });
  console.log('[3/4] Engineer GET /api/reports count:', Array.isArray(engineerReports.data) ? engineerReports.data.length : engineerReports.statusCode);

  // Test 4: Verify company branding on live settings endpoint
  const branding = await request('GET', '/api/settings');
  console.log('[4/4] Live Settings Letterhead:', branding.data?.letterhead_url, 'Footer:', branding.data?.letterhead_footer_url);

  console.log('=== All Live Verification Tests Complete! ===');
}

run();
