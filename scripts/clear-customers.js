const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'server', 'data', 'database.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

db.customers = [];
db.sites = [];

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');

console.log('[FIREX CLEAR] Successfully deleted all customers and sites.');
console.log(`- Customers count: ${db.customers.length}`);
console.log(`- Sites count: ${db.sites.length}`);
console.log(`- Users count: ${db.users.length}`);
