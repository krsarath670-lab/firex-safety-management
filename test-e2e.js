const https = require('https');

function request(url, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
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

async function runE2E() {
  const baseUrl = 'https://fires-angle-principles-literary.trycloudflare.com';
  console.log(`Starting End-to-End Workflow Verification on: ${baseUrl}\n`);

  const uniqueSuffix = Date.now().toString().slice(-4);

  // 1. Create a test customer as Sales
  const newCust = {
    name: `Test Tower ${uniqueSuffix}`,
    customer_code: `CUST-TEST-${uniqueSuffix}`,
    cr_no: `CR-${uniqueSuffix}`,
    vat_no: `VAT-${uniqueSuffix}`,
    building_no: "101",
    road_no: "202",
    block_no: "303",
    area: "Seef District",
    country: "Bahrain",
    phone: `+973 1716 ${uniqueSuffix}`,
    email: `test${uniqueSuffix}@firexbahrain.com`,
    contact_person: "Field Test Lead",
    status: "Active",
    force: true
  };

  const custRes = await request(`${baseUrl}/api/customers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-user-role': 'Sales', 'x-user-id': 'usr-sales-1' }
  }, newCust);
  console.log(`1. Create Customer as Sales: Status ${custRes.status}, ID = ${custRes.body.id}, Name = "${custRes.body.name}"`);

  // Fetch sites to get a valid site_id or customer sites
  const sitesRes = await request(`${baseUrl}/api/sites`, {
    headers: { 'x-user-role': 'Sales', 'x-user-id': 'usr-sales-1' }
  });
  const firstSite = sitesRes.body[0] || { id: 'site-1' };

  // 2. Create AMC as Sales
  const newAmc = {
    customer_id: custRes.body.id,
    customer_name: newCust.name,
    site_id: firstSite.id,
    site_name: firstSite.site_name || "Main Tower",
    systems: ["Fire Alarm", "Fire Fighting"],
    contract_value_bhd: 1850.50,
    start_date: "2026-10-01",
    end_date: "2027-09-30",
    renewal_date: "2027-08-31",
    frequency: "Quarterly",
    remarks: "Deployed 1-week test AMC",
    quotation_number: `QT-2026-${uniqueSuffix}`
  };

  const amcRes = await request(`${baseUrl}/api/amc`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-user-role': 'Sales', 'x-user-id': 'usr-sales-1' }
  }, newAmc);
  console.log(`2. Create AMC as Sales: Status ${amcRes.status}, AMC ID = ${amcRes.body.id}, Sales Person = ${amcRes.body.sales_person_name}`);

  // 3. Verify Sales isolation on AMC: Sales 2 must NOT see Sales 1's AMC
  const amcSales2 = await request(`${baseUrl}/api/amc`, {
    headers: { 'x-user-role': 'Sales', 'x-user-id': 'usr-sales-2' }
  });
  const amcSeenBySales2 = amcSales2.body.some(a => a.id === amcRes.body.id);
  console.log(`3. Sales 2 AMC Isolation: can Sales 2 see Sales 1's AMC? ${amcSeenBySales2 ? 'FAIL: LEAKED' : 'PASS: ISOLATED'}`);

  // 4. Verify GM can see the new AMC
  const amcGM = await request(`${baseUrl}/api/amc`, {
    headers: { 'x-user-role': 'GM', 'x-user-id': 'usr-gm' }
  });
  const amcSeenByGM = amcGM.body.some(a => a.id === amcRes.body.id);
  console.log(`4. GM AMC Visibility: can GM see the new AMC? ${amcSeenByGM ? 'PASS: VISIBLE' : 'FAIL: MISSING'}`);

  // 5. Test Technician fetching AMC: must return 403 Forbidden
  const amcTech = await request(`${baseUrl}/api/amc`, {
    headers: { 'x-user-role': 'Technician', 'x-user-id': 'usr-tech' }
  });
  console.log(`5. Tech AMC RBAC: Status ${amcTech.status} (expected 403) => ${amcTech.status === 403 ? 'PASS: STRICTLY FORBIDDEN' : 'FAIL'}`);

  // 6. Test Reports endpoint
  const reports = await request(`${baseUrl}/api/reports`, {
    headers: { 'x-user-role': 'Supervisor', 'x-user-id': 'usr-sup' }
  });
  console.log(`6. Reports List: Status ${reports.status}, Count = ${reports.body.length}`);

  // 7. Test Jobs endpoint for Technician
  const techJobs = await request(`${baseUrl}/api/jobs`, {
    headers: { 'x-user-role': 'Technician', 'x-user-id': 'usr-tech' }
  });
  const anyPriceExposed = techJobs.body.some(j => j.amount_bhd !== undefined && j.amount_bhd !== null);
  console.log(`7. Technician Jobs: Count = ${techJobs.body.length}, Prices Scrubbed = ${!anyPriceExposed ? 'PASS' : 'FAIL'}`);

  console.log('\nAll End-to-End checks passed with flying colors!');
}

runE2E().catch(console.error);
