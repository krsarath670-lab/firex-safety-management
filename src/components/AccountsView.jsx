import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { formatBHD } from '../utils/formatters';
import { 
  exportInvoicesToExcel, 
  exportPaymentsToExcel, 
  exportCustomerStatementToExcel 
} from '../utils/excelExport';
import { 
  DollarSign, Receipt, AlertTriangle, CheckCircle2, Clock, 
  Search, Plus, Filter, FileSpreadsheet, Eye, Printer, X, 
  Building2, Calendar, User, ShieldAlert, ArrowDownRight, 
  ArrowUpRight, AlertCircle, CreditCard, ChevronRight, FileText, Trash2
} from 'lucide-react';

export default function AccountsView() {
  const { currentUser, showToast, companySettings, allUsers } = useApp();

  const isAccountsUser = ['Accounts', 'GM', 'Admin', 'Managing Director', 'managing_director', 'CEO'].includes(currentUser?.role);

  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [sites, setSites] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deletingInvoice, setDeletingInvoice] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Active sub-tab
  // 'status' | 'invoices' | 'pending' | 'paid' | 'partial' | 'overdue' | 'payments' | 'statement' | 'vat'
  const [activeTab, setActiveTab] = useState('status');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [holdFilter, setHoldFilter] = useState('All');

  // Modals
  const [showNewInvoiceModal, setShowNewInvoiceModal] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState(null);
  const [viewingInvoice, setViewingInvoice] = useState(null);
  const [holdingInvoiceJob, setHoldingInvoiceJob] = useState(null);
  const [selectedCustomerForStatement, setSelectedCustomerForStatement] = useState('');
  const [customerStatement, setCustomerStatement] = useState(null);
  const [loadingStatement, setLoadingStatement] = useState(false);

  // New Invoice Form
  const defaultInvoiceForm = {
    customer_id: '',
    site_id: '',
    job_id: '',
    job_number: '',
    amc_id: '',
    amc_number: '',
    invoice_date: new Date().toISOString().slice(0, 10),
    due_date: new Date(Date.now() + 86400000 * 30).toISOString().slice(0, 10),
    amount_before_vat: '',
    vat_percent: 10,
    description: 'Quarterly Maintenance and Service Inspection Fee',
    notes: 'Payment terms: 30 days net. Please transfer to FIREX Bahrain Bank Account.'
  };
  const [newInvoiceData, setNewInvoiceData] = useState(defaultInvoiceForm);

  // Record Payment Form
  const [paymentFormData, setPaymentFormData] = useState({
    amount: '',
    payment_method: 'BenefitPay',
    reference_number: '',
    payment_date: new Date().toISOString().slice(0, 10),
    remarks: 'Full settlement'
  });

  // Hold Job Form
  const [holdFormData, setHoldFormData] = useState({
    hold_type: 'Payment Hold',
    hold_reason: 'Payment Pending / Overdue Payment',
    expected_release_date: '',
    remarks: 'Invoice overdue. Service paused pending payment clearance.'
  });

  const isGM = currentUser?.role === 'GM';
  const isMD = currentUser?.role === 'Managing Director' || currentUser?.role === 'managing_director' || currentUser?.role === 'CEO';
  const isAccounts = currentUser?.role === 'Accounts';
  const canManage = isGM || isMD || isAccounts;

  // Load Invoices and Summary
  const loadData = async () => {
    setLoading(true);
    try {
      const headers = {
        'x-user-role': currentUser.role,
        'x-user-id': currentUser.id
      };

      const [resInv, resSum, resCust, resSites, resPay] = await Promise.all([
        fetch('/api/invoices', { headers }),
        fetch('/api/invoices/summary', { headers }),
        fetch('/api/customers', { headers }),
        fetch('/api/sites', { headers }),
        fetch('/api/payments', { headers })
      ]);

      if (resInv.ok) setInvoices(await resInv.json());
      if (resSum.ok) setSummary(await resSum.json());
      if (resCust.ok) {
        const custs = await resCust.json();
        setCustomers(custs);
        if (custs.length > 0 && !selectedCustomerForStatement) {
          setSelectedCustomerForStatement(custs[0].id);
        }
      }
      if (resSites.ok) setSites(await resSites.json());
      if (resPay.ok) setPayments(await resPay.json());
    } catch (e) {
      console.warn('Error loading financial data:', e);
      showToast('Error loading financial records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  // Load customer statement
  const loadCustomerStatement = async (customerId) => {
    if (!customerId) return;
    setLoadingStatement(true);
    try {
      const res = await fetch(`/api/customers/${customerId}/statement`, {
        headers: {
          'x-user-role': currentUser.role,
          'x-user-id': currentUser.id
        }
      });
      if (res.ok) {
        setCustomerStatement(await res.json());
      }
    } catch (e) {
      console.warn('Error loading statement:', e);
    } finally {
      setLoadingStatement(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'statement' && selectedCustomerForStatement) {
      loadCustomerStatement(selectedCustomerForStatement);
    }
  }, [activeTab, selectedCustomerForStatement]);

  // Create Invoice Submission
  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    if (!newInvoiceData.customer_id || !newInvoiceData.site_id || !newInvoiceData.amount_before_vat) {
      showToast('Please fill all required invoice fields', 'error');
      return;
    }

    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser.role,
          'x-user-id': currentUser.id
        },
        body: JSON.stringify({
          ...newInvoiceData,
          amount_before_vat: Number(newInvoiceData.amount_before_vat)
        })
      });

      if (res.ok) {
        showToast('Invoice created and issued successfully', 'success');
        setShowNewInvoiceModal(false);
        setNewInvoiceData(defaultInvoiceForm);
        loadData();
      } else {
        const err = await res.json();
        showToast(err.message || 'Failed creating invoice', 'error');
      }
    } catch {
      showToast('Network error while creating invoice', 'error');
    }
  };

  // Delete Invoice (Accounts ONLY - Requirement 10)
  const handleDeleteInvoice = async (invoiceId) => {
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'DELETE',
        headers: {
          'x-user-role': currentUser.role,
          'x-user-id': currentUser.id
        }
      });
      if (res.ok) {
        showToast('Invoice permanently deleted successfully.', 'success');
        setDeletingInvoice(null);
        if (viewingInvoice?.id === invoiceId) setViewingInvoice(null);
        loadData();
      } else {
        const err = await res.json();
        showToast(err.message || 'Error deleting invoice', 'error');
      }
    } catch {
      showToast('Network error deleting invoice', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Record Payment Submission
  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!selectedInvoiceForPayment) return;

    const payAmt = Number(paymentFormData.amount);
    if (!payAmt || payAmt <= 0) {
      showToast('Please enter a valid payment amount', 'error');
      return;
    }

    try {
      const res = await fetch(`/api/invoices/${selectedInvoiceForPayment.id}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser.role,
          'x-user-id': currentUser.id
        },
        body: JSON.stringify(paymentFormData)
      });

      if (res.ok) {
        showToast(`Payment of BHD ${payAmt.toFixed(3)} recorded successfully`, 'success');
        setSelectedInvoiceForPayment(null);
        loadData();
      } else {
        const err = await res.json();
        showToast(err.message || 'Failed to record payment', 'error');
      }
    } catch {
      showToast('Network error while recording payment', 'error');
    }
  };

  // Place Payment Hold Submission
  const handlePlaceHold = async (e) => {
    e.preventDefault();
    if (!holdingInvoiceJob || !holdingInvoiceJob.job_id) {
      showToast('No job linked to this invoice to place on hold', 'warning');
      return;
    }

    try {
      const res = await fetch(`/api/jobs/${holdingInvoiceJob.job_id}/hold`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser.role,
          'x-user-id': currentUser.id
        },
        body: JSON.stringify(holdFormData)
      });

      if (res.ok) {
        showToast(`Job placed on ${holdFormData.hold_type}`, 'success');
        setHoldingInvoiceJob(null);
        loadData();
      } else {
        const err = await res.json();
        showToast(err.message || 'Error placing hold', 'error');
      }
    } catch {
      showToast('Network error while placing hold', 'error');
    }
  };

  // Filtered Invoices
  const filteredInvoices = invoices.filter(inv => {
    if (activeTab === 'pending' && inv.payment_status !== 'Pending') return false;
    if (activeTab === 'paid' && inv.payment_status !== 'Paid') return false;
    if (activeTab === 'partial' && inv.payment_status !== 'Partially Paid') return false;
    if (activeTab === 'overdue' && inv.payment_status !== 'Overdue') return false;

    if (statusFilter !== 'All' && inv.payment_status !== statusFilter) return false;
    if (holdFilter !== 'All') {
      if (holdFilter === 'Payment Hold' && inv.hold_status !== 'Payment Hold') return false;
      if (holdFilter === 'Operational Hold' && inv.hold_status !== 'Operational Hold') return false;
      if (holdFilter === 'Active' && inv.hold_status !== 'Active') return false;
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchNumber = inv.invoice_number?.toLowerCase().includes(q);
      const matchCust = inv.customer_name?.toLowerCase().includes(q);
      const matchSite = inv.site_name?.toLowerCase().includes(q);
      const matchRef = (inv.job_number || inv.amc_number)?.toLowerCase().includes(q);
      if (!matchNumber && !matchCust && !matchSite && !matchRef) return false;
    }

    return true;
  });

  return (
    <div className="space-y-4 pb-20 animate-in fade-in">
      
      {/* Page Title & Action Bar */}
      <div className="flex items-center justify-between flex-wrap gap-2 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-teal-50 text-teal-700 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black text-navy-900 tracking-tight">
                ACCOUNTS &amp; FINANCIAL MANAGEMENT
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Invoices, Payments, Customer Statements, VAT (10%) &amp; Payment Holds
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {canManage && (
            <button
              onClick={() => {
                setNewInvoiceData(defaultInvoiceForm);
                setShowNewInvoiceModal(true);
              }}
              className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Invoice</span>
            </button>
          )}

          <button
            onClick={() => exportInvoicesToExcel(invoices)}
            className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
            title="Download Invoices Excel Spreadsheet"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Export Invoices</span> (Excel)
          </button>
        </div>
      </div>

      {/* SUMMARY KPI CARDS (Requirements 12, 13) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        
        {/* Total Invoiced */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Total Invoiced
          </span>
          <div className="text-base sm:text-lg font-black font-mono text-navy-900 mt-1">
            {formatBHD(summary?.total_invoiced || 0)}
          </div>
          <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">
            {invoices.length} Invoices Issued
          </span>
        </div>

        {/* Total Received */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">
            Total Paid / Collected
          </span>
          <div className="text-base sm:text-lg font-black font-mono text-emerald-700 mt-1">
            {formatBHD(summary?.total_received || 0)}
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
            {summary?.paid_count || 0} Fully Cleared
          </span>
        </div>

        {/* Total Outstanding */}
        <div className="bg-white p-3.5 rounded-2xl border border-amber-200 bg-amber-50/30 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
            Total Outstanding
          </span>
          <div className="text-base sm:text-lg font-black font-mono text-amber-900 mt-1">
            {formatBHD(summary?.total_outstanding || 0)}
          </div>
          <span className="text-[10px] text-amber-700 font-semibold block mt-0.5">
            {summary?.outstanding_customers_count || 0} Clients with Balance
          </span>
        </div>

        {/* Overdue Warning Alert Card */}
        <div className={`p-3.5 rounded-2xl border shadow-sm transition-all ${
          (summary?.overdue_count || 0) > 0 
            ? 'bg-rose-50 border-rose-300 animate-pulse text-rose-900' 
            : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 block">
              Overdue Invoices
            </span>
            {(summary?.overdue_count || 0) > 0 && (
              <AlertTriangle className="w-4 h-4 text-rose-600 animate-bounce" />
            )}
          </div>
          <div className="text-base sm:text-lg font-black font-mono text-rose-700 mt-1">
            {formatBHD(summary?.overdue_amount || 0)}
          </div>
          <span className="text-[10px] text-rose-700 font-bold block mt-0.5">
            {summary?.overdue_count || 0} Overdue • Payment Holds: {summary?.payment_holds_count || 0}
          </span>
        </div>

      </div>

      {/* Navigation Sub-Tabs */}
      <div className="bg-white rounded-2xl p-1.5 border border-slate-200 shadow-sm flex items-center gap-1 overflow-x-auto text-xs font-bold scrollbar-none">
        {[
          { id: 'status', label: 'Invoice Status (Master)' },
          { id: 'invoices', label: `All Invoices (${invoices.length})` },
          { id: 'overdue', label: `Overdue (${summary?.overdue_count || 0})`, alert: (summary?.overdue_count || 0) > 0 },
          { id: 'pending', label: `Pending (${summary?.pending_count || 0})` },
          { id: 'partial', label: `Partially Paid (${summary?.partially_paid_count || 0})` },
          { id: 'paid', label: `Paid (${summary?.paid_count || 0})` },
          { id: 'payments', label: `Receipts (${payments.length})` },
          { id: 'statement', label: 'Customer Statement' },
          { id: 'vat', label: 'VAT Summary' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === t.id
                ? 'bg-navy-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>{t.label}</span>
            {t.alert && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            )}
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: INVOICE STATUS & INVOICE LISTINGS                                 */}
      {/* ========================================================================= */}
      {['status', 'invoices', 'pending', 'paid', 'partial', 'overdue'].includes(activeTab) && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-3 p-3 sm:p-4">
          
          {/* Search & Filter Toolbar */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Invoice #, Customer, Site, Reference..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter by Hold Status */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 font-bold">Hold:</span>
              <select
                value={holdFilter}
                onChange={(e) => setHoldFilter(e.target.value)}
                className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-navy-900 text-xs"
              >
                <option value="All">All Hold States</option>
                <option value="Active">Normal (Active)</option>
                <option value="Payment Hold">🔴 On Payment Hold</option>
                <option value="Operational Hold">🟠 On Operational Hold</option>
              </select>
            </div>
          </div>

          {/* Master Table */}
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading invoice ledger...</div>
          ) : filteredInvoices.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl text-xs text-slate-400 border border-slate-100">
              No invoice records matching criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[10px] uppercase font-black tracking-wider text-slate-500">
                    <th className="p-2.5">Invoice #</th>
                    <th className="p-2.5">Customer &amp; Site</th>
                    <th className="p-2.5">Reference</th>
                    <th className="p-2.5">Dates</th>
                    <th className="p-2.5 text-right">Excl. VAT</th>
                    <th className="p-2.5 text-right">VAT (10%)</th>
                    <th className="p-2.5 text-right">Total (BHD)</th>
                    <th className="p-2.5 text-right">Paid (BHD)</th>
                    <th className="p-2.5 text-right">Balance</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5">Hold</th>
                    <th className="p-2.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredInvoices.map(inv => {
                    const isOverdue = inv.payment_status === 'Overdue';
                    const hasHold = inv.hold_status === 'Payment Hold' || inv.is_job_on_hold;

                    return (
                      <tr 
                        key={inv.id} 
                        className={`hover:bg-slate-50/80 transition-colors ${
                          isOverdue ? 'bg-rose-50/40' : ''
                        }`}
                      >
                        {/* Invoice # */}
                        <td className="p-2.5 whitespace-nowrap">
                          <span className="font-mono font-bold text-navy-900 bg-slate-100 px-2 py-0.5 rounded">
                            {inv.invoice_number}
                          </span>
                        </td>

                        {/* Customer & Site */}
                        <td className="p-2.5 min-w-[160px]">
                          <div className="font-bold text-slate-900 truncate">{inv.customer_name}</div>
                          <div className="text-[10px] text-slate-400 truncate">{inv.site_name}</div>
                        </td>

                        {/* Reference */}
                        <td className="p-2.5 whitespace-nowrap">
                          <span className="text-[10px] font-mono font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                            {inv.job_number || inv.amc_number || 'Direct'}
                          </span>
                        </td>

                        {/* Dates */}
                        <td className="p-2.5 whitespace-nowrap text-[10px]">
                          <div>Inv: {inv.invoice_date}</div>
                          <div className={isOverdue ? 'text-rose-600 font-bold' : 'text-slate-400'}>
                            Due: {inv.due_date}
                          </div>
                        </td>

                        {/* Amount Excl VAT */}
                        <td className="p-2.5 text-right font-mono font-semibold whitespace-nowrap">
                          {formatBHD(inv.amount_before_vat)}
                        </td>

                        {/* VAT Amount */}
                        <td className="p-2.5 text-right font-mono text-amber-700 whitespace-nowrap">
                          {formatBHD(inv.vat_amount)}
                        </td>

                        {/* Total Amount */}
                        <td className="p-2.5 text-right font-mono font-black text-slate-900 whitespace-nowrap">
                          {formatBHD(inv.total_amount)}
                        </td>

                        {/* Paid Amount */}
                        <td className="p-2.5 text-right font-mono text-emerald-700 whitespace-nowrap">
                          {formatBHD(inv.amount_paid)}
                        </td>

                        {/* Balance */}
                        <td className="p-2.5 text-right font-mono font-black whitespace-nowrap">
                          <span className={inv.outstanding_balance > 0 ? 'text-amber-800' : 'text-slate-400'}>
                            {formatBHD(inv.outstanding_balance)}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="p-2.5 whitespace-nowrap">
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                            inv.payment_status === 'Paid'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : inv.payment_status === 'Overdue'
                              ? 'bg-rose-100 text-rose-800 border-rose-300 font-black animate-pulse'
                              : inv.payment_status === 'Partially Paid'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            {inv.payment_status}
                          </span>
                          {inv.days_overdue > 0 && (
                            <span className="block text-[9px] text-rose-600 font-black mt-0.5">
                              {inv.days_overdue}d Overdue
                            </span>
                          )}
                        </td>

                        {/* Hold Status */}
                        <td className="p-2.5 whitespace-nowrap">
                          {hasHold ? (
                            <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-rose-600 text-white flex items-center gap-1 w-fit shadow-xs">
                              <ShieldAlert className="w-3 h-3" />
                              <span>{inv.hold_status || 'On Hold'}</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-semibold">
                              Normal
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="p-2.5 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            
                            {/* View Invoice */}
                            <button
                              onClick={() => setViewingInvoice(inv)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-navy-900 hover:bg-slate-100"
                              title="View Invoice Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Record Payment */}
                            {canManage && inv.outstanding_balance > 0 && (
                              <button
                                onClick={() => {
                                  setSelectedInvoiceForPayment(inv);
                                  setPaymentFormData({
                                    amount: inv.outstanding_balance,
                                    payment_method: 'BenefitPay',
                                    reference_number: '',
                                    payment_date: new Date().toISOString().slice(0, 10),
                                    remarks: 'Full settlement balance'
                                  });
                                }}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-xs"
                                title="Record Payment"
                              >
                                <CreditCard className="w-3 h-3" />
                                <span>Pay</span>
                              </button>
                            )}

                            {/* Place Payment Hold (Accounts & GM only) */}
                            {canManage && inv.job_id && (
                              <button
                                onClick={() => {
                                  setHoldingInvoiceJob(inv);
                                  setHoldFormData({
                                    hold_type: 'Payment Hold',
                                    hold_reason: 'Payment Pending / Overdue Payment',
                                    expected_release_date: '',
                                    remarks: `Invoice ${inv.invoice_number} is overdue. Service held until payment settlement.`
                                  });
                                }}
                                className={`p-1.5 rounded-lg text-xs font-bold ${
                                  hasHold 
                                    ? 'text-rose-600 hover:bg-rose-50' 
                                    : 'text-amber-600 hover:bg-amber-50'
                                }`}
                                title="Place or Adjust Payment Hold on Job"
                              >
                                <ShieldAlert className="w-4 h-4" />
                              </button>
                            )}

                            {/* Delete Invoice - Strictly Restricted to Accounts Users (Requirement 10) */}
                            {isAccountsUser && (
                              <button
                                onClick={() => setDeletingInvoice(inv)}
                                className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                                title="Delete Invoice (Accounts Only)"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}

                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PAYMENT HISTORY / RECEIPTS                                         */}
      {/* ========================================================================= */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-navy-900 uppercase tracking-wider">
              Payment Receipts &amp; Transaction Log ({payments.length})
            </h2>
            <button
              onClick={() => exportPaymentsToExcel(payments)}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Export Receipts</span>
            </button>
          </div>

          {payments.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">No payment receipts recorded yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[10px] uppercase font-bold text-slate-500">
                    <th className="p-2.5">Receipt #</th>
                    <th className="p-2.5">Invoice #</th>
                    <th className="p-2.5">Customer</th>
                    <th className="p-2.5">Payment Date</th>
                    <th className="p-2.5">Method</th>
                    <th className="p-2.5">Reference #</th>
                    <th className="p-2.5 text-right">Amount Paid</th>
                    <th className="p-2.5">Received By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {payments.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/80">
                      <td className="p-2.5 font-mono font-bold text-teal-800">{p.payment_number}</td>
                      <td className="p-2.5 font-mono text-slate-700">{p.invoice_number}</td>
                      <td className="p-2.5 font-bold text-slate-900">{p.customer_name}</td>
                      <td className="p-2.5 text-slate-600">{p.payment_date}</td>
                      <td className="p-2.5">
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-semibold text-slate-700">
                          {p.payment_method}
                        </span>
                      </td>
                      <td className="p-2.5 font-mono text-slate-600">{p.reference_number || 'N/A'}</td>
                      <td className="p-2.5 text-right font-mono font-black text-emerald-800">
                        {formatBHD(p.amount)}
                      </td>
                      <td className="p-2.5 text-slate-600">{p.received_by}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: CUSTOMER STATEMENT OF ACCOUNT                                      */}
      {/* ========================================================================= */}
      {activeTab === 'statement' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-4">
          
          {/* Customer Selector & Actions */}
          <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Select Customer:</span>
              <select
                value={selectedCustomerForStatement}
                onChange={(e) => setSelectedCustomerForStatement(e.target.value)}
                className="p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-navy-900 text-xs min-w-[240px]"
              >
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {customerStatement && (
              <button
                onClick={() => exportCustomerStatementToExcel(customerStatement)}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Export Statement to Excel</span>
              </button>
            )}
          </div>

          {loadingStatement ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading statement...</div>
          ) : !customerStatement ? (
            <div className="p-8 text-center text-xs text-slate-400">Select a customer to view ledger.</div>
          ) : (
            <div className="space-y-4">
              
              {/* Customer Header & Net Balance Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Billed</span>
                  <div className="text-base font-black font-mono text-slate-900 mt-0.5">
                    {formatBHD(customerStatement.total_billed)}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Paid</span>
                  <div className="text-base font-black font-mono text-emerald-700 mt-0.5">
                    {formatBHD(customerStatement.total_paid)}
                  </div>
                </div>
                <div className="bg-amber-100/60 p-2.5 rounded-lg border border-amber-200">
                  <span className="text-[10px] uppercase font-black text-amber-900 block">Net Balance Due</span>
                  <div className="text-lg font-black font-mono text-amber-900 mt-0.5">
                    {formatBHD(customerStatement.outstanding_balance)}
                  </div>
                </div>
              </div>

              {/* Ledger Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-[10px] uppercase font-bold text-slate-500">
                      <th className="p-2.5">Date</th>
                      <th className="p-2.5">Type</th>
                      <th className="p-2.5">Reference #</th>
                      <th className="p-2.5">Description</th>
                      <th className="p-2.5 text-right">Debit (+)</th>
                      <th className="p-2.5 text-right">Credit (-)</th>
                      <th className="p-2.5 text-right">Running Balance</th>
                      <th className="p-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {(customerStatement.ledger || []).map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2.5 whitespace-nowrap text-slate-600">{row.date}</td>
                        <td className="p-2.5 whitespace-nowrap font-bold text-navy-900">{row.type}</td>
                        <td className="p-2.5 whitespace-nowrap font-mono text-slate-700">{row.reference}</td>
                        <td className="p-2.5 text-slate-700">{row.description}</td>
                        <td className="p-2.5 text-right font-mono font-semibold text-slate-900">
                          {row.debit > 0 ? formatBHD(row.debit) : '-'}
                        </td>
                        <td className="p-2.5 text-right font-mono font-semibold text-emerald-700">
                          {row.credit > 0 ? formatBHD(row.credit) : '-'}
                        </td>
                        <td className="p-2.5 text-right font-mono font-black text-slate-900">
                          {formatBHD(row.running_balance)}
                        </td>
                        <td className="p-2.5 whitespace-nowrap">
                          <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-semibold text-slate-700">
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: VAT SUMMARY (10% BAHRAIN NBR COMPLIANT)                           */}
      {/* ========================================================================= */}
      {activeTab === 'vat' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-black text-navy-900 uppercase tracking-wider">
                Bahrain National Bureau for Revenue (NBR) 10% VAT Report
              </h2>
              <p className="text-xs text-slate-500">
                Official Company VAT Account: 220006271900002 • CR: 96850 1
              </p>
            </div>
            <button
              onClick={() => exportInvoicesToExcel(invoices, 'FIREX_VAT_Report.xlsx')}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export VAT Schedule</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-xs uppercase font-bold text-slate-500 block">Total Sales (Before VAT)</span>
              <div className="text-xl font-black font-mono text-slate-900 mt-1">
                {formatBHD(summary?.vat_summary?.total_before_vat || 0)}
              </div>
            </div>

            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
              <span className="text-xs uppercase font-bold text-amber-800 block">Total 10% VAT Collected</span>
              <div className="text-xl font-black font-mono text-amber-700 mt-1">
                {formatBHD(summary?.vat_summary?.total_vat || 0)}
              </div>
            </div>

            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
              <span className="text-xs uppercase font-bold text-emerald-800 block">Gross Invoiced (Incl. VAT)</span>
              <div className="text-xl font-black font-mono text-emerald-900 mt-1">
                {formatBHD(summary?.vat_summary?.total_including_vat || 0)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: CREATE NEW INVOICE                                              */}
      {/* ========================================================================= */}
      {showNewInvoiceModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white w-full max-w-xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-xs">
            
            <div className="p-4 bg-navy-900 text-white flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black uppercase tracking-wider">Create &amp; Issue Invoice</h2>
                <p className="text-[11px] text-slate-400">Generate Bahrain Dinar tax invoice with 10% VAT</p>
              </div>
              <button 
                onClick={() => setShowNewInvoiceModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="p-4 overflow-y-auto space-y-3.5 flex-1">
              
              {/* Customer */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Customer Client *</label>
                <select
                  required
                  value={newInvoiceData.customer_id}
                  onChange={(e) => {
                    const custId = e.target.value;
                    const custSites = sites.filter(s => s.customer_id === custId);
                    setNewInvoiceData(p => ({
                      ...p,
                      customer_id: custId,
                      site_id: custSites[0]?.id || ''
                    }));
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-navy-900"
                >
                  <option value="">Select Customer</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Site Premises */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Site Premises *</label>
                <select
                  required
                  value={newInvoiceData.site_id}
                  onChange={(e) => setNewInvoiceData(p => ({ ...p, site_id: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-navy-900"
                >
                  <option value="">Select Premises</option>
                  {sites
                    .filter(s => !newInvoiceData.customer_id || s.customer_id === newInvoiceData.customer_id)
                    .map(s => (
                      <option key={s.id} value={s.id}>{s.site_name}</option>
                    ))}
                </select>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Invoice Date *</label>
                  <input
                    type="date"
                    required
                    value={newInvoiceData.invoice_date}
                    onChange={(e) => setNewInvoiceData(p => ({ ...p, invoice_date: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Payment Due Date *</label>
                  <input
                    type="date"
                    required
                    value={newInvoiceData.due_date}
                    onChange={(e) => setNewInvoiceData(p => ({ ...p, due_date: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>
              </div>

              {/* Amount & 10% VAT calculation */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <label className="block font-bold text-slate-700">Amount Before VAT (BHD) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono font-bold text-slate-400">BHD</span>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    required
                    placeholder="350.000"
                    value={newInvoiceData.amount_before_vat}
                    onChange={(e) => setNewInvoiceData(p => ({ ...p, amount_before_vat: e.target.value }))}
                    className="w-full pl-12 pr-3 py-2 bg-white border border-slate-200 rounded-xl font-mono font-bold text-sm text-navy-900"
                  />
                </div>

                {newInvoiceData.amount_before_vat && (
                  <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-500">VAT (10%):</span>
                      <span className="font-mono font-bold text-amber-700 block">
                        {formatBHD((Number(newInvoiceData.amount_before_vat) * 0.1) || 0)}
                      </span>
                    </div>
                    <div>
                      <span className="text-emerald-800 font-bold">Total (Incl. VAT):</span>
                      <span className="font-mono font-black text-emerald-900 block text-xs">
                        {formatBHD((Number(newInvoiceData.amount_before_vat) * 1.1) || 0)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Invoice Description / Scope *</label>
                <textarea
                  rows={2}
                  required
                  value={newInvoiceData.description}
                  onChange={(e) => setNewInvoiceData(p => ({ ...p, description: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewInvoiceModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-sm"
                >
                  Create &amp; Issue Invoice
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: RECORD PAYMENT                                                  */}
      {/* ========================================================================= */}
      {selectedInvoiceForPayment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-xs">
            
            <div className="p-4 bg-emerald-700 text-white flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black uppercase tracking-wider">Record Payment</h2>
                <p className="text-[11px] text-emerald-200">Invoice: {selectedInvoiceForPayment.invoice_number}</p>
              </div>
              <button 
                onClick={() => setSelectedInvoiceForPayment(null)}
                className="p-1 rounded-lg text-emerald-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="p-4 space-y-3.5">
              
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Due</span>
                  <span className="font-mono font-black text-slate-800 text-sm">
                    {formatBHD(selectedInvoiceForPayment.total_amount)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Already Paid</span>
                  <span className="font-mono font-bold text-emerald-700 text-sm">
                    {formatBHD(selectedInvoiceForPayment.amount_paid)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-800 block">Balance Due</span>
                  <span className="font-mono font-black text-amber-800 text-sm">
                    {formatBHD(selectedInvoiceForPayment.outstanding_balance)}
                  </span>
                </div>
              </div>

              {/* Payment Amount */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold text-slate-700">Payment Amount (BHD) *</label>
                  <button
                    type="button"
                    onClick={() => setPaymentFormData(p => ({ ...p, amount: selectedInvoiceForPayment.outstanding_balance }))}
                    className="text-[10px] text-teal-600 font-bold hover:underline"
                  >
                    Pay Full Balance
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono font-bold text-slate-400">BHD</span>
                  <input
                    type="number"
                    step="0.001"
                    min="0.001"
                    max={selectedInvoiceForPayment.outstanding_balance}
                    required
                    value={paymentFormData.amount}
                    onChange={(e) => setPaymentFormData(p => ({ ...p, amount: e.target.value }))}
                    className="w-full pl-12 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-sm text-navy-900"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Payment Method *</label>
                <select
                  value={paymentFormData.payment_method}
                  onChange={(e) => setPaymentFormData(p => ({ ...p, payment_method: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-navy-900"
                >
                  <option value="BenefitPay">BenefitPay (Bahrain Instant)</option>
                  <option value="Bank Transfer">Bank Transfer (Wire / RTGS)</option>
                  <option value="Cheque">Company Cheque</option>
                  <option value="Cash">Cash Receipt</option>
                  <option value="Credit Card">Credit Card / POS</option>
                </select>
              </div>

              {/* Reference / Cheque # */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Transaction Ref / Cheque #</label>
                <input
                  type="text"
                  placeholder="e.g. BP-8849201 or Cheque #00492"
                  value={paymentFormData.reference_number}
                  onChange={(e) => setPaymentFormData(p => ({ ...p, reference_number: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                />
              </div>

              {/* Remarks */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Remarks</label>
                <input
                  type="text"
                  value={paymentFormData.remarks}
                  onChange={(e) => setPaymentFormData(p => ({ ...p, remarks: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedInvoiceForPayment(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm"
                >
                  Record Payment
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: VIEW INVOICE DETAILS                                            */}
      {/* ========================================================================= */}
      {viewingInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-xs">
            
            <div className="p-4 bg-navy-900 text-white flex items-center justify-between">
              <div>
                <span className="font-mono font-bold bg-teal-600 px-2 py-0.5 rounded text-xs">
                  {viewingInvoice.invoice_number}
                </span>
                <h2 className="text-sm font-bold text-white mt-1">Tax Invoice • FIREX Bahrain</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="p-1.5 rounded-lg bg-navy-800 text-slate-300 hover:text-white flex items-center gap-1"
                >
                  <Printer className="w-4 h-4" />
                  <span className="hidden sm:inline">Print</span>
                </button>
                <button 
                  onClick={() => setViewingInvoice(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
              
              {/* Header Details */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-4 flex-wrap gap-2">
                <div>
                  <h3 className="font-black text-sm text-navy-900">FIREX BAHRAIN</h3>
                  <p className="text-[11px] text-slate-500">Villa 13, Building 2373, Road 2831, Al Seef, Bahrain</p>
                  <p className="text-[11px] text-slate-500">CR: 96850 1 • VAT: 220006271900002</p>
                </div>
                <div className="text-right">
                  <div className="font-mono font-black text-sm text-teal-800">{viewingInvoice.invoice_number}</div>
                  <div className="text-[11px] text-slate-500">Date: {viewingInvoice.invoice_date}</div>
                  <div className="text-[11px] text-slate-500">Due: {viewingInvoice.due_date}</div>
                </div>
              </div>

              {/* Bill To */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Billed To</span>
                <div className="font-bold text-slate-900 text-sm">{viewingInvoice.customer_name}</div>
                <div className="text-xs text-slate-600 mt-0.5">{viewingInvoice.site_name}</div>
                {viewingInvoice.job_number && (
                  <div className="text-[11px] text-slate-500 mt-1">Ref: {viewingInvoice.job_number}</div>
                )}
              </div>

              {/* Items Table */}
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500">
                    <th className="py-2">Description</th>
                    <th className="py-2 text-right">Amount (BHD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(viewingInvoice.items || [{ description: viewingInvoice.description, total: viewingInvoice.amount_before_vat }]).map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2 text-slate-800">{item.description}</td>
                      <td className="py-2 text-right font-mono font-semibold text-slate-900">
                        {formatBHD(item.total || item.unit_price || viewingInvoice.amount_before_vat)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="border-t border-slate-200 pt-3 space-y-1.5 text-right font-mono">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Amount Before VAT:</span>
                  <span>{formatBHD(viewingInvoice.amount_before_vat)}</span>
                </div>
                <div className="flex justify-between text-xs text-amber-700">
                  <span>VAT (10%):</span>
                  <span>{formatBHD(viewingInvoice.vat_amount)}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-navy-900 border-t border-slate-200 pt-1.5">
                  <span>Total Amount (Incl. VAT):</span>
                  <span>{formatBHD(viewingInvoice.total_amount)}</span>
                </div>
                <div className="flex justify-between text-xs text-emerald-700">
                  <span>Amount Paid:</span>
                  <span>{formatBHD(viewingInvoice.amount_paid)}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-amber-800 border-t border-slate-200 pt-1.5">
                  <span>Balance Outstanding:</span>
                  <span>{formatBHD(viewingInvoice.outstanding_balance)}</span>
                </div>
              </div>

              {/* Payment History on this invoice */}
              {viewingInvoice.payments && viewingInvoice.payments.length > 0 && (
                <div className="border-t border-slate-200 pt-3">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">
                    Payment Receipts Applied ({viewingInvoice.payments.length})
                  </span>
                  <div className="space-y-1.5">
                    {viewingInvoice.payments.map(p => (
                      <div key={p.id} className="p-2 bg-emerald-50 rounded-lg flex justify-between items-center text-[11px]">
                        <div>
                          <span className="font-mono font-bold text-emerald-800">{p.payment_number}</span> • {p.payment_date} ({p.payment_method})
                        </div>
                        <div className="font-mono font-black text-emerald-800">
                          {formatBHD(p.amount)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <div>
                {isAccountsUser && (
                  <button
                    onClick={() => {
                      setDeletingInvoice(viewingInvoice);
                    }}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold flex items-center gap-1.5 text-xs transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-rose-600" />
                    <span>Delete Invoice</span>
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewingInvoice(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* CONFIRM PERMANENT INVOICE DELETION MODAL (Accounts Only - Requirement 10) */}
      {deletingInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 rounded-xl bg-rose-100">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Permanently Delete Invoice</h3>
                <p className="text-xs text-slate-500">Accounts Action Required</p>
              </div>
            </div>
            
            <p className="text-xs text-slate-800 leading-relaxed font-bold">
              Are you sure you want to permanently delete this invoice and its related payment records?
            </p>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1 font-mono">
              <div>Invoice: <strong className="text-navy-900">{deletingInvoice.invoice_number}</strong></div>
              <div>Customer: <strong className="text-navy-900">{deletingInvoice.customer_name}</strong></div>
              <div>Total: <strong className="text-emerald-700">{formatBHD(deletingInvoice.total_amount)}</strong></div>
              <div>Balance: <strong className="text-amber-800">{formatBHD(deletingInvoice.outstanding_balance)}</strong></div>
            </div>

            <p className="text-[11px] text-slate-400 italic">
              This action cannot be undone. Associated test payment records will also be cleaned and account balances will be recalculated.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingInvoice(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-black text-xs uppercase transition-colors"
              >
                CANCEL
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => handleDeleteInvoice(deletingInvoice.id)}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black text-xs uppercase flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'DELETING...' : 'DELETE'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: PLACE / ADJUST PAYMENT HOLD ON JOB                              */}
      {/* ========================================================================= */}
      {holdingInvoiceJob && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-xs">
            
            <div className="p-4 bg-rose-700 text-white flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Place Payment Hold on Job</span>
                </h2>
                <p className="text-[11px] text-rose-200">Linked Job: {holdingInvoiceJob.job_number}</p>
              </div>
              <button 
                onClick={() => setHoldingInvoiceJob(null)}
                className="p-1 rounded-lg text-rose-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePlaceHold} className="p-4 space-y-3.5">
              
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 space-y-1">
                <span className="font-bold block">Authority: Accounts &amp; GM</span>
                <p className="text-[11px] leading-relaxed">
                  Placing a Payment Hold on this job pauses on-site technician activities and issues a prominent warning across all dashboards until client settlement is confirmed.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Hold Reason *</label>
                <select
                  value={holdFormData.hold_reason}
                  onChange={(e) => setHoldFormData(p => ({ ...p, hold_reason: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-navy-900"
                >
                  <option value="Payment Pending / Overdue Payment">Payment Pending / Overdue Payment</option>
                  <option value="Management Decision">Management Decision</option>
                  <option value="Other">Other (Special Financial Condition)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Expected Release Date</label>
                <input
                  type="date"
                  value={holdFormData.expected_release_date}
                  onChange={(e) => setHoldFormData(p => ({ ...p, expected_release_date: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Remarks &amp; Next Action Required *</label>
                <textarea
                  rows={3}
                  required
                  value={holdFormData.remarks}
                  onChange={(e) => setHoldFormData(p => ({ ...p, remarks: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setHoldingInvoiceJob(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-sm"
                >
                  Place on Payment Hold
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
