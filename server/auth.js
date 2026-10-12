const db = require('./db');

/**
 * Role Permission Matrix definition:
 * Exactly 5 Roles: GM, Engineer, Supervisor, Technician, Sales
 */
const ROLE_PERMISSIONS = {
  managing_director: {
    canViewDashboard: 'full',
    canManageCustomers: true,
    canViewCustomers: true,
    canDeleteCustomers: true,
    canManageSites: true,
    canViewSites: true,
    canManageContracts: true,
    canCreateAMC: true,
    canSubmitAMC: true,
    canApproveAMC: true,
    canGenerateAMCVisits: true,
    canAssignTechnician: true,
    canAssignSupervisor: true,
    canAssignEngineer: true,
    canViewFullAMCList: true,
    canViewOtherSalesAMC: true,
    canChangeAMCFrequency: true,
    canEditContractDates: true,
    canScheduleVisits: true,
    canCreateBreakdowns: true,
    canCreateFitOuts: true,
    canCreateProjects: true,
    canManageProjects: true,
    canViewProjects: true,
    canCreateSupply: true,
    canCreateQuotations: true,
    canManageQuotations: true,
    canViewQuotations: true,
    canManageFaults: true,
    canManageDefects: true,
    canViewDefects: true,
    canManageMaterials: true,
    canManageReports: 'full',
    canPrepareReports: true,
    canViewReports: true,
    canDeleteReports: true,
    canReviewReports: true,
    canApproveReports: true,
    canCompleteReports: true,
    canManageUsers: true,
    canManageSettings: true,
    canViewFinancials: true,
    canViewAllJobs: true,
    canAccessAccounts: true,
    canManageInvoices: true,
    canDeleteInvoices: true,
    canViewInvoices: true,
    canManagePayments: true,
    canViewPayments: true,
    canViewCustomerStatements: true,
    canViewFinancialReports: true,
    canHoldJobsFinancial: true,
    canHoldJobsOperational: true,
    canReleaseHold: true,
    canExportAccountsExcel: true,
    canViewEmergencyReports: true,
    canCreateEmergency: true,
    canEditEmergency: 'all',
    canAssignEmergency: true,
    canSubmitEmergency: true,
    canReviewEmergency: true,
    canApproveEmergency: true,
    canCloseEmergency: true,
    canDistributeEmergency: true,
    canViewAuditLogs: true,
    canManageRoles: true,
    canViewAttendance: false,
    canManageAttendance: false
  },
  GM: {
    canViewDashboard: 'full',
    canManageCustomers: true,
    canManageSites: true,
    canManageContracts: true,
    canCreateAMC: true,
    canSubmitAMC: true,
    canApproveAMC: true,
    canGenerateAMCVisits: true,
    canAssignTechnician: true,
    canViewFullAMCList: true,
    canViewOtherSalesAMC: true,
    canChangeAMCFrequency: true,
    canEditContractDates: true,
    canScheduleVisits: true,
    canCreateBreakdowns: true,
    canCreateFitOuts: true,
    canCreateProjects: true,
    canCreateSupply: true,
    canCreateQuotations: true,
    canManageFaults: true,
    canManageMaterials: true,
    canManageReports: 'full',
    canPrepareReports: false,
    canViewReports: true,
    canDeleteReports: true,
    canReviewReports: true,
    canApproveReports: true,
    canManageUsers: true,
    canManageRoles: true,
    canViewAuditLogs: true,
    canManageSettings: true,
    canViewFinancials: true,
    canViewAllJobs: true,
    canAccessAccounts: true,
    canManageInvoices: true,
    canManagePayments: true,
    canViewCustomerStatements: true,
    canViewFinancialReports: true,
    canHoldJobsFinancial: true,
    canHoldJobsOperational: true,
    canReleaseHold: true,
    canManageProjects: true,
    canExportAccountsExcel: true,
    canViewEmergencyReports: true,
    canCreateEmergency: true,
    canEditEmergency: 'all',
    canAssignEmergency: true,
    canSubmitEmergency: true,
    canReviewEmergency: true,
    canApproveEmergency: true,
    canCloseEmergency: true,
    canDistributeEmergency: true,
    canViewAttendance: true,
    canManageAttendance: true
  },
  Engineer: {
    canViewDashboard: 'full',
    canManageCustomers: true,
    canManageSites: true,
    canManageContracts: true,
    canCreateAMC: true,
    canSubmitAMC: true,
    canApproveAMC: true,
    canGenerateAMCVisits: true,
    canAssignTechnician: true,
    canViewFullAMCList: true,
    canViewOtherSalesAMC: true,
    canChangeAMCFrequency: false,
    canEditContractDates: true,
    canScheduleVisits: true,
    canCreateBreakdowns: true,
    canCreateFitOuts: true,
    canCreateProjects: true,
    canCreateSupply: true,
    canCreateQuotations: true,
    canManageFaults: true,
    canManageMaterials: true,
    canManageReports: 'full',
    canPrepareReports: true,
    canViewReports: true,
    canDeleteReports: true,
    canReviewReports: true,
    canApproveReports: true,
    canManageUsers: false,
    canManageSettings: false,
    canViewFinancials: true,
    canViewAllJobs: true,
    canAccessAccounts: false,
    canHoldJobsFinancial: false,
    canHoldJobsOperational: true,
    canReleaseHold: true,
    canManageProjects: true,
    canViewEmergencyReports: true,
    canCreateEmergency: true,
    canEditEmergency: 'operational',
    canAssignEmergency: true,
    canSubmitEmergency: true,
    canReviewEmergency: true,
    canApproveEmergency: true,
    canCloseEmergency: false,
    canDistributeEmergency: true
  },
  Supervisor: {
    canViewDashboard: 'full',
    canManageCustomers: true,
    canManageSites: true,
    canManageContracts: true,
    canCreateAMC: true,
    canSubmitAMC: true,
    canApproveAMC: true,
    canGenerateAMCVisits: true,
    canAssignTechnician: true,
    canViewFullAMCList: true,
    canViewOtherSalesAMC: true,
    canChangeAMCFrequency: false,
    canEditContractDates: true,
    canScheduleVisits: true,
    canCreateBreakdowns: true,
    canCreateFitOuts: true,
    canCreateProjects: true,
    canCreateSupply: true,
    canCreateQuotations: true,
    canManageFaults: true,
    canManageMaterials: true,
    canManageReports: 'full',
    canPrepareReports: true,
    canViewReports: true,
    canDeleteReports: true,
    canReviewReports: true,
    canApproveReports: true,
    canManageUsers: false,
    canManageSettings: false,
    canViewFinancials: true,
    canViewAllJobs: true,
    canAccessAccounts: false,
    canHoldJobsFinancial: false,
    canHoldJobsOperational: true,
    canReleaseHold: true,
    canManageProjects: true,
    canViewEmergencyReports: true,
    canCreateEmergency: true,
    canEditEmergency: 'assigned_managed',
    canAssignEmergency: true,
    canSubmitEmergency: true,
    canReviewEmergency: true,
    canApproveEmergency: false,
    canCloseEmergency: false,
    canDistributeEmergency: true
  },
  Technician: {
    canViewDashboard: 'limited',
    canManageCustomers: false,
    canManageSites: false,
    canManageContracts: false,
    canCreateAMC: false,
    canSubmitAMC: false,
    canApproveAMC: false,
    canGenerateAMCVisits: false,
    canAssignTechnician: false,
    canViewFullAMCList: false,
    canViewOtherSalesAMC: false,
    canChangeAMCFrequency: false,
    canEditContractDates: false,
    canScheduleVisits: false,
    canCreateBreakdowns: false,
    canCreateFitOuts: false,
    canCreateProjects: false,
    canCreateSupply: false,
    canCreateQuotations: false,
    canManageFaults: false,
    canManageMaterials: false,
    canManageReports: 'assigned_only',
    canPrepareReports: true,
    canViewReports: true,
    canDeleteReports: false,
    canReviewReports: false,
    canApproveReports: false,
    canManageUsers: false,
    canManageSettings: false,
    canViewFinancials: false, // strictly forbidden: scrubbed at API level
    canViewAllJobs: false,
    canAccessAccounts: false,
    canHoldJobsFinancial: false,
    canHoldJobsOperational: false,
    canReleaseHold: false,
    canViewEmergencyReports: true,
    canCreateEmergency: false,
    canEditEmergency: 'field_only',
    canAssignEmergency: false,
    canSubmitEmergency: true,
    canReviewEmergency: false,
    canApproveEmergency: false,
    canCloseEmergency: false,
    canDistributeEmergency: false
  },
  Sales: {
    canViewDashboard: 'sales_only',
    canManageCustomers: true,
    canManageSites: true,
    canManageContracts: 'own_only',
    canCreateAMC: true,
    canSubmitAMC: true,
    canApproveAMC: false, // strictly forbidden: management only
    canGenerateAMCVisits: false, // system generates after management approval
    canAssignTechnician: false,
    canViewFullAMCList: false,
    canViewOtherSalesAMC: false,
    canChangeAMCFrequency: false,
    canEditContractDates: false,
    canScheduleVisits: false,
    canCreateBreakdowns: true,
    canCreateFitOuts: true,
    canCreateProjects: true,
    canCreateSupply: true,
    canCreateQuotations: true,
    canManageFaults: false,
    canManageMaterials: false,
    canManageReports: 'own_work',
    canPrepareReports: false,
    canViewReports: 'own_work',
    canDeleteReports: false,
    canReviewReports: false,
    canApproveReports: false,
    canManageUsers: false,
    canManageSettings: false,
    canViewFinancials: 'own_only', // only their own work amount
    canViewAllJobs: false,          // only their own jobs
    canAccessAccounts: false,
    canHoldJobsFinancial: false,
    canHoldJobsOperational: false,
    canRequestHold: true,
    canViewEmergencyReports: true,
    canCreateEmergency: false,
    canEditEmergency: false,
    canAssignEmergency: false,
    canSubmitEmergency: false,
    canReviewEmergency: false,
    canApproveEmergency: false,
    canCloseEmergency: false,
    canDistributeEmergency: false
  },
  Accounts: {
    canViewDashboard: 'accounts_only',
    canAccessAccounts: true,
    canManageInvoices: true,
    canManagePayments: true,
    canViewCustomerStatements: true,
    canViewFinancialReports: true,
    canHoldJobsFinancial: true,
    canReleaseHold: true,
    canExportAccountsExcel: true,
    canManageCustomers: true,
    canManageSites: true,
    canManageContracts: true,
    canCreateAMC: false,
    canSubmitAMC: false,
    canApproveAMC: false,
    canGenerateAMCVisits: false,
    canAssignTechnician: false,
    canViewFullAMCList: true,
    canViewOtherSalesAMC: true,
    canChangeAMCFrequency: false,
    canEditContractDates: false,
    canScheduleVisits: false,
    canCreateBreakdowns: false,
    canCreateFitOuts: false,
    canCreateProjects: false,
    canCreateSupply: false,
    canCreateQuotations: false,
    canManageFaults: false,
    canManageMaterials: false,
    canManageReports: false,
    canPrepareReports: false,
    canViewReports: true,
    canDeleteReports: false,
    canReviewReports: false,
    canApproveReports: false,
    canManageUsers: false,
    canManageSettings: false,
    canViewFinancials: true,
    canViewAllJobs: true,
    canViewEmergencyReports: true,
    canCreateEmergency: false,
    canEditEmergency: false,
    canAssignEmergency: false,
    canSubmitEmergency: false,
    canReviewEmergency: false,
    canApproveEmergency: false,
    canCloseEmergency: false,
    canDistributeEmergency: false,
    canLinkEmergencyInvoice: true
  },
  'Projects Manager': {
    canViewDashboard: 'projects_only',
    canManageCustomers: true,
    canViewCustomers: true,
    canManageSites: true,
    canViewSites: true,
    canManageContracts: true,
    canCreateAMC: false,
    canSubmitAMC: false,
    canApproveAMC: false,
    canGenerateAMCVisits: false,
    canAssignTechnician: true,
    canAssignSupervisor: true,
    canAssignEngineer: true,
    canViewFullAMCList: true,
    canViewOtherSalesAMC: true,
    canChangeAMCFrequency: false,
    canEditContractDates: false,
    canScheduleVisits: true,
    canCreateBreakdowns: false,
    canCreateFitOuts: true,
    canCreateProjects: true,
    canManageProjects: true,
    canViewProjects: true,
    canCreateSupply: true,
    canCreateQuotations: true,
    canManageQuotations: true,
    canViewQuotations: true,
    canManageFaults: true,
    canManageDefects: true,
    canViewDefects: true,
    canManageMaterials: true,
    canManageReports: 'full',
    canPrepareReports: true,
    canViewReports: true,
    canDeleteReports: false,
    canReviewReports: true,
    canApproveReports: true,
    canCompleteReports: true,
    canManageUsers: true,
    canManageRoles: true,
    canManageSettings: false,
    canViewFinancials: true,
    canViewInvoices: true,
    canViewPayments: true,
    canManageInvoices: false,
    canDeleteInvoices: false,
    canViewAllJobs: true,
    canHoldJobsOperational: true,
    canReleaseHold: true,
    canAccessAccounts: false,
    canHoldJobsFinancial: false,
    canViewEmergencyReports: true,
    canCreateEmergency: true,
    canEditEmergency: 'projects_operational',
    canAssignEmergency: true,
    canSubmitEmergency: true,
    canReviewEmergency: true,
    canApproveEmergency: false,
    canCloseEmergency: false,
    canDistributeEmergency: true
  },
  CEO: {
    canViewDashboard: 'full',
    canManageCustomers: false,
    canViewCustomers: true,
    canDeleteCustomers: false,
    canManageSites: false,
    canViewSites: true,
    canManageContracts: false,
    canCreateAMC: false,
    canSubmitAMC: false,
    canApproveAMC: false,
    canGenerateAMCVisits: false,
    canAssignTechnician: false,
    canAssignSupervisor: false,
    canAssignEngineer: false,
    canViewFullAMCList: true,
    canViewOtherSalesAMC: true,
    canChangeAMCFrequency: false,
    canEditContractDates: false,
    canScheduleVisits: false,
    canCreateBreakdowns: false,
    canCreateFitOuts: false,
    canCreateProjects: false,
    canManageProjects: false,
    canViewProjects: true,
    canCreateSupply: false,
    canCreateQuotations: false,
    canManageQuotations: false,
    canViewQuotations: true,
    canManageFaults: false,
    canManageDefects: false,
    canViewDefects: true,
    canManageMaterials: false,
    canManageReports: false,
    canPrepareReports: false,
    canViewReports: true,
    canDeleteReports: false,
    canReviewReports: false,
    canApproveReports: false,
    canCompleteReports: false,
    canManageUsers: true,
    canManageRoles: true,
    canManageSettings: false,
    canViewFinancials: true,
    canViewAllJobs: true,
    canAccessAccounts: true,
    canViewAccounts: true,
    canManageInvoices: false,
    canDeleteInvoices: false,
    canViewInvoices: true,
    canManagePayments: false,
    canViewPayments: true,
    canViewCustomerStatements: true,
    canViewFinancialReports: true,
    canHoldJobsFinancial: false,
    canHoldJobsOperational: false,
    canReleaseHold: false,
    canExportAccountsExcel: true,
    canViewEmergencyReports: true,
    canCreateEmergency: false,
    canEditEmergency: false,
    canAssignEmergency: false,
    canSubmitEmergency: false,
    canReviewEmergency: false,
    canApproveEmergency: false,
    canCloseEmergency: false,
    canDistributeEmergency: false,
    canViewAuditLogs: true,
    canViewAttendance: false,
    canManageAttendance: false
  },
  Admin: {
    canViewDashboard: 'full',
    canManageCustomers: true,
    canViewCustomers: true,
    canDeleteCustomers: true,
    canManageSites: true,
    canViewSites: true,
    canManageContracts: true,
    canCreateAMC: true,
    canSubmitAMC: true,
    canApproveAMC: true,
    canGenerateAMCVisits: true,
    canAssignTechnician: true,
    canAssignSupervisor: true,
    canAssignEngineer: true,
    canViewFullAMCList: true,
    canViewOtherSalesAMC: true,
    canChangeAMCFrequency: true,
    canEditContractDates: true,
    canScheduleVisits: true,
    canCreateBreakdowns: true,
    canCreateFitOuts: true,
    canCreateProjects: true,
    canManageProjects: true,
    canViewProjects: true,
    canCreateSupply: true,
    canCreateQuotations: true,
    canManageQuotations: true,
    canViewQuotations: true,
    canManageFaults: true,
    canManageDefects: true,
    canViewDefects: true,
    canManageMaterials: true,
    canManageReports: 'full',
    canPrepareReports: true,
    canViewReports: true,
    canDeleteReports: true,
    canReviewReports: true,
    canApproveReports: true,
    canCompleteReports: true,
    canManageUsers: true,
    canManageSettings: true,
    canViewFinancials: true,
    canViewAllJobs: true,
    canAccessAccounts: true,
    canManageInvoices: true,
    canDeleteInvoices: true,
    canViewInvoices: true,
    canManagePayments: true,
    canViewPayments: true,
    canViewCustomerStatements: true,
    canViewFinancialReports: true,
    canHoldJobsFinancial: true,
    canHoldJobsOperational: true,
    canReleaseHold: true,
    canExportAccountsExcel: true,
    canViewEmergencyReports: true,
    canCreateEmergency: true,
    canEditEmergency: 'all',
    canAssignEmergency: true,
    canSubmitEmergency: true,
    canReviewEmergency: true,
    canApproveEmergency: true,
    canCloseEmergency: true,
    canDistributeEmergency: true,
    canViewAuditLogs: true,
    canManageRoles: true,
    canViewAttendance: true,
    canManageAttendance: true
  }
};

// Aliases for consistent role mapping (Requirements 1 & 17)
ROLE_PERMISSIONS['Managing Director (MD)'] = ROLE_PERMISSIONS['managing_director'];
ROLE_PERMISSIONS['Managing Director'] = ROLE_PERMISSIONS['managing_director'];
ROLE_PERMISSIONS['managing director'] = ROLE_PERMISSIONS['managing_director'];
ROLE_PERMISSIONS['MD'] = ROLE_PERMISSIONS['managing_director'];
ROLE_PERMISSIONS['md'] = ROLE_PERMISSIONS['managing_director'];
ROLE_PERMISSIONS['projects_manager'] = ROLE_PERMISSIONS['Projects Manager'];
ROLE_PERMISSIONS['project_manager'] = ROLE_PERMISSIONS['Projects Manager'];
ROLE_PERMISSIONS['Project Manager'] = ROLE_PERMISSIONS['Projects Manager'];
ROLE_PERMISSIONS['PM'] = ROLE_PERMISSIONS['Projects Manager'];
ROLE_PERMISSIONS['admin'] = ROLE_PERMISSIONS['Admin'];
ROLE_PERMISSIONS['administrator'] = ROLE_PERMISSIONS['Admin'];
ROLE_PERMISSIONS['ceo'] = ROLE_PERMISSIONS['CEO'];

const crypto = require('crypto');

function hashPassword(plainPassword) {
  if (!plainPassword) return plainPassword;
  const str = String(plainPassword).trim();
  if (str.startsWith('pbkdf2:')) return str;
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(str, salt, 1000, 64, 'sha512').toString('hex');
  return `pbkdf2:${salt}:${hash}`;
}

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

function sanitizeUser(user) {
  if (!user) return null;
  const { password, pin, ...safe } = user;
  
  let resetStatus = 'Active';
  if (user.temp_password_active) {
    if (user.temp_password_expires_at && new Date(user.temp_password_expires_at).getTime() < Date.now()) {
      resetStatus = 'Temp Expired';
    } else {
      resetStatus = 'Temp Password Issued';
    }
  } else if (user.must_change_password) {
    resetStatus = 'Reset Required';
  }

  let createdByName = user.created_by_name;
  if (!createdByName && user.created_by) {
    if (user.created_by === 'system') {
      createdByName = 'System Administrator';
    } else {
      const creator = db.getById('users', user.created_by);
      if (creator) createdByName = creator.name;
    }
  }

  return {
    ...safe,
    has_password: Boolean(password || pin),
    password_reset_status: resetStatus,
    created_by_name: createdByName || user.created_by || 'System',
    last_reset_by_name: user.last_reset_by_name || null,
    last_reset_by_role: user.last_reset_by_role || null,
    last_reset_at: user.last_reset_at || null,
    last_reset_mode: user.last_reset_mode || null
  };
}

function normalizeRole(role) {
  if (!role) return 'Guest';
  const clean = String(role).trim().toLowerCase().replace(/[\s\-_]+/g, ' ');
  if (clean === 'managing director (md)' || clean === 'managing director' || clean === 'managing_director' || clean === 'md') {
    return 'Managing Director (MD)';
  }
  if (clean === 'ceo' || clean === 'chief executive officer') {
    return 'CEO';
  }
  if (clean === 'admin' || clean === 'administrator' || clean === 'system administrator') {
    return 'Admin';
  }
  if (clean === 'projects manager' || clean === 'project manager' || clean === 'pm' || clean === 'projects_manager' || clean === 'project_manager') {
    return 'Projects Manager';
  }
  if (clean === 'gm' || clean === 'general manager') {
    return 'GM';
  }
  if (clean === 'engineer') return 'Engineer';
  if (clean === 'supervisor') return 'Supervisor';
  if (clean === 'technician' || clean === 'tech') return 'Technician';
  if (clean === 'sales' || clean === 'salesperson') return 'Sales';
  if (clean === 'accounts' || clean === 'accountant' || clean === 'finance') return 'Accounts';
  return role;
}

/**
 * Sanitize job for the calling user's role:
 * Technicians must NEVER receive financial amounts in API/database responses (Requirement 33).
 */
function sanitizeJobForRole(job, user) {
  if (!job) return null;
  const cloned = { ...job };
  if (user && user.role === 'Technician') {
    cloned.amount = null;
    cloned.vat_percent = null;
    cloned.vat_amount = null;
    cloned.total_including_vat = null;
    cloned.currency = null;
    cloned.quotation_amount = null;
    cloned.invoice_amount = null;
    cloned.invoice_total = null;
    cloned.invoice_paid = null;
    cloned.invoice_outstanding = null;
    cloned.invoice_number = null;
    cloned.payment_status = null;
    cloned.is_payment_pending = false;
    cloned.is_payment_overdue = false;
  }
  return cloned;
}

/**
 * Sanitize AMC contract for the calling user's role:
 * Technicians must NEVER receive contract values in API/database responses (Requirement 33).
 */
function sanitizeContractForRole(contract, user) {
  if (!contract) return null;
  const cloned = { ...contract };
  if (user && user.role === 'Technician') {
    cloned.contract_value = null;
    cloned.vat_percent = null;
    cloned.vat_amount = null;
    cloned.total_including_vat = null;
    cloned.currency = null;
    cloned.invoice_total = null;
    cloned.invoice_paid = null;
    cloned.invoice_outstanding = null;
    cloned.payment_status = null;
    cloned.is_payment_pending = false;
    cloned.is_payment_overdue = false;
  }
  return cloned;
}

/**
 * Authentication and RBAC Middleware
 * Extracts user ID or role from header 'x-user-id' or 'x-user-role' or Bearer token.
 */
function authMiddleware(req, res, next) {
  let userId = req.headers['x-user-id'];
  const userRole = req.headers['x-user-role'];
  const authHeader = req.headers['authorization'];

  if (!userId && authHeader && authHeader.startsWith('Bearer token-')) {
    const raw = authHeader.replace(/^Bearer token-/, '');
    const lastDash = raw.lastIndexOf('-');
    if (lastDash > 0) {
      userId = raw.substring(0, lastDash);
    }
  }

  let currentUser = null;

  if (userId) {
    currentUser = db.getById('users', userId);
  }
  if (!currentUser && userRole) {
    const users = db.get('users') || [];
    const norm = normalizeRole(userRole);
    currentUser = users.find(u => normalizeRole(u.role) === norm);
  }

  // If role is explicitly provided in headers (e.g. for testing or API integration), but no user exists in DB with that role, construct valid role user:
  if (!currentUser && userRole) {
    const roleCapitalized = normalizeRole(userRole);
    currentUser = {
      id: userId || `usr-${roleCapitalized.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-1`,
      name: roleCapitalized,
      role: roleCapitalized,
      email: `${roleCapitalized.toLowerCase().replace(/[^a-z0-9]+/g, '')}@firexbahrain.com`,
      designation: roleCapitalized
    };
  }

  // Fallback to default Supervisor if none provided for testing, or safe guest object if no users exist
  if (!currentUser) {
    const users = db.get('users') || [];
    currentUser = users.find(u => u.role === 'Supervisor') || users[0] || null;
  }

  if (currentUser && currentUser.role) {
    currentUser.role = normalizeRole(currentUser.role);
  }

  req.user = currentUser || { id: 'guest', name: 'Guest', role: 'Guest', designation: 'Setup' };
  const userRoleKey = currentUser?.role ? normalizeRole(currentUser.role) : 'Guest';
  req.permissions = ROLE_PERMISSIONS[userRoleKey] || (currentUser?.role && ROLE_PERMISSIONS[currentUser.role]) || {};
  next();
}

/**
 * Permission guard generator
 */
function requirePermission(permKey) {
  return (req, res, next) => {
    // Admin has full system access across all modules
    if (req.user && normalizeRole(req.user.role) === 'Admin') {
      return next();
    }
    if (!req.permissions || !req.permissions[permKey]) {
      return res.status(403).json({
        error: "Access Denied",
        message: `Your role (${req.user ? req.user.role : 'Guest'}) does not have permission '${permKey}' to perform this action.`
      });
    }
    next();
  };
}

/**
 * Role guard generator
 */
function requireRole(...allowedRoles) {
  const normAllowed = allowedRoles.map(r => normalizeRole(r));
  return (req, res, next) => {
    // Admin has full system access across all modules
    if (req.user && normalizeRole(req.user.role) === 'Admin') {
      return next();
    }
    const userRole = req.user ? normalizeRole(req.user.role) : 'None';
    if (!req.user || !normAllowed.includes(userRole)) {
      return res.status(403).json({
        error: "Access Denied",
        message: `Access requires one of the following roles: ${allowedRoles.join(', ')}. Current role: ${req.user ? req.user.role : 'None'}`
      });
    }
    next();
  };
}

module.exports = {
  ROLE_PERMISSIONS,
  normalizeRole,
  authMiddleware,
  requirePermission,
  requireRole,
  sanitizeJobForRole,
  sanitizeContractForRole,
  hashPassword,
  verifyPassword,
  sanitizeUser
};
