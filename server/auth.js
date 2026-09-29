const db = require('./db');

/**
 * Role Permission Matrix definition:
 * Exactly 5 Roles: GM, Engineer, Supervisor, Technician, Sales
 */
const ROLE_PERMISSIONS = {
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
    canExportAccountsExcel: true
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
    canManageProjects: true
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
    canManageProjects: true
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
    canReleaseHold: false
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
    canRequestHold: true
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
    canDeleteReports: false,
    canReviewReports: false,
    canApproveReports: false,
    canManageUsers: false,
    canManageSettings: false,
    canViewFinancials: true,
    canViewAllJobs: true
  },
  'Projects Manager': {
    canViewDashboard: 'projects_only',
    canManageCustomers: true,
    canManageSites: true,
    canManageContracts: true,
    canCreateAMC: false,
    canSubmitAMC: false,
    canApproveAMC: false,
    canGenerateAMCVisits: false,
    canAssignTechnician: true,
    canViewFullAMCList: true,
    canViewOtherSalesAMC: true,
    canChangeAMCFrequency: false,
    canEditContractDates: false,
    canScheduleVisits: true,
    canCreateBreakdowns: false,
    canCreateFitOuts: true,
    canCreateProjects: true,
    canCreateSupply: true,
    canCreateQuotations: true,
    canManageFaults: true,
    canManageMaterials: true,
    canManageReports: 'full',
    canDeleteReports: false,
    canReviewReports: true,
    canApproveReports: true,
    canManageUsers: false,
    canManageSettings: false,
    canViewFinancials: true,
    canViewAllJobs: true,
    canHoldJobsOperational: true,
    canReleaseHold: true,
    canManageProjects: true,
    canAccessAccounts: false,
    canHoldJobsFinancial: false
  }
};

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
  const userId = req.headers['x-user-id'];
  const userRole = req.headers['x-user-role'];

  let currentUser = null;

  if (userId) {
    currentUser = db.getById('users', userId);
  }
  if (!currentUser && userRole) {
    const users = db.get('users');
    currentUser = users.find(u => u.role.toLowerCase() === userRole.toLowerCase());
  }

  // Fallback to default Supervisor if none provided for testing, or safe guest object if no users exist
  if (!currentUser) {
    const users = db.get('users') || [];
    currentUser = users.find(u => u.role === 'Supervisor') || users[0] || null;
  }

  req.user = currentUser || { id: 'guest', name: 'Guest', role: 'Guest', designation: 'Setup' };
  req.permissions = (currentUser && currentUser.role && ROLE_PERMISSIONS[currentUser.role]) ? ROLE_PERMISSIONS[currentUser.role] : {};
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
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
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
  authMiddleware,
  requirePermission,
  requireRole,
  sanitizeJobForRole,
  sanitizeContractForRole
};
