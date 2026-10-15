const { Client } = require('pg');
const crypto = require('crypto');
const dbUrl = 'postgresql://firex_user:jqR7j4yaLoFSQQJmCId6RMxrGTaKXJDA@dpg-datg627lot8c73feemmg-a.frankfurt-postgres.render.com:5432/firex?ssl=true';

function hashPassword(password, salt) {
  salt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return 'pbkdf2:' + salt + ':' + hash;
}

async function updateBoth() {
  const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();
  const res = await client.query("SELECT data FROM firex_store WHERE key = 'app_state'");
  const appState = res.rows[0].data;
  
  const sarath = appState.users.find(u => (u.username||'').toLowerCase() === 'sarath');
  if (sarath) {
    const h = hashPassword('EX8DS2');
    sarath.password = h;
    sarath.pin = h;
    sarath.assigned_password = 'EX8DS2';
    sarath.status = 'Active';
    sarath.must_change_password = false;
    sarath.temp_password_active = false;
    sarath.password_updated_at = new Date().toISOString();
  }

  const chandi = appState.users.find(u => (u.username||'').toLowerCase() === 'chandiramohan');
  if (chandi) {
    const h = hashPassword('7FB6DK');
    chandi.password = h;
    chandi.pin = h;
    chandi.assigned_password = '7FB6DK';
    chandi.status = 'Active';
    chandi.must_change_password = false;
    chandi.temp_password_active = false;
    chandi.password_updated_at = new Date().toISOString();
  }

  await client.query("UPDATE firex_store SET data = $1, updated_at = NOW() WHERE key = 'app_state'", [JSON.stringify(appState)]);
  console.log('Successfully synced sarath (EX8DS2) and Chandiramohan (7FB6DK) in PostgreSQL');
  await client.end();
}

updateBoth().catch(console.error);
