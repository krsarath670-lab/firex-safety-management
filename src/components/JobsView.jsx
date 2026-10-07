import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { formatBHD } from '../utils/formatters';
import { 
  Briefcase, Plus, Search, Calendar, Users, Wrench, 
  Flame, CheckCircle2, Clock, ChevronRight, FileText, ArrowRight,
  DollarSign, Building2, Package, Edit, X, UserCheck, ShieldCheck,
  Trash2, AlertTriangle, ShieldAlert, Download
} from 'lucide-react';
import { exportJobsToExcel, exportFitoutToExcel, exportProjectToExcel } from '../utils/excelExport';

import QuickAddCustomerModal from './QuickAddCustomerModal';

export default function JobsView({ onStartJob, onStartInspectionForJob, onNewReportForJob, initialJobType = null }) {
  const { currentUser, showToast, allUsers } = useApp();
  const canPrepareReports = currentUser?.role === 'CEO' || ['Projects Manager', 'Engineer', 'Supervisor', 'Technician'].includes(currentUser?.role);
  const [jobs, setJobs] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState(initialJobType || 'all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [salesPersonFilter, setSalesPersonFilter] = useState('all');

  // Modals
  const [showNewJobModal, setShowNewJobModal] = useState(false);
  const [showQuickAddCustomer, setShowQuickAddCustomer] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [isDeletingJob, setIsDeletingJob] = useState(false);

  // Job Hold States
  const [holdingJob, setHoldingJob] = useState(null);
  const [releasingHoldJob, setReleasingHoldJob] = useState(null);
  const [holdFormData, setHoldFormData] = useState({
    hold_type: 'Payment Hold',
    reason: 'Overdue Invoice',
    remarks: '',
    next_action: 'Client to clear overdue payment before work resumes'
  });
  const [releaseRemarks, setReleaseRemarks] = useState('');
  const [isHoldSubmitting, setIsHoldSubmitting] = useState(false);

  const isSales = currentUser?.role === 'Sales';
  const isTechnician = currentUser?.role === 'Technician';
  const isAccounts = currentUser?.role === 'Accounts';
  const isProjectsManager = currentUser?.role === 'Projects Manager';
  const isGM = currentUser?.role === 'GM';
  const isCEO = currentUser?.role === 'CEO';
  const isEngineer = currentUser?.role === 'Engineer';
  const isManagement = ['GM', 'CEO', 'Engineer', 'Supervisor'].includes(currentUser?.role);
  const canEditDelete = isManagement || isProjectsManager;
  const canHoldFinancial = isGM || isCEO || isAccounts;
  const canHoldOperational = isGM || isCEO || isProjectsManager || isEngineer;
  const canHoldJobs = canHoldFinancial || canHoldOperational;
  const canReleaseHold = isGM || isCEO || isAccounts || isProjectsManager || isEngineer;

  const salesUsers = (allUsers || []).filter(u => u.role === 'Sales');
  const supervisorUsers = (allUsers || []).filter(u => u.role === 'Supervisor');
  const technicianUsers = (allUsers || []).filter(u => u.role === 'Technician');

  // New Job Form State
  const defaultNewJobState = () => ({
    job_type: initialJobType || 'Breakdown',
    system: 'Fire Alarm',
    customer_id: '',
    site_id: '',
    description: '',
    amount: 150.000,
    vat_percent: 10,
    quotation_number: '',
    sales_person_id: isSales ? currentUser.id : (salesUsers[0]?.id || ''),
    supervisor_id: supervisorUsers[0]?.id || 'usr-sup',
    technician_id: technicianUsers[0]?.id || 'usr-tech',
    expected_start_date: new Date().toISOString().slice(0, 10),
    expected_completion_date: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10),
    status: 'In Progress',
    remarks: ''
  });

  const [newJobData, setNewJobData] = useState(defaultNewJobState);

  useEffect(() => {
    if (initialJobType) {
      setTypeFilter(initialJobType);
      setNewJobData(p => ({ ...p, job_type: initialJobType }));
    }
  }, [initialJobType]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [resJobs, resCust, resSites] = await Promise.all([
        fetch('/api/jobs', { headers: { 'x-user-role': currentUser.role, 'x-user-id': currentUser.id } }),
        fetch('/api/customers', { headers: { 'x-user-role': currentUser.role, 'x-user-id': currentUser.id } }),
        fetch('/api/sites', { headers: { 'x-user-role': currentUser.role, 'x-user-id': currentUser.id } })
      ]);
      if (resJobs.ok) setJobs(await resJobs.json());
      if (resCust.ok) setCustomers(await resCust.json());
      if (resSites.ok) setSites(await resSites.json());
    } catch (e) {
      console.warn('Failed loading jobs', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const handleCreateJob = async (e) => {
    e.preventDefault();
    if (!newJobData.site_id) {
      showToast('Please select a site premises', 'error');
      return;
    }
    try {
      const payload = {
        ...newJobData,
        amount: Number(newJobData.amount) || 0,
        vat_percent: Number(newJobData.vat_percent) || 10,
        sales_person_id: isSales ? currentUser.id : (newJobData.sales_person_id || salesUsers[0]?.id)
      };

      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser.role,
          'x-user-id': currentUser.id
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showToast('Work order created successfully', 'success');
        setShowNewJobModal(false);
        setNewJobData(defaultNewJobState());
        loadData();
      } else {
        const err = await res.json();
        showToast(err.message || 'Error creating job', 'error');
      }
    } catch (e) {
      showToast('Network error', 'error');
    }
  };

  const handleSaveEditJob = async (e) => {
    e.preventDefault();
    if (!editingJob) return;
    try {
      const res = await fetch(`/api/jobs/${editingJob.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser.role,
          'x-user-id': currentUser.id
        },
        body: JSON.stringify({
          job_type: editingJob.job_type,
          system_type: editingJob.system || editingJob.system_type,
          system: editingJob.system || editingJob.system_type,
          description: editingJob.description,
          amount: Number(editingJob.amount) || 0,
          vat_percent: Number(editingJob.vat_percent) || 10,
          sales_person_id: editingJob.sales_person_id,
          quotation_number: editingJob.quotation_number,
          technician_id: editingJob.technician_id,
          supervisor_id: editingJob.supervisor_id,
          expected_start_date: editingJob.expected_start_date,
          expected_completion_date: editingJob.expected_completion_date,
          status: editingJob.status,
          remarks: editingJob.remarks
        })
      });
      if (res.ok) {
        showToast(`Work order ${editingJob.job_number} updated successfully`, 'success');
        setEditingJob(null);
        loadData();
      } else {
        const err = await res.json();
        showToast(err.message || 'Failed to update job', 'error');
      }
    } catch {
      showToast('Error saving changes', 'error');
    }
  };

  const handleConfirmDeleteJob = async () => {
    if (!jobToDelete) return;
    setIsDeletingJob(true);
    try {
      const res = await fetch(`/api/jobs/${jobToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'x-user-role': currentUser.role,
          'x-user-id': currentUser.id
        }
      });
      if (res.ok) {
        showToast(`Work order ${jobToDelete.job_number} (${jobToDelete.job_type}) deleted successfully`, 'success');
        setJobToDelete(null);
        loadData();
      } else {
        const err = await res.json();
        showToast(err.message || 'Failed to delete job', 'error');
      }
    } catch {
      showToast('Network error while deleting job', 'error');
    } finally {
      setIsDeletingJob(false);
    }
  };

  const handleUpdateJobStatus = async (jobId, nextStatus) => {
    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser.role,
          'x-user-id': currentUser.id
        },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        showToast(`Job status set to ${nextStatus}`, 'success');
        loadData();
      }
    } catch (e) {
      showToast('Failed to update job status', 'error');
    }
  };

  // Place Job on Hold (Payment Hold or Operational Hold)
  const handlePlaceHold = async (e) => {
    e.preventDefault();
    if (!holdingJob) return;
    setIsHoldSubmitting(true);
    try {
      const res = await fetch(`/api/jobs/${holdingJob.id}/hold`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser.role,
          'x-user-id': currentUser.id
        },
        body: JSON.stringify(holdFormData)
      });
      if (res.ok) {
        showToast(`Job ${holdingJob.job_number} placed on ${holdFormData.hold_type}`, 'warning');
        setHoldingJob(null);
        await loadData();
      } else {
        const err = await res.json();
        showToast(err.message || 'Failed to place job on hold', 'error');
      }
    } catch {
      showToast('Network error while placing hold', 'error');
    } finally {
      setIsHoldSubmitting(false);
    }
  };

  // Release Job Hold with audit logging
  const handleReleaseHold = async (e) => {
    e.preventDefault();
    if (!releasingHoldJob) return;
    setIsHoldSubmitting(true);
    try {
      const res = await fetch(`/api/jobs/${releasingHoldJob.id}/release-hold`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser.role,
          'x-user-id': currentUser.id
        },
        body: JSON.stringify({ release_remarks: releaseRemarks })
      });
      if (res.ok) {
        showToast(`Job ${releasingHoldJob.job_number} hold successfully released`, 'success');
        setReleasingHoldJob(null);
        setReleaseRemarks('');
        await loadData();
      } else {
        const err = await res.json();
        showToast(err.message || 'Failed to release hold', 'error');
      }
    } catch {
      showToast('Network error while releasing hold', 'error');
    } finally {
      setIsHoldSubmitting(false);
    }
  };

  const filteredJobs = jobs.filter((j) => {
    if (typeFilter !== 'all' && j.job_type !== typeFilter) return false;
    if (statusFilter !== 'all' && j.status !== statusFilter) return false;
    if (isManagement && salesPersonFilter !== 'all' && j.sales_person_id !== salesPersonFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        j.job_number?.toLowerCase().includes(q) ||
        j.customer_name?.toLowerCase().includes(q) ||
        j.site_name?.toLowerCase().includes(q) ||
        j.description?.toLowerCase().includes(q) ||
        j.quotation_number?.toLowerCase().includes(q) ||
        j.system?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getTypeColor = (type) => {
    switch (type) {
      case 'Breakdown':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'AMC':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Fit-out':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Supply':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'Project':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Installation':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Testing & Commissioning':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'Inspection':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Emergency Call-Out':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Other':
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-4 pb-24">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-600" />
            <span>{isSales ? 'My Work & Sales Jobs' : isTechnician ? 'Assigned Field Jobs' : 'Job Management & History'}</span>
          </h1>
          <p className="text-xs text-slate-500">
            {isSales 
              ? 'Your assigned client contracts, fit-outs, supplies, projects, and callouts.' 
              : 'Work orders, breakdowns, fit-outs, installations, and inspections.'}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Excel Export Button (Requirements 30-31) */}
          <button
            onClick={() => {
              if (typeFilter === 'Fit-out') {
                exportFitoutToExcel(filteredJobs);
              } else if (typeFilter === 'Project') {
                exportProjectToExcel(filteredJobs);
              } else {
                exportJobsToExcel(filteredJobs);
              }
              showToast('Excel export initiated', 'success');
            }}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            title="Export filtered records to formatted Excel spreadsheet"
          >
            <Download className="w-4 h-4" />
            <span>
              {typeFilter === 'Fit-out' 
                ? 'Export Fit-out to Excel' 
                : typeFilter === 'Project' 
                ? 'Export Project to Excel' 
                : 'Export Jobs to Excel'}
            </span>
          </button>

          <a
            href="/FIREX_User_Roles_and_Jobs_Guide.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
            title="Download Step-by-Step Roles & Jobs Guide (PDF)"
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span className="hidden sm:inline">Jobs &amp; Roles Guide (PDF)</span>
            <span className="sm:hidden">Guide PDF</span>
          </a>

          {!isTechnician && (
            <button
              onClick={() => {
                setNewJobData(defaultNewJobState());
                setShowNewJobModal(true);
              }}
              className="px-3.5 py-2 bg-navy-900 hover:bg-navy-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>New Work Order</span>
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by job #, quotation #, customer, site, description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white"
          />
        </div>

        {/* Job Type Filters */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            'all', 
            'AMC', 
            'Breakdown', 
            'Fit-out', 
            'Supply', 
            'Project', 
            'Inspection', 
            'Testing & Commissioning', 
            'Installation', 
            'Emergency Call-Out', 
            'Other'
          ].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                typeFilter === t
                  ? 'bg-navy-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t === 'all' ? 'All Types' : t}
            </button>
          ))}
        </div>

        {/* Status Filter & Sales Person Filter */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-slate-100 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-semibold self-center">Status:</span>
            {['all', 'In Progress', 'Pending', 'Completed'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2 py-0.5 rounded-md font-semibold ${
                  statusFilter === s ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {s === 'all' ? 'All' : s}
              </button>
            ))}
          </div>

          {/* Sales Person Filter for GM / Engineer / Supervisor */}
          {isManagement && (
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-semibold">Salesperson:</span>
              <select
                value={salesPersonFilter}
                onChange={(e) => setSalesPersonFilter(e.target.value)}
                className="p-1 bg-slate-50 border border-slate-200 rounded-md font-bold text-navy-900 text-[11px]"
              >
                <option value="all">All Salespersons</option>
                {salesUsers.map(su => (
                  <option key={su.id} value={su.id}>{su.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Jobs List */}
      {loading ? (
        <div className="p-8 text-center text-xs text-slate-400">Loading work orders...</div>
      ) : filteredJobs.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center text-xs text-slate-400 border border-slate-200">
          No work orders found matching criteria.
        </div>
      ) : (
        filteredJobs.map((j) => (
          <div
            key={j.id}
            className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-3"
          >
            {/* Top row */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-bold text-navy-900 bg-slate-100 px-2 py-0.5 rounded">
                    {j.job_number}
                  </span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${getTypeColor(j.job_type)}`}>
                    {j.job_type}
                  </span>
                  {j.system && (
                    <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {j.system}
                    </span>
                  )}
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                      j.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : j.status === 'In Progress'
                        ? 'bg-blue-100 text-blue-800 animate-pulse'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {j.status}
                  </span>

                  {/* On Hold Status Badges */}
                  {(j.on_hold || j.is_on_hold) && (
                    <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full text-white shadow-sm flex items-center gap-1 ${
                      j.hold_type === 'Payment Hold' ? 'bg-red-600' : 'bg-amber-600'
                    }`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                      <span>{j.hold_type === 'Payment Hold' ? '🔴 PAYMENT HOLD' : `🟠 OPERATIONAL HOLD: ${j.hold_reason || 'Site Constraint'}`}</span>
                    </span>
                  )}

                  {/* Payment Pending Warning Badge */}
                  {(j.has_unpaid_invoices || j.payment_status === 'Unpaid' || j.payment_status === 'Overdue') && (
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 shadow-sm">
                      <AlertTriangle className="w-3 h-3 text-amber-700" />
                      <span>⚠ PAYMENT PENDING</span>
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-slate-900 mt-1.5">
                  {j.site_name}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {j.customer_name}
                </p>
              </div>

              {/* Amount badge (Protected for Tech) & Date */}
              <div className="text-right">
                {!isTechnician && j.amount !== undefined && j.amount !== null && (
                  <div className="text-xs font-mono font-black text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md inline-block shadow-sm">
                    {formatBHD(j.total_including_vat || j.amount)}
                  </div>
                )}
                {isTechnician && (
                  <div className="text-[10px] text-slate-400 font-medium italic bg-slate-100 px-2 py-0.5 rounded">
                    Protected
                  </div>
                )}
                {j.quotation_number && (
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    QT: {j.quotation_number}
                  </div>
                )}
                <div className="text-[10px] text-slate-400 font-semibold mt-1">
                  {j.date || j.expected_start_date}
                </div>
              </div>
            </div>

            {/* Prominent Hold Details Banner */}
            {(j.on_hold || j.is_on_hold) && (
              <div className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                j.hold_type === 'Payment Hold'
                  ? 'bg-red-50 border-red-300 text-red-950'
                  : 'bg-amber-50 border-amber-300 text-amber-950'
              }`}>
                <div className="flex items-center justify-between font-black text-[11px]">
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className={`w-4 h-4 ${j.hold_type === 'Payment Hold' ? 'text-red-600' : 'text-amber-600'}`} />
                    <span>{j.hold_type === 'Payment Hold' ? '🔴 JOB ON PAYMENT HOLD (WORK SUSPENDED)' : `🟠 JOB ON OPERATIONAL HOLD: ${j.hold_reason || 'Site Constraint'}`}</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold">{j.held_at?.slice(0, 10) || 'Active'}</span>
                </div>
                <div className="text-[11px] leading-relaxed">
                  <strong>Held By:</strong> {j.held_by_name || 'Management'} ({j.held_by_role || 'Staff'}) • <strong>Reason:</strong> {j.hold_reason}
                </div>
                {j.hold_remarks && (
                  <div className="text-[10.5px] italic text-slate-700">
                    <strong>Remarks:</strong> {j.hold_remarks}
                  </div>
                )}
                {j.hold_next_action && (
                  <div className="text-[10.5px] font-bold text-red-900 bg-white/80 p-2 rounded-lg border border-red-200 mt-1 flex items-center gap-1.5">
                    <span>Required Next Action:</span>
                    <span className="font-normal">{j.hold_next_action}</span>
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
              {j.description}
            </p>

            {/* VAT Breakdown Row (Requirements 17-21, Protected for Technicians) */}
            {!isTechnician ? (
              <div className="bg-amber-50/60 border border-amber-200/70 rounded-xl p-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Excl. VAT</span>
                  <span className="font-mono font-bold text-slate-800">{formatBHD(j.amount)}</span>
                </div>
                <div className="text-center">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">VAT ({j.vat_percent !== undefined ? j.vat_percent : 10}%)</span>
                  <span className="font-mono font-bold text-amber-700">
                    {formatBHD(j.vat_amount !== undefined ? j.vat_amount : (Number(j.amount || 0) * (Number(j.vat_percent || 10) / 100)))}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-emerald-700 font-bold uppercase block">Total (Incl. VAT)</span>
                  <span className="font-mono font-black text-emerald-800">
                    {formatBHD(j.total_including_vat !== undefined ? j.total_including_vat : (Number(j.amount || 0) * (1 + (Number(j.vat_percent || 10) / 100))))}
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-center text-[11px] text-slate-400 font-medium italic">
                Financial Details: Protected (Technician Access)
              </div>
            )}

            {/* Team, Salesperson & Supervisor Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-600 bg-slate-50/50 p-2 rounded-xl border border-slate-100">
              <span className="flex items-center gap-1 truncate">
                <span className="text-slate-400 font-semibold">Sales:</span>
                <span className="font-bold text-slate-800 truncate">{j.sales_person_name || 'Unassigned'}</span>
              </span>
              <span className="flex items-center gap-1 truncate">
                <span className="text-slate-400 font-semibold">Sup:</span>
                <span className="font-bold text-slate-800 truncate">{j.supervisor_name || 'Tariq Mahmoud'}</span>
              </span>
              <span className="flex items-center gap-1 truncate">
                <span className="text-slate-400 font-semibold">Tech:</span>
                <span className="font-bold text-slate-800 truncate">{j.technician_name || j.team || 'Rajesh Kumar'}</span>
              </span>
            </div>

            {/* Remarks if any */}
            {j.remarks && (
              <div className="text-[11px] text-slate-500 italic pl-1">
                Remarks: {j.remarks}
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 flex-wrap">
                {/* Hold Action: Release Hold button if held, or Hold Job button if active */}
                {(j.on_hold || j.is_on_hold) ? (
                  canReleaseHold && (
                    <button
                      onClick={() => {
                        setReleasingHoldJob(j);
                        setReleaseRemarks('');
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1 shadow-sm transition-all"
                      title="Authorize and log release of this job from hold"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Release Hold</span>
                    </button>
                  )
                ) : (
                  canHoldJobs && j.status !== 'Completed' && (
                    <button
                      onClick={() => {
                        setHoldingJob(j);
                        setHoldFormData({
                          hold_type: isAccounts ? 'Payment Hold' : isProjectsManager ? 'Operational Hold' : 'Payment Hold',
                          reason: isAccounts ? 'Unpaid Invoices' : 'Site Access Restricted',
                          remarks: '',
                          next_action: isAccounts ? 'Client to clear overdue payment before field attendance' : 'Site team to resolve operational constraint'
                        });
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold flex items-center gap-1 transition-all"
                      title="Place this job on Payment Hold or Operational Hold"
                    >
                      <AlertTriangle className="w-3 h-3 text-red-600" />
                      <span>Hold Job</span>
                    </button>
                  )
                )}

                {canEditDelete && !(j.on_hold || j.is_on_hold) && (
                  j.status !== 'Completed' ? (
                    <button
                      onClick={() => handleUpdateJobStatus(j.id, 'Completed')}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-xs font-bold flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Close Job</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpdateJobStatus(j.id, 'In Progress')}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold"
                    >
                      Re-open
                    </button>
                  )
                )}

                {/* Management Only (GM, Engineer, Supervisor, PM): Edit & Delete for Fit Out, Jobs, Projects */}
                {canEditDelete && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingJob({ ...j, system: j.system || j.system_type || 'Fire Alarm' })}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors"
                      title="Edit Job / Fit-Out / Project"
                    >
                      <Edit className="w-3 h-3 text-blue-600" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => setJobToDelete(j)}
                      className="px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold flex items-center gap-1 transition-colors"
                      title="Delete Job / Fit-Out / Project"
                    >
                      <Trash2 className="w-3 h-3 text-red-600" />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                {/* Start Inspection */}
                {(j.on_hold || j.is_on_hold) ? (
                  <button
                    disabled={true}
                    title="Inspection blocked: Job is currently on hold"
                    className="px-2.5 py-1.5 bg-slate-100 text-slate-400 rounded-lg text-xs font-bold flex items-center gap-1 opacity-50 cursor-not-allowed"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Held</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onStartInspectionForJob(j)}
                    className="px-2.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Inspect</span>
                  </button>
                )}

                {/* Complete Report (Guarded by canPrepareReports) */}
                {canPrepareReports && (
                  <button
                    onClick={() => onNewReportForJob(j)}
                    className="px-3 py-1.5 bg-navy-900 hover:bg-navy-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-400" />
                    <span>Create Report</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))
      )}

      {/* New Job Modal */}
      {showNewJobModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                <span>Create New Work Order</span>
              </h3>
              <button onClick={() => setShowNewJobModal(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Job Type *</label>
                  <select
                    value={newJobData.job_type}
                    onChange={(e) => setNewJobData(p => ({ ...p, job_type: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="AMC">AMC Maintenance</option>
                    <option value="Breakdown">Breakdown (Callout)</option>
                    <option value="Fit-out">Fit-out Works</option>
                    <option value="Supply">Supply of Items</option>
                    <option value="Project">Project Installation</option>
                    <option value="Inspection">Site Inspection</option>
                    <option value="Testing & Commissioning">Testing &amp; Commissioning</option>
                    <option value="Installation">Installation</option>
                    <option value="Emergency Call-Out">Emergency Call-Out</option>
                    <option value="Other">Other Works</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">System Type *</label>
                  <select
                    value={newJobData.system}
                    onChange={(e) => setNewJobData(p => ({ ...p, system: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="Fire Alarm">Fire Alarm &amp; Voice Evacuation</option>
                    <option value="Fire Fighting">Firefighting &amp; Sprinkler Systems</option>
                    <option value="Fire Extinguishers">Fire Extinguishers</option>
                    <option value="FM200 / Clean Agent">FM200 / Clean Agent Systems</option>
                    <option value="Emergency & Exit Lighting">Emergency &amp; Exit Lighting</option>
                    <option value="All Systems">All Integrated Safety Systems</option>
                  </select>
                </div>
              </div>

              {/* Customer Selection with Quick Add */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-700">Customer / Company</label>
                  <button
                    type="button"
                    onClick={() => setShowQuickAddCustomer(true)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ New Customer</span>
                  </button>
                </div>
                <select
                  value={newJobData.customer_id}
                  onChange={(e) => {
                    const cid = e.target.value;
                    const matchedSite = sites.find(s => s.customer_id === cid);
                    setNewJobData(p => ({
                      ...p,
                      customer_id: cid,
                      site_id: matchedSite ? matchedSite.id : (cid ? '' : p.site_id)
                    }));
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                >
                  <option value="">-- All Customers / Filter Site --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.code ? `(${c.code})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Site Premises */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Site / Premises *</label>
                <select
                  required
                  value={newJobData.site_id}
                  onChange={(e) => {
                    const sid = e.target.value;
                    const s = sites.find(x => x.id === sid);
                    setNewJobData(p => ({ ...p, site_id: sid, customer_id: s ? s.customer_id : p.customer_id }));
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="">-- Choose Site --</option>
                  {sites
                    .filter(s => !newJobData.customer_id || s.customer_id === newJobData.customer_id)
                    .map(s => (
                      <option key={s.id} value={s.id}>{s.site_name} ({s.customer_name || 'Client'})</option>
                    ))}
                </select>
              </div>

              {/* Amount BHD, VAT % & Quotation Number */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Amount (Excl. VAT) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2.5 font-bold text-slate-400">BHD</span>
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      required
                      value={newJobData.amount}
                      onChange={(e) => setNewJobData(p => ({ ...p, amount: e.target.value }))}
                      className="w-full pl-12 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    VAT Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={newJobData.vat_percent !== undefined ? newJobData.vat_percent : 10}
                    onChange={(e) => setNewJobData(p => ({ ...p, vat_percent: e.target.value }))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-center"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Quotation Ref #</label>
                  <input
                    type="text"
                    placeholder="e.g. QT-2026-088"
                    value={newJobData.quotation_number}
                    onChange={(e) => setNewJobData(p => ({ ...p, quotation_number: e.target.value }))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              {/* Live VAT Calculation Preview */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block">Excl. VAT:</span>
                  <span className="font-mono font-bold text-slate-800">{formatBHD(newJobData.amount)}</span>
                </div>
                <div className="text-center">
                  <span className="text-[10px] text-slate-500 font-bold block">VAT ({newJobData.vat_percent || 10}%):</span>
                  <span className="font-mono font-bold text-amber-700">
                    {formatBHD(((Number(newJobData.amount) || 0) * (Number(newJobData.vat_percent || 10))) / 100)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-emerald-700 font-bold block">Total (Incl. VAT):</span>
                  <span className="font-mono font-black text-emerald-800">
                    {formatBHD((Number(newJobData.amount) || 0) * (1 + ((Number(newJobData.vat_percent || 10)) / 100)))}
                  </span>
                </div>
              </div>

              {/* Personnel Assignment: Sales, Supervisor, Tech */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-[11px]">Sales Person *</label>
                  {isSales ? (
                    <div className="p-2 bg-white border border-slate-200 rounded-lg font-bold text-navy-900 truncate">
                      {currentUser?.name}
                    </div>
                  ) : (
                    <select
                      value={newJobData.sales_person_id}
                      onChange={(e) => setNewJobData(p => ({ ...p, sales_person_id: e.target.value }))}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg font-bold text-navy-900 text-xs"
                    >
                      {salesUsers.map(su => (
                        <option key={su.id} value={su.id}>{su.name}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-[11px]">Supervisor *</label>
                  <select
                    value={newJobData.supervisor_id}
                    onChange={(e) => setNewJobData(p => ({ ...p, supervisor_id: e.target.value }))}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg font-bold text-navy-900 text-xs"
                  >
                    {supervisorUsers.map(su => (
                      <option key={su.id} value={su.id}>{su.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-[11px]">Technician *</label>
                  <select
                    value={newJobData.technician_id}
                    onChange={(e) => setNewJobData(p => ({ ...p, technician_id: e.target.value }))}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg font-bold text-navy-900 text-xs"
                  >
                    {technicianUsers.map(tu => (
                      <option key={tu.id} value={tu.id}>{tu.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Start & Completion Dates */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Expected Start Date *</label>
                  <input
                    type="date"
                    required
                    value={newJobData.expected_start_date}
                    onChange={(e) => setNewJobData(p => ({ ...p, expected_start_date: e.target.value }))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Expected Completion Date</label>
                  <input
                    type="date"
                    value={newJobData.expected_completion_date}
                    onChange={(e) => setNewJobData(p => ({ ...p, expected_completion_date: e.target.value }))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              {/* Scope & Description */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Work Description / Scope *</label>
                <textarea
                  required
                  rows={2}
                  value={newJobData.description}
                  onChange={(e) => setNewJobData(p => ({ ...p, description: e.target.value }))}
                  placeholder="Specific client instructions, scope of supply, or installation parameters..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              {/* Remarks */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Remarks (Optional)</label>
                <input
                  type="text"
                  placeholder="Special access requirements, gate passes, etc."
                  value={newJobData.remarks}
                  onChange={(e) => setNewJobData(p => ({ ...p, remarks: e.target.value }))}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewJobModal(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-navy-900 text-white font-bold shadow-md"
                >
                  Generate Work Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Job Modal: GM, Engineer, Supervisor Only */}
      {editingJob && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom text-xs">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                    Management Access • Edit Work Order
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Edit className="w-5 h-5 text-blue-600" />
                  <span>{editingJob.job_number} ({editingJob.job_type})</span>
                </h3>
              </div>
              <button onClick={() => setEditingJob(null)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditJob} className="mt-4 space-y-3.5">
              
              {/* Job Type & System */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Job Classification / Type *</label>
                  <select
                    value={editingJob.job_type}
                    onChange={(e) => setEditingJob(p => ({ ...p, job_type: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="AMC">AMC Maintenance</option>
                    <option value="Breakdown">Breakdown (Callout)</option>
                    <option value="Fit-out">Fit-out Works</option>
                    <option value="Supply">Supply of Items</option>
                    <option value="Project">Project Installation</option>
                    <option value="Inspection">Site Inspection</option>
                    <option value="Testing & Commissioning">Testing &amp; Commissioning</option>
                    <option value="Installation">Installation</option>
                    <option value="Emergency Call-Out">Emergency Call-Out</option>
                    <option value="Other">Other Works</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Safety System *</label>
                  <select
                    value={editingJob.system || editingJob.system_type || 'Fire Alarm'}
                    onChange={(e) => setEditingJob(p => ({ ...p, system: e.target.value, system_type: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Fire Alarm">Fire Alarm &amp; Detection</option>
                    <option value="Fire Fighting">Fire Fighting &amp; Hose Reels</option>
                    <option value="Fire Extinguishers">Fire Extinguishers</option>
                    <option value="FM200 / Clean Agent">FM200 / Clean Agent Suppression</option>
                    <option value="Sprinkler System">Sprinkler System</option>
                    <option value="Emergency Lighting">Emergency &amp; Exit Lighting</option>
                    <option value="Pump Set">Fire Pump Set</option>
                  </select>
                </div>
              </div>

              {/* Status & Assigned Technician */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Work Status *</label>
                  <select
                    value={editingJob.status}
                    onChange={(e) => setEditingJob(p => ({ ...p, status: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="New">New / Scheduled</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Pending">Pending / On Hold</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Technician</label>
                  <select
                    value={editingJob.technician_id || ''}
                    onChange={(e) => setEditingJob(p => ({ ...p, technician_id: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Unassigned</option>
                    {allUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sales Person Assignment (Management can reassign - Requirement 10) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Sales Person *</label>
                  <select
                    value={editingJob.sales_person_id || ''}
                    onChange={(e) => setEditingJob(p => ({ ...p, sales_person_id: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Unassigned</option>
                    {salesUsers.map((su) => (
                      <option key={su.id} value={su.id}>
                        {su.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Supervisor</label>
                  <select
                    value={editingJob.supervisor_id || ''}
                    onChange={(e) => setEditingJob(p => ({ ...p, supervisor_id: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  >
                    {supervisorUsers.map((su) => (
                      <option key={su.id} value={su.id}>
                        {su.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Financial Amount, VAT Rate (%) & Quotation Number */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Amount (Excl. VAT)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 font-bold text-slate-400">BHD</span>
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      value={editingJob.amount || 0}
                      onChange={(e) => setEditingJob(p => ({ ...p, amount: e.target.value }))}
                      className="w-full pl-12 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">VAT Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={editingJob.vat_percent !== undefined ? editingJob.vat_percent : 10}
                    onChange={(e) => setEditingJob(p => ({ ...p, vat_percent: e.target.value }))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 text-center focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Quotation Number</label>
                  <input
                    type="text"
                    placeholder="e.g. QT-2026-089"
                    value={editingJob.quotation_number || ''}
                    onChange={(e) => setEditingJob(p => ({ ...p, quotation_number: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Live VAT Calculation Preview in Edit Modal */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block">Excl. VAT:</span>
                  <span className="font-mono font-bold text-slate-800">{formatBHD(editingJob.amount)}</span>
                </div>
                <div className="text-center">
                  <span className="text-[10px] text-slate-500 font-bold block">VAT ({editingJob.vat_percent || 10}%):</span>
                  <span className="font-mono font-bold text-amber-700">
                    {formatBHD(((Number(editingJob.amount) || 0) * (Number(editingJob.vat_percent || 10))) / 100)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-emerald-700 font-bold block">Total (Incl. VAT):</span>
                  <span className="font-mono font-black text-emerald-800">
                    {formatBHD((Number(editingJob.amount) || 0) * (1 + ((Number(editingJob.vat_percent || 10)) / 100)))}
                  </span>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={editingJob.expected_start_date || ''}
                    onChange={(e) => setEditingJob(p => ({ ...p, expected_start_date: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Completion Date</label>
                  <input
                    type="date"
                    value={editingJob.expected_completion_date || ''}
                    onChange={(e) => setEditingJob(p => ({ ...p, expected_completion_date: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Scope &amp; Description</label>
                <textarea
                  rows={2}
                  placeholder="Details of the job requirements and installation/repair work..."
                  value={editingJob.description || ''}
                  onChange={(e) => setEditingJob(p => ({ ...p, description: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Remarks */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Remarks &amp; Notes</label>
                <input
                  type="text"
                  placeholder="Special client instructions or safety notes..."
                  value={editingJob.remarks || ''}
                  onChange={(e) => setEditingJob(p => ({ ...p, remarks: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingJob(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Job Confirmation Modal: GM, Engineer, Supervisor Only */}
      {jobToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-6 text-xs space-y-4 animate-in zoom-in-95">
            
            <div className="flex items-start gap-3">
              <div className="p-3 bg-red-50 text-red-600 rounded-2xl shrink-0 border border-red-200">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                    Management Action
                  </span>
                </div>
                <h3 className="text-base font-black text-slate-900">
                  Delete Work Order
                </h3>
                <p className="text-slate-500 mt-0.5 text-xs">
                  Are you sure you want to permanently delete this work order?
                </p>
              </div>
            </div>

            {/* Job Details Card */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-1.5 font-medium">
              <div className="flex justify-between items-center text-slate-700">
                <span className="text-slate-500">Job Number:</span>
                <span className="font-mono font-bold text-slate-900">{jobToDelete.job_number}</span>
              </div>
              <div className="flex justify-between items-center text-slate-700">
                <span className="text-slate-500">Job Type:</span>
                <span className="font-bold text-slate-900">{jobToDelete.job_type}</span>
              </div>
              <div className="flex justify-between items-center text-slate-700">
                <span className="text-slate-500">Customer:</span>
                <span className="font-semibold text-slate-900 truncate max-w-[200px]">{jobToDelete.customer_name}</span>
              </div>
              <div className="flex justify-between items-center text-slate-700">
                <span className="text-slate-500">Site / Premises:</span>
                <span className="font-semibold text-slate-900 truncate max-w-[200px]">{jobToDelete.site_name}</span>
              </div>
              <div className="flex justify-between items-center text-slate-700 pt-1 border-t border-slate-200">
                <span className="text-slate-500">Work Value:</span>
                <span className="font-black text-slate-900 text-sm">{formatBHD(jobToDelete.amount)}</span>
              </div>
            </div>

            <p className="text-[11px] text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200 font-semibold leading-relaxed">
              ⚠️ Notice: This action is restricted to General Manager, Engineer, and Supervisor. Once deleted, this work order and its records will be completely removed.
            </p>

            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                disabled={isDeletingJob}
                onClick={() => setJobToDelete(null)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingJob}
                onClick={handleConfirmDeleteJob}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-colors shadow-lg shadow-red-600/20 flex items-center justify-center gap-1.5"
              >
                {isDeletingJob ? (
                  <span className="animate-pulse">Deleting...</span>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Yes, Delete Job</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Quick Add Customer Modal */}
      <QuickAddCustomerModal
        isOpen={showQuickAddCustomer}
        onClose={() => setShowQuickAddCustomer(false)}
        onCustomerCreated={async (newCust) => {
          try {
            const [resC, resS] = await Promise.all([
              fetch('/api/customers', { headers: { 'x-user-role': currentUser.role, 'x-user-id': currentUser.id } }),
              fetch('/api/sites', { headers: { 'x-user-role': currentUser.role, 'x-user-id': currentUser.id } })
            ]);
            if (resC.ok) setCustomers(await resC.json());
            if (resS.ok) {
              const updatedSites = await resS.json();
              setSites(updatedSites);
              const primarySite = updatedSites.find(s => s.customer_id === newCust.id);
              setNewJobData(p => ({
                ...p,
                customer_id: newCust.id,
                site_id: primarySite ? primarySite.id : p.site_id
              }));
            } else {
              setNewJobData(p => ({
                ...p,
                customer_id: newCust.id
              }));
            }
          } catch (e) {
            console.error('Error refreshing customer data after quick add:', e);
          }
        }}
      />

      {/* HOLD JOB MODAL */}
      {holdingJob && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-6 text-xs space-y-4 animate-in zoom-in-95">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-red-50 text-red-600 rounded-2xl shrink-0 border border-red-200">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                  Suspend Work Order
                </span>
                <h3 className="text-base font-black text-slate-900 mt-1">
                  Place Job on Hold
                </h3>
                <p className="text-slate-500 mt-0.5 text-xs">
                  Placing on hold halts field inspections, technician dispatch, and report sign-offs.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-slate-700 space-y-1 font-medium">
              <div className="flex justify-between">
                <span className="text-slate-500">Work Order:</span>
                <span className="font-mono font-bold text-slate-900">{holdingJob.job_number} ({holdingJob.job_type})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Site &amp; Client:</span>
                <span className="font-semibold text-slate-900 truncate max-w-[200px]">{holdingJob.site_name}</span>
              </div>
            </div>

            <form onSubmit={handlePlaceHold} className="space-y-3 pt-1">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Hold Type *</label>
                <select
                  value={holdFormData.hold_type}
                  onChange={(e) => {
                    const hType = e.target.value;
                    setHoldFormData(p => ({
                      ...p,
                      hold_type: hType,
                      reason: hType === 'Payment Hold' ? 'Unpaid Invoices' : 'Site Access Restricted',
                      next_action: hType === 'Payment Hold' ? 'Client must clear overdue balance' : 'Resolve site access/coordination'
                    }));
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-red-500"
                >
                  {(isGM || isAccounts) && (
                    <option value="Payment Hold">Payment Hold — (Financial &amp; Accounts hold)</option>
                  )}
                  {(isGM || isProjectsManager || isEngineer) && (
                    <option value="Operational Hold">Operational Hold — (Site constraint, safety, client hold)</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Hold Reason *</label>
                <select
                  value={holdFormData.reason}
                  onChange={(e) => setHoldFormData(p => ({ ...p, reason: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-red-500"
                >
                  {holdFormData.hold_type === 'Payment Hold' ? (
                    <>
                      <option value="Unpaid Invoices">Unpaid Invoices / Overdue Receivables</option>
                      <option value="Overdue Balance Exceeded">Overdue Balance Exceeded</option>
                      <option value="Credit Limit Breach">Credit Limit Breach</option>
                      <option value="Bounced Cheque / Payment Reversal">Bounced Cheque / Payment Reversal</option>
                      <option value="Other Financial Hold">Other Financial Hold</option>
                    </>
                  ) : (
                    <>
                      <option value="Site Access Restricted">Site Access Restricted / Permits Pending</option>
                      <option value="Awaiting Civil Defence Drawings">Awaiting Civil Defence Drawing / Approval</option>
                      <option value="Awaiting Equipment / Materials">Awaiting Specialized Equipment / Spare Parts</option>
                      <option value="Client Postponed Request">Client Requested Postponement</option>
                      <option value="Site Safety Concern">Site Safety Concern / Hazardous Conditions</option>
                      <option value="General Contractor Delay">General Contractor Delay / Civil Work Not Ready</option>
                      <option value="Scope Discrepancy">Scope of Work Discrepancy</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Hold Remarks / Context</label>
                <textarea
                  rows={2}
                  placeholder="Provide internal background or details on the situation..."
                  value={holdFormData.remarks}
                  onChange={(e) => setHoldFormData(p => ({ ...p, remarks: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Required Next Action to Release Hold *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Accounts to confirm receipt of BHD 350.000 before technician attendance"
                  value={holdFormData.next_action}
                  onChange={(e) => setHoldFormData(p => ({ ...p, next_action: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  disabled={isHoldSubmitting}
                  onClick={() => setHoldingJob(null)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isHoldSubmitting}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-colors shadow-lg shadow-red-600/20 flex items-center justify-center gap-1.5"
                >
                  {isHoldSubmitting ? (
                    <span className="animate-pulse">Placing Hold...</span>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4" />
                      <span>Confirm &amp; Place on Hold</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RELEASE HOLD MODAL */}
      {releasingHoldJob && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-6 text-xs space-y-4 animate-in zoom-in-95">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shrink-0 border border-emerald-200">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  Authorize Resume Work
                </span>
                <h3 className="text-base font-black text-slate-900 mt-1">
                  Release Job Hold
                </h3>
                <p className="text-slate-500 mt-0.5 text-xs">
                  Releasing hold resumes technician scheduling and on-site inspection execution.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-slate-700 space-y-1 font-medium">
              <div className="flex justify-between">
                <span className="text-slate-500">Work Order:</span>
                <span className="font-mono font-bold text-slate-900">{releasingHoldJob.job_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Current Hold:</span>
                <span className="font-bold text-red-700">{releasingHoldJob.hold_type} ({releasingHoldJob.hold_reason})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Held By:</span>
                <span className="font-semibold text-slate-900">{releasingHoldJob.held_by_name || 'Staff'} on {releasingHoldJob.held_at?.slice(0, 10)}</span>
              </div>
              {releasingHoldJob.hold_next_action && (
                <div className="pt-1 border-t border-slate-200 text-slate-600 text-[11px]">
                  <strong>Condition:</strong> {releasingHoldJob.hold_next_action}
                </div>
              )}
            </div>

            <form onSubmit={handleReleaseHold} className="space-y-3 pt-1">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Release Remarks &amp; Justification *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Payment verified by Accounts (Receipt #REC-2026-081) / Site clearance issued by consultant"
                  value={releaseRemarks}
                  onChange={(e) => setReleaseRemarks(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  disabled={isHoldSubmitting}
                  onClick={() => setReleasingHoldJob(null)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isHoldSubmitting}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-1.5"
                >
                  {isHoldSubmitting ? (
                    <span className="animate-pulse">Releasing...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm &amp; Resume Work</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
