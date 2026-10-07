const db = require('./db');

/**
 * Role Permission Matrix definition:
 * Exactly 5 Roles: GM, Engineer, Supervisor, Technician, Sales
 */
const ROLE_PERMISSIONS = {
  CEO: {
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
    canManageRoles: true
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
    canDistributeEmergency: true
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
    canManageUsers: true,
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
    canManageUsers: true,
    canManageSettings: true,
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
    canManageUsers: false,
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
  }
};

// Aliases for consistent role mapping (Requirements 1 & 17)
ROLE_PERMISSIONS['ceo'] = ROLE_PERMISSIONS['CEO'];
ROLE_PERMISSIONS['Ceo'] = ROLE_PERMISSIONS['CEO'];
ROLE_PERMISSIONS['projects_manager'] = ROLE_PERMISSIONS['Projects Manager'];
ROLE_PERMISSIONS['project_manager'] = ROLE_PERMISSIONS['Projects Manager'];
ROLE_PERMISSIONS['Project Manager'] = ROLE_PERMISSIONS['Projects Manager'];
ROLE_PERMISSIONS['PM'] = ROLE_PERMISSIONS['Projects Manager'];
ROLE_PERMISSIONS['admin'] = ROLE_PERMISSIONS['GM'];
ROLE_PERMISSIONS['Admin'] = ROLE_PERMISSIONS['GM'];

function normalizeRole(role) {
  if (!role) return 'Guest';
  const clean = String(role).trim().toLowerCase().replace(/[\s\-_]+/g, ' ');
  if (clean === 'ceo' || clean === 'chief executive officer') {
    return 'CEO';
  }
  if (clean === 'projects manager' || clean === 'project manager' || clean === 'pm' || clean === 'projects_manager' || clean === 'project_manager') {
    return 'Projects Manager';
  }
  if (clean === 'gm' || clean === 'general manager' || clean === 'admin' || clean === 'administrator') {
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
      id: userId || `usr-${roleCapitalized.toLowerCase().replace(/\s+/g, '-')}-1`,
      name: roleCapitalized === 'CEO' ? 'Eng. Mohamed Hweidi (CEO)' :
            roleCapitalized === 'Projects Manager' ? 'Sarah Ali' :
            roleCapitalized === 'Accounts' ? 'Zahra Hasan' :
            roleCapitalized === 'Engineer' ? 'John Smith' :
            roleCapitalized === 'Supervisor' ? 'David Thomas' :
            roleCapitalized === 'Technician' ? 'Ahmed Mohammed' :
            roleCapitalized === 'Sales' ? 'Mohammed Alwadhi' :
            'Eng. Mohamed Hweidi',
      role: roleCapitalized,
      email: `${roleCapitalized.toLowerCase().replace(/\s+/g, '')}@firexbahrain.com`,
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
  sanitizeContractForRole
};
