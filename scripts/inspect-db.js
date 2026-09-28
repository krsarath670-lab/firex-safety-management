const fs = require('fs');
const db = JSON.parse(fs.readFileSync('server/data/database.json', 'utf8'));

console.log('--- JOBS ---');
console.log(db.jobs.map(j => ({ id: j.id, job_number: j.job_number, type: j.job_type, customer_id: j.customer_id })));

console.log('--- AMC CONTRACTS ---');
console.log(db.amc_contracts.map(a => ({ id: a.id, customer_id: a.customer_id, systems: a.systems })));

console.log('--- REPORTS (first 5) ---');
console.log(db.reports.slice(0, 5).map(r => ({ id: r.id, report_number: r.report_number, job_id: r.job_id, type: r.report_type })));

console.log('--- FAULTS ---');
console.log(db.faults.map(f => ({ id: f.id, title: f.title, customer_id: f.customer_id })));
