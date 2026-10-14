/**
 * FireX Bulk Password Reset Script
 * Resets all active user passwords to secure, unique 6-character alphanumeric temporary passwords.
 * Sets must_change_password: true so users must pick their own password upon first login.
 */

const db = require('../db');
const { generate6CharPassword, hashPassword, validatePasswordFormat } = require('../auth');

function resetAllPasswords() {
  const users = db.get('users') || [];
  if (users.length === 0) {
    console.error('No users found in database.');
    return [];
  }

  const results = [];
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days validity

  for (const user of users) {
    let rawPassword = '';
    // Ensure unique, compliant 6-char password
    do {
      rawPassword = generate6CharPassword();
    } while (!validatePasswordFormat(rawPassword).valid);

    const hashed = hashPassword(rawPassword);

    db.update('users', user.id, {
      password: hashed,
      pin: hashed,
      must_change_password: true,
      temp_password_active: true,
      temp_password_expires_at: expiresAt,
      last_reset_at: now.toISOString(),
      last_reset_by_name: 'Administrator',
      last_reset_mode: 'Bulk Password Reset'
    });

    db.logAudit(
      'sys',
      'PASSWORD_RESET',
      'users',
      user.id,
      `Administrator initiated bulk password reset for ${user.name} (${user.role})`
    );

    results.push({
      id: user.id,
      role: user.role,
      name: user.name,
      username: user.username || user.email || user.id,
      temporaryPassword: rawPassword
    });
  }

  return results;
}

const credentials = resetAllPasswords();
console.log(JSON.stringify(credentials, null, 2));
