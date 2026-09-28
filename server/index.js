const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');
const { authMiddleware, requirePermission, requireRole, ROLE_PERMISSIONS, sanitizeJobForRole, sanitizeContractForRole } = require('./auth');
const ai = require('./ai');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Diagnostic request logger for all incoming traffic
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Auth & RBAC injection
app.use(authMiddleware);

// --- HEALTH & AUTH INFO ---
app.get('/api/health', (req, res) => {
  const dbHealth = db.isPostgres ? (db.pgPool ? 'postgres-connected' : 'postgres-connecting') : 'local-storage';
  res.json({
    status: 'ok',
    database: dbHealth,
    serverTime: new Date().toISOString(),
    uptime: Math.floor(process.uptime())
  });
});

app.get('/api/auth/me', (req, res) => {
  res.json({
    user: req.user,
    permissions: req.permissions,
    allRoles: ['GM', 'Engineer', 'Supervisor', 'Technician', 'Sales']
  });
});

// --- DATABASE BACKUP (GM, Engineer, Supervisor; Forbidden for Tech & Sales) ---
app.get('/api/backup', (req, res) => {
  if (['Technician', 'Sales'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Access Denied', message: 'You do not have permission to download system backups.' });
  }
  const dbData = db.read();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="firex-database-backup-${timestamp}.json"`);
  res.send(JSON.stringify(dbData, null, 2));
});

// --- AUTHENTICATION: LOGIN & DIRECTORY ---
app.get('/api/auth/users-list', (req, res) => {
  const users = db.get('users') || [];
  const publicList = users
    .filter(u => u.status !== 'Inactive')
    .map(u => ({
      id: u.id,
      name: u.name,
      role: u.role,
      avatar: u.avatar || u.role?.[0] || 'U',
      designation: u.designation || u.role,
      email: u.email,
      phone: u.phone
    }));
  res.json(publicList);
});

// --- INITIAL SETUP: CREATE GM ACCOUNT WHEN USERS LIST IS EMPTY ---
app.post('/api/auth/setup-first-user', (req, res) => {
  const users = db.get('users') || [];
  const existingGM = users.find(u => u.role === 'GM');

  // Prevent setup if GM already exists
  if (users.length > 0 && existingGM) {
    return res.status(403).json({
      error: 'Setup Completed',
      message: 'A General Manager account already exists. Please sign in or use Staff Management inside the app.'
    });
  }

  const { name, phone, email, password, pin } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Name Required', message: 'Full name is required to create your GM account.' });
  }

  const cleanPass = (password || pin || '').toString().trim();
  if (!cleanPass || cleanPass.length < 3) {
    return res.status(400).json({ error: 'Password Required', message: 'Please enter a password or PIN (minimum 3 characters or digits).' });
  }

  const trimmedName = name.trim();
  const initials = (trimmedName.split(' ').map(n => n[0]).join('')).toUpperCase().slice(0, 2) || 'GM';
  const newGM = db.insert('users', {
    id: 'usr-gm-' + Date.now(),
    name: trimmedName,
    email: email && email.trim() ? email.trim() : `${trimmedName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@firexbahrain.com`,
    role: 'GM',
    phone: phone && phone.trim() ? phone.trim() : '+973 17162240',
    designation: 'General Manager',
    status: 'Active',
    pin: cleanPass,
    password: cleanPass,
    notes: 'Primary General Manager & System Administrator',
    avatar: initials,
    created_by: 'system',
    created_at: new Date().toISOString()
  });

  db.logAudit(newGM.id, 'SETUP_FIRST_USER', 'users', newGM.id, `Created primary GM account for ${newGM.name}`);

  res.status(201).json({
    message: `General Manager account created successfully for ${newGM.name}!`,
    user: {
      id: newGM.id,
      name: newGM.name,
      email: newGM.email,
      role: newGM.role,
      phone: newGM.phone,
      designation: newGM.designation,
      avatar: newGM.avatar,
      pin: newGM.pin
    },
    permissions: ROLE_PERMISSIONS.GM,
    token: `token-${newGM.id}-${Date.now()}`
  });
});

app.post('/api/auth/login', (req, res) => {
  const { userId, role, identifier, password, pin } = req.body;
  const inputSecret = (password || pin || '').toString().trim();
  const users = db.get('users') || [];

  let user = null;
  if (userId) {
    user = users.find(u => u.id === userId);
  } else if (identifier) {
    const idf = identifier.toString().trim().toLowerCase();
    user = users.find(u => 
      (u.id && u.id.toLowerCase() === idf) ||
      (u.email && u.email.toLowerCase() === idf) ||
      (u.phone && u.phone.replace(/\s+/g, '') === idf.replace(/\s+/g, '')) ||
      (u.name && u.name.toLowerCase() === idf)
    );
  } else if (role) {
    user = users.find(u => u.role && u.role.toLowerCase() === role.toLowerCase());
  }

  if (!user) {
    return res.status(404).json({ error: 'User Not Found', message: 'No account found matching the provided identifier.' });
  }

  if (user.status === 'Inactive') {
    return res.status(403).json({ error: 'Account Inactive', message: 'Your staff account is currently deactivated. Please contact your manager.' });
  }

  const expectedSecret = (user.password || user.pin || '1234').toString().trim();
  if (inputSecret !== expectedSecret) {
    return res.status(401).json({ error: 'Incorrect Password', message: 'Invalid password or PIN entered. Please try again.' });
  }

  // Audit login
  db.logAudit(user.id, 'LOGIN', 'users', user.id, `User ${user.name} logged in successfully`);

  res.json({
    message: `Welcome back, ${user.name}!`,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      designation: user.designation,
      avatar: user.avatar,
      pin: user.pin
    },
    permissions: ROLE_PERMISSIONS[user.role] || ROLE_PERMISSIONS.Technician,
    token: `token-${user.id}-${Date.now()}`
  });
});

app.post('/api/auth/switch-role', (req, res) => {
  const { role, userId, password, pin } = req.body;
  const users = db.get('users');
  let targetUser = null;
  if (userId) {
    targetUser = users.find(u => u.id === userId);
  }
  if (!targetUser && role) {
    targetUser = users.find(u => u.role.toLowerCase() === (role || '').toLowerCase());
  }
  if (!targetUser) {
    return res.status(404).json({ error: `User with role ${role} not found` });
  }

  // If password or PIN is provided, validate it
  if (password || pin) {
    const inputSecret = (password || pin).toString().trim();
    const expectedSecret = (targetUser.password || targetUser.pin || '1234').toString().trim();
    if (inputSecret !== expectedSecret) {
      return res.status(401).json({ error: 'Incorrect Password', message: 'Password or PIN entered is incorrect.' });
    }
  }

  res.json({
    message: `Switched to role ${targetUser.role}: ${targetUser.name}`,
    user: targetUser,
    permissions: ROLE_PERMISSIONS[targetUser.role]
  });
});

// --- USERS MANAGEMENT (GM, Engineer, Supervisor; Forbidden for Tech & Sales) ---
app.get('/api/users', (req, res) => {
  if (req.user.role === 'Technician' || req.user.role === 'Sales') {
    return res.status(403).json({ error: 'Access Denied', message: 'You do not have permission to browse the user directory.' });
  }
  const users = db.get('users');
  res.json(users);
});

app.post('/api/users', requirePermission('canManageUsers'), (req, res) => {
  const { name, email, role, phone, designation, status, pin, password, notes } = req.body;
  if (!name || !role) {
    return res.status(400).json({ error: 'Name and Role are required' });
  }

  // Engineer and Supervisor can only add Technician and Sales users
  if (['Engineer', 'Supervisor'].includes(req.user.role)) {
    if (!['Technician', 'Sales'].includes(role)) {
      return res.status(403).json({ 
        error: 'Access Denied', 
        message: 'Engineers and Supervisors can only add Technician and Sales staff members.' 
      });
    }
  }

  const cleanPass = (password || pin || '1234').toString().trim();
  const initials = (name.trim().split(' ').map(n => n[0]).join('')).toUpperCase().slice(0, 2);
  const newUser = db.insert('users', {
    name: name.trim(),
    email: email ? email.trim() : `${name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@firexbahrain.com`,
    role,
    phone: phone ? phone.trim() : '+973 3000 0000',
    designation: designation ? designation.trim() : (role === 'Sales' ? 'Commercial Sales Executive' : 'Certified Fire Technician'),
    status: status || 'Active',
    pin: cleanPass,
    password: cleanPass,
    notes: notes || '',
    avatar: initials || 'FS',
    created_by: req.user.id,
    created_at: new Date().toISOString()
  });

  db.logAudit(req.user.id, 'CREATE_USER', 'users', newUser.id, `Created user ${name} with role ${role} (password/PIN configured)`);
  res.status(201).json(newUser);
});

app.put('/api/users/:id', requirePermission('canManageUsers'), (req, res) => {
  const existing = db.getById('users', req.params.id);
  if (!existing) return res.status(404).json({ error: 'User not found' });

  // Engineer and Supervisor can only modify Technician and Sales accounts
  if (['Engineer', 'Supervisor'].includes(req.user.role)) {
    if (!['Technician', 'Sales'].includes(existing.role)) {
      return res.status(403).json({ 
        error: 'Access Denied', 
        message: 'Engineers and Supervisors can only modify Technician and Sales accounts.' 
      });
    }
    if (req.body.role && !['Technician', 'Sales'].includes(req.body.role)) {
      return res.status(403).json({ 
        error: 'Access Denied', 
        message: 'Engineers and Supervisors can only assign Technician or Sales role.' 
      });
    }
  }

  const updates = { ...req.body };
  if (updates.password || updates.pin) {
    const cleanPass = (updates.password || updates.pin).toString().trim();
    updates.password = cleanPass;
    updates.pin = cleanPass;
  }

  const updated = db.update('users', req.params.id, updates);
  db.logAudit(req.user.id, 'UPDATE_USER', 'users', req.params.id, `Updated user details for ${existing.name}`);
  res.json(updated);
});

// Dedicated Password Management: GM, Engineer, Supervisor can set password
app.post('/api/users/:id/password', (req, res) => {
  const { newPassword, pin } = req.body;
  const cleanPass = (newPassword || pin || '').toString().trim();
  if (!cleanPass || cleanPass.length < 3) {
    return res.status(400).json({ error: 'Password / PIN must be at least 3 characters or digits' });
  }

  const target = db.getById('users', req.params.id);
  if (!target) return res.status(404).json({ error: 'User not found' });

  const isGM = req.user.role === 'GM';
  const isEngineerOrSupervisor = ['Engineer', 'Supervisor'].includes(req.user.role);
  const isSelf = req.user.id === target.id;
  const isTargetTechOrSales = ['Technician', 'Sales'].includes(target.role);

  if (isGM) {
    // GM can set password for anyone
  } else if (isEngineerOrSupervisor && isTargetTechOrSales) {
    // Engineer & Supervisor can set password for Tech and Sales
  } else if (isSelf) {
    // Self update
  } else {
    return res.status(403).json({ 
      error: 'Access Denied', 
      message: 'You do not have permission to change the password for this account.' 
    });
  }

  const updated = db.update('users', target.id, {
    password: cleanPass,
    pin: cleanPass
  });

  db.logAudit(req.user.id, 'SET_PASSWORD', 'users', target.id, `Password / PIN updated for ${target.name} (${target.role})`);
  res.json({ message: `Password for ${target.name} successfully updated to: ${cleanPass}`, user: updated });
});

app.delete('/api/users/:id', requirePermission('canManageUsers'), (req, res) => {
  const existing = db.getById('users', req.params.id);
  if (!existing) return res.status(404).json({ error: 'User not found' });

  // Engineer and Supervisor can only delete Technician and Sales accounts
  if (['Engineer', 'Supervisor'].includes(req.user.role)) {
    if (!['Technician', 'Sales'].includes(existing.role)) {
      return res.status(403).json({ 
        error: 'Access Denied', 
        message: 'Engineers and Supervisors can only delete Technician and Sales accounts.' 
      });
    }
  }

  if (existing.id === req.user.id) {
    return res.status(400).json({ error: 'Cannot delete your own active account.' });
  }

  db.delete('users', req.params.id);
  db.logAudit(req.user.id, 'DELETE_USER', 'users', req.params.id, `Deleted user ${existing.name}`);
  res.json({ success: true, message: `User ${existing.name} deleted successfully.` });
});

// --- DASHBOARD INTELLIGENCE & STATISTICS ---
app.get('/api/dashboard/stats', (req, res) => {
  const isSales = req.user.role === 'Sales';
  const isTechnician = req.user.role === 'Technician';

  // If Sales user, return dedicated Sales dashboard metrics
  if (isSales) {
    const salesStats = db.getSalesDashboardStats(req.user.id);
    const upcomingAmc = db.getUpcomingAmcVisits(req.user.id);
    return res.json({
      role: 'Sales',
      ...salesStats,
      upcoming_amc: upcomingAmc
    });
  }

  const now = new Date();
  const amcs = db.get('amc_contracts');
  const jobs = db.get('jobs');
  const faults = db.get('faults');
  const reports = db.get('reports');
  const quotations = db.get('quotations');
  const customers = db.get('customers');
  const sites = db.get('sites');

  let totalActiveAMC = 0;
  let expiring30Days = 0;
  let expiring60Days = 0;
  let expiring90Days = 0;
  let expiredAMC = 0;

  amcs.forEach(amc => {
    const endDate = new Date(amc.end_date);
    const diffTime = endDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      expiredAMC++;
    } else {
      totalActiveAMC++;
      if (diffDays <= 30) expiring30Days++;
      if (diffDays <= 60) expiring60Days++;
      if (diffDays <= 90) expiring90Days++;
    }
  });

  // Today's jobs
  const todayStr = now.toISOString().slice(0, 10);
  let userJobs = jobs;
  if (isTechnician) {
    userJobs = jobs.filter(j => j.technician_id === req.user.id || (j.team && j.team.includes(req.user.name)));
  }

  const todayJobsCount = userJobs.filter(j => (j.date === todayStr || j.expected_start_date === todayStr)).length;
  const pendingJobsCount = userJobs.filter(j => ['Pending', 'New', 'Quoted', 'Scheduled', 'In Progress'].includes(j.status)).length;
  const completedJobsCount = userJobs.filter(j => j.status === 'Completed').length;
  const openFaultsCount = faults.filter(f => f.status === 'Open' || f.status === 'In Progress').length;
  const pendingQuotationsCount = quotations.filter(q => q.status.toLowerCase().includes('pending') || q.status.toLowerCase().includes('draft')).length;
  const pendingReportsCount = reports.filter(r => r.status === 'Draft' || r.status === 'Submitted' || r.status === 'Reviewed').length;
  const pendingBreakdownsCount = userJobs.filter(j => j.job_type === 'Breakdown' && j.status !== 'Completed').length;

  const upcomingAmc = db.getUpcomingAmcVisits();

  res.json({
    role: req.user.role,
    totalActiveAMC: isTechnician ? 0 : totalActiveAMC,
    expiring30Days: isTechnician ? 0 : expiring30Days,
    expiring60Days: isTechnician ? 0 : expiring60Days,
    expiring90Days: isTechnician ? 0 : expiring90Days,
    expiredAMC: isTechnician ? 0 : expiredAMC,
    todayJobsCount,
    pendingJobsCount,
    completedJobsCount,
    pendingBreakdownsCount,
    pendingQuotationsCount: isTechnician ? 0 : pendingQuotationsCount,
    openFaultsCount,
    pendingReportsCount,
    customersCount: isTechnician ? 0 : customers.length,
    sitesCount: isTechnician ? 0 : sites.length,
    upcoming_amc: upcomingAmc
  });
});

// --- CUSTOMERS & SITES (Strict RBAC: Tech = Limited/Forbidden) ---

function formatCustomerAddress(c) {
  if (!c) return '';
  const parts = [];
  if (c.villa_unit) {
    const v = c.villa_unit.toString().trim();
    parts.push(v.toLowerCase().startsWith('villa') || v.toLowerCase().startsWith('unit') ? v : `Villa ${v}`);
  }
  if (c.building_no) {
    const b = c.building_no.toString().trim();
    parts.push(b.toLowerCase().startsWith('building') || b.toLowerCase().startsWith('bldg') ? b : `Building ${b}`);
  }
  if (c.road_no) {
    const r = c.road_no.toString().trim();
    parts.push(r.toLowerCase().startsWith('road') ? r : `Road ${r}`);
  }
  if (c.area) parts.push(c.area.trim());
  if (c.block_no) {
    const blk = c.block_no.toString().trim();
    parts.push(blk.toLowerCase().startsWith('block') ? blk : `Block ${blk}`);
  }
  if (c.country) parts.push(c.country.trim());
  if (parts.length > 0) return parts.join(', ');
  return c.address || '';
}

function normalizeStr(str) {
  return (str || '').toString().toLowerCase().replace(/[\s\-_]/g, '');
}

function findCustomerDuplicates(newCust, excludeId = null) {
  const customers = db.get('customers') || [];
  const duplicates = [];

  const normName = normalizeStr(newCust.name);
  const normCr = normalizeStr(newCust.cr_no);
  const normVat = normalizeStr(newCust.vat_no);
  const normPhone = normalizeStr(newCust.phone);

  customers.forEach(existing => {
    if (excludeId && existing.id === excludeId) return;

    const reasons = [];
    if (normName && normalizeStr(existing.name) === normName) {
      reasons.push(`Matching Name: "${existing.name}"`);
    }
    if (normCr && normalizeStr(existing.cr_no) === normCr) {
      reasons.push(`Matching CR No: "${existing.cr_no}"`);
    }
    if (normVat && normalizeStr(existing.vat_no) === normVat) {
      reasons.push(`Matching VAT No: "${existing.vat_no}"`);
    }
    if (normPhone && normPhone.length >= 6 && normalizeStr(existing.phone).endsWith(normPhone.slice(-8))) {
      reasons.push(`Matching Phone: "${existing.phone}"`);
    }

    if (reasons.length > 0) {
      duplicates.push({
        id: existing.id,
        name: existing.name,
        customer_code: existing.customer_code,
        cr_no: existing.cr_no,
        vat_no: existing.vat_no,
        phone: existing.phone,
        address: formatCustomerAddress(existing),
        reasons,
        matchReasons: reasons
      });
    }
  });

  return duplicates;
}

function generateCustomerCode() {
  const customers = db.get('customers') || [];
  let maxSeq = 0;
  customers.forEach(c => {
    const code = c.customer_code || '';
    const m = code.match(/CUST(?:-BH)?-(\d+)/i) || code.match(/(\d+)$/);
    if (m) {
      const num = parseInt(m[1], 10);
      if (num > maxSeq) maxSeq = num;
    }
  });
  return `CUST-BH-${String(maxSeq + 1).padStart(3, '0')}`;
}

app.get('/api/customers', (req, res) => {
  if (req.user.role === 'Technician') {
    return res.status(403).json({ error: 'Access Denied', message: 'Technicians do not have access to full customer database.' });
  }

  const customers = db.get('customers') || [];
  const sites = db.get('sites') || [];
  const amcs = db.get('amc_contracts') || [];

  const searchQuery = (req.query.search || req.query.q || '').toLowerCase().trim();
  const statusFilter = req.query.status;

  const enriched = customers.map(c => {
    const custSites = sites.filter(s => s.customer_id === c.id);
    const custAmcs = amcs.filter(a => a.customer_id === c.id && ['Active', 'Approved'].includes(a.status || a.contract_status) && a.contract_status !== 'Expired');
    const combinedAddr = formatCustomerAddress(c);

    return {
      ...c,
      status: c.status || 'Active',
      code: c.customer_code || `CUST-BH-${c.id.replace(/\D/g, '').slice(-3) || '001'}`,
      customer_code: c.customer_code || `CUST-BH-${c.id.replace(/\D/g, '').slice(-3) || '001'}`,
      cr_no: c.cr_no || '',
      vat_no: c.vat_no || '',
      area: c.area || (c.address ? c.address.split(',')[0].trim() : 'Bahrain'),
      address: combinedAddr,
      formatted_address: combinedAddr,
      sites_count: custSites.length,
      active_amc_count: custAmcs.length
    };
  });

  let filtered = enriched;
  if (statusFilter && statusFilter !== 'all') {
    filtered = filtered.filter(c => c.status.toLowerCase() === statusFilter.toLowerCase());
  }

  if (searchQuery) {
    filtered = filtered.filter(c => 
      c.name.toLowerCase().includes(searchQuery) ||
      (c.customer_code && c.customer_code.toLowerCase().includes(searchQuery)) ||
      (c.code && c.code.toLowerCase().includes(searchQuery)) ||
      (c.cr_no && c.cr_no.toLowerCase().includes(searchQuery)) ||
      (c.vat_no && c.vat_no.toLowerCase().includes(searchQuery)) ||
      (c.phone && c.phone.toLowerCase().includes(searchQuery)) ||
      (c.contact_person && c.contact_person.toLowerCase().includes(searchQuery)) ||
      (c.area && c.area.toLowerCase().includes(searchQuery))
    );
  }

  res.json(filtered);
});

app.post('/api/customers/check-duplicate', (req, res) => {
  if (req.user.role === 'Technician') {
    return res.status(403).json({ error: 'Access Denied' });
  }
  const duplicates = findCustomerDuplicates(req.body, req.body.exclude_id);
  res.json({
    isDuplicate: duplicates.length > 0,
    hasDuplicates: duplicates.length > 0,
    duplicates
  });
});

app.get('/api/customers/:id/details', (req, res) => {
  if (req.user.role === 'Technician') {
    return res.status(403).json({ error: 'Access Denied', message: 'Technicians do not have access to customer management details.' });
  }

  const custId = req.params.id;
  const customer = db.getById('customers', custId);
  if (!customer) return res.status(404).json({ error: 'Customer not found' });

  const sites = (db.get('sites') || []).filter(s => s.customer_id === custId);
  const siteIds = new Set(sites.map(s => s.id));

  let amcContracts = (db.get('amc_contracts') || []).filter(a => a.customer_id === custId || siteIds.has(a.site_id));
  let jobs = (db.get('jobs') || []).filter(j => j.customer_id === custId || siteIds.has(j.site_id));
  const faults = (db.get('faults') || []).filter(f => f.customer_id === custId || siteIds.has(f.site_id));
  const reports = (db.get('reports') || []).filter(r => r.customer_id === custId || siteIds.has(r.site_id));
  let quotations = (db.get('quotations') || []).filter(q => q.customer_id === custId || siteIds.has(q.site_id));
  const auditLogs = (db.get('audit_logs') || []).filter(l => l.entity_id === custId || (l.details && l.details.includes(customer.name)));

  // If Sales user, filter own work
  if (req.user.role === 'Sales') {
    amcContracts = amcContracts.filter(a => a.sales_person_id === req.user.id);
    jobs = jobs.filter(j => j.sales_person_id === req.user.id);
    quotations = quotations.filter(q => q.sales_person_id === req.user.id);
  }

  const formattedAddress = formatCustomerAddress(customer);

  res.json({
    customer: {
      ...customer,
      status: customer.status || 'Active',
      customer_code: customer.customer_code || `CUST-BH-${customer.id.replace(/\D/g, '').slice(-3) || '001'}`,
      cr_no: customer.cr_no || '',
      vat_no: customer.vat_no || '',
      address: formattedAddress,
      formatted_address: formattedAddress
    },
    sites,
    amcContracts,
    jobs,
    faults,
    reports,
    quotations,
    history: auditLogs
  });
});

app.post('/api/customers', requirePermission('canManageCustomers'), (req, res) => {
  const { 
    name, customer_code, cr_no, vat_no, 
    villa_unit, building_no, road_no, block_no, area, country,
    contact_person, contact_mobile, phone, email, remarks, notes, status,
    force
  } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Customer name is required' });
  }

  // Duplicate customer check
  if (!force) {
    const duplicates = findCustomerDuplicates({ name, cr_no, vat_no, phone });
    if (duplicates.length > 0) {
      return res.status(409).json({
        error: 'Possible Existing Customer',
        message: 'A customer with similar details already exists in the system.',
        duplicates
      });
    }
  }

  const generatedCode = customer_code && customer_code.trim() ? customer_code.trim() : generateCustomerCode();
  const rawCountry = country && country.trim() ? country.trim() : 'Bahrain';

  const customerData = {
    name: name.trim(),
    customer_code: generatedCode,
    cr_no: (cr_no || '').trim(),
    vat_no: (vat_no || '').trim(),
    villa_unit: (villa_unit || '').trim(),
    building_no: (building_no || '').trim(),
    road_no: (road_no || '').trim(),
    block_no: (block_no || '').trim(),
    area: (area || '').trim(),
    country: rawCountry,
    contact_person: (contact_person || '').trim(),
    contact_mobile: (contact_mobile || '').trim(),
    phone: (phone || '').trim(),
    email: (email || '').trim(),
    remarks: (remarks || notes || '').trim(),
    notes: (remarks || notes || '').trim(),
    status: status || 'Active'
  };

  customerData.address = formatCustomerAddress(customerData);

  const newCust = db.insert('customers', customerData);

  // If a primary site name was optionally specified or default site created:
  let primarySite = null;
  const siteNameToUse = req.body.primary_site_name || req.body.site_name;
  if (siteNameToUse && siteNameToUse.trim()) {
    primarySite = db.insert('sites', {
      customer_id: newCust.id,
      site_name: siteNameToUse.trim(),
      site_address: customerData.address,
      contact_person: customerData.contact_person,
      contact_number: customerData.contact_mobile || customerData.phone,
      email: customerData.email,
      building_type: req.body.building_type || 'Commercial',
      equipment_info: req.body.equipment_info || '',
      notes: 'Initial primary site'
    });
  }

  db.logAudit(req.user.id, 'CREATE_CUSTOMER', 'customers', newCust.id, `Created customer ${newCust.name} (${newCust.customer_code}) with CR: ${newCust.cr_no || 'N/A'}, VAT: ${newCust.vat_no || 'N/A'}`);
  res.status(201).json({
    ...newCust,
    code: newCust.customer_code,
    primary_site_id: primarySite ? primarySite.id : null
  });
});

app.put('/api/customers/:id', requirePermission('canManageCustomers'), (req, res) => {
  const existing = db.getById('customers', req.params.id);
  if (!existing) return res.status(404).json({ error: 'Customer not found' });

  const {
    name, customer_code, cr_no, vat_no,
    villa_unit, building_no, road_no, block_no, area, country,
    contact_person, contact_mobile, phone, email, remarks, notes, status
  } = req.body;

  const updates = {};
  if (name !== undefined) updates.name = name.trim();
  if (customer_code !== undefined) updates.customer_code = customer_code.trim();
  if (cr_no !== undefined) updates.cr_no = cr_no.trim(); // CR No. IS EDITABLE
  if (vat_no !== undefined) updates.vat_no = vat_no.trim(); // VAT No. IS EDITABLE
  if (villa_unit !== undefined) updates.villa_unit = villa_unit.trim();
  if (building_no !== undefined) updates.building_no = building_no.trim();
  if (road_no !== undefined) updates.road_no = road_no.trim();
  if (block_no !== undefined) updates.block_no = block_no.trim();
  if (area !== undefined) updates.area = area.trim();
  if (country !== undefined) updates.country = country.trim();
  if (contact_person !== undefined) updates.contact_person = contact_person.trim();
  if (contact_mobile !== undefined) updates.contact_mobile = contact_mobile.trim();
  if (phone !== undefined) updates.phone = phone.trim();
  if (email !== undefined) updates.email = email.trim();
  if (remarks !== undefined) updates.remarks = remarks.trim();
  if (notes !== undefined) updates.notes = notes.trim();
  if (status !== undefined) updates.status = status;

  // Rebuild address
  const merged = { ...existing, ...updates };
  updates.address = formatCustomerAddress(merged);

  const updated = db.update('customers', req.params.id, updates);
  db.logAudit(req.user.id, 'UPDATE_CUSTOMER', 'customers', req.params.id, `Updated customer ${updated.name}`);
  res.json({
    ...updated,
    code: updated.customer_code,
    customer: { ...updated, code: updated.customer_code }
  });
});

app.delete('/api/customers/:id', (req, res) => {
  const existing = db.getById('customers', req.params.id);
  if (!existing) return res.status(404).json({ error: 'Customer not found' });

  // Access restricted strictly to GM, Engineer, and Supervisor
  if (!['GM', 'Engineer', 'Supervisor'].includes(req.user.role)) {
    return res.status(403).json({
      error: 'Access Denied',
      message: 'Access restricted: Only GM, Engineer, and Supervisor can delete customers.'
    });
  }

  const force = req.query.force === 'true' || req.body?.force === true;
  const sites = db.get('sites').filter(s => s.customer_id === req.params.id);
  const contracts = db.get('amc_contracts').filter(a => a.customer_id === req.params.id);
  const jobs = db.get('jobs').filter(j => j.customer_id === req.params.id);

  if (!force && (sites.length > 0 || contracts.length > 0 || jobs.length > 0)) {
    return res.status(400).json({
      error: 'Cannot delete customer',
      message: `Customer "${existing.name}" has ${sites.length} site(s), ${contracts.length} AMC contract(s), and ${jobs.length} job(s) linked. Do you want to permanently delete this customer and all linked records?`,
      linked_records: {
        sites_count: sites.length,
        contracts_count: contracts.length,
        jobs_count: jobs.length
      },
      requires_force: true
    });
  }

  // If force is true, clean up related sites, amc contracts, visits, jobs, and reports
  if (force) {
    const dbData = db.read();
    const contractIds = new Set(contracts.map(c => c.id));

    if (dbData.sites) {
      dbData.sites = dbData.sites.filter(s => s.customer_id !== req.params.id);
    }
    if (dbData.amc_contracts) {
      dbData.amc_contracts = dbData.amc_contracts.filter(c => c.customer_id !== req.params.id);
    }
    if (dbData.amc_visits) {
      dbData.amc_visits = dbData.amc_visits.filter(v => !contractIds.has(v.amc_contract_id) && !contractIds.has(v.amc_id));
    }
    if (dbData.jobs) {
      dbData.jobs = dbData.jobs.filter(j => j.customer_id !== req.params.id);
    }
    if (dbData.reports) {
      dbData.reports = dbData.reports.filter(r => r.customer_id !== req.params.id);
    }
    db.write(dbData);
  }

  db.delete('customers', req.params.id);
  db.logAudit(req.user.id, 'DELETE_CUSTOMER', 'customers', req.params.id, `Deleted customer ${existing.name} (${existing.customer_code || req.params.id})`);
  res.json({ success: true, message: `Customer ${existing.name} deleted successfully` });
});

app.get('/api/sites', (req, res) => {
  const sites = db.get('sites');
  if (req.user.role === 'Technician') {
    // Technician can only see sites for jobs assigned to them
    const jobs = db.get('jobs').filter(j => j.technician_id === req.user.id || (j.team && j.team.includes(req.user.name)));
    const siteIds = new Set(jobs.map(j => j.site_id));
    return res.json(sites.filter(s => siteIds.has(s.id)));
  }
  res.json(sites);
});

app.post('/api/sites', requirePermission('canManageSites'), (req, res) => {
  const { customer_id, site_name, site_address, contact_person, contact_number, email, building_type, site_location, equipment_info, notes } = req.body;
  if (!site_name || !customer_id) return res.status(400).json({ error: 'Site name and Customer ID are required' });
  const newSite = db.insert('sites', {
    customer_id,
    site_name,
    site_address: site_address || '',
    contact_person: contact_person || '',
    contact_number: contact_number || '',
    email: email || '',
    building_type: building_type || 'Commercial',
    site_location: site_location || '',
    equipment_info: equipment_info || '',
    notes: notes || ''
  });
  db.logAudit(req.user.id, 'CREATE_SITE', 'sites', newSite.id, `Created site ${site_name}`);
  res.status(201).json(newSite);
});

app.get('/api/sites/:id/details', (req, res) => {
  const siteId = req.params.id;
  const site = db.getById('sites', siteId);
  if (!site) return res.status(404).json({ error: 'Site not found' });

  const customer = db.getById('customers', site.customer_id);
  let amcContracts = db.get('amc_contracts').filter(a => a.site_id === siteId);
  const reports = db.get('reports').filter(r => r.site_id === siteId);
  let jobs = db.get('jobs').filter(j => j.site_id === siteId);
  const faults = db.get('faults').filter(f => f.site_id === siteId);
  let quotations = db.get('quotations').filter(q => q.site_id === siteId);

  // Sales data isolation check
  if (req.user.role === 'Sales') {
    amcContracts = amcContracts.filter(a => a.sales_person_id === req.user.id);
    jobs = jobs.filter(j => j.sales_person_id === req.user.id);
    quotations = quotations.filter(q => q.sales_person_id === req.user.id);
  }

  // Mask financial values if technician
  if (req.user.role === 'Technician') {
    amcContracts = amcContracts.map(a => sanitizeContractForRole(a, req.user));
    jobs = jobs.map(j => sanitizeJobForRole(j, req.user));
    return res.json({
      site,
      customer,
      amcContracts,
      reports,
      jobs,
      faults
    });
  }

  res.json({
    site,
    customer,
    amcContracts,
    reports,
    jobs,
    faults,
    quotations
  });
});

// --- AMC CONTRACT MANAGEMENT & APPROVAL WORKFLOW ---
// Handles both /api/amc-contracts and /api/amc
const getAmcContractsHandler = (req, res) => {
  if (req.user.role === 'Technician') {
    return res.status(403).json({ error: 'Access Denied', message: 'Technicians do not have access to AMC Contracts.' });
  }

  let amcs = db.get('amc_contracts') || [];
  const customers = db.get('customers') || [];
  const sites = db.get('sites') || [];
  const users = db.get('users') || [];
  const allVisits = db.get('amc_visits') || [];
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  // Strict backend data isolation for Sales: only own contracts
  if (req.user.role === 'Sales') {
    amcs = amcs.filter(c => c.sales_person_id === req.user.id);
  }

  // Filter for management if query param passed
  if (req.query.sales_person_id && req.query.sales_person_id !== 'All') {
    amcs = amcs.filter(c => c.sales_person_id === req.query.sales_person_id);
  }

  // Filter by status if query param passed
  if (req.query.status && req.query.status !== 'All') {
    amcs = amcs.filter(c => {
      const s = c.status || c.contract_status || 'Draft';
      return s.toLowerCase() === req.query.status.toLowerCase();
    });
  }

  const enhanced = amcs.map(contract => {
    const endDate = new Date(contract.end_date);
    const diffTime = endDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let autoStatus = contract.status || contract.contract_status || 'Draft';
    // Only Active/Approved contracts undergo automatic expiry status calculation
    if (!['Draft', 'Submitted', 'Returned for Correction', 'Renewed', 'Cancelled'].includes(autoStatus)) {
      if (diffDays < 0) {
        autoStatus = 'Expired';
      } else if (diffDays <= 60) {
        autoStatus = 'Expiring Soon';
      } else {
        autoStatus = 'Active';
      }
    }

    // Calculate next visit
    let nextVisit = 'None scheduled';
    if (['Draft', 'Submitted', 'Returned for Correction'].includes(autoStatus)) {
      nextVisit = 'Pending Approval';
    } else {
      const contractVisits = allVisits.filter(v => (v.amc_contract_id === contract.id || v.amc_id === contract.id) && v.status !== 'Completed');
      contractVisits.sort((a, b) => (a.scheduled_date || '').localeCompare(b.scheduled_date || ''));
      const upcoming = contractVisits.find(v => (v.scheduled_date || '') >= todayStr) || contractVisits[0];
      if (upcoming && upcoming.scheduled_date) {
        nextVisit = `${upcoming.scheduled_date} (${upcoming.system_type || upcoming.system || 'Inspection'})`;
      }
    }

    const customer = customers.find(c => c.id === contract.customer_id);
    const site = sites.find(s => s.id === contract.site_id);
    const sp = users.find(u => u.id === contract.sales_person_id);
    const spName = sp ? sp.name : (contract.sales_person_name || 'Unassigned');

    const numVal = Number(contract.contract_value) || 0;
    const vatPct = contract.vat_percent !== undefined ? Number(contract.vat_percent) : 10;
    const vatAmt = contract.vat_amount !== undefined ? Number(contract.vat_amount) : Math.round(numVal * (vatPct / 100) * 1000) / 1000;
    const totalIncVat = contract.total_including_vat !== undefined ? Number(contract.total_including_vat) : Math.round((numVal + vatAmt) * 1000) / 1000;

    const sanitized = sanitizeContractForRole({
      ...contract,
      contract_value: numVal,
      vat_percent: vatPct,
      vat_amount: vatAmt,
      total_including_vat: totalIncVat
    }, req.user);

    return {
      ...sanitized,
      contract_status: autoStatus,
      status: autoStatus,
      days_to_expiry: diffDays,
      next_visit: nextVisit,
      customer_name: customer ? customer.name : 'Unknown Customer',
      site_name: site ? site.site_name : 'Unknown Site',
      sales_person_id: contract.sales_person_id,
      sales_person_name: spName,
      contract_start_date: contract.start_date,
      contract_end_date: contract.end_date,
      contract_period: `${contract.start_date} to ${contract.end_date}`,
      quarter: db.getQuarter(contract.start_date)
    };
  });

  res.json(enhanced);
};

app.get('/api/amc-contracts', getAmcContractsHandler);
app.get('/api/amc', getAmcContractsHandler);

const getAmcContractByIdHandler = (req, res) => {
  const contract = db.getById('amc_contracts', req.params.id);
  if (!contract) return res.status(404).json({ error: 'Contract not found' });

  // Sales data isolation check (Requirement 2 & 3)
  if (req.user.role === 'Sales' && contract.sales_person_id !== req.user.id) {
    return res.status(403).json({ error: 'Access Denied', message: 'You are not authorized to view another salesperson\'s AMC contract.' });
  }

  if (req.user.role === 'Technician') {
    return res.status(403).json({ error: 'Access Denied', message: 'Technicians do not have access to AMC Contracts.' });
  }

  const customers = db.get('customers') || [];
  const sites = db.get('sites') || [];
  const users = db.get('users') || [];
  const allVisits = db.get('amc_visits') || [];
  const allReports = db.get('reports') || [];
  const allFaults = db.get('faults') || [];

  const customer = customers.find(c => c.id === contract.customer_id);
  const site = sites.find(s => s.id === contract.site_id);
  const sp = users.find(u => u.id === contract.sales_person_id);
  const spName = sp ? sp.name : (contract.sales_person_name || 'Unassigned');

  const visits = allVisits.filter(v => v.amc_contract_id === contract.id || v.amc_id === contract.id);
  const reports = allReports.filter(r => r.amc_id === contract.id || r.amc_contract_id === contract.id || r.amc_number === contract.contract_number);
  const faults = allFaults.filter(f => f.customer_id === contract.customer_id && (!contract.site_id || f.site_id === contract.site_id));

  const numVal = Number(contract.contract_value) || 0;
  const vatPct = contract.vat_percent !== undefined ? Number(contract.vat_percent) : 10;
  const vatAmt = contract.vat_amount !== undefined ? Number(contract.vat_amount) : Math.round(numVal * (vatPct / 100) * 1000) / 1000;
  const totalIncVat = contract.total_including_vat !== undefined ? Number(contract.total_including_vat) : Math.round((numVal + vatAmt) * 1000) / 1000;

  const sanitized = sanitizeContractForRole({
    ...contract,
    contract_value: numVal,
    vat_percent: vatPct,
    vat_amount: vatAmt,
    total_including_vat: totalIncVat
  }, req.user);

  res.json({
    ...sanitized,
    customer_name: customer ? customer.name : 'Unknown Customer',
    site_name: site ? site.site_name : 'Unknown Site',
    sales_person_id: contract.sales_person_id,
    sales_person_name: spName,
    contract_start_date: contract.start_date,
    contract_end_date: contract.end_date,
    contract_period: `${contract.start_date} to ${contract.end_date}`,
    quarter: db.getQuarter(contract.start_date),
    visits,
    reports,
    faults
  });
};

app.get('/api/amc-contracts/:id', getAmcContractByIdHandler);
app.get('/api/amc/:id', getAmcContractByIdHandler);

const postAmcContractHandler = (req, res) => {
  const { customer_id, site_id, contract_type, start_date, end_date, renewal_date, systems, systems_covered, contract_value, contact_person, remarks, reminder_days, quotation_number, frequency, visit_frequency, vat_percent } = req.body;
  if (!customer_id || !site_id || !start_date || !end_date) {
    return res.status(400).json({ error: 'Customer, Site, Start Date and End Date are required.' });
  }

  const isSales = req.user.role === 'Sales';
  const users = db.get('users') || [];
  // If Sales user, lock sales_person_id to the logged-in user; otherwise allow selection
  const sales_person_id = isSales ? req.user.id : (req.body.sales_person_id || users.find(u => u.role === 'Sales')?.id || req.user.id);
  const sp = users.find(u => u.id === sales_person_id);
  const sales_person_name = sp ? sp.name : 'Unassigned';

  // Status handling:
  let status = req.body.status || (isSales ? 'Draft' : 'Active');
  if (isSales && !['Draft', 'Submitted'].includes(status)) {
    status = 'Draft';
  }

  // Contract number:
  let contract_number = req.body.contract_number;
  if (!contract_number) {
    if (status === 'Draft' || status === 'Submitted') {
      const year = new Date().getFullYear();
      const rand = Math.floor(1000 + Math.random() * 9000);
      contract_number = `DRAFT-${year}-${rand}`;
    } else {
      contract_number = db.generateAmcContractNumber();
    }
  }

  const systemsArr = systems || systems_covered || ["Fire Alarm", "Fire Fighting"];
  const numValue = Number(contract_value) || 0;
  const vatCalc = db.calculateVat(numValue, vat_percent);

  const newContract = db.insert('amc_contracts', {
    contract_number,
    customer_id,
    site_id,
    sales_person_id,
    sales_person_name,
    contract_type: contract_type || 'Comprehensive',
    start_date,
    end_date,
    renewal_date: renewal_date || end_date,
    contract_status: status,
    status: status,
    systems: Array.isArray(systemsArr) ? systemsArr : [systemsArr],
    systems_covered: Array.isArray(systemsArr) ? systemsArr : [systemsArr],
    visit_frequency: frequency || visit_frequency || 'System-Specific',
    quotation_number: quotation_number || '',
    contract_value: vatCalc.amount,
    vat_percent: vatCalc.vat_percent,
    vat_amount: vatCalc.vat_amount,
    total_including_vat: vatCalc.total_including_vat,
    currency: "BHD",
    contact_person: contact_person || '',
    remarks: remarks || '',
    reminder_days: reminder_days || [90, 60, 30, 7],
    submitted_at: status === 'Submitted' ? new Date().toISOString() : null,
    created_by: req.user.id,
    created_at: new Date().toISOString()
  });

  // Automatically calculate and generate system visit schedules (Requirements 5, 6, 7)
  const visits = db.generateAmcVisits(newContract);

  db.logAudit(req.user.id, 'CREATE_AMC', 'amc_contracts', newContract.id, `Created AMC contract ${contract_number} (Status: ${status}) with ${visits.length} system visits`);
  res.status(201).json({ ...newContract, generated_visits_count: visits.length });
};

app.post('/api/amc-contracts', requirePermission('canManageContracts'), postAmcContractHandler);
app.post('/api/amc', requirePermission('canManageContracts'), postAmcContractHandler);

const putAmcContractHandler = (req, res) => {
  const existing = db.getById('amc_contracts', req.params.id);
  if (!existing) return res.status(404).json({ error: 'Contract not found' });

  // Access restricted strictly to GM, Engineer, and Supervisor
  if (!['GM', 'Engineer', 'Supervisor'].includes(req.user.role)) {
    return res.status(403).json({
      error: 'Access Denied',
      message: 'Access restricted: Only GM, Engineer, and Supervisor can edit AMC contracts.'
    });
  }

  const updated = db.updateAmcContract(req.params.id, req.body);
  db.logAudit(req.user.id, 'UPDATE_AMC', 'amc_contracts', req.params.id, `Updated AMC contract ${existing.contract_number}`);
  res.json(updated);
};

app.put('/api/amc-contracts/:id', requirePermission('canManageContracts'), putAmcContractHandler);
app.put('/api/amc/:id', requirePermission('canManageContracts'), putAmcContractHandler);

// Submit AMC Contract for Approval (Sales or Management)
const submitAmcContractHandler = (req, res) => {
  const existing = db.getById('amc_contracts', req.params.id);
  if (!existing) return res.status(404).json({ error: 'Contract not found' });

  if (req.user.role === 'Sales' && existing.sales_person_id !== req.user.id) {
    return res.status(403).json({ error: 'Access Denied', message: 'You cannot submit another salesperson\'s AMC contract.' });
  }

  if (existing.status === 'Active' || existing.status === 'Approved') {
    return res.status(400).json({ error: 'Contract is already active or approved.' });
  }

  const updated = db.updateAmcContract(req.params.id, {
    status: 'Submitted',
    contract_status: 'Submitted',
    submitted_at: new Date().toISOString(),
    submission_notes: req.body.notes || req.body.remarks || existing.remarks || ''
  });

  db.logAudit(req.user.id, 'SUBMIT_AMC', 'amc_contracts', req.params.id, `Submitted contract ${existing.contract_number} for approval`);
  res.json(updated);
};

app.post('/api/amc-contracts/:id/submit', submitAmcContractHandler);
app.post('/api/amc/:id/submit', submitAmcContractHandler);

// Approve AMC Contract (Management: GM, Engineer, Supervisor ONLY. Sales STRICTLY FORBIDDEN)
const approveAmcContractHandler = (req, res) => {
  // Sales MUST NOT be able to approve
  if (req.user.role === 'Sales') {
    return res.status(403).json({
      error: 'Access Denied',
      message: 'Sales users cannot approve AMC contracts. Approval is restricted to GM, Engineer, and Supervisor roles.'
    });
  }

  if (req.user.role === 'Technician') {
    return res.status(403).json({ error: 'Access Denied', message: 'Technicians cannot approve AMC contracts.' });
  }

  const existing = db.getById('amc_contracts', req.params.id);
  if (!existing) return res.status(404).json({ error: 'Contract not found' });

  // Allocate official contract number if currently Draft
  let officialNumber = existing.contract_number;
  if (!officialNumber || officialNumber.startsWith('DRAFT-')) {
    officialNumber = db.generateAmcContractNumber();
  }

  const updated = db.updateAmcContract(req.params.id, {
    status: 'Active',
    contract_status: 'Active',
    contract_number: officialNumber,
    approved_by: req.user.id,
    approved_by_name: req.user.name,
    approved_at: new Date().toISOString(),
    approval_notes: req.body.notes || req.body.remarks || 'Approved by management'
  });

  // Automatically generate system visit schedules on approval
  const visits = db.generateAmcVisits(updated);

  db.logAudit(req.user.id, 'APPROVE_AMC', 'amc_contracts', req.params.id, `Approved AMC contract ${officialNumber} by ${req.user.name}. Generated ${visits.length} system visits.`);
  res.json({ ...updated, generated_visits_count: visits.length });
};

app.post('/api/amc-contracts/:id/approve', approveAmcContractHandler);
app.post('/api/amc/:id/approve', approveAmcContractHandler);

// Return AMC Contract for Correction (Management: GM, Engineer, Supervisor)
const returnAmcContractHandler = (req, res) => {
  if (req.user.role === 'Sales' || req.user.role === 'Technician') {
    return res.status(403).json({
      error: 'Access Denied',
      message: 'Only GM, Engineer, or Supervisor can return contracts for correction.'
    });
  }

  const existing = db.getById('amc_contracts', req.params.id);
  if (!existing) return res.status(404).json({ error: 'Contract not found' });

  const notes = req.body.remarks || req.body.reason || req.body.notes || 'Please revise and resubmit.';

  const updated = db.updateAmcContract(req.params.id, {
    status: 'Returned for Correction',
    contract_status: 'Returned for Correction',
    return_notes: notes,
    returned_by: req.user.name,
    returned_at: new Date().toISOString()
  });

  db.logAudit(req.user.id, 'RETURN_AMC', 'amc_contracts', req.params.id, `Returned AMC contract ${existing.contract_number} for correction: ${notes}`);
  res.json(updated);
};

app.post('/api/amc-contracts/:id/return', returnAmcContractHandler);
app.post('/api/amc/:id/return', returnAmcContractHandler);

// AMC Renewal Endpoint (Requirement 24)
const renewAmcContractHandler = (req, res) => {
  const existing = db.getById('amc_contracts', req.params.id);
  if (!existing) return res.status(404).json({ error: 'Contract not found' });

  if (req.user.role === 'Sales' && existing.sales_person_id !== req.user.id) {
    return res.status(403).json({ error: 'Access Denied', message: 'You cannot renew another salesperson\'s AMC contract.' });
  }

  const renewed = db.renewAmcContract(req.params.id, req.body);
  if (!renewed) return res.status(500).json({ error: 'Failed to renew contract' });

  db.logAudit(req.user.id, 'RENEW_AMC', 'amc_contracts', renewed.id, `Renewed AMC contract ${existing.contract_number} -> ${renewed.contract_number}`);
  res.status(201).json(renewed);
};

app.post('/api/amc-contracts/:id/renew', requirePermission('canManageContracts'), renewAmcContractHandler);
app.post('/api/amc/:id/renew', requirePermission('canManageContracts'), renewAmcContractHandler);

const deleteAmcContractHandler = (req, res) => {
  const existing = db.getById('amc_contracts', req.params.id);
  if (!existing) return res.status(404).json({ error: 'Contract not found' });

  // Access restricted strictly to GM, Engineer, and Supervisor
  if (!['GM', 'Engineer', 'Supervisor'].includes(req.user.role)) {
    return res.status(403).json({
      error: 'Access Denied',
      message: 'Access restricted: Only GM, Engineer, and Supervisor can delete AMC contracts.'
    });
  }

  const success = db.delete('amc_contracts', req.params.id);
  if (!success) return res.status(404).json({ error: 'Contract not found' });

  // Also remove any visits associated with this contract if any
  const dbData = db.read();
  if (dbData.amc_visits) {
    dbData.amc_visits = dbData.amc_visits.filter(v => v.amc_contract_id !== req.params.id && v.amc_id !== req.params.id);
    db.write(dbData);
  }

  db.logAudit(req.user.id, 'DELETE_AMC', 'amc_contracts', req.params.id, `Deleted AMC contract ${existing.contract_number}`);
  res.json({ message: 'AMC contract deleted' });
};

app.delete('/api/amc-contracts/:id', deleteAmcContractHandler);
app.delete('/api/amc/:id', deleteAmcContractHandler);

// --- AMC VISIT SCHEDULING (Requirements 19-28) ---
app.get('/api/amc-visits', (req, res) => {
  let visits = db.get('amc_visits');
  const amcs = db.get('amc_contracts');
  const sites = db.get('sites');
  const customers = db.get('customers');
  const users = db.get('users');

  // Sales role isolation
  if (req.user.role === 'Sales') {
    visits = visits.filter(v => v.sales_person_id === req.user.id);
  }

  // Technician role isolation
  if (req.user.role === 'Technician') {
    visits = visits.filter(v => v.technician_id === req.user.id || v.assigned_technician === req.user.id);
  }

  // Filters
  if (req.query.system_type && req.query.system_type !== 'All') {
    visits = visits.filter(v => v.system_type === req.query.system_type || v.system === req.query.system_type);
  }

  if (req.query.status && req.query.status !== 'All') {
    visits = visits.filter(v => (v.status || v.visit_status) === req.query.status);
  }

  if (req.query.sales_person_id && req.query.sales_person_id !== 'All') {
    visits = visits.filter(v => v.sales_person_id === req.query.sales_person_id);
  }

  const enhanced = visits.map(v => {
    const amc = amcs.find(a => a.id === (v.amc_contract_id || v.amc_id));
    const site = sites.find(s => s.id === v.site_id || (amc && s.id === amc.site_id));
    const customer = customers.find(c => c.id === v.customer_id || (amc && c.id === amc.customer_id));
    const sp = users.find(u => u.id === v.sales_person_id);
    const tech = users.find(u => u.id === (v.assigned_technician || v.technician_id));

    return {
      ...v,
      quarter: v.quarter || db.getQuarter(v.scheduled_date),
      day: v.day || db.getDayName(v.scheduled_date),
      day_of_week: v.day_of_week || v.day || db.getDayName(v.scheduled_date),
      status: v.status || v.visit_status || 'Scheduled',
      contract_number: v.contract_number || (amc ? amc.contract_number : 'AMC-2026'),
      site_name: site ? site.site_name : 'N/A',
      site_address: site ? site.site_address : 'N/A',
      customer_name: customer ? customer.name : 'N/A',
      sales_person_name: sp ? sp.name : 'Unassigned',
      technician_name: tech ? tech.name : 'Rajesh Kumar'
    };
  });

  // Sort by date ascending
  enhanced.sort((a, b) => (a.scheduled_date || '').localeCompare(b.scheduled_date || ''));

  res.json(enhanced);
});

// AMC Monthly Schedule Screen Endpoint (Requirements 25-27)
app.get('/api/amc-visits/monthly', (req, res) => {
  const year = parseInt(req.query.year, 10) || new Date().getFullYear();
  const month = parseInt(req.query.month, 10) || (new Date().getMonth() + 1);

  const filters = {
    system_type: req.query.system_type,
    status: req.query.status,
    technician_id: req.query.technician_id,
    customer_id: req.query.customer_id
  };

  if (req.user.role === 'Sales') {
    filters.sales_person_id = req.user.id;
  } else if (req.query.sales_person_id && req.query.sales_person_id !== 'All') {
    filters.sales_person_id = req.query.sales_person_id;
  }

  const result = db.getMonthlyAmcSchedule(year, month, filters);
  res.json(result);
});

// Upcoming AMC Visits Endpoint (Requirement 28)
app.get('/api/amc-visits/upcoming', (req, res) => {
  const salesPersonId = req.user.role === 'Sales' ? req.user.id : (req.query.sales_person_id || null);
  const result = db.getUpcomingAmcVisits(salesPersonId);
  res.json(result);
});

app.post('/api/amc-visits', requirePermission('canScheduleVisits'), (req, res) => {
  const { amc_id, amc_contract_id, visit_number, scheduled_date, technician_id, assigned_technician, system_type, system, remarks, assigned_team } = req.body;
  const contractId = amc_contract_id || amc_id;
  if (!contractId || !scheduled_date) return res.status(400).json({ error: 'AMC ID and Scheduled Date are required.' });

  const amc = db.getById('amc_contracts', contractId);

  const newVisit = db.insert('amc_visits', {
    amc_contract_id: contractId,
    amc_id: contractId,
    contract_number: amc ? amc.contract_number : 'AMC-2026',
    customer_id: amc ? amc.customer_id : req.body.customer_id,
    site_id: amc ? amc.site_id : req.body.site_id,
    sales_person_id: amc ? amc.sales_person_id : null,
    visit_number: visit_number || 1,
    scheduled_date,
    technician_id: technician_id || assigned_technician || 'usr-tech',
    assigned_technician: technician_id || assigned_technician || 'usr-tech',
    assigned_team: assigned_team || 'Team Alpha (Tariq & Rajesh)',
    system_type: system_type || system || 'Fire Alarm',
    system: system_type || system || 'Fire Alarm',
    status: 'Scheduled',
    visit_status: 'Scheduled',
    remarks: remarks || ''
  });

  db.logAudit(req.user.id, 'SCHEDULE_AMC_VISIT', 'amc_visits', newVisit.id, `Scheduled AMC visit for ${scheduled_date}`);
  res.status(201).json(newVisit);
});

app.put('/api/amc-visits/:id', (req, res) => {
  const existing = db.getById('amc_visits', req.params.id);
  if (!existing) return res.status(404).json({ error: 'Visit not found' });

  // Status transition or rescheduling
  const updates = { ...req.body };
  if (updates.status && !updates.visit_status) updates.visit_status = updates.status;
  if (updates.visit_status && !updates.status) updates.status = updates.visit_status;

  const updated = db.update('amc_visits', req.params.id, updates);
  db.logAudit(req.user.id, 'UPDATE_AMC_VISIT', 'amc_visits', req.params.id, `Updated visit to ${updates.status || 'Updated'}`);
  res.json(updated);
});

// --- JOBS MANAGEMENT (Requirements 2-11, 32-37) ---
app.get('/api/jobs', (req, res) => {
  let jobs = db.get('jobs');
  const customers = db.get('customers');
  const sites = db.get('sites');
  const users = db.get('users');

  // 1. Strict backend data isolation for Sales (Requirement 2 & 3)
  if (req.user.role === 'Sales') {
    jobs = jobs.filter(j => j.sales_person_id === req.user.id);
  }

  // 2. Technician role filter
  if (req.user.role === 'Technician') {
    jobs = jobs.filter(j => j.technician_id === req.user.id || (j.team && j.team.includes(req.user.name)));
  }

  // 3. Management query filters
  if (req.query.sales_person_id && req.query.sales_person_id !== 'All') {
    jobs = jobs.filter(j => j.sales_person_id === req.query.sales_person_id);
  }

  if (req.query.job_type && req.query.job_type !== 'All') {
    jobs = jobs.filter(j => j.job_type === req.query.job_type);
  }

  if (req.query.status && req.query.status !== 'All') {
    jobs = jobs.filter(j => j.status === req.query.status);
  }

  if (req.query.customer_id && req.query.customer_id !== 'All') {
    jobs = jobs.filter(j => j.customer_id === req.query.customer_id);
  }

  const enhanced = jobs.map(j => {
    const cust = customers.find(c => c.id === j.customer_id);
    const site = sites.find(s => s.id === j.site_id);
    const sp = users.find(u => u.id === j.sales_person_id);
    const sup = users.find(u => u.id === j.supervisor_id);
    const tech = users.find(u => u.id === j.technician_id);

    const numAmount = Number(j.amount) || 0;
    const vatPct = j.vat_percent !== undefined ? Number(j.vat_percent) : 10;
    const vatAmt = j.vat_amount !== undefined ? Number(j.vat_amount) : Math.round(numAmount * (vatPct / 100) * 1000) / 1000;
    const totalIncVat = j.total_including_vat !== undefined ? Number(j.total_including_vat) : Math.round((numAmount + vatAmt) * 1000) / 1000;

    // Sanitize financial values for Technician (Requirement 33)
    const sanitized = sanitizeJobForRole({
      ...j,
      amount: numAmount,
      vat_percent: vatPct,
      vat_amount: vatAmt,
      total_including_vat: totalIncVat
    }, req.user);

    return {
      ...sanitized,
      customer_name: cust ? cust.name : 'Unknown',
      site_name: site ? site.site_name : 'Unknown Site',
      site_address: site ? site.site_address : '',
      sales_person_id: j.sales_person_id,
      sales_person_name: sp ? sp.name : (j.sales_person_name || 'Unassigned'),
      supervisor_name: sup ? sup.name : 'Tariq Mahmoud',
      technician_name: tech ? tech.name : 'Rajesh Kumar'
    };
  });

  res.json(enhanced);
});

app.get('/api/jobs/:id', (req, res) => {
  const job = db.getById('jobs', req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found' });

  // Sales data isolation check (Requirement 2 & 3)
  if (req.user.role === 'Sales' && job.sales_person_id !== req.user.id) {
    return res.status(403).json({ error: 'Access Denied', message: 'You are not authorized to view another salesperson\'s job.' });
  }

  // Technician check
  if (req.user.role === 'Technician' && job.technician_id !== req.user.id && (!job.team || !job.team.includes(req.user.name))) {
    return res.status(403).json({ error: 'Access Denied', message: 'You are not assigned to this job.' });
  }

  const users = db.get('users') || [];
  const sp = users.find(u => u.id === job.sales_person_id);

  const numAmount = Number(job.amount) || 0;
  const vatPct = job.vat_percent !== undefined ? Number(job.vat_percent) : 10;
  const vatAmt = job.vat_amount !== undefined ? Number(job.vat_amount) : Math.round(numAmount * (vatPct / 100) * 1000) / 1000;
  const totalIncVat = job.total_including_vat !== undefined ? Number(job.total_including_vat) : Math.round((numAmount + vatAmt) * 1000) / 1000;

  res.json(sanitizeJobForRole({
    ...job,
    amount: numAmount,
    vat_percent: vatPct,
    vat_amount: vatAmt,
    total_including_vat: totalIncVat,
    sales_person_name: sp ? sp.name : (job.sales_person_name || 'Unassigned')
  }, req.user));
});

app.post('/api/jobs', (req, res) => {
  const { 
    job_type, customer_id, site_id, sales_person_id, supervisor_id, technician_id, 
    system_type, description, amount, currency, quotation_number, 
    expected_start_date, expected_completion_date, status, remarks, materials_used,
    vat_percent
  } = req.body;
  
  // Technician cannot create jobs
  if (req.user.role === 'Technician') {
    return res.status(403).json({ error: 'Access Denied', message: 'Technicians cannot create jobs.' });
  }

  if (!customer_id || !site_id) {
    return res.status(400).json({ error: 'Customer and Site are required.' });
  }

  const selectedType = job_type || 'AMC';
  const job_number = db.generateJobNumber(selectedType);

  // If Sales user, enforce sales_person_id = req.user.id; otherwise resolve selected sales person
  const users = db.get('users') || [];
  const assignedSalesId = (req.user.role === 'Sales') ? req.user.id : (sales_person_id || users.find(u => u.role === 'Sales')?.id || req.user.id);
  const sp = users.find(u => u.id === assignedSalesId);
  const sales_person_name = sp ? sp.name : 'Unassigned';

  const numAmount = Number(amount) || 0;
  const vatCalc = db.calculateVat(numAmount, vat_percent);

  const newJob = db.insert('jobs', {
    job_number,
    job_type: selectedType,
    customer_id,
    site_id,
    sales_person_id: assignedSalesId,
    sales_person_name: sales_person_name,
    supervisor_id: supervisor_id || 'usr-sup',
    technician_id: technician_id || 'usr-tech',
    system_type: system_type || 'Fire Alarm & Detection',
    description: description || '',
    amount: vatCalc.amount,
    vat_percent: vatCalc.vat_percent,
    vat_amount: vatCalc.vat_amount,
    total_including_vat: vatCalc.total_including_vat,
    currency: currency || 'BHD',
    quotation_number: quotation_number || '',
    expected_start_date: expected_start_date || new Date().toISOString().slice(0, 10),
    expected_completion_date: expected_completion_date || '',
    date: expected_start_date || new Date().toISOString().slice(0, 10),
    status: status || 'New',
    remarks: remarks || '',
    materials_used: materials_used || [],
    photos: [],
    report_id: null,
    created_by: req.user.id
  });

  db.logAudit(req.user.id, 'CREATE_JOB', 'jobs', newJob.id, `Created job ${job_number} (${selectedType})`);
  res.status(201).json(newJob);
});

app.put('/api/jobs/:id', (req, res) => {
  const existing = db.getById('jobs', req.params.id);
  if (!existing) return res.status(404).json({ error: 'Job not found' });

  // Access restricted strictly to GM, Engineer, and Supervisor
  if (!['GM', 'Engineer', 'Supervisor'].includes(req.user.role)) {
    return res.status(403).json({
      error: 'Access Denied',
      message: 'Access restricted: Only GM, Engineer, and Supervisor can edit jobs, fit-outs, and projects.'
    });
  }

  const updates = { ...req.body };
  if (updates.amount !== undefined || updates.vat_percent !== undefined) {
    const numAmount = updates.amount !== undefined ? Number(updates.amount) : (Number(existing.amount) || 0);
    const numVatPercent = updates.vat_percent !== undefined ? Number(updates.vat_percent) : (existing.vat_percent !== undefined ? Number(existing.vat_percent) : 10);
    const vatCalc = db.calculateVat(numAmount, numVatPercent);
    updates.amount = vatCalc.amount;
    updates.vat_percent = vatCalc.vat_percent;
    updates.vat_amount = vatCalc.vat_amount;
    updates.total_including_vat = vatCalc.total_including_vat;
  }

  if (updates.sales_person_id) {
    const users = db.get('users') || [];
    const sp = users.find(u => u.id === updates.sales_person_id);
    updates.sales_person_name = sp ? sp.name : 'Unassigned';
  }

  const updated = db.update('jobs', req.params.id, updates);
  db.logAudit(req.user.id, 'UPDATE_JOB', 'jobs', req.params.id, `Updated job ${existing.job_number} (${existing.job_type})`);
  res.json(sanitizeJobForRole(updated, req.user));
});

app.delete('/api/jobs/:id', (req, res) => {
  const existing = db.getById('jobs', req.params.id);
  if (!existing) return res.status(404).json({ error: 'Job not found' });

  // Access restricted strictly to GM, Engineer, and Supervisor
  if (!['GM', 'Engineer', 'Supervisor'].includes(req.user.role)) {
    return res.status(403).json({
      error: 'Access Denied',
      message: 'Access restricted: Only GM, Engineer, and Supervisor can delete jobs, fit-outs, and projects.'
    });
  }

  db.delete('jobs', req.params.id);
  db.logAudit(req.user.id, 'DELETE_JOB', 'jobs', req.params.id, `Deleted job ${existing.job_number} (${existing.job_type})`);
  res.json({ message: 'Job deleted successfully' });
});

// --- SALES MONTHLY REPORT (Requirement 31) ---
app.get('/api/sales/monthly-report', (req, res) => {
  const year = parseInt(req.query.year, 10) || new Date().getFullYear();
  const month = parseInt(req.query.month, 10) || (new Date().getMonth() + 1);

  // If Sales user, strictly force sales_person_id to req.user.id
  let targetSalesId = req.user.id;
  if (['GM', 'Engineer', 'Supervisor'].includes(req.user.role) && req.query.sales_person_id) {
    targetSalesId = req.query.sales_person_id;
  }

  const report = db.getSalesMonthlyReport(targetSalesId, year, month);
  res.json(report);
});

// Dedicated Sales Dashboard Stats Endpoint
app.get('/api/sales/dashboard-stats', (req, res) => {
  let targetSalesId = req.user.id;
  if (['GM', 'Engineer', 'Supervisor'].includes(req.user.role) && req.query.sales_person_id) {
    targetSalesId = req.query.sales_person_id;
  }
  const salesStats = db.getSalesDashboardStats(targetSalesId);
  const upcomingAmc = db.getUpcomingAmcVisits(targetSalesId);
  res.json({
    role: 'Sales',
    ...salesStats,
    upcoming_amc: upcomingAmc
  });
});


// --- FAULTS MANAGEMENT ---
app.get('/api/faults', (req, res) => {
  const faults = db.get('faults');
  const customers = db.get('customers');
  const sites = db.get('sites');

  const enhanced = faults.map(f => {
    const cust = customers.find(c => c.id === f.customer_id);
    const site = sites.find(s => s.id === f.site_id);
    return {
      ...f,
      customer_name: cust ? cust.name : 'Unknown',
      site_name: site ? site.site_name : 'Unknown Site'
    };
  });

  res.json(enhanced);
});

app.post('/api/faults', (req, res) => {
  const { customer_id, site_id, system, location, device_equipment, fault_description, cause, action_taken, materials_used, before_photo, after_photo, status } = req.body;
  const count = db.get('faults').length + 1;
  const fault_number = `FLT-${new Date().getFullYear()}-${String(count).padStart(3, '0')}`;

  const newFault = db.insert('faults', {
    fault_number,
    customer_id,
    site_id,
    system: system || 'Fire Alarm',
    location: location || '',
    device_equipment: device_equipment || '',
    fault_description: fault_description || '',
    cause: cause || '',
    action_taken: action_taken || '',
    materials_used: materials_used || '',
    status: status || 'Open',
    before_photo: before_photo || '',
    after_photo: after_photo || '',
    technician_id: req.user.id,
    date: new Date().toISOString().slice(0, 10)
  });

  db.logAudit(req.user.id, 'CREATE_FAULT', 'faults', newFault.id, `Logged fault ${fault_number}`);
  res.status(201).json(newFault);
});

app.put('/api/faults/:id', (req, res) => {
  const updated = db.update('faults', req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Fault not found' });
  db.logAudit(req.user.id, 'UPDATE_FAULT', 'faults', req.params.id, `Updated fault status to ${updated.status}`);
  res.json(updated);
});

// --- MATERIALS INVENTORY ---
app.get('/api/materials', (req, res) => {
  res.json(db.get('materials'));
});

app.post('/api/materials', requirePermission('canManageMaterials'), (req, res) => {
  const { name, code, category, unit, stock, unit_cost } = req.body;
  const newMat = db.insert('materials', {
    name,
    code: code || `MAT-${Date.now().toString().slice(-4)}`,
    category: category || 'Fire Alarm',
    unit: unit || 'Pcs',
    stock: Number(stock) || 0,
    unit_cost: Number(unit_cost) || 0
  });
  res.status(201).json(newMat);
});

// --- REPORTS MANAGEMENT & STRICT APPROVAL PIPELINE ---
// Status pipeline: Draft -> Submitted -> Reviewed -> Approved
app.get('/api/reports', (req, res) => {
  const reports = db.get('reports') || [];
  const customers = db.get('customers') || [];
  const sites = db.get('sites') || [];
  const users = db.get('users') || [];
  const amcs = db.get('amc_contracts') || [];
  const jobs = db.get('jobs') || [];

  let filtered = reports;
  if (req.user.role === 'Technician') {
    // Technician can only see reports assigned to or created by them
    filtered = reports.filter(r => r.created_by === req.user.id || r.assigned_by === req.user.id || r.technician_name === req.user.name);
  } else if (req.user.role === 'Sales') {
    // Sales Person data isolation: only their own assigned contracts / jobs / reports (Requirement 2 & 3)
    const userJobNumbers = new Set(jobs.filter(j => j.sales_person_id === req.user.id).map(j => j.job_number));
    const userJobIds = new Set(jobs.filter(j => j.sales_person_id === req.user.id).map(j => j.id));
    const userAmcNumbers = new Set(amcs.filter(c => c.sales_person_id === req.user.id).map(c => c.contract_number));
    const userAmcIds = new Set(amcs.filter(c => c.sales_person_id === req.user.id).map(c => c.id));

    filtered = reports.filter(r => 
      r.sales_person_id === req.user.id ||
      r.created_by === req.user.id ||
      (r.job_id && userJobIds.has(r.job_id)) ||
      (r.job_number && userJobNumbers.has(r.job_number)) ||
      (r.amc_id && userAmcIds.has(r.amc_id)) ||
      (r.amc_number && userAmcNumbers.has(r.amc_number))
    );
  }

  const enhanced = filtered.map(r => {
    const cust = customers.find(c => c.id === r.customer_id);
    const site = sites.find(s => s.id === r.site_id);
    const amc = amcs.find(c => c.id === r.amc_id || c.contract_number === r.amc_number);
    const job = jobs.find(j => j.id === r.job_id || j.job_number === r.job_number);

    const spId = r.sales_person_id || (amc ? amc.sales_person_id : (job ? job.sales_person_id : null));
    const sp = users.find(u => u.id === spId);
    const spName = sp ? sp.name : (r.sales_person_name || 'Unassigned');

    const contractStart = r.contract_start_date || (amc ? amc.start_date : '');
    const contractEnd = r.contract_end_date || (amc ? amc.end_date : '');
    const contractPeriod = r.contract_period || (contractStart && contractEnd ? `${contractStart} to ${contractEnd}` : '');

    return {
      ...r,
      customer_name: cust ? cust.name : (r.customer_name || 'Customer / Client'),
      customer_address: cust ? (cust.address || formatCustomerAddress(cust)) : (r.customer_address || ''),
      contact_person: cust ? (cust.contact_person || cust.contact_mobile) : (r.contact_person || ''),
      contact_number: cust ? (cust.contact_mobile || cust.phone) : (r.contact_number || ''),
      site_name: site ? site.site_name : (r.site_name || 'Primary Facility'),
      site_address: site ? site.site_address : (r.site_address || ''),
      sales_person_id: spId,
      sales_person_name: spName,
      contract_start_date: contractStart,
      contract_end_date: contractEnd,
      contract_period: contractPeriod,
      quarter: r.quarter || db.getQuarter(r.date || r.created_at)
    };
  });

  res.json(enhanced);
});

app.get('/api/reports/:id', (req, res) => {
  const report = db.getById('reports', req.params.id);
  if (!report) return res.status(404).json({ error: 'Report not found' });

  // Security check for Technician
  if (req.user.role === 'Technician' && report.created_by !== req.user.id && report.technician_name !== req.user.name) {
    return res.status(403).json({ error: 'Access Denied', message: 'You can only view your own assigned reports.' });
  }

  const amcs = db.get('amc_contracts') || [];
  const jobs = db.get('jobs') || [];
  const users = db.get('users') || [];
  const amc = amcs.find(c => c.id === report.amc_id || c.contract_number === report.amc_number);
  const job = jobs.find(j => j.id === report.job_id || j.job_number === report.job_number);

  // Security check for Sales (Requirement 2 & 3)
  if (req.user.role === 'Sales') {
    const isAuthorized = report.sales_person_id === req.user.id ||
      report.created_by === req.user.id ||
      (job && job.sales_person_id === req.user.id) ||
      (amc && amc.sales_person_id === req.user.id);
    if (!isAuthorized) {
      return res.status(403).json({ error: 'Access Denied', message: 'You are not authorized to view reports of another salesperson.' });
    }
  }

  const customer = db.getById('customers', report.customer_id);
  const site = db.getById('sites', report.site_id);
  const settings = db.getSettings();

  const spId = report.sales_person_id || (amc ? amc.sales_person_id : (job ? job.sales_person_id : null));
  const sp = users.find(u => u.id === spId);
  const spName = sp ? sp.name : (report.sales_person_name || 'Unassigned');

  const contractStart = report.contract_start_date || (amc ? amc.start_date : '');
  const contractEnd = report.contract_end_date || (amc ? amc.end_date : '');
  const contractPeriod = report.contract_period || (contractStart && contractEnd ? `${contractStart} to ${contractEnd}` : '');

  res.json({
    ...report,
    customer_name: customer ? customer.name : (report.customer_name || 'Customer / Client'),
    customer_address: customer ? (customer.address || formatCustomerAddress(customer)) : (report.customer_address || ''),
    contact_person: customer ? (customer.contact_person || customer.contact_mobile) : (report.contact_person || ''),
    contact_number: customer ? (customer.contact_mobile || customer.phone) : (report.contact_number || ''),
    site_name: site ? site.site_name : (report.site_name || 'Primary Facility'),
    site_address: site ? site.site_address : (report.site_address || ''),
    sales_person_id: spId,
    sales_person_name: spName,
    contract_start_date: contractStart,
    contract_end_date: contractEnd,
    contract_period: contractPeriod,
    quarter: report.quarter || db.getQuarter(report.date || report.created_at),
    customer,
    site,
    company_settings: settings
  });
});

app.post('/api/reports', (req, res) => {
  const body = req.body;
  const count = db.get('reports').length + 1;
  const amcs = db.get('amc_contracts') || [];
  const jobs = db.get('jobs') || [];
  const users = db.get('users') || [];

  const amc = amcs.find(c => c.id === body.amc_id || c.id === body.amc_contract_id || c.contract_number === body.amc_number);
  const job = jobs.find(j => j.id === body.job_id || j.job_number === body.job_number);

  // Automatically pull: AMC number, Customer, Site, Sales Person, Contract start date, Contract end date, Visit number, Visit date, System, Technician, Supervisor (Requirements 25 & 26)
  if (amc) {
    body.amc_id = amc.id;
    body.amc_number = amc.contract_number;
    body.customer_id = body.customer_id || amc.customer_id;
    body.site_id = body.site_id || amc.site_id;
    body.sales_person_id = body.sales_person_id || amc.sales_person_id;
    body.contract_start_date = amc.start_date;
    body.contract_end_date = amc.end_date;
    body.contract_period = `${amc.start_date} to ${amc.end_date}`;
  } else if (job) {
    body.job_id = job.id;
    body.job_number = job.job_number;
    body.customer_id = body.customer_id || job.customer_id;
    body.site_id = body.site_id || job.site_id;
    body.sales_person_id = body.sales_person_id || job.sales_person_id;
  }

  const sp = users.find(u => u.id === body.sales_person_id);
  if (sp) {
    body.sales_person_name = sp.name;
  }

  let typeCode = 'RPT';
  if (body.report_type === 'AMC Service Report') typeCode = 'AMC';
  else if (body.report_type === 'Work Completion Report') typeCode = 'WCR';
  else if (body.report_type === 'Fault Report') typeCode = 'FLT';
  else if (body.report_type === 'Inspection Report') typeCode = 'INSP';
  else if (body.report_type === 'Testing & Commissioning Report') typeCode = 'TCR';

  const cust = body.customer_id ? db.getById('customers', body.customer_id) : null;
  const site = body.site_id ? db.getById('sites', body.site_id) : null;

  const report_number = body.report_number || `RPT-${typeCode}-${new Date().getFullYear()}-${String(count).padStart(3, '0')}`;

  const newReport = db.insert('reports', {
    ...body,
    customer_name: cust ? cust.name : (body.customer_name || 'Customer / Client'),
    customer_address: cust ? (cust.address || formatCustomerAddress(cust)) : (body.customer_address || ''),
    site_name: site ? site.site_name : (body.site_name || 'Primary Facility'),
    site_address: site ? site.site_address : (body.site_address || ''),
    contact_person: cust ? (cust.contact_person || cust.contact_mobile) : (body.contact_person || ''),
    contact_number: cust ? (cust.contact_mobile || cust.phone) : (body.contact_number || ''),
    report_number,
    quarter: db.getQuarter(body.date || new Date().toISOString()),
    status: body.status || 'Draft',
    created_by: req.user.id,
    created_at: new Date().toISOString(),
    submitted_by: body.status === 'Submitted' ? req.user.id : null,
    submitted_at: body.status === 'Submitted' ? new Date().toISOString() : null,
    reviewed_by: null,
    reviewed_at: null,
    approved_by: null,
    approved_at: null
  });

  // Link to job if provided
  if (body.job_id) {
    db.update('jobs', body.job_id, { report_id: newReport.id });
  }

  db.logAudit(req.user.id, 'CREATE_REPORT', 'reports', newReport.id, `Created ${body.report_type} ${report_number}`);
  res.status(201).json(newReport);
});


app.put('/api/reports/:id', (req, res) => {
  const existing = db.getById('reports', req.params.id);
  if (!existing) return res.status(404).json({ error: 'Report not found' });

  // If technician, can only edit if status is Draft or if submitting it
  if (req.user.role === 'Technician') {
    if (existing.created_by !== req.user.id && existing.technician_name !== req.user.name) {
      return res.status(403).json({ error: 'Access Denied', message: 'You cannot edit another technician\'s report.' });
    }
    if (existing.status !== 'Draft' && req.body.status !== 'Submitted') {
      return res.status(403).json({ error: 'Access Denied', message: 'Submitted or approved reports cannot be edited by technicians.' });
    }
  }

  const updates = { ...req.body };

  // Track status transitions: Draft -> Submitted -> Reviewed -> Approved
  if (updates.status === 'Submitted' && existing.status !== 'Submitted') {
    updates.submitted_by = req.user.id;
    updates.submitted_at = new Date().toISOString();
  }

  if (updates.status === 'Reviewed' && existing.status !== 'Reviewed') {
    if (req.user.role === 'Technician') {
      return res.status(403).json({ error: 'Technicians cannot mark reports as Reviewed.' });
    }
    updates.reviewed_by = req.user.id;
    updates.reviewed_at = new Date().toISOString();
  }

  if (updates.status === 'Approved' && existing.status !== 'Approved') {
    if (req.user.role === 'Technician') {
      return res.status(403).json({ error: 'Technicians cannot approve reports.' });
    }
    updates.approved_by = req.user.id;
    updates.approved_at = new Date().toISOString();
  }

  const updated = db.update('reports', req.params.id, updates);
  db.logAudit(req.user.id, 'UPDATE_REPORT', 'reports', req.params.id, `Updated report to ${updates.status || existing.status}`);
  res.json(updated);
});

app.delete('/api/reports/:id', requirePermission('canDeleteReports'), (req, res) => {
  const success = db.delete('reports', req.params.id);
  if (!success) return res.status(404).json({ error: 'Report not found' });
  db.logAudit(req.user.id, 'DELETE_REPORT', 'reports', req.params.id, `Deleted report`);
  res.json({ message: 'Report deleted successfully' });
});

// --- AI REPORT ASSISTANT ENDPOINTS ---
app.post('/api/ai/enhance', (req, res) => {
  const { notes, mode, customer_name, site_name } = req.body;
  if (!notes) return res.status(400).json({ error: 'Notes text is required' });

  switch (mode) {
    case 'wording':
      return res.json({ result: ai.enhanceTechnicalWording(notes) });
    case 'summary':
      return res.json({ result: ai.createWorkSummary(notes) });
    case 'fault':
      return res.json({ result: ai.createFaultDescription(notes) });
    case 'recommendation':
      return res.json({ result: ai.createRecommendation(notes) });
    case 'email':
      return res.json({ result: ai.createCustomerEmail(notes, customer_name, site_name) });
    case 'full':
    default:
      return res.json({ result: ai.generateFullReportNarrative(notes) });
  }
});

// --- NOTIFICATIONS & REMINDERS ---
app.get('/api/notifications', (req, res) => {
  const notifs = db.get('notifications');
  res.json(notifs);
});

app.put('/api/notifications/:id/read', (req, res) => {
  const updated = db.update('notifications', req.params.id, { read: true });
  res.json(updated);
});

// --- COMPANY SETTINGS ---
app.get('/api/settings', (req, res) => {
  res.json(db.getSettings());
});

app.put('/api/settings', requirePermission('canManageSettings'), (req, res) => {
  const updated = db.updateSettings(req.body);
  db.logAudit(req.user.id, 'UPDATE_SETTINGS', 'company_settings', 'main', `Updated company settings`);
  res.json(updated);
});

// Branding upload (Letterhead banner and Logo)
app.post('/api/settings/branding', requirePermission('canManageSettings'), (req, res) => {
  const { logo, letterhead, use_custom_letterhead } = req.body;
  const updates = {};
  if (use_custom_letterhead !== undefined) {
    updates.use_custom_letterhead = !!use_custom_letterhead;
  }

  const publicDir = path.join(__dirname, '..', 'public');
  const distDir = path.join(__dirname, '..', 'dist');
  if (!require('fs').existsSync(publicDir)) {
    require('fs').mkdirSync(publicDir, { recursive: true });
  }

  if (logo) {
    if (logo.startsWith('data:image')) {
      try {
        const base64Data = logo.replace(/^data:image\/\w+;base64,/, '');
        const buf = Buffer.from(base64Data, 'base64');
        require('fs').writeFileSync(path.join(publicDir, 'logo.png'), buf);
        if (require('fs').existsSync(distDir)) {
          require('fs').writeFileSync(path.join(distDir, 'logo.png'), buf);
        }
      } catch (e) {
        console.error('Error writing logo file:', e);
      }
    }
    updates.logo_url = logo;
  }

  if (letterhead) {
    if (letterhead.startsWith('data:image')) {
      try {
        const base64Data = letterhead.replace(/^data:image\/\w+;base64,/, '');
        const buf = Buffer.from(base64Data, 'base64');
        require('fs').writeFileSync(path.join(publicDir, 'letterhead.png'), buf);
        if (require('fs').existsSync(distDir)) {
          require('fs').writeFileSync(path.join(distDir, 'letterhead.png'), buf);
        }
      } catch (e) {
        console.error('Error writing letterhead file:', e);
      }
    }
    updates.letterhead_url = letterhead;
  }

  const updated = db.updateSettings(updates);
  db.logAudit(req.user.id, 'UPDATE_BRANDING', 'company_settings', 'branding', 'Updated letterhead and logo branding');
  res.json({ success: true, settings: updated });
});

// --- OFFLINE BATCH SYNCHRONIZATION ---
app.post('/api/sync', (req, res) => {
  const { reports, faults, inspections, signatures } = req.body;
  let syncedReports = 0;
  let syncedFaults = 0;

  if (Array.isArray(reports)) {
    reports.forEach(r => {
      if (r.id && db.getById('reports', r.id)) {
        db.update('reports', r.id, r);
      } else {
        db.insert('reports', r);
      }
      syncedReports++;
    });
  }

  if (Array.isArray(faults)) {
    faults.forEach(f => {
      if (f.id && db.getById('faults', f.id)) {
        db.update('faults', f.id, f);
      } else {
        db.insert('faults', f);
      }
      syncedFaults++;
    });
  }

  db.logAudit(req.user.id, 'OFFLINE_SYNC', 'sync', 'batch', `Synced ${syncedReports} reports, ${syncedFaults} faults from offline cache`);

  res.json({
    success: true,
    message: `Successfully synchronized ${syncedReports} reports and ${syncedFaults} faults.`,
    timestamp: new Date().toISOString()
  });
});

// Serve public static assets (letterhead, logo, icons)
const publicPath = path.join(__dirname, '..', 'public');
if (require('fs').existsSync(publicPath)) {
  app.use(express.static(publicPath, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('sw.js')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      }
    }
  }));
}

// Serve frontend in production or when built
const distPath = path.join(__dirname, '..', 'dist');
if (require('fs').existsSync(distPath)) {
  app.use(express.static(distPath, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.html') || filePath.endsWith('sw.js')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      }
    }
  }));
  app.get('*', (req, res) => {
    if (req.path.startsWith('/assets/') || req.path.startsWith('/api/')) {
      return res.status(404).send('Not Found');
    }
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Fire & Safety Management API running on port ${PORT}`);
});
