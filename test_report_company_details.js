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
  console.log('--- STARTING VERIFICATION TESTS ---');

  // 1. Verify Company Settings
  console.log('\n[1] Testing GET /api/settings...');
  const settingsRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/settings',
    method: 'GET'
  });

  if (settingsRes.status !== 200) {
    throw new Error(`Failed to get settings: ${settingsRes.status}`);
  }

  const s = settingsRes.data;
  console.log('Company Settings:', {
    company_name: s.company_name,
    cr_number: s.cr_number,
    vat_number: s.vat_number,
    address: s.address,
    address_line_1: s.address_line_1,
    address_line_2: s.address_line_2,
    address_line_3: s.address_line_3,
    report_footer: s.report_footer
  });

  if (s.company_name !== 'FIREX') throw new Error(`Expected company_name 'FIREX', got '${s.company_name}'`);
  if (s.cr_number !== '96850 1' && s.cr_no !== '96850 1') throw new Error(`Invalid CR number: ${s.cr_number}`);
  if (s.vat_number !== '220006271900002' && s.vat_no !== '220006271900002') throw new Error(`Invalid VAT number: ${s.vat_number}`);
  if (!s.address.includes('Villa 13, Building 2373') || !s.address.includes('Al Seef') || !s.address.includes('Block 428')) {
    throw new Error(`Invalid company address: ${s.address}`);
  }
  if (s.address.toLowerCase().includes('civil defence') || (s.report_footer && s.report_footer.toLowerCase().includes('civil defence'))) {
    throw new Error(`Found Civil Defence in company address or footer!`);
  }
  if (!s.phone || !s.phone.includes('17162240') && !s.phone.includes('1716 2240')) {
    throw new Error(`Expected phone to contain 17162240, got ${s.phone}`);
  }
  if (!s.use_custom_letterhead) {
    throw new Error(`Expected use_custom_letterhead to be true, got ${s.use_custom_letterhead}`);
  }
  if (!s.letterhead_url) {
    throw new Error(`Expected letterhead_url to be defined`);
  }
  console.log('✓ Company settings verified with official FIREX details and custom letterhead enabled.');

  // Test static letterhead file availability
  const imgRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: s.letterhead_url,
    method: 'GET'
  });
  if (imgRes.status !== 200) {
    throw new Error(`Failed to load letterhead asset ${s.letterhead_url}: HTTP ${imgRes.status}`);
  }
  console.log(`✓ Static letterhead image (${s.letterhead_url}) loaded successfully with HTTP 200 OK.`);

  // 2. Fetch Customers to get an ID for testing
  const customersRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/customers',
    method: 'GET'
  });
  const customers = customersRes.data || [];
  const testCustomer = customers[0] || {
    id: 'CUST-001',
    name: 'Bahrain Financial Harbour Holding',
    address: 'East Tower, Building 1398, Road 4626, Block 346, Seafront, Manama',
    contact_person: 'Ahmed Al-Sayed',
    phone: '+973 1710 0000'
  };

  // 3. Test creating all 5 report types
  const reportTypes = [
    'AMC Service Report',
    'Work Completion Report',
    'Fault Report',
    'Inspection Report',
    'Testing & Commissioning Report'
  ];

  console.log('\n[2] Testing Creation and Verification of all 5 Report Types...');
  for (const type of reportTypes) {
    const postData = {
      title: `${type} - Test Verification`,
      type: type,
      customer_id: testCustomer.id,
      customer_name: testCustomer.name,
      customer_address: testCustomer.address,
      site_name: 'Main Commercial Tower - Seef',
      site_address: 'Building 12, Road 24, Block 428, Seef, Bahrain',
      contact_person: testCustomer.contact_person,
      contact_number: testCustomer.phone || testCustomer.contact_number || '+973 3300 0000',
      system_type: 'Fire Alarm & Fire Fighting Systems',
      status: 'Completed',
      technician_id: 'TECH-001',
      technician_name: 'Mahmoud Mansoor',
      supervisor_name: 'Ali Salman',
      supervisor_designation: 'FIREX Certified Safety Engineer / Inspector',
      inspection_summary: 'Quarterly maintenance inspection completed adhering strictly to NFPA and safety regulations.',
      work_performed: 'Inspected control panel, tested smoke detectors, checked sounders and call points.',
      findings: 'All systems operating within normal parameters.',
      recommendations: 'Continue scheduled quarterly AMC visits.'
    };

    const createRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/reports',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, postData);

    if (createRes.status !== 201 && createRes.status !== 200) {
      throw new Error(`Failed to create ${type}: ${createRes.status} - ${JSON.stringify(createRes.data)}`);
    }

    const createdReport = createRes.data;
    console.log(`✓ Created: [${createdReport.report_number || createdReport.id}] ${type}`);

    // Verify report fields
    const getRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/reports/${createdReport.id}`,
      method: 'GET'
    });
    const fetchedReport = getRes.data;

    // Verify customer address is preserved and not replaced by FIREX address
    if (!fetchedReport.customer_address || fetchedReport.customer_address.includes('Villa 13, Building 2373')) {
      throw new Error(`Customer address was incorrectly overwritten or empty: ${fetchedReport.customer_address}`);
    }
    if (fetchedReport.customer_name !== testCustomer.name) {
      throw new Error(`Customer name mismatch: ${fetchedReport.customer_name}`);
    }
    if (fetchedReport.supervisor_designation && fetchedReport.supervisor_designation.toLowerCase().includes('civil defence bahrain approved')) {
      throw new Error(`Report contains old Civil Defence designation!`);
    }

    console.log(`   Customer Address preserved: "${fetchedReport.customer_address.substring(0, 45)}..."`);
    console.log(`   Supervisor: "${fetchedReport.supervisor_name} (${fetchedReport.supervisor_designation})"`);
  }

  console.log('\n--- ALL VERIFICATION TESTS PASSED SUCCESSFULLY! ---');
}

runTests().catch(err => {
  console.error('\n❌ Test failed:', err.message);
  process.exit(1);
});
