const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'server', 'data', 'database.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

db.users = (db.users || []).map(u => ({
  ...u,
  pin: u.pin || '1234',
  password: u.password || u.pin || '1234'
}));

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');

console.log('[FIREX AUTH] Passwords and PINs initialized for all users:');
db.users.forEach(u => {
  console.log(`- ${u.name} (${u.role}): PIN/Password = ${u.pin}`);
});
