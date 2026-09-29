const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'data', 'database.json');
const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));

// Helper to add months to YYYY-MM-DD
function addMonths(dateStr, months) {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split('T')[0];
}

// 1. Ensure AMC frequencies in company settings
db.company_settings = db.company_settings || {};
db.company_settings.amc_frequencies = {
  "Fire Alarm": { interval_months: 3, visits_per_year: 4 },
  "Fire Fighting": { interval_months: 3, visits_per_year: 4 },
  "Fire Extinguishers": { interval_months: 6, visits_per_year: 2 }
};

// 2. Ensure exactly the 5 roles in users, with 2 Sales users for data isolation testing
const existingUsers = db.users || [];
const sales1Exists = existingUsers.some(u => u.id === 'usr-sales-1');
const sales2Exists = existingUsers.some(u => u.id === 'usr-sales-2');

if (!sales1Exists) {
  existingUsers.push({
    id: "usr-sales-1",
    name: "Hussain Al-Saeed",
    email: "hussain.sales@firexbahrain.com",
    role: "Sales",
    phone: "+973 3988 5544",
    designation: "Commercial Sales Executive",
    avatar: "HA",
    created_at: new Date().toISOString()
  });
}

if (!sales2Exists) {
  existingUsers.push({
    id: "usr-sales-2",
    name: "Noor Al-Qassim",
    email: "noor.sales@firexbahrain.com",
    role: "Sales",
    phone: "+973 3977 4433",
    designation: "Senior Sales & Contracting Specialist",
    avatar: "NQ",
    created_at: new Date().toISOString()
  });
}
db.users = existingUsers;

// 3. Update AMC contracts with sales_person_id and proper systems array
db.amc_contracts = (db.amc_contracts || []).map((contract, idx) => {
  const salesId = idx % 2 === 0 ? 'usr-sales-1' : 'usr-sales-2';
  // Normalize systems into the 3 standard types
  let systems = [];
  if (idx === 0) {
    systems = ["Fire Alarm", "Fire Fighting", "Fire Extinguishers"]; // Mixed contract (10 visits)
  } else if (idx === 1) {
    systems = ["Fire Alarm", "Fire Fighting"]; // 8 visits
  } else if (idx === 2) {
    systems = ["Fire Alarm"]; // 4 visits
  } else if (idx === 3) {
    systems = ["Fire Fighting"]; // 4 visits
  } else {
    systems = ["Fire Alarm", "Fire Extinguishers"]; // 6 visits
  }

  return {
    ...contract,
    sales_person_id: contract.sales_person_id || salesId,
    systems: systems,
    currency: "BHD",
    contract_value: Number(contract.contract_value) > 10000 ? Math.round(contract.contract_value / 10) : (Number(contract.contract_value) || 2500)
  };
});

// 4. Generate AMC Visits for all contracts
const freqs = db.company_settings.amc_frequencies;
const generatedVisits = [];

db.amc_contracts.forEach(contract => {
  const systems = contract.systems || ["Fire Alarm"];
  systems.forEach(sys => {
    const config = freqs[sys] || { interval_months: 3, visits_per_year: 4 };
    for (let v = 1; v <= config.visits_per_year; v++) {
      const scheduledDate = addMonths(contract.start_date, (v - 1) * config.interval_months);
      
      // Determine status based on date relative to current date (Sep 2026)
      let status = "Scheduled";
      if (scheduledDate < "2026-09-01") {
        status = "Completed";
      } else if (scheduledDate >= "2026-09-01" && scheduledDate <= "2026-09-28") {
        status = (v % 2 === 0) ? "In Progress" : "Completed";
      }

      generatedVisits.push({
        id: `vis-${contract.id}-${sys.replace(/\s+/g, '').toLowerCase()}-${v}`,
        amc_contract_id: contract.id,
        amc_id: contract.id, // alias
        contract_number: contract.contract_number,
        customer_id: contract.customer_id,
        site_id: contract.site_id,
        sales_person_id: contract.sales_person_id,
        system_type: sys,
        system: sys, // alias
        visit_number: v,
        scheduled_date: scheduledDate,
        assigned_team: "Team Alpha (Tariq & Rajesh)",
        assigned_technician: "usr-tech",
        technician_id: "usr-tech",
        status: status,
        visit_status: status, // alias
        remarks: `Routine ${sys} safety compliance inspection #${v}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
  });
});
db.amc_visits = generatedVisits;

// 5. Update Jobs with sales_person_id, supervisor_id, technician_id, job_type, amount, currency
const jobTypes = [
  "AMC", "Fit-out", "Supply", "Project", "Breakdown", "Installation", "Testing & Commissioning", "Inspection"
];

db.jobs = (db.jobs || []).map((job, idx) => {
  const salesId = idx % 2 === 0 ? 'usr-sales-1' : 'usr-sales-2';
  const jType = jobTypes[idx % jobTypes.length];
  const amounts = [1250.000, 480.000, 2500.000, 350.000, 890.000, 1600.000, 420.000, 750.000];
  
  return {
    ...job,
    sales_person_id: job.sales_person_id || salesId,
    supervisor_id: job.supervisor_id || 'usr-sup',
    technician_id: job.technician_id || 'usr-tech',
    job_type: job.job_type || jType,
    system_type: job.system_type || "Fire Alarm & Detection",
    amount: Number(job.amount) || amounts[idx % amounts.length],
    currency: "BHD",
    quotation_number: job.quotation_number || `QT-2026-0${10 + idx}`,
    expected_start_date: job.expected_start_date || job.date || "2026-09-20",
    expected_completion_date: job.expected_completion_date || "2026-10-15",
    remarks: job.remarks || "Commercial contract approved. Field execution scheduled.",
    created_by: job.created_by || salesId
  };
});

// Add extra jobs for both salespersons so each has multiple jobs across types
if (db.jobs.length < 8) {
  const extraJobs = [
    {
      id: "job-sales-1-fitout",
      job_number: "FIT-2026-004",
      customer_id: "cust-1",
      site_id: "site-1",
      sales_person_id: "usr-sales-1",
      supervisor_id: "usr-sup",
      technician_id: "usr-tech",
      job_type: "Fit-out",
      system_type: "Fire Alarm",
      description: "Restaurant mezzanine floor fit-out modification with 14 smoke detectors and 2 duct detectors.",
      amount: 850.000,
      currency: "BHD",
      quotation_number: "QT-2026-018",
      expected_start_date: "2026-09-15",
      expected_completion_date: "2026-10-05",
      status: "In Progress",
      remarks: "Site permits cleared. Awaiting ceiling grid completion.",
      created_by: "usr-sales-1",
      created_at: new Date().toISOString()
    },
    {
      id: "job-sales-1-supply",
      job_number: "SUP-2026-001",
      customer_id: "cust-2",
      site_id: "site-3",
      sales_person_id: "usr-sales-1",
      supervisor_id: "usr-sup",
      technician_id: "usr-tech",
      job_type: "Supply",
      system_type: "Fire Extinguishers",
      description: "Supply and wall mounting of 50 units of 6KG ABC Dry Powder Extinguishers with Civil Defence tags.",
      amount: 1450.000,
      currency: "BHD",
      quotation_number: "QT-2026-022",
      expected_start_date: "2026-09-25",
      expected_completion_date: "2026-09-30",
      status: "Approved",
      remarks: "Equipment delivered to site store.",
      created_by: "usr-sales-1",
      created_at: new Date().toISOString()
    },
    {
      id: "job-sales-2-project",
      job_number: "PRJ-2026-001",
      customer_id: "cust-3",
      site_id: "site-4",
      sales_person_id: "usr-sales-2",
      supervisor_id: "usr-sup",
      technician_id: "usr-tech",
      job_type: "Project",
      system_type: "Fire Fighting",
      description: "Warehouse extension sprinkler installation with 150 pendent sprinkler heads and zone valve.",
      amount: 6800.000,
      currency: "BHD",
      quotation_number: "QT-2026-031",
      expected_start_date: "2026-09-10",
      expected_completion_date: "2026-11-20",
      status: "In Progress",
      remarks: "Pipe fabrication in progress at workshop.",
      created_by: "usr-sales-2",
      created_at: new Date().toISOString()
    },
    {
      id: "job-sales-2-breakdown",
      job_number: "BRK-2026-002",
      customer_id: "cust-4",
      site_id: "site-5",
      sales_person_id: "usr-sales-2",
      supervisor_id: "usr-sup",
      technician_id: "usr-tech",
      job_type: "Breakdown",
      system_type: "Fire Alarm",
      description: "Emergency troubleshooting of ground fault on Loop 3 causing continuous trouble buzzer.",
      amount: 180.000,
      currency: "BHD",
      quotation_number: "QT-2026-035",
      expected_start_date: "2026-09-28",
      expected_completion_date: "2026-09-28",
      status: "New",
      remarks: "Customer called emergency office dispatch. Dispatched immediately.",
      created_by: "usr-sales-2",
      created_at: new Date().toISOString()
    }
  ];
  db.jobs.push(...extraJobs);
}

// Write migrated database
fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
console.log('Migration Complete:');
console.log('- Users:', db.users.map(u => `${u.name} (${u.role})`));
console.log('- Total AMC Contracts:', db.amc_contracts.length);
console.log('- Total AMC Visits Generated:', db.amc_visits.length);
console.log('- Total Jobs:', db.jobs.length);
