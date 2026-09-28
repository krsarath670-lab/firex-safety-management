// Comprehensive End-to-End Test Suite for All 36 Requirements
const http = require('http');

function request(method, path, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });
    req.on('error', (err) => reject(err));
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('STARTING END-TO-END VERIFICATION SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // 0. Discover Users
    console.log('--- STEP 0: Discovering System Users ---');
    const usersRes = await request('GET', '/api/users', { 'x-user-role': 'GM', 'x-user-id': 'usr-gm' });
    assert(usersRes.status === 200, 'Fetched users list successfully');
    const allUsers = usersRes.data || [];
    const salesUsers = allUsers.filter(u => u.role === 'Sales');
    const techUsers = allUsers.filter(u => u.role === 'Technician');
    const gmUser = allUsers.find(u => u.role === 'GM');
    const engUser = allUsers.find(u => u.role === 'Engineer');
    const supUser = allUsers.find(u => u.role === 'Supervisor');

    assert(salesUsers.length >= 2, `Found ${salesUsers.length} Sales Persons: ${salesUsers.map(s => s.name).join(', ')}`);
    assert(techUsers.length >= 1, `Found Technician: ${techUsers[0]?.name}`);
    assert(gmUser && engUser && supUser, 'Management roles GM, Engineer, Supervisor present');

    const sales1 = salesUsers[0];
    const sales2 = salesUsers[1];
    const tech = techUsers[0];

    // 1. TEST 1: Create AMC with Sales Person & 10% VAT -> check visit schedule, quarters, and days
    console.log('\n--- TEST 1: Create AMC with Sales Person & 10% VAT ---');
    const customersRes = await request('GET', '/api/customers', { 'x-user-role': 'GM', 'x-user-id': 'usr-gm' });
    const sitesRes = await request('GET', '/api/sites', { 'x-user-role': 'GM', 'x-user-id': 'usr-gm' });
    const testCust = customersRes.data[0];
    const testSite = sitesRes.data[0];

    const createAmcPayload = {
      customer_id: testCust.id,
      site_id: testSite.id,
      sales_person_id: sales1.id,
      contract_type: 'Comprehensive',
      start_date: '2026-01-01',
      end_date: '2026-12-31',
      contract_value: 2400.000,
      vat_percent: 10,
      systems_covered: ['Fire Alarm', 'Fire Fighting'],
      systems: ['Fire Alarm', 'Fire Fighting'],
      visit_frequency: 'Quarterly',
      contact_person: 'Mr. Test Client'
    };

    const newAmcRes = await request('POST', '/api/amc-contracts', { 'x-user-role': 'GM', 'x-user-id': 'usr-gm' }, createAmcPayload);
    assert(newAmcRes.status === 201, `AMC Contract created with status 201: ${newAmcRes.data.contract_number}`);
    const createdAmc = newAmcRes.data;

    // Check VAT calculation (10% on 2400 = 240, total = 2640)
    assert(createdAmc.contract_value === 2400, `Contract Value is 2400 (Actual: ${createdAmc.contract_value})`);
    assert(createdAmc.vat_percent === 10, `VAT Percent is 10% (Actual: ${createdAmc.vat_percent})`);
    assert(createdAmc.vat_amount === 240, `VAT Amount is 240.000 BHD (Actual: ${createdAmc.vat_amount})`);
    assert(createdAmc.total_including_vat === 2640, `Total Including VAT is 2640.000 BHD (Actual: ${createdAmc.total_including_vat})`);
    assert(createdAmc.sales_person_id === sales1.id, `Sales Person linked: ${createdAmc.sales_person_name}`);

    // Check Visits generated with Quarters (Q1-Q4) and Day of Week
    const visitsRes = await request('GET', `/api/amc-visits?amc_id=${createdAmc.id}`, { 'x-user-role': 'GM', 'x-user-id': 'usr-gm' });
    const visits = visitsRes.data || [];
    assert(visits.length >= 4, `Generated ${visits.length} scheduled visits across systems`);

    const quartersPresent = new Set(visits.map(v => v.quarter));
    assert(quartersPresent.has('Q1') && quartersPresent.has('Q2') && quartersPresent.has('Q3') && quartersPresent.has('Q4'),
      `Visits have calculated Quarters Q1, Q2, Q3, Q4: [${Array.from(quartersPresent).join(', ')}]`);

    const daysValid = visits.every(v => v.day_of_week && typeof v.day_of_week === 'string' && v.day_of_week.length > 2);
    assert(daysValid, `Visits have calculated Day of Week (e.g. ${visits[0]?.day_of_week})`);

    // 2. TEST 2: Sales Person Login & Isolation
    console.log('\n--- TEST 2: Sales Person Login & Strict Isolation ---');
    // Sales 1 accesses AMC contracts
    const sales1AmcRes = await request('GET', '/api/amc-contracts', { 'x-user-role': 'Sales', 'x-user-id': sales1.id });
    assert(sales1AmcRes.status === 200, `Sales 1 fetched their AMC list (${sales1AmcRes.data.length} contracts)`);
    const allBelongToSales1 = sales1AmcRes.data.every(a => a.sales_person_id === sales1.id);
    assert(allBelongToSales1, 'Every contract in Sales 1 list belongs strictly to Sales 1');

    // Sales 2 accesses AMC contracts
    const sales2AmcRes = await request('GET', '/api/amc-contracts', { 'x-user-role': 'Sales', 'x-user-id': sales2.id });
    const containsCreatedAmc = sales2AmcRes.data.some(a => a.id === createdAmc.id);
    assert(!containsCreatedAmc, 'Sales 2 CANNOT see Sales 1 AMC in list (strict isolation)');

    // Sales 2 attempts direct access to Sales 1 contract by ID -> 403 Forbidden
    const sales2DirectRes = await request('GET', `/api/amc-contracts/${createdAmc.id}`, { 'x-user-role': 'Sales', 'x-user-id': sales2.id });
    assert(sales2DirectRes.status === 403, `Sales 2 direct access to Sales 1 AMC returned 403 Forbidden (Actual: ${sales2DirectRes.status})`);

    // Also test Job isolation for Sales Person
    const createJobPayload = {
      job_type: 'Fit-out',
      system_type: 'Fire Fighting',
      customer_id: testCust.id,
      site_id: testSite.id,
      sales_person_id: sales1.id,
      amount: 1500.000,
      vat_percent: 10,
      description: 'Sales 1 Exclusive Fitout Job'
    };
    const jobRes = await request('POST', '/api/jobs', { 'x-user-role': 'Sales', 'x-user-id': sales1.id }, createJobPayload);
    assert(jobRes.status === 201, `Sales 1 created Fit-out job ${jobRes.data.job_number}`);
    const createdJob = jobRes.data;

    // Sales 2 attempts direct access to Sales 1 job by ID -> 403 Forbidden
    const sales2JobRes = await request('GET', `/api/jobs/${createdJob.id}`, { 'x-user-role': 'Sales', 'x-user-id': sales2.id });
    assert(sales2JobRes.status === 403, `Sales 2 direct access to Sales 1 Job returned 403 Forbidden (Actual: ${sales2JobRes.status})`);

    // 3. TEST 3: Technician Login & Complete Financial Protection
    console.log('\n--- TEST 3: Technician Complete Financial Protection ---');
    // Technician views AMC contracts -> 403 Forbidden (Technicians have no access to AMC contracts)
    const techAmcListRes = await request('GET', '/api/amc-contracts', { 'x-user-role': 'Technician', 'x-user-id': tech.id });
    assert(techAmcListRes.status === 403, `Technician access to /api/amc-contracts returned 403 Forbidden (Actual: ${techAmcListRes.status})`);

    // Technician views direct contract by ID -> 403 Forbidden
    const techAmcDirectRes = await request('GET', `/api/amc-contracts/${createdAmc.id}`, { 'x-user-role': 'Technician', 'x-user-id': tech.id });
    assert(techAmcDirectRes.status === 403, `Technician direct access to AMC returned 403 Forbidden (Actual: ${techAmcDirectRes.status})`);

    // Assign job to technician and verify financial masking
    await request('PUT', `/api/jobs/${createdJob.id}`, { 'x-user-role': 'GM', 'x-user-id': 'usr-gm' }, { technician_id: tech.id });
    const techJobRes = await request('GET', `/api/jobs/${createdJob.id}`, { 'x-user-role': 'Technician', 'x-user-id': tech.id });
    assert(techJobRes.status === 200, 'Technician fetched assigned job');
    assert(techJobRes.data.amount === null, `Technician job amount is MASKED/NULL (Actual: ${techJobRes.data.amount})`);
    assert(techJobRes.data.vat_amount === null, `Technician job VAT amount is MASKED/NULL (Actual: ${techJobRes.data.vat_amount})`);
    assert(techJobRes.data.total_including_vat === null, `Technician job total is MASKED/NULL (Actual: ${techJobRes.data.total_including_vat})`);

    // 4. TEST 4: Management Login, Edit & Delete, and Sales Person Reassignment
    console.log('\n--- TEST 4: Management Edit, Delete & Sales Person Reassignment ---');
    // Engineer reassigns Sales Person from Sales 1 to Sales 2 on AMC
    const reassignAmcRes = await request('PUT', `/api/amc-contracts/${createdAmc.id}`, { 'x-user-role': 'Engineer', 'x-user-id': engUser.id }, {
      sales_person_id: sales2.id,
      contract_value: 3000.000,
      vat_percent: 10
    });
    assert(reassignAmcRes.status === 200, `Engineer updated AMC: ${reassignAmcRes.data.contract_number}`);
    assert(reassignAmcRes.data.sales_person_id === sales2.id, `Sales Person reassigned to: ${reassignAmcRes.data.sales_person_name}`);
    assert(reassignAmcRes.data.contract_value === 3000, `Contract value updated to 3000 (VAT: ${reassignAmcRes.data.vat_amount}, Total: ${reassignAmcRes.data.total_including_vat})`);

    // Supervisor reassigns Sales Person on Job
    const reassignJobRes = await request('PUT', `/api/jobs/${createdJob.id}`, { 'x-user-role': 'Supervisor', 'x-user-id': supUser.id }, {
      sales_person_id: sales2.id,
      amount: 1800.000
    });
    assert(reassignJobRes.status === 200, `Supervisor updated Job: ${reassignJobRes.data.job_number}`);
    assert(reassignJobRes.data.sales_person_id === sales2.id, `Job Sales Person reassigned to: ${reassignJobRes.data.sales_person_name}`);
    assert(reassignJobRes.data.amount === 1800, `Job amount updated to 1800 BHD (Total: ${reassignJobRes.data.total_including_vat})`);

    // Non-management (Sales or Tech) cannot delete AMC or Job
    const salesDeleteRes = await request('DELETE', `/api/amc-contracts/${createdAmc.id}`, { 'x-user-role': 'Sales', 'x-user-id': sales1.id });
    assert(salesDeleteRes.status === 403, `Sales delete attempt returned 403 Forbidden (Actual: ${salesDeleteRes.status})`);

    const techDeleteJobRes = await request('DELETE', `/api/jobs/${createdJob.id}`, { 'x-user-role': 'Technician', 'x-user-id': tech.id });
    assert(techDeleteJobRes.status === 403, `Tech delete job attempt returned 403 Forbidden (Actual: ${techDeleteJobRes.status})`);

    // GM deletes test Job
    const gmDeleteJobRes = await request('DELETE', `/api/jobs/${createdJob.id}`, { 'x-user-role': 'GM', 'x-user-id': 'usr-gm' });
    assert(gmDeleteJobRes.status === 200, 'GM successfully deleted test job');

    // 5. TEST 5: AMC Monthly Schedule & Sales Dashboard Metrics
    console.log('\n--- TEST 5: AMC Monthly Schedule & Sales Dashboard Metrics ---');
    const monthlyScheduleRes = await request('GET', '/api/amc-visits/monthly?year=2026&month=1', { 'x-user-role': 'GM', 'x-user-id': 'usr-gm' });
    assert(monthlyScheduleRes.status === 200, 'Fetched AMC Monthly Schedule for Jan 2026');
    assert(monthlyScheduleRes.data.summary !== undefined, 'Schedule includes calculated summary (total_visits, completed, pending, etc.)');
    assert(Array.isArray(monthlyScheduleRes.data.visits), `Schedule returned ${monthlyScheduleRes.data.visits?.length} visits for the month`);

    // Test Sales Dashboard Metrics (13 metrics)
    const salesStatsRes = await request('GET', `/api/sales/dashboard-stats?sales_person_id=${sales2.id}`, { 'x-user-role': 'Sales', 'x-user-id': sales2.id });
    assert(salesStatsRes.status === 200, 'Fetched Sales Dashboard Stats');
    const stats = salesStatsRes.data;
    assert(stats.active_amc_contracts !== undefined, `active_amc_contracts metric: ${stats.active_amc_contracts}`);
    assert(stats.active_amc_value !== undefined, `active_amc_value metric: ${stats.active_amc_value} BHD`);
    assert(stats.expiring_30_days !== undefined && stats.expiring_60_days !== undefined && stats.expiring_90_days !== undefined,
      `Expiry metrics (30/60/90 days): ${stats.expiring_30_days} / ${stats.expiring_60_days} / ${stats.expiring_90_days}`);
    assert(stats.active_fitout_value !== undefined, `active_fitout_value metric: ${stats.active_fitout_value} BHD`);
    assert(stats.active_projects_value !== undefined, `active_projects_value metric: ${stats.active_projects_value} BHD`);
    assert(stats.revenue_this_month !== undefined, `revenue_this_month metric: ${stats.revenue_this_month} BHD`);
    assert(stats.revenue_this_year !== undefined, `revenue_this_year metric: ${stats.revenue_this_year} BHD`);

    // 6. TEST 6: Report Generation & AMC Contract Period
    console.log('\n--- TEST 6: Report Generation & AMC Contract Period Linkage ---');
    const createReportPayload = {
      report_type: 'AMC Service Report',
      amc_id: createdAmc.id,
      amc_contract_number: createdAmc.contract_number,
      customer_id: testCust.id,
      site_id: testSite.id,
      sales_person_id: sales2.id,
      date: '2026-03-15',
      system: 'Fire Alarm',
      work_description: 'Q1 Comprehensive Fire Alarm inspection completed. All call points verified.',
      status: 'Submitted'
    };

    const newReportRes = await request('POST', '/api/reports', { 'x-user-role': 'Technician', 'x-user-id': tech.id }, createReportPayload);
    assert(newReportRes.status === 201, `Report created: ${newReportRes.data.report_number}`);
    const createdReport = newReportRes.data;

    // Check that AMC Contract Period and Sales Person are automatically linked
    const fetchReportRes = await request('GET', `/api/reports/${createdReport.id}`, { 'x-user-role': 'Sales', 'x-user-id': sales2.id });
    assert(fetchReportRes.status === 200, 'Sales 2 fetched the report');
    const repData = fetchReportRes.data;
    assert(repData.contract_period && repData.contract_period.includes('2026'),
      `Report has Contract Period: "${repData.contract_period}"`);
    assert(repData.quarter === 'Q1', `Report Quarter automatically derived: "${repData.quarter}"`);
    assert(repData.sales_person_name === sales2.name,
      `Report displays correct Sales Specialist: "${repData.sales_person_name}"`);

    // Sales 1 attempts to access Sales 2 report -> 403 Forbidden
    const sales1ReportRes = await request('GET', `/api/reports/${createdReport.id}`, { 'x-user-role': 'Sales', 'x-user-id': sales1.id });
    assert(sales1ReportRes.status === 403, `Sales 1 access to Sales 2 report returned 403 Forbidden (Actual: ${sales1ReportRes.status})`);

    console.log('\n====================================================');
    console.log(`END-TO-END VERIFICATION COMPLETED: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================\n');

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Fatal error running tests:', err);
    process.exit(1);
  }
}

runTests();
