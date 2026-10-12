/**
 * FIREX Service Management - Administrative Account Recovery CLI
 * 
 * Safely provision or reset administrative accounts (Admin, CEO, MD, GM, Projects Manager)
 * directly from the server environment without exposing public HTTP endpoints.
 * 
 * Usage:
 *   node server/scripts/recover-account.js --role=Admin --username=admin --password=<NEW_PASSWORD>
 *   node server/scripts/recover-account.js --role=CEO --name="Ahamd Jamal" --username=AhamdJamal --password=<NEW_PASSWORD>
 */

const path = require('path');
const db = require('../db');
const { hashPassword, normalizeRole, sanitizeUser } = require('../auth');

function parseArgs() {
  const args = {};
  process.argv.slice(2).forEach(arg => {
    if (arg.startsWith('--')) {
      const eqIdx = arg.indexOf('=');
      if (eqIdx !== -1) {
        const key = arg.slice(2, eqIdx).trim();
        const value = arg.slice(eqIdx + 1).trim();
        args[key] = value;
      }
    }
  });
  return args;
}

async function main() {
  const args = parseArgs();
  const rawRole = args.role || 'Admin';
  const role = normalizeRole(rawRole);
  const username = (args.username || '').trim();
  const name = (args.name || role).trim();
  const password = (args.password || '').trim();
  const email = (args.email || `${role.toLowerCase().replace(/[^a-z0-9]/g, '')}@firexbahrain.com`).trim();

  if (!username) {
    console.error('Error: --username is required (e.g. --username=admin)');
    process.exit(1);
  }

  if (!password || password.length < 4) {
    console.error('Error: --password must be at least 4 characters long.');
    process.exit(1);
  }

  // Wait briefly for Postgres connection if running with DATABASE_URL
  if (db.isPostgres && db.pgPool) {
    console.log('[FIREX Recovery] Waiting for PostgreSQL database initialization...');
    await new Promise(r => setTimeout(r, 1200));
  }

  const users = db.get('users') || [];
  let existingUser = users.find(u => 
    (u.username && u.username.toLowerCase() === username.toLowerCase()) ||
    (normalizeRole(u.role).toLowerCase() === role.toLowerCase() && u.name.toLowerCase() === name.toLowerCase())
  );

  const hashedPassword = hashPassword(password);
  let resultUser = null;

  if (existingUser) {
    console.log(`[FIREX Recovery] Existing account found for ${existingUser.name} (${existingUser.role}, ID: ${existingUser.id}). Resetting credentials...`);
    const updates = {
      username: username,
      password: hashedPassword,
      pin: hashedPassword,
      status: 'Active',
      must_change_password: false,
      temp_password_active: false,
      temp_password_expires_at: null,
      last_reset_by_id: 'sys-recovery-cli',
      last_reset_by_name: 'Server Recovery CLI',
      last_reset_by_role: 'System Administrator',
      last_reset_at: new Date().toISOString(),
      last_reset_mode: 'CLI Administrative Recovery',
      updated_at: new Date().toISOString()
    };
    if (args.name) updates.name = name;
    if (args.role) updates.role = role;

    resultUser = db.update('users', existingUser.id, updates);
    db.logAudit('sys-recovery-cli', 'ACCOUNT_RECOVERY', 'users', existingUser.id, `Password and access recovered for ${existingUser.name} (${existingUser.role}) via CLI recovery tool`);
    console.log(`[FIREX Recovery] Credentials successfully updated for ${resultUser.name}.`);
  } else {
    console.log(`[FIREX Recovery] No existing account found matching username "${username}". Creating new ${role} account...`);
    const initials = (name.split(' ').map(n => n[0]).join('')).toUpperCase().slice(0, 2) || role.slice(0, 2).toUpperCase();
    const newUser = {
      id: `use-rec-${Date.now()}`,
      name: name,
      username: username,
      email: email,
      role: role,
      designation: role === 'Admin' ? 'System Administrator' : (role === 'CEO' ? 'Chief Executive Officer' : role),
      status: 'Active',
      password: hashedPassword,
      pin: hashedPassword,
      avatar: initials,
      created_by: 'sys-recovery-cli',
      created_by_name: 'Server Recovery CLI',
      created_by_role: 'System Administrator',
      created_at: new Date().toISOString()
    };
    resultUser = db.insert('users', newUser);
    db.logAudit('sys-recovery-cli', 'CREATE_RECOVERY_USER', 'users', resultUser.id, `Created ${role} account for ${name} via CLI recovery tool`);
    console.log(`[FIREX Recovery] Account successfully created: ${resultUser.name} (${resultUser.role}).`);
  }

  const safe = sanitizeUser(resultUser);
  console.log('\n====================================================');
  console.log('RECOVERY SUMMARY (No plain text secrets exposed):');
  console.log('====================================================');
  console.log('ID:         ', safe.id);
  console.log('Name:       ', safe.name);
  console.log('Username:   ', safe.username);
  console.log('Role:       ', safe.role);
  console.log('Status:     ', safe.status);
  console.log('Encrypted:   PBKDF2 SHA-512 with random salt');
  console.log('====================================================\n');
  process.exit(0);
}

main().catch(err => {
  console.error('[FIREX Recovery] Error during recovery operation:', err);
  process.exit(1);
});
