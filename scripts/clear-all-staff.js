const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'server', 'data', 'database.json');
const raw = fs.readFileSync(dbPath, 'utf8');
const data = JSON.parse(raw);

const previousCount = (data.users || []).length;
console.log(`[CLEAR-STAFF] Found ${previousCount} staff members in database.`);

// Wipe all users
data.users = [];

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
console.log(`[CLEAR-STAFF] Successfully emptied users array. Current count: ${data.users.length}`);
