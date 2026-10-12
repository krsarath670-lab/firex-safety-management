const assert = require('assert');
const http = require('http');
const express = require('express');
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

console.log('====================================================');
console.log('FIREX VERIFICATION: MANAGEMENT ROLES & PERMISSIONS');
console.log('====================================================\n');

// ----------------------------------------------------
// 1. VERIFY 5 MANAGEMENT ROLES HAVE canManageUsers: true
// ----------------------------------------------------
console.log('--- TEST 1: The 5 Management Roles Staff Permissions ---');
const managementRoles = [
  'Admin',
  'CEO',
  'Managing Director (MD)',
  'GM',
  'Projects Manager'
];

managementRoles.forEach(role => {
  const norm = normalizeRole(role);
  const perms = ROLE_PERMISSIONS[norm] || ROLE_PERMISSIONS[role];
  assert(perms, `Permissions must be defined for ${role}`);
  assert.strictEqual(perms.canManageUsers, true, `${role} MUST have canManageUsers: true`);
  assert.strictEqual(perms.canManageRoles, true, `${role} MUST have canManageRoles: true`);
  console.log(`[PASS] ${role} has canManageUsers: true and canManageRoles: true`);
});

// Verify all 5 have the SAME staff-management permissions
managementRoles.forEach(role => {
  const perms = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS[normalizeRole(role)];
  assert.strictEqual(perms.canManageUsers, true);
  assert.strictEqual(perms.canManageRoles, true);
});
console.log('[PASS] All 5 management roles share identical staff-management permissions');

// ----------------------------------------------------
// 2. VERIFY SUPERVISOR & OTHER ROLES CANNOT MANAGE USERS
// ----------------------------------------------------
console.log('\n--- TEST 2: Supervisor & Other Roles Restricted Access ---');
const nonManagementRoles = [
  'Supervisor',
  'Engineer',
  'Technician',
  'Sales',
  'Accounts'
];

nonManagementRoles.forEach(role => {
  const perms = ROLE_PERMISSIONS[role];
  assert(perms, `Permissions must be defined for ${role}`);
  assert.strictEqual(perms.canManageUsers, false, `${role} must NOT have canManageUsers`);
  console.log(`[PASS] ${role} is blocked from staff management (canManageUsers: false)`);
});

// Verify Supervisor specific restrictions
const supPerms = ROLE_PERMISSIONS['Supervisor'];
assert.strictEqual(supPerms.canManageUsers, false, 'Supervisor must not have canManageUsers');
assert.strictEqual(supPerms.canManageSettings, false, 'Supervisor must not have canManageSettings');
assert.strictEqual(supPerms.canAccessAccounts, false, 'Supervisor must not have access to accounts');

// Verify Supervisor preserves authorized operational tasks
assert.strictEqual(supPerms.canViewDashboard, 'full', 'Supervisor retains operational dashboard');
assert.strictEqual(supPerms.canManageCustomers, true, 'Supervisor retains customer access');
assert.strictEqual(supPerms.canManageSites, true, 'Supervisor retains site access');
assert.strictEqual(supPerms.canManageContracts, true, 'Supervisor retains contract access');
assert.strictEqual(supPerms.canCreateAMC, true, 'Supervisor retains AMC creation');
assert.strictEqual(supPerms.canScheduleVisits, true, 'Supervisor retains visit scheduling');
assert.strictEqual(supPerms.canAssignTechnician, true, 'Supervisor retains technician assignment');
assert.strictEqual(supPerms.canManageReports, 'full', 'Supervisor retains report management');
assert.strictEqual(supPerms.canPrepareReports, true, 'Supervisor retains report preparation');
assert.strictEqual(supPerms.canApproveReports, true, 'Supervisor retains report approvals');
assert.strictEqual(supPerms.canViewAllJobs, true, 'Supervisor retains jobs view');
assert.strictEqual(supPerms.canCreateEmergency, true, 'Supervisor retains emergency callouts');
console.log('[PASS] Supervisor retains all operational permissions while account management is restricted');

// ----------------------------------------------------
// 3. BACKEND GUARDS ENFORCEMENT TEST
// ----------------------------------------------------
console.log('\n--- TEST 3: Backend Permission Guards Enforcement ---');

function testGuard(role, perm) {
  let passed = false;
  let blockedCode = null;
  const mockReq = { 
    user: { role, name: `Test ${role}` },
    permissions: ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS[normalizeRole(role)] || {}
  };
  const mockRes = {
    status: (code) => {
      blockedCode = code;
      return { json: () => {} };
    }
  };
  const mockNext = () => { passed = true; };

  requirePermission(perm)(mockReq, mockRes, mockNext);
  return { passed, blockedCode };
}

// All 5 management roles MUST pass canManageUsers guard
managementRoles.forEach(role => {
  const result = testGuard(role, 'canManageUsers');
  assert.strictEqual(result.passed, true, `${role} must pass canManageUsers guard`);
  console.log(`[PASS] ${role} passed requirePermission('canManageUsers')`);
});

// Non-management roles MUST be blocked by canManageUsers guard with 403
nonManagementRoles.forEach(role => {
  const result = testGuard(role, 'canManageUsers');
  assert.strictEqual(result.passed, false, `${role} must NOT pass canManageUsers guard`);
  assert.strictEqual(result.blockedCode, 403, `${role} must receive HTTP 403 Forbidden`);
  console.log(`[PASS] ${role} strictly blocked with HTTP 403 on requirePermission('canManageUsers')`);
});

// ----------------------------------------------------
// 4. PASSWORD MANAGEMENT, SANITIZATION & AUDIT TRAIL
// ----------------------------------------------------
console.log('\n--- TEST 4: Secure Password Management & Tracking ---');

// PBKDF2 hashing
const rawSecret = 'FireXManagement#2026';
const hashed = hashPassword(rawSecret);
assert(hashed.startsWith('pbkdf2:'), 'Must be hashed with PBKDF2');
assert(verifyPassword(rawSecret, hashed) === true, 'Valid password must verify');
assert(verifyPassword('WrongSecret', hashed) === false, 'Invalid password must reject');
console.log('[PASS] PBKDF2 hashing and verification validated');

// Creator & Reset History tracking in sanitizeUser
const mockUser = {
  id: 'usr-staff-test-01',
  name: 'Ahmed Tariq',
  username: 'ahmed.tariq',
  role: 'Technician',
  password: hashed,
  pin: '1234',
  created_by: 'usr-gm-1790621464394',
  created_by_name: 'Eng. Mohamed Hweidi',
  last_reset_by_name: 'Sarah Ali (Projects Manager)',
  last_reset_at: new Date().toISOString(),
  last_reset_mode: 'Temporary Password (24h)',
  temp_password_active: true,
  temp_password_expires_at: new Date(Date.now() + 24 * 3600 * 1000).toISOString()
};

const sanitized = sanitizeUser(mockUser);
assert.strictEqual(sanitized.password, undefined, 'Plaintext password must be stripped');
assert.strictEqual(sanitized.pin, undefined, 'Plaintext PIN must be stripped');
assert.strictEqual(sanitized.username, 'ahmed.tariq', 'Username must be preserved');
assert.strictEqual(sanitized.created_by_name, 'Eng. Mohamed Hweidi', 'Account creator must be tracked');
assert.strictEqual(sanitized.last_reset_by_name, 'Sarah Ali (Projects Manager)', 'Last resetter must be tracked');
assert.strictEqual(sanitized.last_reset_mode, 'Temporary Password (24h)', 'Reset mode must be tracked');
assert.strictEqual(sanitized.password_reset_status, 'Temp Password Issued', 'Password reset status must be Temp Password Issued');
console.log('[PASS] Creator and reset history correctly tracked and sanitized without plaintext leak');

// ----------------------------------------------------
// 5. PRODUCTION DATA INTEGRITY VERIFICATION
// ----------------------------------------------------
console.log('\n--- TEST 5: Production Data Integrity ---');
const users = db.get('users') || [];
const mdUser = users.find(u => u.id === 'usr-md-1');
assert(mdUser, 'MD user usr-md-1 must exist');
assert.strictEqual(mdUser.name, 'Wissam Jamal Hussein', 'MD name must be Wissam Jamal Hussein');
assert.strictEqual(mdUser.role, 'Managing Director (MD)', 'MD role must be Managing Director (MD)');
console.log(`[PASS] MD user intact: ${mdUser.name} (${mdUser.role})`);

const gmUser = users.find(u => u.role === 'GM');
assert(gmUser, 'GM user must exist');
assert.strictEqual(gmUser.name, 'Eng. Mohamed Hweidi', 'GM name must be Eng. Mohamed Hweidi');
console.log(`[PASS] GM user intact: ${gmUser.name} (${gmUser.role})`);

const customers = db.get('customers') || [];
const hawwar = customers.find(c => c.name.includes('Hawwar School'));
assert(hawwar, 'Hawwar School customer must exist');
console.log(`[PASS] Hawwar School customer intact: ${hawwar.name}`);

const contracts = db.get('amc_contracts') || [];
const contract = contracts.find(c => c.customer_id === hawwar.id);
assert(contract, 'Hawwar School AMC contract must exist');
console.log(`[PASS] Hawwar School contract intact: ${contract.contract_number}`);

const reports = db.get('reports') || [];
const report = reports.find(r => r.contract_id === contract.id);
assert(report, 'Hawwar School service report must exist');
console.log(`[PASS] Hawwar School report intact: ${report.report_number}`);

console.log('\n====================================================');
console.log('ALL 12 CRITERIA PASSED CLEANLY & VERIFIED!');
console.log('====================================================');
