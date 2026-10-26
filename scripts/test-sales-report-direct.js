const { EventEmitter } = require('events');
const { app } = require('../server/index');
const { normalizeRole, ROLE_PERMISSIONS } = require('../server/auth');

function invokeRoute(method, url, headers = {}, body = null) {
  return new Promise((resolve) => {
    const req = new EventEmitter();
    req.method = method.toUpperCase();
    req.url = url;
    req.headers = {
      'content-type': 'application/json',
      ...Object.fromEntries(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v]))
    };
    req.body = body || {};
    req.query = {};
    req.params = {};

    const res = new EventEmitter();
    let statusCode = 200;
    let responseBody = null;
    let headersSent = false;
    const resHeaders = {};

    res.statusCode = 200;
    res.setHeader = (name, value) => {
      resHeaders[name.toLowerCase()] = value;
    };
    res.getHeader = (name) => resHeaders[name.toLowerCase()];
    res.status = (code) => {
      statusCode = code;
      res.statusCode = code;
      return res;
    };
    res.json = (data) => {
      responseBody = data;
      resolve({ status: statusCode, body: data });
    };
    res.send = (data) => {
      responseBody = data;
      try {
        responseBody = JSON.parse(data);
      } catch {}
      resolve({ status: statusCode, body: responseBody });
    };
    res.end = () => {
      resolve({ status: statusCode, body: responseBody });
    };

    app.handle(req, res, (err) => {
      if (err) {
        resolve({ status: 500, body: { error: err.message } });
      } else {
        resolve({ status: 404, body: { error: 'Not Found' } });
      }
    });
  });
}

async function runDirectTests() {
  console.log('=== FIREX DIRECT ROUTE & RBAC RESTRICTION TESTS ===\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message, details = '') {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message} - ${details}`);
      failed++;
    }
  }

  // 1. Role Permission Matrix Checks
  console.log('1. Checking Role Permission Matrix in server/auth.js:');
  assert(
    ROLE_PERMISSIONS.Sales.canPrepareReports === false,
    'Sales role has canPrepareReports === false'
  );
  assert(
    ROLE_PERMISSIONS.Sales.canManageReports === false,
    'Sales role has canManageReports === false'
  );
  assert(
    ROLE_PERMISSIONS.Sales.canCreateEmergency === false,
    'Sales role has canCreateEmergency === false'
  );
  assert(
    ROLE_PERMISSIONS.Sales.canEditEmergency === false,
    'Sales role has canEditEmergency === false'
  );
  assert(
    ROLE_PERMISSIONS.Sales.canSubmitEmergency === false,
    'Sales role has canSubmitEmergency === false'
  );
  assert(
    ROLE_PERMISSIONS.Sales.canCreateQuotations === true,
    'Sales role retains canCreateQuotations === true'
  );
  assert(
    ROLE_PERMISSIONS.Sales.canManageCustomers === true,
    'Sales role retains canManageCustomers === true'
  );

  // 2. Sales Route Denial Tests
  console.log('\n2. Testing Sales Denials on API Endpoints:');

  // 2.1 POST /api/reports
  const postReport = await invokeRoute('POST', '/api/reports', {
    'x-user-role': 'Sales',
    'x-user-id': 'usr-sales-1'
  }, {
    report_type: 'AMC Service Report',
    customer_id: 'cust-1'
  });
  assert(
    postReport.status === 403,
    'POST /api/reports returns 403 Forbidden for Sales',
    `Got: ${postReport.status} ${JSON.stringify(postReport.body)}`
  );

  // 2.2 PUT /api/reports/:id
  const putReport = await invokeRoute('PUT', '/api/reports/rpt-1', {
    'x-user-role': 'Sales',
    'x-user-id': 'usr-sales-1'
  }, {
    work_description: 'Test edit'
  });
  assert(
    putReport.status === 403,
    'PUT /api/reports/:id returns 403 Forbidden for Sales',
    `Got: ${putReport.status} ${JSON.stringify(putReport.body)}`
  );

  // 2.3 POST /api/emergency-calls
  const postEmerg = await invokeRoute('POST', '/api/emergency-calls', {
    'x-user-role': 'Sales',
    'x-user-id': 'usr-sales-1'
  }, {
    customer_name: 'Test Customer',
    emergency_type: 'Pump Malfunction'
  });
  assert(
    postEmerg.status === 403,
    'POST /api/emergency-calls returns 403 Forbidden for Sales',
    `Got: ${postEmerg.status} ${JSON.stringify(postEmerg.body)}`
  );

  // 2.4 PUT /api/emergency-calls/:id
  const putEmerg = await invokeRoute('PUT', '/api/emergency-calls/call-1', {
    'x-user-role': 'Sales',
    'x-user-id': 'usr-sales-1'
  }, {
    findings: 'Attempted modification'
  });
  assert(
    putEmerg.status === 403,
    'PUT /api/emergency-calls/:id returns 403 Forbidden for Sales',
    `Got: ${putEmerg.status} ${JSON.stringify(putEmerg.body)}`
  );

  // 2.5 POST /api/emergency-calls/:id/submit
  const submitEmerg = await invokeRoute('POST', '/api/emergency-calls/call-1/submit', {
    'x-user-role': 'Sales',
    'x-user-id': 'usr-sales-1'
  }, {});
  assert(
    submitEmerg.status === 403,
    'POST /api/emergency-calls/:id/submit returns 403 Forbidden for Sales',
    `Got: ${submitEmerg.status} ${JSON.stringify(submitEmerg.body)}`
  );

  // 2.6 POST /api/amc-visits/:id/checklist
  const amcChecklist = await invokeRoute('POST', '/api/amc-visits/visit-1/checklist', {
    'x-user-role': 'Sales',
    'x-user-id': 'usr-sales-1'
  }, { checklist: {} });
  assert(
    amcChecklist.status === 403,
    'POST /api/amc-visits/:id/checklist returns 403 Forbidden for Sales',
    `Got: ${amcChecklist.status} ${JSON.stringify(amcChecklist.body)}`
  );

  // 3. Authorized Roles Allowed Tests
  console.log('\n3. Testing Authorized Roles (Projects Manager, Engineer, Supervisor, Technician):');
  const authorized = [
    { role: 'Projects Manager', id: 'usr-pm-1' },
    { role: 'Engineer', id: 'usr-eng' },
    { role: 'Supervisor', id: 'usr-sup' },
    { role: 'Technician', id: 'usr-tech' }
  ];

  for (const auth of authorized) {
    const authReport = await invokeRoute('POST', '/api/reports', {
      'x-user-role': auth.role,
      'x-user-id': auth.id
    }, {
      report_type: 'AMC Service Report',
      customer_id: 'cust-1',
      site_id: 'site-1'
    });
    assert(
      authReport.status !== 403,
      `${auth.role} is authorized to prepare reports (HTTP ${authReport.status})`
    );

    const authEmerg = await invokeRoute('POST', '/api/emergency-calls', {
      'x-user-role': auth.role,
      'x-user-id': auth.id
    }, {
      customer_name: 'Al Futtaim Logistics',
      emergency_type: 'Hydrant Flow Low'
    });
    assert(
      authEmerg.status !== 403,
      `${auth.role} is authorized to create Emergency Call-Out Reports (HTTP ${authEmerg.status})`
    );
  }

  // 4. Preserved Sales Operations Tests
  console.log('\n4. Testing Preserved Sales Operations:');
  const getCust = await invokeRoute('GET', '/api/customers', {
    'x-user-role': 'Sales',
    'x-user-id': 'usr-sales-1'
  });
  assert(
    getCust.status === 200,
    'Sales role successfully fetches customers (200 OK)'
  );

  const getJobs = await invokeRoute('GET', '/api/jobs', {
    'x-user-role': 'Sales',
    'x-user-id': 'usr-sales-1'
  });
  assert(
    getJobs.status === 200,
    'Sales role successfully fetches jobs (200 OK)'
  );

  const getAmc = await invokeRoute('GET', '/api/amc-contracts', {
    'x-user-role': 'Sales',
    'x-user-id': 'usr-sales-1'
  });
  assert(
    getAmc.status === 200,
    'Sales role successfully fetches AMC contracts (200 OK)'
  );

  const getQuot = await invokeRoute('GET', '/api/jobs', {
    'x-user-role': 'Sales',
    'x-user-id': 'usr-sales-1'
  });
  assert(
    getQuot.status === 200,
    'Sales role successfully fetches jobs and quotations (200 OK)'
  );

  const getStats = await invokeRoute('GET', '/api/dashboard/stats', {
    'x-user-role': 'Sales',
    'x-user-id': 'usr-sales-1'
  });
  assert(
    getStats.status === 200,
    'Sales role successfully fetches dashboard stats (200 OK)'
  );

  console.log(`\n=== RESULTS: ${passed} PASSED, ${failed} FAILED ===`);
  process.exit(failed > 0 ? 1 : 0);
}

runDirectTests();
