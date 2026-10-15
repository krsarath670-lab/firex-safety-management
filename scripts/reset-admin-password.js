const { Client } = require('pg');
const crypto = require('crypto');

const dbUrl = 'postgresql://firex_user:jqR7j4yaLoFSQQJmCId6RMxrGTaKXJDA@dpg-datg627lot8c73feemmg-a.frankfurt-postgres.render.com:5432/firex?ssl=true';

function hashPassword(password, salt) {
  salt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return 'pbkdf2:' + salt + ':' + hash;
}

const newPassword = 'FX7B2K';
const newHash = hashPassword(newPassword);

async function run() {
  const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();
  const res = await client.query("SELECT data FROM firex_store WHERE key = $1", ['app_state']);
  if (!res.rows.length) {
    console.error('No app_state found');
    await client.end();
    return;
  }
  const appState = res.rows[0].data;
  const admin = (appState.users || []).find(u => u.username === 'admin');
  if (!admin) {
    console.error('No admin user found');
    await client.end();
    return;
  }
  console.log('Current admin user:', {
    id: admin.id,
    username: admin.username,
    role: admin.role,
    status: admin.status,
    password_updated_at: admin.password_updated_at,
    currentPasswordHash: admin.password ? admin.password.slice(0, 25) + '...' : null
  });

  admin.password = newHash;
  admin.pin = newHash;
  admin.status = 'Active';
  admin.must_change_password = false;
  admin.temp_password_active = false;
  admin.password_updated_at = new Date().toISOString();

  await client.query("UPDATE firex_store SET data = $1, updated_at = NOW() WHERE key = $2", [JSON.stringify(appState), 'app_state']);
  console.log('Admin password successfully updated in remote PostgreSQL to:', newPassword);
  await client.end();
}

run().catch(console.error);
