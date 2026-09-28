const assert = require('assert');

const BASE_URL = 'http://localhost:5000/api';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, options);
  let data;
  try {
    data = await res.json();
  } catch (e) {
    data = null;
  }
  return { status: res.status, ok: res.ok, data };
}

async function runTests() {
  console.log('--- STARTING SALES AMC CREATION & APPROVAL WORKFLOW TESTS ---');

  // Step 0: Fetch users to identify Sales users and GM/Supervisor
  const { data: users } = await request('/users', {
    headers: { 'x-user-role': 'GM' }
  });

  const salesUser1 = users.find(u => u.role === 'Sales');
  assert(salesUser1, 'Must have at least one Sales user');
  console.log(`Sales User 1: ${salesUser1.name} (${salesUser1.id})`);

  // Let's create or find Sales User 2 to test isolation between salespeople
  let salesUser2 = users.filter(u => u.role === 'Sales')[1];
  if (!salesUser2) {
    const res = await request('/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-role': 'GM' },
      body: JSON.stringify({
        name: 'Zahra Al-Haddad',
        email: 'zahra.sales@firex.bh',
        role: 'Sales',
        phone: '+973 3912 3456',
        designation: 'Sales Executive'
      })
    });
    salesUser2 = res.data;
  }
  console.log(`Sales User 2: ${salesUser2.name} (${salesUser2.id})`);

  const gmUser = users.find(u => u.role === 'GM');
  assert(gmUser, 'Must have a GM user');

  // Fetch customers and sites
  const { data: customers } = await request('/customers', {
    headers: { 'x-user-id': salesUser1.id, 'x-user-role': 'Sales' }
  });
  const customer = customers[0];
  assert(customer, 'Must have at least one customer');

  const { data: sites } = await request('/sites', {
    headers: { 'x-user-id': salesUser1.id, 'x-user-role': 'Sales' }
  });
  const site = sites.find(s => s.customer_id === customer.id) || sites[0];
  assert(site, 'Must have at least one site');

  // 1. TEST: Sales User 1 creates Draft AMC
  console.log('\n1. Testing Sales AMC Draft Creation...');
  const draftPayload = {
    customer_id: customer.id,
    site_id: site.id,
    contract_type: 'Comprehensive',
    start_date: '2026-10-01',
    end_date: '2027-09-30',
    systems: ['Fire Alarm', 'Fire Fighting', 'Fire Extinguishers'],
    contract_value: 850.500,
    quotation_number: 'QT-2026-099',
    remarks: 'Full annual maintenance package with 24/7 emergency response SLA',
    status: 'Draft',
    // Deliberately trying to assign to another user to verify ownership enforcement:
    sales_person_id: 'usr-different-person'
  };

  const createDraftRes = await request('/amc-contracts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': salesUser1.id,
      'x-user-role': 'Sales'
    },
    body: JSON.stringify(draftPayload)
  });

  assert.strictEqual(createDraftRes.status, 201, 'Should create draft contract');
  const createdDraft = createDraftRes.data;
  assert.strictEqual(createdDraft.status, 'Draft', 'Contract status must be Draft');
  assert.strictEqual(createdDraft.sales_person_id, salesUser1.id, 'Ownership must be locked to logged-in Sales user!');
  assert(createdDraft.contract_number.startsWith('DRAFT-'), `Contract number should be Draft: ${createdDraft.contract_number}`);
  assert.strictEqual(createdDraft.generated_visits_count, 0, 'Visits must NOT be generated for Draft AMC!');
  console.log(`✓ Draft AMC created: ${createdDraft.contract_number} for ${salesUser1.name}. Visits count: 0 (deferred until approval).`);

  // 2. TEST: Sales User 1 views "My AMC"
  console.log('\n2. Testing Sales Data Isolation (Viewing My AMC)...');
  const sales1ContractsRes = await request('/amc-contracts', {
    headers: { 'x-user-id': salesUser1.id, 'x-user-role': 'Sales' }
  });
  assert(sales1ContractsRes.ok, 'Sales 1 should be able to get AMC list');
  const sales1List = sales1ContractsRes.data;
  // All contracts in sales1List MUST belong to salesUser1
  assert(sales1List.every(c => c.sales_person_id === salesUser1.id), 'Sales 1 must ONLY see their own contracts!');
  const foundDraft = sales1List.find(c => c.id === createdDraft.id);
  assert(foundDraft, 'Draft AMC must be in Sales 1 list');
  assert.strictEqual(foundDraft.status, 'Draft', 'Status must remain Draft and not get overwritten to Active or Expired');
  assert.strictEqual(foundDraft.next_visit, 'Pending Approval', 'Next visit for Draft must show Pending Approval');
  console.log(`✓ Sales User 1 sees their draft. Next Visit status: "${foundDraft.next_visit}". All returned contracts belong to Sales User 1.`);

  // 3. TEST: Sales User 2 CANNOT view or access Sales User 1's AMC
  console.log('\n3. Testing Cross-Salesperson Isolation...');
  const sales2ContractsRes = await request('/amc-contracts', {
    headers: { 'x-user-id': salesUser2.id, 'x-user-role': 'Sales' }
  });
  const sales2List = sales2ContractsRes.data;
  const leakCheck = sales2List.find(c => c.id === createdDraft.id);
  assert(!leakCheck, 'Sales User 2 must NOT see Sales User 1 AMC in list query!');

  const directAccessRes = await request(`/amc-contracts/${createdDraft.id}`, {
    headers: { 'x-user-id': salesUser2.id, 'x-user-role': 'Sales' }
  });
  assert.strictEqual(directAccessRes.status, 403, 'Sales User 2 must get 403 Forbidden accessing Sales User 1 contract');
  console.log('✓ Sales User 2 cannot access or view Sales User 1 contract (403 Forbidden).');

  // 4. TEST: Sales User 1 edits their Draft AMC
  console.log('\n4. Testing Draft Editing by Sales Owner...');
  const editDraftRes = await request(`/amc-contracts/${createdDraft.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': salesUser1.id,
      'x-user-role': 'Sales'
    },
    body: JSON.stringify({
      contract_value: 920.000,
      remarks: 'Revised pricing with Civil Defense certification included',
      // Try to reassign ownership
      sales_person_id: salesUser2.id
    })
  });
  assert(editDraftRes.ok, 'Sales 1 should be able to edit their draft');
  assert.strictEqual(editDraftRes.data.contract_value, 920.000);
  assert.strictEqual(editDraftRes.data.sales_person_id, salesUser1.id, 'Ownership must NOT be changed!');
  console.log(`✓ Sales User 1 edited draft. Contract value: ${editDraftRes.data.contract_value} BHD. Ownership preserved.`);

  // 5. TEST: Sales User 2 CANNOT edit Sales User 1's AMC
  const unauthorizedEditRes = await request(`/amc-contracts/${createdDraft.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': salesUser2.id,
      'x-user-role': 'Sales'
    },
    body: JSON.stringify({ contract_value: 100 })
  });
  assert.strictEqual(unauthorizedEditRes.status, 403, 'Unauthorized salesperson must get 403 Forbidden when editing');
  console.log('✓ Cross-salesperson edit rejected with 403 Forbidden.');

  // 6. TEST: Sales User 1 submits Draft AMC for Approval
  console.log('\n6. Testing Submit for Approval...');
  const submitRes = await request(`/amc-contracts/${createdDraft.id}/submit`, {
    method: 'POST',
    headers: {
      'x-user-id': salesUser1.id,
      'x-user-role': 'Sales'
    }
  });
  assert(submitRes.ok, 'Submission should succeed');
  assert.strictEqual(submitRes.data.status, 'Submitted');
  assert(submitRes.data.submitted_at, 'submitted_at must be populated');
  console.log(`✓ Contract submitted for approval at: ${submitRes.data.submitted_at}. Status: Submitted.`);

  // 7. TEST: Sales User CANNOT approve their own submitted AMC (STRICT RULE)
  console.log('\n7. Testing Self-Approval Restriction (Sales MUST NOT approve)...');
  const selfApproveRes = await request(`/amc-contracts/${createdDraft.id}/approve`, {
    method: 'POST',
    headers: {
      'x-user-id': salesUser1.id,
      'x-user-role': 'Sales'
    }
  });
  assert.strictEqual(selfApproveRes.status, 403, 'Sales user must receive 403 Forbidden when attempting to approve!');
  console.log(`✓ Self-approval strictly forbidden: received 403 Forbidden (${selfApproveRes.data.message || selfApproveRes.data.error}).`);

  // 8. TEST: Management returns AMC for correction
  console.log('\n8. Testing Management Return for Correction...');
  const returnRes = await request(`/amc-contracts/${createdDraft.id}/return`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': gmUser.id,
      'x-user-role': 'GM'
    },
    body: JSON.stringify({
      remarks: 'Please increase extinguisher inspection frequency to quarterly per new Civil Defense directive.'
    })
  });
  assert(returnRes.ok, 'GM should be able to return contract');
  assert.strictEqual(returnRes.data.status, 'Returned for Correction');
  assert(returnRes.data.return_notes.includes('extinguisher inspection frequency'));
  console.log(`✓ GM returned contract for correction with note: "${returnRes.data.return_notes}". Status: Returned for Correction.`);

  // 9. TEST: Sales resubmits the contract
  console.log('\n9. Testing Resubmission by Sales...');
  const resubmitRes = await request(`/amc-contracts/${createdDraft.id}/submit`, {
    method: 'POST',
    headers: {
      'x-user-id': salesUser1.id,
      'x-user-role': 'Sales'
    },
    body: JSON.stringify({ notes: 'Updated terms as requested by GM' })
  });
  assert(resubmitRes.ok, 'Resubmission should succeed');
  assert.strictEqual(resubmitRes.data.status, 'Submitted');
  console.log('✓ Contract resubmitted by Sales user. Status: Submitted.');

  // 10. TEST: GM approves AMC Contract & visits are generated
  console.log('\n10. Testing Management Approval and Automated Visit Generation...');
  const approveRes = await request(`/amc-contracts/${createdDraft.id}/approve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': gmUser.id,
      'x-user-role': 'GM'
    },
    body: JSON.stringify({ notes: 'Approved for annual cycle' })
  });
  assert(approveRes.ok, 'GM approval should succeed');
  const approvedContract = approveRes.data;
  assert.strictEqual(approvedContract.status, 'Active', 'Status must now be Active');
  assert(approvedContract.contract_number.startsWith('AMC-'), `Official contract number assigned: ${approvedContract.contract_number}`);
  assert(approvedContract.generated_visits_count > 0, `System visits must be generated! Generated: ${approvedContract.generated_visits_count}`);
  console.log(`✓ AMC approved by GM ${gmUser.name}. Official contract number: ${approvedContract.contract_number}. Generated visits count: ${approvedContract.generated_visits_count}.`);

  // 11. TEST: Sales User CANNOT edit approved/active contract
  console.log('\n11. Testing Locked Terms on Approved Contract for Sales...');
  const editLockedRes = await request(`/amc-contracts/${createdDraft.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': salesUser1.id,
      'x-user-role': 'Sales'
    },
    body: JSON.stringify({ contract_value: 500.000 })
  });
  assert.strictEqual(editLockedRes.status, 403, 'Sales user must NOT be able to modify Approved/Active contracts');
  console.log(`✓ Modification of approved contract blocked for Sales: 403 Forbidden (${editLockedRes.data.message}).`);

  // 12. TEST: Sales User deletes their own draft, but cannot delete active
  console.log('\n12. Testing Delete Rules...');
  // Attempt to delete active contract
  const deleteActiveRes = await request(`/amc-contracts/${createdDraft.id}`, {
    method: 'DELETE',
    headers: {
      'x-user-id': salesUser1.id,
      'x-user-role': 'Sales'
    }
  });
  assert.strictEqual(deleteActiveRes.status, 403, 'Sales user cannot delete Active AMC');
  console.log('✓ Sales user cannot delete active AMC (403 Forbidden).');

  // Create another draft to test successful draft deletion
  const draft2Res = await request('/amc-contracts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': salesUser1.id,
      'x-user-role': 'Sales'
    },
    body: JSON.stringify({
      customer_id: customer.id,
      site_id: site.id,
      start_date: '2026-11-01',
      end_date: '2027-10-31',
      status: 'Draft'
    })
  });
  assert(draft2Res.ok);
  const draft2Id = draft2Res.data.id;

  const deleteDraftRes = await request(`/amc-contracts/${draft2Id}`, {
    method: 'DELETE',
    headers: {
      'x-user-id': salesUser1.id,
      'x-user-role': 'Sales'
    }
  });
  assert(deleteDraftRes.ok, 'Sales should be able to delete their own draft AMC');
  console.log('✓ Sales user successfully deleted their own draft AMC.');

  console.log('\n======================================================');
  console.log('ALL SALES AMC CREATION & APPROVAL WORKFLOW TESTS PASSED!');
  console.log('======================================================\n');
}

runTests().catch(err => {
  console.error('TEST FAILED:', err);
  process.exit(1);
});
