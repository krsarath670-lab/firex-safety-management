const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'server', 'data', 'database.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// Clear operational transaction data
db.jobs = [];
db.amc_contracts = [];
db.amc_visits = [];
db.reports = [];
db.faults = [];
db.notifications = [];
db.quotations = [];

// Write back to database.json
fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');

console.log('[FIREX CLEAR] Successfully cleared jobs, AMCs, visits, reports, faults, and quotations.');
console.log('Preserved Master Data:');
console.log(`- Company: ${db.company_settings.company_name} (CR: ${db.company_settings.cr_number})`);
console.log(`- Users: ${db.users.length}`);
console.log(`- Customers: ${db.customers.length}`);
console.log(`- Sites: ${db.sites.length}`);
console.log(`- Materials: ${db.materials.length}`);
