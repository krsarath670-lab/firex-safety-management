const http = require('http');

function request({ method, path, headers = {}, body }) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
          ...headers
        }
      },
      res => {
        let data = '';
        res.on('data', chunk => (data += chunk));
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(data);
          } catch {
            parsed = data;
          }
          resolve({ status: res.statusCode, data: parsed });
        });
      }
    );
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runTests() {
  console.log('=== RUNNING FIREX REPORT WORKFLOW & PERMISSION VERIFICATION ===\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  // 1. Engineer creates report
  const res1 = await request({
    method: 'POST',
    path: '/api/reports',
    headers: { 'x-user-role': 'Engineer', 'x-user-id': 'usr-eng-john' },
    body: {
      report_type: 'AMC Service Report',
      system: 'Fire Alarm',
      customer_id: 'cust-1',
      site_id: 'site-1',
      date: '2026-09-30'
    }
  });
  assert(res1.status === 201, 'Engineer can create report (201 Created)');
  assert(res1.data.prepared_by_name === 'John Smith', 'Engineer name automatically set as Prepared By: ' + res1.data.prepared_by_name);
  assert(res1.data.prepared_by_role === 'Engineer', 'Engineer role automatically set as Prepared By Role: ' + res1.data.prepared_by_role);
  const engReportId = res1.data.id;

  // 2. Supervisor creates report
  const res2 = await request({
    method: 'POST',
    path: '/api/reports',
    headers: { 'x-user-role': 'Supervisor', 'x-user-id': 'usr-sup-david' },
    body: {
      report_type: 'Work Completion Report',
      system: 'Fire Fighting',
      customer_id: 'cust-1',
      site_id: 'site-1',
      date: '2026-09-30'
    }
  });
  assert(res2.status === 201, 'Supervisor can create report (201 Created)');
  assert(res2.data.prepared_by_name === 'David Thomas', 'Supervisor name automatically set as Prepared By: ' + res2.data.prepared_by_name);
  assert(res2.data.prepared_by_role === 'Supervisor', 'Supervisor role automatically set as Prepared By Role: ' + res2.data.prepared_by_role);

  // 3. Technician creates report
  const res3 = await request({
    method: 'POST',
    path: '/api/reports',
    headers: { 'x-user-role': 'Technician', 'x-user-id': 'usr-tech-ahmed' },
    body: {
      report_type: 'Fault Report',
      system: 'Fire Extinguishers',
      customer_id: 'cust-1',
      site_id: 'site-1',
      date: '2026-09-30'
    }
  });
  assert(res3.status === 201, 'Technician can create report (201 Created)');
  assert(res3.data.prepared_by_name === 'Ahmed Mohammed', 'Technician name automatically set as Prepared By: ' + res3.data.prepared_by_name);
  assert(res3.data.prepared_by_role === 'Technician', 'Technician role automatically set as Prepared By Role: ' + res3.data.prepared_by_role);
  const techReportId = res3.data.id;

  // 4. Projects Manager creates report
  const res4 = await request({
    method: 'POST',
    path: '/api/reports',
    headers: { 'x-user-role': 'Projects Manager', 'x-user-id': 'usr-pm-sarah' },
    body: {
      report_type: 'Project Report',
      system: 'FM200 Gas Suppression',
      customer_id: 'cust-1',
      site_id: 'site-1',
      date: '2026-09-30'
    }
  });
  assert(res4.status === 201, 'Projects Manager can create report (201 Created)');
  assert(res4.data.prepared_by_name === 'Sarah Ali', 'Projects Manager name automatically set as Prepared By: ' + res4.data.prepared_by_name);
  assert(res4.data.prepared_by_role === 'Projects Manager', 'Projects Manager role automatically set as Prepared By Role: ' + res4.data.prepared_by_role);

  // 5. Sales attempts to create report -> MUST BE 403 Forbidden
  const resSales = await request({
    method: 'POST',
    path: '/api/reports',
    headers: { 'x-user-role': 'Sales', 'x-user-id': 'use-1790621910982-865' },
    body: {
      report_type: 'AMC Service Report',
      system: 'Fire Alarm',
      customer_id: 'cust-1',
      site_id: 'site-1',
      date: '2026-09-30'
    }
  });
  assert(resSales.status === 403, 'Sales CANNOT create report (403 Forbidden enforced)');

  // 6. Accounts attempts to create report -> MUST BE 403 Forbidden
  const resAcc = await request({
    method: 'POST',
    path: '/api/reports',
    headers: { 'x-user-role': 'Accounts', 'x-user-id': 'usr-acc-zahra' },
    body: {
      report_type: 'AMC Service Report',
      system: 'Fire Alarm',
      customer_id: 'cust-1',
      site_id: 'site-1',
      date: '2026-09-30'
    }
  });
  assert(resAcc.status === 403, 'Accounts CANNOT create report (403 Forbidden enforced)');

  // 7. Technician attempts to review or complete report -> MUST BE 403 Forbidden
  const resTechRev = await request({
    method: 'PUT',
    path: `/api/reports/${techReportId}`,
    headers: { 'x-user-role': 'Technician', 'x-user-id': 'usr-tech-ahmed' },
    body: { status: 'Reviewed' }
  });
  assert(resTechRev.status === 403, 'Technician CANNOT review report (403 Forbidden enforced)');

  const resTechComp = await request({
    method: 'PUT',
    path: `/api/reports/${techReportId}`,
    headers: { 'x-user-role': 'Technician', 'x-user-id': 'usr-tech-ahmed' },
    body: { status: 'Completed' }
  });
  assert(resTechComp.status === 403, 'Technician CANNOT complete report (403 Forbidden enforced)');

  // 8. GM attempts to edit/approve/review/complete report -> MUST BE 403 Forbidden (View only)
  const resGMApprove = await request({
    method: 'PUT',
    path: `/api/reports/${techReportId}`,
    headers: { 'x-user-role': 'GM', 'x-user-id': 'usr-gm-1790621464394' },
    body: { status: 'Completed' }
  });
  assert(resGMApprove.status === 403, 'GM CANNOT approve or complete reports (403 Forbidden: GM is View Only)');

  // 9. GM views report -> 200 OK
  const resGMView = await request({
    method: 'GET',
    path: `/api/reports/${techReportId}`,
    headers: { 'x-user-role': 'GM', 'x-user-id': 'usr-gm-1790621464394' }
  });
  assert(resGMView.status === 200, 'GM CAN view report (200 OK)');
  assert(resGMView.data.prepared_by_name === 'Ahmed Mohammed', 'GM sees original Prepared By identity');

  // 10. Technician submits draft report
  const resTechSubmit = await request({
    method: 'PUT',
    path: `/api/reports/${techReportId}`,
    headers: { 'x-user-role': 'Technician', 'x-user-id': 'usr-tech-ahmed' },
    body: { status: 'Submitted' }
  });
  assert(resTechSubmit.status === 200, 'Technician can submit their own draft report (200 OK)');
  assert(resTechSubmit.data.status === 'Submitted', 'Status is now Submitted');
  assert(resTechSubmit.data.submitted_by_name === 'Ahmed Mohammed', 'Submitted By captured automatically');

  // 11. Supervisor reviews report
  const resSupRev = await request({
    method: 'PUT',
    path: `/api/reports/${techReportId}`,
    headers: { 'x-user-role': 'Supervisor', 'x-user-id': 'usr-sup-david' },
    body: { status: 'Reviewed' }
  });
  assert(resSupRev.status === 200, 'Supervisor can review report (200 OK)');
  assert(resSupRev.data.status === 'Reviewed', 'Status is now Reviewed');
  assert(resSupRev.data.reviewed_by_name === 'David Thomas', 'Reviewed By captured: David Thomas');

  // 12. Engineer completes report WITHOUT GM approval
  const resEngComp = await request({
    method: 'PUT',
    path: `/api/reports/${techReportId}`,
    headers: { 'x-user-role': 'Engineer', 'x-user-id': 'usr-eng-john' },
    body: { status: 'Completed' }
  });
  assert(resEngComp.status === 200, 'Engineer completes report without GM (200 OK)');
  assert(resEngComp.data.status === 'Completed', 'Final status is Completed (NOT Approved)');
  assert(resEngComp.data.completed_by_name === 'John Smith', 'Completed By captured: John Smith');
  assert(resEngComp.data.prepared_by_name === 'Ahmed Mohammed', 'Original creator Ahmed Mohammed is preserved');

  console.log(`\nTEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
