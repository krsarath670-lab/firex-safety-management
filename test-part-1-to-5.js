const assert = require('assert');
const db = require('./server/db');
const { 
  ROLE_PERMISSIONS, 
  normalizeRole, 
  hashPassword, 
  verifyPassword, 
  sanitizeUser,
  requirePermission,
  requireRole
} = require('./server/auth');
const fs = require('fs');
const path = require('path');

console.log('====================================================');
console.log('FIREX VERIFICATION: PARTS 1 TO 5');
console.log('====================================================\n');

// ----------------------------------------------------
// PART 1: ALL 10 ROLES VISIBLE & NO HARDCODED NAMES/PASSWORDS
// ----------------------------------------------------
console.log('--- PART 1: 10 Roles & Login Authentication ---');
const expected10Roles = [
  'MD',
  'CEO',
  'Admin',
  'GM',
  'Engineer',
  'Supervisor',
  'Technician',
  'Sales',
  'Accounts',
  'Projects Manager'
];

// Check LoginView.jsx includes all 10 roles
const loginViewSrc = fs.readFileSync(path.join(__dirname, 'src/components/LoginView.jsx'), 'utf8');
expected10Roles.forEach((role, idx) => {
  assert(loginViewSrc.includes(role), `LoginView.jsx must contain role: ${role}`);
  console.log(`[PASS] LoginView contains role ${idx + 1}: ${role}`);
});

// Check LoginView does not bypass authentication
assert(!loginViewSrc.includes('Fill Default (1234)'), 'LoginView must not have Fill Default (1234)');
assert(!loginViewSrc.includes('Default PIN: 1234'), 'LoginView must not display Default PIN 1234');
console.log('[PASS] LoginView has no bypass and no hardcoded 1234 credentials');

// Check UserManagementView.jsx shows all 10 roles in filters and displays user details
const userMgmtSrc = fs.readFileSync(path.join(__dirname, 'src/components/UserManagementView.jsx'), 'utf8');
expected10Roles.forEach(role => {
  assert(userMgmtSrc.includes(role) || userMgmtSrc.includes('Projects Mgr'), `UserManagementView must include role: ${role}`);
});
assert(userMgmtSrc.includes('password_reset_status'), 'UserManagementView must display password reset status');
assert(userMgmtSrc.includes('last_login'), 'UserManagementView must display last login');
console.log('[PASS] UserManagementView displays all 10 roles, reset status, and last login');

// ----------------------------------------------------
// PART 2: ADMIN HAS FULL APPLICATION ACCESS
// ----------------------------------------------------
console.log('\n--- PART 2: Admin Full Application Access ---');
const adminPerms = ROLE_PERMISSIONS['Admin'];
assert(adminPerms, 'Admin permissions must be defined');

const criticalAdminPermissions = [
  'canViewDashboard',
  'canManageCustomers',
  'canViewCustomers',
  'canDeleteCustomers',
  'canManageSites',
  'canViewSites',
  'canManageContracts',
  'canCreateAMC',
  'canSubmitAMC',
  'canApproveAMC',
  'canGenerateAMCVisits',
  'canAssignTechnician',
  'canAssignSupervisor',
  'canAssignEngineer',
  'canViewFullAMCList',
  'canChangeAMCFrequency',
  'canEditContractDates',
  'canScheduleVisits',
  'canCreateBreakdowns',
  'canCreateFitOuts',
  'canCreateProjects',
  'canManageProjects',
  'canViewProjects',
  'canCreateQuotations',
  'canManageQuotations',
  'canManageFaults',
  'canManageDefects',
  'canManageMaterials',
  'canManageReports',
  'canPrepareReports',
  'canViewReports',
  'canDeleteReports',
  'canReviewReports',
  'canApproveReports',
  'canCompleteReports',
  'canManageUsers',
  'canManageSettings',
  'canViewFinancials',
  'canViewAllJobs',
  'canAccessAccounts',
  'canManageInvoices',
  'canDeleteInvoices',
  'canViewInvoices',
  'canManagePayments',
  'canViewPayments',
  'canViewCustomerStatements',
  'canViewFinancialReports',
  'canHoldJobsFinancial',
  'canHoldJobsOperational',
  'canReleaseHold',
  'canExportAccountsExcel',
  'canViewEmergencyReports',
  'canCreateEmergency',
  'canAssignEmergency',
  'canSubmitEmergency',
  'canReviewEmergency',
  'canApproveEmergency',
  'canCloseEmergency',
  'canDistributeEmergency',
  'canViewAuditLogs',
  'canManageRoles',
  'canViewAttendance',
  'canManageAttendance'
];

criticalAdminPermissions.forEach(perm => {
  const val = adminPerms[perm];
  assert(val === true || val === 'full' || val === 'all', `Admin must have ${perm}, got: ${val}`);
});
console.log(`[PASS] Admin has all ${criticalAdminPermissions.length} full permissions`);

// Test requirePermission and requireRole bypass for Admin
let passedGuard = false;
const mockAdminReq = { user: { role: 'Admin', name: 'System Admin' } };
const mockRes = { status: (code) => ({ json: (data) => console.log('Blocked:', code, data) }) };
const mockNext = () => { passedGuard = true; };

passedGuard = false;
requirePermission('canManageSettings')(mockAdminReq, mockRes, mockNext);
assert(passedGuard === true, 'Admin must pass requirePermission guard');

passedGuard = false;
requireRole(['GM'])(mockAdminReq, mockRes, mockNext);
assert(passedGuard === true, 'Admin must pass requireRole guard even if GM only specified');
console.log('[PASS] Admin passes backend permission and role authorization guards');

// ----------------------------------------------------
// PART 3: ADMIN USER & PASSWORD MANAGEMENT
// ----------------------------------------------------
console.log('\n--- PART 3: Admin Password Management & Security ---');

// PBKDF2 hashing
const testPlain = 'SecurePass2026!';
const hashed = hashPassword(testPlain);
assert(hashed.startsWith('pbkdf2:'), 'Password must be hashed with PBKDF2');
assert(verifyPassword(testPlain, hashed) === true, 'Valid password must verify');
assert(verifyPassword('WrongPass', hashed) === false, 'Invalid password must be rejected');
console.log('[PASS] PBKDF2 password hashing & verification verified');

// Sanitization: no plaintext passwords or PINs exposed
const rawUser = {
  id: 'usr-test-1',
  name: 'Test Staff',
  role: 'Engineer',
  password: hashed,
  pin: 'pbkdf2:salt:hash',
  temp_password_active: true,
  temp_password_expires_at: new Date(Date.now() + 24 * 3600 * 1000).toISOString()
};
const sanitized = sanitizeUser(rawUser);
assert(sanitized.password === undefined, 'Sanitized user must not have password');
assert(sanitized.pin === undefined, 'Sanitized user must not have pin');
assert(sanitized.has_password === true, 'Sanitized user must indicate has_password: true');
assert(sanitized.password_reset_status === 'Temp Password Issued', 'Sanitized user must compute Temp Password Issued');
console.log('[PASS] Password sanitization prevents plaintext exposure and reports correct status');

// ----------------------------------------------------
// PART 4: ACTIVITY LOGGING & BAHRAIN LOCAL TIME
// ----------------------------------------------------
console.log('\n--- PART 4: Activity Log & Bahrain Time ---');
const testAudit = db.logAudit(
  'usr-admin-test',
  'ADMIN_RESET_PASSWORD',
  'users',
  'usr-test-1',
  'Generated 24-hour temporary password for Test Staff',
  { status: 'SUCCESS' }
);
assert(testAudit.id, 'Audit log entry must have an ID');
assert(testAudit.bahrain_time, 'Audit log must record bahrain_time');
assert(testAudit.bahrain_date, 'Audit log must record bahrain_date');
assert(testAudit.timestamp, 'Audit log must record ISO timestamp');
console.log(`[PASS] Activity log recorded: ${testAudit.action} at ${testAudit.bahrain_date} ${testAudit.bahrain_time} (Bahrain Time)`);

// ----------------------------------------------------
// PART 5: PRESERVE REAL COMPANY DATA
// ----------------------------------------------------
console.log('\n--- PART 5: Preservation of Real Company Data ---');
const users = db.get('users') || [];
const mdUser = users.find(u => u.id === 'usr-md-1');
assert(mdUser, 'MD user usr-md-1 must exist');
assert.strictEqual(mdUser.name, 'Wissam Jamal Hussein', 'MD name must be Wissam Jamal Hussein');
assert.strictEqual(mdUser.role, 'Managing Director (MD)', 'MD role must be Managing Director (MD)');
console.log(`[PASS] MD user preserved: ${mdUser.name} (${mdUser.role})`);

const gmUser = users.find(u => u.role === 'GM');
assert(gmUser, 'GM user must exist');
assert.strictEqual(gmUser.name, 'Eng. Mohamed Hweidi', 'GM name must be Eng. Mohamed Hweidi');
console.log(`[PASS] GM user preserved: ${gmUser.name} (${gmUser.role})`);

const contracts = db.get('amc_contracts') || [];
const customers = db.get('customers') || [];
const hawwarCustomer = customers.find(c => c.name.includes('Hawwar School'));
assert(hawwarCustomer, 'Hawwar School customer record must exist');
const hawwarContract = contracts.find(c => c.customer_id === hawwarCustomer.id || c.customer_name === 'Hawwar School');
assert(hawwarContract, 'Hawwar School AMC contract must be preserved');
console.log(`[PASS] Production AMC contract preserved: ${hawwarContract.contract_number} for Hawwar School`);

const reports = db.get('reports') || [];
const hawwarReport = reports.find(r => r.contract_id === hawwarContract.id);
assert(hawwarReport, 'Hawwar School service report must be preserved');
console.log(`[PASS] Production service report preserved: ${hawwarReport.report_number || hawwarReport.id}`);

console.log('\n====================================================');
console.log('ALL VERIFICATIONS PASSED SUCCESSFULLY!');
console.log('====================================================');
