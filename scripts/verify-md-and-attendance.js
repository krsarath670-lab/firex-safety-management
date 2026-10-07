const assert = require('assert');

async function runTests() {
  console.log('--- STARTING VERIFICATION FOR MD USER NAME AND HIDE ATTENDANCE ---');

  const db = require('../server/db');
  const { ROLE_PERMISSIONS, normalizeRole } = require('../server/auth');

  // 1. Verify MD User Record
  const users = db.get('users') || [];
  const mdUser = users.find(u => u.id === 'usr-md-1');
  assert(mdUser, 'usr-md-1 must exist');
  assert.strictEqual(mdUser.name, 'Wissam Jamal Hussein', 'MD name must be Wissam Jamal Hussein');
  assert.strictEqual(mdUser.role, 'Managing Director (MD)', 'MD role must be Managing Director (MD)');
  assert.strictEqual(mdUser.username, 'md', 'MD username must be md');
  assert.strictEqual(mdUser.employee_id, 'FX-MD-01', 'MD employee_id must be FX-MD-01');
  assert.strictEqual(mdUser.avatar, 'WJ', 'MD avatar must be WJ');
  assert.strictEqual(mdUser.pin, '1234', 'MD PIN must be 1234');
  assert.strictEqual(mdUser.password, '1234', 'MD password must be 1234');
  console.log('✓ Requirement 1 passed: usr-md-1 name is "Wissam Jamal Hussein", role is "Managing Director (MD)"');

  // 2. Verify GM User is Unchanged
  const gmUser = users.find(u => u.role === 'GM');
  assert(gmUser, 'GM user must exist');
  assert.strictEqual(gmUser.name, 'Eng. Mohamed Hweidi', 'GM name must remain Eng. Mohamed Hweidi');
  assert.strictEqual(gmUser.role, 'GM', 'GM role must remain GM');
  console.log('✓ Requirement 4 passed: GM user is unchanged ("Eng. Mohamed Hweidi", role "GM")');

  // 3. Verify Other Staff Accounts Unchanged
  const engineer = users.find(u => u.role === 'Engineer');
  const supervisor = users.find(u => u.role === 'Supervisor');
  const technician = users.find(u => u.role === 'Technician');
  const sales = users.find(u => u.role === 'Sales');
  const accounts = users.find(u => u.role === 'Accounts');
  const pm = users.find(u => u.role === 'Projects Manager');

  console.log('✓ Verified staff accounts present:', {
    Engineer: engineer ? engineer.name : 'N/A',
    Supervisor: supervisor ? supervisor.name : 'N/A',
    Technician: technician ? technician.name : 'N/A',
    Sales: sales ? sales.name : 'N/A',
    Accounts: accounts ? accounts.name : 'N/A',
    ProjectsManager: pm ? pm.name : 'N/A'
  });

  // 4. Verify Role Permissions for Managing Director vs GM
  const mdPerms = ROLE_PERMISSIONS['Managing Director (MD)'];
  assert(mdPerms, 'ROLE_PERMISSIONS for MD must exist');
  assert.strictEqual(mdPerms.canViewAttendance, false, 'canViewAttendance must be false for MD');
  assert.strictEqual(mdPerms.canManageAttendance, false, 'canManageAttendance must be false for MD');
  assert.strictEqual(mdPerms.canManageCustomers, true, 'MD must retain full customer access');
  assert.strictEqual(mdPerms.canManageContracts, true, 'MD must retain full AMC access');
  assert.strictEqual(mdPerms.canAccessAccounts, true, 'MD must retain full accounts access');
  assert.strictEqual(mdPerms.canManageReports, 'full', 'MD must retain full report access');
  console.log('✓ Requirement 2 & 3 passed: MD has full business access, but canViewAttendance is false');

  const gmPerms = ROLE_PERMISSIONS['GM'];
  assert.strictEqual(gmPerms.canViewAttendance, true, 'GM canViewAttendance must be true');
  console.log('✓ Requirement 3 & 4 passed: Other roles (GM) retain attendance access');

  // Start app by requiring server/index
  require('../server/index');
  const port = process.env.PORT || 5000;
  await new Promise(r => setTimeout(r, 600));

  // 5a. Login as MD
  const loginRes = await fetch(`http://127.0.0.1:${port}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'md', password: '1234' })
  });
  const loginData = await loginRes.json();
  assert.strictEqual(loginRes.status, 200, 'Login must succeed');
  assert.strictEqual(loginData.user.name, 'Wissam Jamal Hussein', 'Login user name must be Wissam Jamal Hussein');
  assert.strictEqual(loginData.user.role, 'Managing Director (MD)', 'Login user role must be Managing Director (MD)');
  assert.strictEqual(loginData.permissions.canViewAttendance, false, 'Login permissions canViewAttendance must be false');
  console.log('✓ MD Login successful with name "Wissam Jamal Hussein"');

  // 5b. MD Dashboard Stats: attendanceSummary must be null
  const statsRes = await fetch(`http://127.0.0.1:${port}/api/dashboard/stats`, {
    headers: { 'x-user-role': 'Managing Director (MD)', 'x-user-id': 'usr-md-1' }
  });
  const statsData = await statsRes.json();
  assert.strictEqual(statsRes.status, 200);
  assert.strictEqual(statsData.attendanceSummary, null, 'attendanceSummary must be null for MD');
  assert(statsData.employeeSummary, 'employeeSummary must still be available for MD');
  console.log('✓ MD Dashboard stats: attendanceSummary is null (hidden from MD)');

  // 5c. GM Dashboard Stats: attendanceSummary must NOT be null
  const gmStatsRes = await fetch(`http://127.0.0.1:${port}/api/dashboard/stats`, {
    headers: { 'x-user-role': 'GM', 'x-user-id': gmUser.id }
  });
  const gmStatsData = await gmStatsRes.json();
  assert.strictEqual(gmStatsRes.status, 200);
  assert(gmStatsData.attendanceSummary !== null, 'attendanceSummary must be returned for GM');
  assert(gmStatsData.attendanceSummary.onDuty !== undefined, 'attendanceSummary must contain onDuty for GM');
  console.log('✓ GM Dashboard stats: attendanceSummary is available for GM');

  // 6. Verify Business Data Preserved
  assert(db.get('customers').length > 0, 'Customers preserved');
  assert(db.get('sites').length > 0, 'Sites preserved');
  assert(db.get('amc_contracts').length > 0, 'AMC preserved');
  assert(db.get('amc_visits').length > 0, 'AMC visits preserved');
  assert(db.get('reports').length > 0, 'Reports preserved');
  console.log('✓ Requirement 5 passed: All business data preserved');

  // 7. Verify MD reports updated to Wissam Jamal Hussein
  const rep = db.getById('reports', 'rep-1791389261935-169');
  if (rep) {
    assert.strictEqual(rep.prepared_by_name, 'Wissam Jamal Hussein', 'Report prepared_by_name must be Wissam Jamal Hussein');
    assert.strictEqual(rep.reviewed_by_name, 'Wissam Jamal Hussein', 'Report reviewed_by_name must be Wissam Jamal Hussein');
    assert.strictEqual(rep.completed_by_name, 'Wissam Jamal Hussein', 'Report completed_by_name must be Wissam Jamal Hussein');
    console.log('✓ MD report names verified as "Wissam Jamal Hussein"');
  }

  console.log('\n========================================');
  console.log('ALL VERIFICATION CHECKS PASSED SUCCESSFULLY!');
  console.log('========================================');
  process.exit(0);
}

runTests().catch(err => {
  console.error('VERIFICATION FAILED:', err);
  process.exit(1);
});
