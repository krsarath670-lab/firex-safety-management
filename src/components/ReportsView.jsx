import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  FileSpreadsheet, Plus, Search, Eye, Edit, Trash2, 
  CheckCircle2, Clock, ShieldCheck, ArrowRight, Download, 
  Printer, UserCheck, AlertCircle
} from 'lucide-react';

export default function ReportsView({ onNewReport, onEditReport, onPreviewReport }) {
  const { currentUser, showToast } = useApp();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const isTechnician = currentUser?.role === 'Technician';

  const loadReports = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/reports', {
        headers: {
          'x-user-role': currentUser.role,
          'x-user-id': currentUser.id
        }
      });
      if (res.ok) {
        setReports(await res.json());
      }
    } catch (e) {
      console.warn('Failed to load reports', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [currentUser]);

  // Handle Status Pipeline transitions: Draft -> Submitted -> Reviewed -> Approved
  const handleTransitionStatus = async (reportId, nextStatus) => {
    try {
      const res = await fetch(`/api/reports/${reportId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser.role,
          'x-user-id': currentUser.id
        },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        showToast(`Report updated to status: ${nextStatus}`, 'success');
        loadReports();
      } else {
        const err = await res.json();
        showToast(err.message || 'Operation denied by RBAC policy', 'error');
      }
    } catch (e) {
      showToast('Network error updating report', 'error');
    }
  };

  // Handle Delete Report
  const handleDeleteReport = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    try {
      const res = await fetch(`/api/reports/${reportId}`, {
        method: 'DELETE',
        headers: {
          'x-user-role': currentUser.role,
          'x-user-id': currentUser.id
        }
      });
      if (res.ok) {
        showToast('Report deleted', 'success');
        loadReports();
      } else {
        const err = await res.json();
        showToast(err.message || 'Cannot delete report', 'error');
      }
    } catch (e) {
      showToast('Network error', 'error');
    }
  };

  const filteredReports = reports.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        r.report_number?.toLowerCase().includes(q) ||
        r.customer_name?.toLowerCase().includes(q) ||
        r.site_name?.toLowerCase().includes(q) ||
        r.system?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Draft':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'Submitted':
        return 'bg-blue-100 text-blue-800 border-blue-300 animate-pulse';
      case 'Reviewed':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'Approved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-extrabold';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-4 pb-24">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-600" />
            <span>Service &amp; AMC Reports</span>
          </h1>
          <p className="text-xs text-slate-500">
            Official field reports, digital approvals, and FIREX A4 PDFs.
          </p>
        </div>
        <button
          onClick={onNewReport}
          className="px-3 py-2 bg-navy-900 hover:bg-navy-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Report</span>
        </button>
      </div>

      {/* Search and Status Pipeline Filters */}
      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search reports by #, customer, site, system..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white"
          />
        </div>

        {/* Status Pipeline Filter Buttons */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: 'All Reports' },
            { id: 'Draft', label: 'Draft' },
            { id: 'Submitted', label: 'Submitted' },
            { id: 'Reviewed', label: 'Reviewed' },
            { id: 'Approved', label: 'Approved (Official)' }
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                statusFilter === st.id
                  ? 'bg-navy-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="p-8 text-center text-xs text-slate-400">Loading reports...</div>
      ) : filteredReports.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center text-xs text-slate-400 border border-slate-200">
          No reports found matching your search.
        </div>
      ) : (
        filteredReports.map((r) => {
          const isDraft = r.status === 'Draft';
          const isSubmitted = r.status === 'Submitted';
          const isReviewed = r.status === 'Reviewed';
          const isApproved = r.status === 'Approved';

          return (
            <div
              key={r.id}
              className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-3"
            >
              {/* Report Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-navy-900 bg-slate-100 px-2 py-0.5 rounded">
                      {r.report_number}
                    </span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(r.status)}`}>
                      {r.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mt-1.5">
                    {r.report_type}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {r.site_name} • {r.customer_name}
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 font-semibold">{r.date}</span>
              </div>

              {/* Meta details */}
              <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[9px] font-bold uppercase text-slate-400 block">System</span>
                  <span className="font-semibold text-slate-800">{r.system || 'Fire Alarm & Firefighting'}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase text-slate-400 block">Job Reference</span>
                  <span className="font-mono font-bold text-blue-700">{r.job_number || 'N/A'}</span>
                </div>
                {(r.amc_contract_number || r.contract_period || r.amc_start_date) && (
                  <div className="col-span-2 pt-1 border-t border-slate-200/60 flex items-center justify-between text-[11px] flex-wrap gap-1">
                    <span className="text-slate-500">AMC: <strong className="text-slate-800">{r.amc_contract_number || r.amc_number || 'AMC-2026'}</strong></span>
                    <span className="text-slate-500">Period: <strong className="text-slate-800">{r.contract_period || (r.amc_start_date ? `${r.amc_start_date} to ${r.amc_end_date}` : '01-Jan-2026 to 31-Dec-2026')}</strong></span>
                  </div>
                )}
                <div className="col-span-2 pt-1 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Sales Specialist: <strong className="text-navy-900">{r.sales_person_name || 'Unassigned'}</strong></span>
                  {r.quarter && <span className="text-slate-500">Quarter: <strong className="text-blue-700">{r.quarter}</strong></span>}
                </div>
              </div>

              {/* Audit Trail Pipeline Breakdown (Requirement 18) */}
              <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500 space-y-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-slate-700">Audit Trail:</span>
                  <span className="bg-slate-100 px-1.5 py-0.5 rounded">Created by {r.technician_name || 'Rajesh'}</span>
                  {r.submitted_at && <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">Submitted {r.submitted_at.slice(0, 10)}</span>}
                  {r.reviewed_at && <span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded">Reviewed {r.reviewed_at.slice(0, 10)}</span>}
                  {r.approved_at && <span className="bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded font-bold">Approved {r.approved_at.slice(0, 10)}</span>}
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                
                {/* PDF Preview Button */}
                <button
                  onClick={() => onPreviewReport(r)}
                  className="px-3 py-1.5 bg-navy-900 hover:bg-navy-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
                >
                  <Eye className="w-3.5 h-3.5 text-blue-400" />
                  <span>Preview &amp; PDF</span>
                </button>

                <div className="flex items-center gap-1.5">
                  {/* Status Progression Button */}
                  {isDraft && (
                    <button
                      onClick={() => handleTransitionStatus(r.id, 'Submitted')}
                      className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
                    >
                      Submit for Review
                    </button>
                  )}

                  {!isTechnician && isSubmitted && (
                    <button
                      onClick={() => handleTransitionStatus(r.id, 'Reviewed')}
                      className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
                    >
                      Mark Reviewed
                    </button>
                  )}

                  {!isTechnician && (isSubmitted || isReviewed) && (
                    <button
                      onClick={() => handleTransitionStatus(r.id, 'Approved')}
                      className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Approve</span>
                    </button>
                  )}

                  {/* Edit Draft */}
                  {(!isTechnician || isDraft) && (
                    <button
                      onClick={() => onEditReport(r)}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
                      title="Edit"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Delete Report */}
                  {!isTechnician && (
                    <button
                      onClick={() => handleDeleteReport(r.id)}
                      className="p-1.5 rounded-lg border border-slate-200 text-red-500 hover:bg-red-50"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}

    </div>
  );
}
