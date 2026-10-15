const { Client } = require('pg');
const crypto = require('crypto');
const dbUrl = 'postgresql://firex_user:jqR7j4yaLoFSQQJmCId6RMxrGTaKXJDA@dpg-datg627lot8c73feemmg-a.frankfurt-postgres.render.com:5432/firex?ssl=true';

function hashPassword(password, salt) {
  salt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return 'pbkdf2:' + salt + ':' + hash;
}

const PASSWORD_MAP = {
  'admin': 'FX7B2K',
  'md': 'F8B3PU',
  'ahamdjamal': 'EJR5W2',
  'yaser': 'U2NMC3',
  'mohamedhweidi': 'FUHP43',
  'chandiramohan': '7FB6DK',
  'sarath': 'EX8DS2',
  'hasanzulaikh': 'PN8GH8',
  'abdulmajeed': 'G76JER',
  'amar': '8WN7AX',
  'abdulsattarsaiyed': 'NC5ZN7',
  'mohammedalawadhi': '2QZS2B'
};

async function syncPasswords() {
  const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();
  const res = await client.query("SELECT data FROM firex_store WHERE key = 'app_state'");
  const appState = res.rows[0].data;
  const users = appState.users || [];
  
  console.log(`Updating ${users.length} users with assigned_password and PBKDF2 hash...`);
  for (const u of users) {
    const uname = (u.username || '').toLowerCase();
    const cleanPass = PASSWORD_MAP[uname] || 'FX7B2K';
    const hashed = hashPassword(cleanPass);
    u.assigned_password = cleanPass;
    u.password = hashed;
    u.pin = hashed;
    u.status = 'Active';
    u.must_change_password = false;
    u.temp_password_active = false;
    u.password_updated_at = new Date().toISOString();
    console.log(`Updated ${u.username} (${u.role}): ${cleanPass}`);
  }

  await client.query("UPDATE firex_store SET data = $1, updated_at = NOW() WHERE key = $2", [JSON.stringify(appState), 'app_state']);
  console.log('PostgreSQL firex_store updated successfully.');
  await client.end();
}

syncPasswords().catch(console.error);
