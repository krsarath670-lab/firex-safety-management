const { Client } = require('pg');
const crypto = require('crypto');
const dbUrl = 'postgresql://firex_user:jqR7j4yaLoFSQQJmCId6RMxrGTaKXJDA@dpg-datg627lot8c73feemmg-a.frankfurt-postgres.render.com:5432/firex?ssl=true';

function verifyPassword(inputPassword, storedPassword) {
  if (!inputPassword || !storedPassword) return false;
  const strStored = String(storedPassword).trim();
  const strInput = String(inputPassword).trim();
  if (strStored.startsWith('pbkdf2:')) {
    const parts = strStored.split(':');
    if (parts.length === 3) {
      const salt = parts[1];
      const hash = parts[2];
      const verifyHash = crypto.pbkdf2Sync(strInput, salt, 1000, 64, 'sha512').toString('hex');
      return hash === verifyHash;
    }
  }
  return strInput === strStored;
}

const BULK_MAP = {
  'admin': 'FX7B2K',
  'ahamdjamal': 'EJR5W2',
  'yaser': 'U2NMC3',
  'md': 'F8B3PU',
  'mohamedhweidi': 'FUHP43',
  'chandiramohan': '7FB6DK',
  'sarath': 'EX8DS2',
  'hasanzulaikh': 'PN8GH8',
  'abdulmajeed': 'G76JER',
  'amar': '8WN7AX',
  'abdulsattarsaiyed': 'NC5ZN7',
  'mohammedalawadhi': '2QZS2B'
};

async function testAll() {
  const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();
  const res = await client.query("SELECT data FROM firex_store WHERE key = 'app_state'");
  const users = res.rows[0].data.users || [];
  console.log(`Found ${users.length} users in PostgreSQL:`);
  for (const u of users) {
    const uname = (u.username || '').toLowerCase();
    const expected = BULK_MAP[uname];
    const match = verifyPassword(expected, u.password);
    console.log(`User: ${u.username.padEnd(18)} | Role: ${u.role.padEnd(20)} | Password: ${expected || 'N/A'} | Hash Match: ${match}`);
  }
  await client.end();
}
testAll().catch(console.error);
