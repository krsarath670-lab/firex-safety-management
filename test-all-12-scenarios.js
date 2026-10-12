// Test all 12 Scenarios for FireX System Updates
const fs = require('fs');
const db = require('./server/db');
const { ROLE_PERMISSIONS: permissions, normalizeRole, hashPassword, verifyPassword, sanitizeUser } = require('./server/auth');

async function runTests() {
  console.log('====================================================');
  console.log('FIREX SYSTEM VERIFICATION: ALL 12 SCENARIOS');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} - ${details}`);
      failed++;
    }
  }

  // SCENARIO 1: AMC Contract & Report Visibility
  console.log('--- SCENARIO 1: AMC Contract & Report Visibility ---');
  const report = db.getById('reports', 'rep-1791389261935-169');
  assert(!!report, 'Report rep-1791389261935-169 exists in database');
  assert(report?.amc_contract_id === 'amc-1791205127198-923', 'Report linked to contract amc-1791205127198-923');
  assert(report?.customer_id === 'cus-1791205043580-498', 'Report linked to Hawwar School');

  const contract = db.getById('amc_contracts', 'amc-1791205127198-923');
  assert(!!contract, 'Contract amc-1791205127198-923 exists');

  const quarters = db.getContractQuarters('amc-1791205127198-923');
  assert(quarters?.Q1?.report_id === 'rep-1791389261935-169', 'Contract quarters.Q1 has report_id', `Found: ${quarters?.Q1?.report_id}`);
  assert(quarters?.Q1?.status === 'Completed', 'Contract quarters.Q1 status is Completed', `Found: ${quarters?.Q1?.status}`);

  const visits = (db.get('amc_visits') || []).filter(v => v.amc_contract_id === 'amc-1791205127198-923' || v.contract_id === 'amc-1791205127198-923');
  const q1Visit = visits.find(v => v.quarter === 'Q1' || v.visit_number === 1);
  assert(!!q1Visit && q1Visit.report_id === 'rep-1791389261935-169', 'AMC Visit Q1 contains report_id');

  // SCENARIO 2: MAKE REPORT button opens existing report without duplicates
  console.log('\n--- SCENARIO 2: Reopen Existing Report Without Duplicate ---');
  assert(q1Visit?.report_id === 'rep-1791389261935-169', 'Existing report ID is resolved for Q1 visit');
  const allReportsForContract = (db.get('reports') || []).filter(r => r.amc_contract_id === 'amc-1791205127198-923' || r.contract_id === 'amc-1791205127198-923');
  assert(allReportsForContract.length === 1, `Exactly 1 report exists for this contract visit (no duplicates). Count: ${allReportsForContract.length}`);

  // SCENARIO 3: CEO Role Creation & Permissions
  console.log('\n--- SCENARIO 3: CEO Role Creation & Permissions ---');
  assert(!!permissions.CEO, 'CEO permissions defined in auth.js');
  assert(permissions.CEO.canViewReports === true, 'CEO can view reports');
  assert(permissions.CEO.canViewAccounts === true, 'CEO can view accounts');
  assert(permissions.CEO.canViewAuditLogs === true, 'CEO can view audit logs');
  assert(permissions.CEO.canManageUsers === true, 'CEO can manage users');
  assert(permissions.CEO.canViewAttendance === false, 'CEO cannot view attendance');
  assert(normalizeRole('CEO') === 'CEO', 'normalizeRole preserves CEO without converting to MD');

  // SCENARIO 4: Admin Role Creation & Permissions
  console.log('\n--- SCENARIO 4: Admin Role Creation & Permissions ---');
  assert(!!permissions.Admin, 'Admin permissions defined in auth.js');
  assert(permissions.Admin.canManageUsers === true, 'Admin can manage users');
  assert(permissions.Admin.canViewAuditLogs === true, 'Admin can view audit logs');
  assert(permissions.Admin.canApproveAMC === true, 'Admin can approve AMC');
  assert(normalizeRole('Admin') === 'Admin', 'normalizeRole preserves Admin');

  // SCENARIO 5: Preserved Users & MD Configuration
  console.log('\n--- SCENARIO 5: Preserved Users & MD Wissam Jamal Hussein ---');
  const mdUser = db.getById('users', 'usr-md-1');
  assert(!!mdUser, 'MD user usr-md-1 exists');
  assert(mdUser?.name === 'Wissam Jamal Hussein', `MD name is Wissam Jamal Hussein (Got: ${mdUser?.name})`);
  assert(normalizeRole(mdUser?.role) === 'Managing Director (MD)', `MD normalized role is Managing Director (MD) (Got: ${normalizeRole(mdUser?.role)})`);
  assert(permissions.managing_director.canViewAttendance === false, 'MD attendance is hidden in permissions');

  const gmUser = (db.get('users') || []).find(u => u.role === 'GM');
  assert(!!gmUser && gmUser.name.includes('Mohamed'), 'GM Eng. Mohamed Hweidi preserved');

  const techUsers = (db.get('users') || []).filter(u => u.role === 'Technician');
  assert(techUsers.length > 0, `Technician accounts preserved (${techUsers.length} found)`);

  // SCENARIO 6: Activity Monitoring & Bahrain Local Time (UTC+3)
  console.log('\n--- SCENARIO 6: Activity Monitoring & Bahrain Local Time ---');
  const testLog = db.logAudit('usr-md-1', 'TEST_ACTION', 'system', 'sys-1', 'Test verification action');
  assert(!!testLog, 'logAudit creates audit log');
  assert(!!testLog.formatted_date && !!testLog.formatted_time, 'Audit log has formatted date and time');
  assert(testLog.user_role === 'Managing Director (MD)' || testLog.user_role === 'managing_director', `User role attached to audit log (Got: ${testLog.user_role})`);
  assert(testLog.user_name === 'Wissam Jamal Hussein', `User name attached to audit log (Got: ${testLog.user_name})`);

  // SCENARIO 7: Activity Log Filtering & Search
  console.log('\n--- SCENARIO 7: Activity Log Filtering & Search ---');
  const allLogs = db.get('audit_logs') || [];
  assert(allLogs.length > 0, `Audit logs present in database (${allLogs.length} entries)`);
  const filteredByModule = allLogs.filter(l => (l.resource || l.module) === 'system');
  assert(filteredByModule.length > 0, 'Filtering by module system succeeds');
  const filteredByUser = allLogs.filter(l => l.user_id === 'usr-md-1');
  assert(filteredByUser.length > 0, 'Filtering by user usr-md-1 succeeds');

  // SCENARIO 8: Activity Log Export & Print Support
  console.log('\n--- SCENARIO 8: Activity Log Export & Print Support ---');
  const excelSrc = fs.readFileSync('./src/utils/excelExport.js', 'utf8');
  assert(excelSrc.includes('exportAuditLogsToExcel'), 'exportAuditLogsToExcel exists in excelExport.js');
  const auditViewSrc = fs.readFileSync('./src/components/AuditLogView.jsx', 'utf8');
  assert(auditViewSrc.includes('handleExportCSV'), 'handleExportCSV exists in AuditLogView.jsx');
  assert(auditViewSrc.includes('handlePrint'), 'handlePrint exists in AuditLogView.jsx');
  assert(auditViewSrc.includes('selectedLog'), 'Audit detail inspection modal exists in AuditLogView.jsx');

  // SCENARIO 9: Activity Log Security & RBAC
  console.log('\n--- SCENARIO 9: Activity Log Security & RBAC ---');
  const techAllowed = permissions.Technician.canViewAuditLogs;
  const salesAllowed = permissions.Sales.canViewAuditLogs;
  const adminAllowed = permissions.Admin.canViewAuditLogs;
  const ceoAllowed = permissions.CEO.canViewAuditLogs;
  assert(!techAllowed, 'Technician blocked from audit logs');
  assert(!salesAllowed, 'Sales blocked from audit logs');
  assert(adminAllowed === true, 'Admin permitted to view audit logs');
  assert(ceoAllowed === true, 'CEO permitted to view audit logs');

  // SCENARIO 10: Password Security & Cryptographic Hashing
  console.log('\n--- SCENARIO 10: Password Security & PBKDF2 Hashing ---');
  const samplePw = 'SecurePass2026!';
  const hashed = hashPassword(samplePw);
  assert(hashed.startsWith('pbkdf2:'), 'Password hashed with PBKDF2');
  assert(verifyPassword(samplePw, hashed) === true, 'PBKDF2 password verifies correctly');
  assert(verifyPassword('WrongPass', hashed) === false, 'Invalid password rejected');
  assert(verifyPassword('1234', '1234') === true, 'Backward compatibility for legacy plain password works');

  const sanitized = sanitizeUser({ id: 'u1', name: 'Test', password: 'secret', pin: '1234', role: 'Admin' });
  assert(!sanitized.password && !sanitized.pin, 'Sanitized user scrubs password and PIN');
  assert(sanitized.has_password === true, 'Sanitized user includes has_password flag');

  const userViewSrc = fs.readFileSync('./src/components/UserManagementView.jsx', 'utf8');
  assert(!userViewSrc.includes('PIN: {u.pin}'), 'User card plaintext PIN display is completely removed');
  assert(!userViewSrc.includes('Default (1234)'), 'Default 1234 button removed from password modal');

  // SCENARIO 11: Session Persistence & Schema Auto-repair
  console.log('\n--- SCENARIO 11: Schema Auto-repair Across Restarts ---');
  db.ensureSchema();
  const refreshedQuarters = db.getContractQuarters('amc-1791205127198-923');
  assert(refreshedQuarters?.Q1?.report_id === 'rep-1791389261935-169', 'ensureSchema preserves report linkage to contract Q1');

  // SCENARIO 12: Building & Fire Panel History
  console.log('\n--- SCENARIO 12: Building & Fire Panel Report History ---');
  const site = db.getById('sites', 'sit-1791205043637-866');
  assert(!!site, 'Hawwar School site exists');
  assert(report.site_id === 'sit-1791205043637-866', 'Report is linked to Hawwar School site');
  const panelExists = (report.systems || []).includes('Fire Alarm') || (report.checklist_data?.fire_alarm_items?.length > 0);
  assert(panelExists, 'Report includes Fire Alarm and Panel inspection checklist items');

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(e => {
  console.error(e);
  process.exit(1);
});
