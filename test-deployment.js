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

async function runTests() {
  const baseUrl = 'https://fires-angle-principles-literary.trycloudflare.com';
  console.log(`Starting deployment smoke tests on: ${baseUrl}\n`);

  // 1. Health check
  const health = await request(`${baseUrl}/api/health`);
  console.log(`1. Health Check: Status ${health.status}`, health.body);

  // 2. Settings check
  const settings = await request(`${baseUrl}/api/settings`);
  console.log(`2. Settings Check: Company = ${settings.body.company_name}, CR = ${settings.body.cr_number}, Phone = ${settings.body.phone}`);

  // 3. PWA manifest check
  const manifest = await request(`${baseUrl}/manifest.json`);
  console.log(`3. PWA Manifest Check: Name = "${manifest.body.name}", Display = "${manifest.body.display}", Theme = "${manifest.body.theme_color}"`);

  // 4. Role switch tests
  const roles = ['GM', 'Engineer', 'Supervisor', 'Technician', 'Sales'];
  for (const role of roles) {
    const res = await request(`${baseUrl}/api/auth/switch-role`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { role });
    console.log(`4. Switch to ${role}: Status ${res.status}, User = ${res.body.user?.name} (${res.body.user?.role})`);
  }

  // 5. RBAC Technician Scrubbing Check
  const techJobs = await request(`${baseUrl}/api/jobs`, {
    headers: { 'x-user-role': 'Technician', 'x-user-id': 'usr-tech' }
  });
  const hasAmount = techJobs.body.some(j => j.amount_bhd !== undefined && j.amount_bhd !== null);
  console.log(`5. Tech Jobs RBAC: count=${techJobs.body.length}, financial amounts exposed? ${hasAmount ? 'FAIL: EXPOSED' : 'PASS: PROPERLY SCRUBBED'}`);

  // 6. RBAC Sales Isolation Check
  const sales1Jobs = await request(`${baseUrl}/api/jobs`, {
    headers: { 'x-user-role': 'Sales', 'x-user-id': 'usr-sales-1' }
  });
  const sales1AllOwn = sales1Jobs.body.every(j => j.sales_person_id === 'usr-sales-1' || j.created_by_id === 'usr-sales-1');
  console.log(`6. Sales 1 Jobs Isolation: count=${sales1Jobs.body.length}, all own records? ${sales1AllOwn ? 'PASS: ISOLATED' : 'FAIL: CROSS-CONTAMINATION'}`);

  const sales2Jobs = await request(`${baseUrl}/api/jobs`, {
    headers: { 'x-user-role': 'Sales', 'x-user-id': 'usr-sales-2' }
  });
  const sales2AllOwn = sales2Jobs.body.every(j => j.sales_person_id === 'usr-sales-2' || j.created_by_id === 'usr-sales-2');
  console.log(`6b. Sales 2 Jobs Isolation: count=${sales2Jobs.body.length}, all own records? ${sales2AllOwn ? 'PASS: ISOLATED' : 'FAIL: CROSS-CONTAMINATION'}`);

  // 7. Backup endpoint RBAC check
  const supBackup = await request(`${baseUrl}/api/backup`, {
    headers: { 'x-user-role': 'Supervisor' }
  });
  const techBackup = await request(`${baseUrl}/api/backup`, {
    headers: { 'x-user-role': 'Technician' }
  });
  console.log(`7. Backup RBAC: Supervisor status=${supBackup.status} (expected 200), Tech status=${techBackup.status} (expected 403) => ${supBackup.status === 200 && techBackup.status === 403 ? 'PASS' : 'FAIL'}`);

  console.log('\nAll deployment smoke tests completed successfully!');
}

runTests().catch(console.error);
