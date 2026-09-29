import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Flame, Plus, Search, Filter, AlertTriangle, Clock, 
  MapPin, Phone, User, CheckCircle2, ChevronRight, FileText, 
  Printer, Download, Share2, Camera, PenTool, Check, 
  Eye, RefreshCw, AlertOctagon, Send, History, Shield, 
  ArrowRight, Wrench, Building2, Lock, X
} from 'lucide-react';
import EmergencyCalloutModal from './EmergencyCalloutModal';
import EmergencyCalloutPDF from './EmergencyCalloutPDF';

export default function EmergencyCalloutView() {
  const { currentUser, showToast } = useApp();

  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTabFilter, setActiveTabFilter] = useState('all'); // 'all' | 'reports' | 'critical' | 'inprogress' | 'assigned_me' | 'closed'
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [systemFilter, setSystemFilter] = useState('ALL');

  // Modals
  const [selectedCallForModal, setSelectedCallForModal] = useState(null); // for edit/view modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCallForPDF, setSelectedCallForPDF] = useState(null);
  const [selectedCallForAudit, setSelectedCallForAudit] = useState(null);
  const [distributeModalCall, setDistributeModalCall] = useState(null);
  const [distributionRecipient, setDistributionRecipient] = useState({
    name: 'Eng. Mohamed Hweidi',
    email: 'eng..mohamed.hweidi@firexbahrain.com',
    role: 'GM'
  });
  const [distributing, setDistributing] = useState(false);

  // Role permissions
  const role = currentUser?.role || 'Technician';
  const isGM = role === 'GM';
  const isEngineer = role === 'Engineer';
  const isSupervisor = role === 'Supervisor';
  const isTech = role === 'Technician';
  const isSales = role === 'Sales';
  const isAccounts = role === 'Accounts';
  const isPM = role === 'Projects Manager';

  const canCreate = isGM || isEngineer || isSupervisor || isPM;
  const canApprove = isGM || isEngineer;
  const canReview = isGM || isEngineer || isSupervisor;
  const canClose = isGM;

  // Load emergency calls from backend
  const loadCalls = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/emergency-calls', {
        headers: {
          'x-user-role': role,
          'x-user-id': currentUser?.id
        }
      });
      if (res.ok) {
        const data = await res.json();
        setCalls(data);
      } else {
        showToast('Failed to load emergency calls', 'error');
      }
    } catch (err) {
      showToast('Network error loading emergency calls', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCalls();
  }, [currentUser]);

  // Fast Arrival Recording
  const handleRecordArrival = async (callId) => {
    try {
      const res = await fetch(`/api/emergency-calls/${callId}/arrival`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': role,
          'x-user-id': currentUser.id
        }
      });
      if (res.ok) {
        showToast('Arrival recorded! Status updated to On Site.', 'success');
        loadCalls();
      } else {
        const err = await res.json();
        showToast(err.message || 'Error recording arrival', 'error');
      }
    } catch {
      showToast('Network error', 'error');
    }
  };

  // Submit Report
  const handleSubmitReport = async (callId) => {
    try {
      const res = await fetch(`/api/emergency-calls/${callId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': role,
          'x-user-id': currentUser.id
        }
      });
      if (res.ok) {
        showToast('Emergency Report submitted for Supervisor / Engineering review!', 'success');
        loadCalls();
      } else {
        const err = await res.json();
        showToast(err.message || 'Error submitting report', 'error');
      }
    } catch {
      showToast('Network error', 'error');
    }
  };

  // Review Report
  const handleReviewReport = async (callId) => {
    try {
      const res = await fetch(`/api/emergency-calls/${callId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': role,
          'x-user-id': currentUser.id
        },
        body: JSON.stringify({
          supervisor_remarks: 'Technical findings and Civil Defence compliance reviewed and confirmed.'
        })
      });
      if (res.ok) {
        showToast('Report reviewed and ready for Engineering approval!', 'success');
        loadCalls();
      } else {
        const err = await res.json();
        showToast(err.message || 'Error reviewing report', 'error');
      }
    } catch {
      showToast('Network error', 'error');
    }
  };

  // Approve Report
  const handleApproveReport = async (callId) => {
    try {
      const res = await fetch(`/api/emergency-calls/${callId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': role,
          'x-user-id': currentUser.id
        }
      });
      if (res.ok) {
        showToast('Emergency Call-Out Report APPROVED and locked!', 'success');
        loadCalls();
      } else {
        const err = await res.json();
        showToast(err.message || 'Error approving report', 'error');
      }
    } catch {
      showToast('Network error', 'error');
    }
  };

  // Close Emergency Call
  const handleCloseCall = async (callId) => {
    try {
      const res = await fetch(`/api/emergency-calls/${callId}/close`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': role,
          'x-user-id': currentUser.id
        }
      });
      if (res.ok) {
        showToast('Emergency Call officially CLOSED by General Manager.', 'info');
        loadCalls();
      } else {
        const err = await res.json();
        showToast(err.message || 'Error closing call', 'error');
      }
    } catch {
      showToast('Network error', 'error');
    }
  };

  // Distribute Report Internally
  const handleDistributeSubmit = async (e) => {
    e.preventDefault();
    if (!distributeModalCall) return;

    setDistributing(true);
    try {
      const res = await fetch(`/api/emergency-calls/${distributeModalCall.id}/distribute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': role,
          'x-user-id': currentUser.id
        },
        body: JSON.stringify({
          recipient_name: distributionRecipient.name,
          recipient_email: distributionRecipient.email,
          recipient_role: distributionRecipient.role
        })
      });

      if (res.ok) {
        showToast(`Report distributed internally to ${distributionRecipient.name} (${distributionRecipient.role})`, 'success');
        setDistributeModalCall(null);
        loadCalls();
      } else {
        const err = await res.json();
        showToast(err.message || 'Distribution failed', 'error');
      }
    } catch {
      showToast('Network error distributing report', 'error');
    } finally {
      setDistributing(false);
    }
  };

  // Filter calculations
  const totalCalls = calls.length;
  const criticalCalls = calls.filter(c => c.priority === 'Critical' && !['Closed', 'Cancelled', 'Approved'].includes(c.status));
  const inProgressCalls = calls.filter(c => ['On Site', 'In Progress', 'Assigned', 'En Route'].includes(c.status));
  const pendingReports = calls.filter(c => ['Draft', 'Submitted'].includes(c.report_status));
  const approvedReports = calls.filter(c => c.report_status === 'Approved');
  const myAssignedCalls = calls.filter(c => c.assigned_technician_id === currentUser?.id || c.assigned_supervisor_id === currentUser?.id);

  // Filtered List for View
  const filteredCalls = calls.filter(c => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchCall = (c.call_number || '').toLowerCase().includes(q);
      const matchReport = (c.report_number || '').toLowerCase().includes(q);
      const matchCust = (c.customer_name || '').toLowerCase().includes(q);
      const matchSite = (c.site_name || '').toLowerCase().includes(q);
      const matchType = (c.emergency_type || '').toLowerCase().includes(q);
      const matchProb = (c.reported_problem || '').toLowerCase().includes(q);
      const matchTech = (c.assigned_technician_name || '').toLowerCase().includes(q);
      const matchSup = (c.assigned_supervisor_name || '').toLowerCase().includes(q);
      const matchDate = (c.call_date || '').includes(q);
      if (!matchCall && !matchReport && !matchCust && !matchSite && !matchType && !matchProb && !matchTech && !matchSup && !matchDate) {
        return false;
      }
    }

    // Tab Filters
    if (activeTabFilter === 'reports') {
      // ALL roles can view reports!
      // Show reports that are submitted, reviewed, approved, or closed
      if (!c.report_status || c.report_status === 'Draft') return false;
    } else if (activeTabFilter === 'critical') {
      if (c.priority !== 'Critical') return false;
    } else if (activeTabFilter === 'inprogress') {
      if (!['On Site', 'In Progress', 'Assigned', 'En Route'].includes(c.status)) return false;
    } else if (activeTabFilter === 'assigned_me') {
      if (c.assigned_technician_id !== currentUser?.id && c.assigned_supervisor_id !== currentUser?.id) return false;
    } else if (activeTabFilter === 'closed') {
      if (!['Closed', 'Cancelled'].includes(c.status)) return false;
    }

    // Dropdown filters
    if (priorityFilter !== 'ALL' && c.priority !== priorityFilter) return false;
    if (systemFilter !== 'ALL' && c.system !== systemFilter) return false;

    return true;
  });

  return (
    <div className="space-y-4 pb-28 max-w-5xl mx-auto select-none">
      
      {/* ========================================================================= */}
      {/* TOP HEADER & ACTION BAR                                                   */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-red-100 text-red-700 animate-pulse">
              <Flame className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  Emergency Call-Out Module
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-50 text-red-700 border border-red-200 uppercase tracking-wider">
                  24/7 Rapid Response
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Urgent field dispatch, real-time arrival recording, on-site findings, customer sign-off &amp; formal reports.
              </p>
            </div>
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={loadCalls}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all"
            title="Refresh Emergency Calls"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {canCreate && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="h-11 px-4 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-red-900/25 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ LOG EMERGENCY CALL</span>
            </button>
          )}
        </div>
      </div>

      {/* Critical Alert Banner if critical calls are active */}
      {criticalCalls.length > 0 && (
        <div className="p-3.5 bg-red-600 text-white rounded-2xl shadow-lg shadow-red-900/30 flex items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-2.5">
            <AlertOctagon className="w-5 h-5 shrink-0" />
            <div>
              <p className="text-xs font-black uppercase tracking-wider">
                CRITICAL EMERGENCY ALERT ({criticalCalls.length} Active)
              </p>
              <p className="text-[11px] text-red-100 font-medium">
                Immediate on-site intervention required. Lead engineer &amp; supervisor dispatched.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTabFilter('critical')}
            className="px-3 py-1.5 bg-white text-red-700 rounded-xl text-xs font-black hover:bg-red-50 shrink-0"
          >
            View Critical
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* KPI METRIC CARDS                                                          */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        
        <div 
          onClick={() => setActiveTabFilter('all')}
          className={`p-3 rounded-2xl border transition-all cursor-pointer ${
            activeTabFilter === 'all' ? 'bg-navy-900 text-white border-navy-900 shadow-sm' : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className={`text-[10px] font-bold uppercase tracking-wider block ${activeTabFilter === 'all' ? 'text-slate-300' : 'text-slate-400'}`}>
            Total Emergency Calls
          </span>
          <div className="text-xl sm:text-2xl font-black mt-0.5">{totalCalls}</div>
          <span className={`text-[10px] font-medium ${activeTabFilter === 'all' ? 'text-slate-300' : 'text-slate-500'}`}>
            Master Register
          </span>
        </div>

        <div 
          onClick={() => setActiveTabFilter('critical')}
          className={`p-3 rounded-2xl border transition-all cursor-pointer ${
            activeTabFilter === 'critical' ? 'bg-red-600 text-white border-red-600 shadow-sm' : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className={`text-[10px] font-bold uppercase tracking-wider block ${activeTabFilter === 'critical' ? 'text-red-100' : 'text-red-600'}`}>
            Critical Active
          </span>
          <div className="text-xl sm:text-2xl font-black mt-0.5">{criticalCalls.length}</div>
          <span className={`text-[10px] font-medium ${activeTabFilter === 'critical' ? 'text-red-100' : 'text-slate-500'}`}>
            Immediate Danger
          </span>
        </div>

        <div 
          onClick={() => setActiveTabFilter('inprogress')}
          className={`p-3 rounded-2xl border transition-all cursor-pointer ${
            activeTabFilter === 'inprogress' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className={`text-[10px] font-bold uppercase tracking-wider block ${activeTabFilter === 'inprogress' ? 'text-blue-100' : 'text-blue-600'}`}>
            In Progress / On Site
          </span>
          <div className="text-xl sm:text-2xl font-black mt-0.5">{inProgressCalls.length}</div>
          <span className={`text-[10px] font-medium ${activeTabFilter === 'inprogress' ? 'text-blue-100' : 'text-slate-500'}`}>
            Field Attendance
          </span>
        </div>

        <div 
          onClick={() => setActiveTabFilter('reports')}
          className={`p-3 rounded-2xl border transition-all cursor-pointer ${
            activeTabFilter === 'reports' ? 'bg-purple-900 text-white border-purple-900 shadow-sm' : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className={`text-[10px] font-bold uppercase tracking-wider block ${activeTabFilter === 'reports' ? 'text-purple-200' : 'text-purple-700'}`}>
            Emergency Reports
          </span>
          <div className="text-xl sm:text-2xl font-black mt-0.5">{approvedReports.length + pendingReports.length}</div>
          <span className={`text-[10px] font-medium ${activeTabFilter === 'reports' ? 'text-purple-200' : 'text-slate-500'}`}>
            {approvedReports.length} Approved • {pendingReports.length} Pending
          </span>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* SEARCH & FILTER TOOLBAR                                                   */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-sm space-y-2.5">
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Call # (ECO), Report # (ECR), Customer, Site, Problem, Date, Tech..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 font-bold text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: `All Calls (${calls.length})` },
            { id: 'reports', label: `Emergency Reports (${approvedReports.length + pendingReports.length})`, highlight: true },
            { id: 'critical', label: `Critical Priority (${criticalCalls.length})` },
            { id: 'inprogress', label: `In Progress (${inProgressCalls.length})` },
            ...(isTech ? [{ id: 'assigned_me', label: `My Assigned Calls (${myAssignedCalls.length})` }] : []),
            { id: 'closed', label: 'Closed / Rectified' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTabFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all border ${
                activeTabFilter === tab.id
                  ? tab.highlight 
                    ? 'bg-purple-900 text-white border-purple-900 shadow-sm'
                    : 'bg-navy-900 text-white border-navy-900 shadow-sm'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Priority & System Dropdowns */}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-bold text-[10px] uppercase">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700"
            >
              <option value="ALL">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-bold text-[10px] uppercase">System:</span>
            <select
              value={systemFilter}
              onChange={(e) => setSystemFilter(e.target.value)}
              className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700"
            >
              <option value="ALL">All Systems</option>
              <option value="Fire Alarm">Fire Alarm</option>
              <option value="Fire Fighting">Fire Fighting</option>
              <option value="Sprinkler">Sprinkler</option>
              <option value="Suppression">Suppression</option>
            </select>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* EMERGENCY CALL CARDS LIST                                                 */}
      {/* ========================================================================= */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <div className="w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-600">Loading emergency calls register...</p>
        </div>
      ) : filteredCalls.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Flame className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No emergency call-outs match your filter</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery ? `No results for "${searchQuery}". Clear your search query.` : 'All emergency calls have been rectified or closed.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCalls.map(c => {
            const isCritical = c.priority === 'Critical';
            const isAssignedToMe = c.assigned_technician_id === currentUser?.id;
            const isOnSite = c.status === 'On Site';
            const isDraft = c.report_status === 'Draft';
            const isSubmitted = c.report_status === 'Submitted';
            const isReviewed = c.report_status === 'Reviewed';
            const isApproved = c.report_status === 'Approved';
            const isClosed = c.status === 'Closed';

            return (
              <div 
                key={c.id}
                className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all shadow-sm hover:shadow-md ${
                  isCritical 
                    ? 'border-red-300 ring-1 ring-red-200 bg-gradient-to-r from-red-50/20 to-white' 
                    : 'border-slate-200'
                }`}
              >
                
                {/* Header Row: Numbers & Status Badges */}
                <div className="flex flex-wrap items-start justify-between gap-2 pb-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-sm text-slate-900">
                      {c.call_number}
                    </span>
                    {c.report_number && (
                      <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                        {c.report_number}
                      </span>
                    )}
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                      c.priority === 'Critical' ? 'bg-red-600 text-white animate-pulse' :
                      c.priority === 'High' ? 'bg-orange-500 text-white' :
                      c.priority === 'Medium' ? 'bg-amber-100 text-amber-900' :
                      'bg-blue-100 text-blue-900'
                    }`}>
                      {c.priority}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Operational Status Badge */}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                      c.status === 'On Site' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                      c.status === 'In Progress' ? 'bg-blue-50 text-blue-800 border-blue-300' :
                      c.status === 'Rectified' ? 'bg-teal-50 text-teal-800 border-teal-300' :
                      c.status === 'Closed' ? 'bg-slate-100 text-slate-700 border-slate-300' :
                      'bg-amber-50 text-amber-800 border-amber-300'
                    }`}>
                      {c.status}
                    </span>

                    {/* Report Lifecycle Badge */}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      isApproved ? 'bg-emerald-600 text-white' :
                      isReviewed ? 'bg-blue-600 text-white' :
                      isSubmitted ? 'bg-purple-600 text-white' :
                      'bg-slate-200 text-slate-700'
                    }`}>
                      Report: {c.report_status || 'Draft'}
                    </span>
                  </div>
                </div>

                {/* Body Details: Customer, Site, Problem, Timings */}
                <div className="py-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  
                  {/* Left: Customer & Facility */}
                  <div className="space-y-1">
                    <p className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{c.customer_name}</span>
                    </p>
                    <p className="text-slate-600 font-semibold">{c.site_name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{c.site_address || 'Kingdom of Bahrain'}</p>
                    {c.contact_person && (
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{c.contact_person} {c.contact_phone}</span>
                      </p>
                    )}
                  </div>

                  {/* Middle: Emergency Nature & Problem */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-red-700 block">
                      {c.system} • {c.emergency_type}
                    </span>
                    <p className="text-slate-700 line-clamp-2 leading-relaxed">
                      {c.reported_problem || c.emergency_description}
                    </p>
                    {c.rectification && (
                      <p className="text-[11px] text-emerald-700 font-bold line-clamp-1 mt-1">
                        ✓ Rectified: {c.rectification}
                      </p>
                    )}
                  </div>

                  {/* Right: Team & Timings */}
                  <div className="space-y-1 sm:text-right">
                    <p className="text-slate-500 font-medium">
                      Call Date: <strong className="text-slate-800">{c.call_date} {c.call_time}</strong>
                    </p>
                    <p className="text-slate-600">
                      Arrival: <strong className={c.arrival_time ? 'text-emerald-700' : 'text-amber-600'}>
                        {c.arrival_time ? `${c.arrival_time}` : 'Not on site yet'}
                      </strong>
                    </p>
                    <p className="text-slate-600">
                      Tech: <strong className="text-navy-900">{c.assigned_technician_name || 'Unassigned'}</strong>
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Sup: <strong>{c.assigned_supervisor_name || 'Lead Supervisor'}</strong>
                    </p>
                  </div>

                </div>

                {/* Evidence & Signatures Quick Indicator Bar */}
                <div className="py-2 px-3 bg-slate-50 rounded-xl flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600 mb-3 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 font-semibold">
                      <Camera className="w-3.5 h-3.5 text-blue-600" />
                      <span>{c.photos?.length || 0} Photos</span>
                    </span>

                    <span className="flex items-center gap-1 font-semibold">
                      <Wrench className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{c.materials_used?.length || 0} Materials</span>
                    </span>

                    <span className={`flex items-center gap-1 font-bold ${
                      c.customer_signature ? 'text-emerald-700' : 'text-slate-400'
                    }`}>
                      <PenTool className="w-3.5 h-3.5" />
                      <span>{c.customer_signature ? 'Client Signed' : 'Pending Signature'}</span>
                    </span>
                  </div>

                  {/* Audit Trail quick button */}
                  <button
                    onClick={() => setSelectedCallForAudit(c)}
                    className="text-slate-500 hover:text-navy-900 font-bold flex items-center gap-1"
                  >
                    <History className="w-3 h-3 text-slate-400" />
                    <span>Audit Trail ({c.audit_trail?.length || 1})</span>
                  </button>
                </div>

                {/* ========================================================================= */}
                {/* CONTEXTUAL ACTION BUTTONS (MOBILE FIRST, LARGE TOUCH TARGETS)              */}
                {/* ========================================================================= */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  
                  {/* Left Buttons: Workflow Progressions */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    
                    {/* Record Arrival 1-Tap button */}
                    {!c.arrival_time && (isTech || isSupervisor || isGM) && (
                      <button
                        onClick={() => handleRecordArrival(c.id)}
                        className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Record Arrival (On Site)</span>
                      </button>
                    )}

                    {/* Edit / Enter Field Action & Findings */}
                    <button
                      onClick={() => setSelectedCallForModal(c)}
                      className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                    >
                      <Wrench className="w-3.5 h-3.5 text-blue-600" />
                      <span>{isApproved && !isGM ? 'View Details' : 'Field Findings & Action'}</span>
                    </button>

                    {/* Submit Report */}
                    {isDraft && !isApproved && (isTech || isSupervisor || isGM) && (
                      <button
                        onClick={() => handleSubmitReport(c.id)}
                        className="py-2 px-3 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-purple-200 transition-all"
                      >
                        <Send className="w-3.5 h-3.5 text-purple-600" />
                        <span>Submit Report</span>
                      </button>
                    )}

                    {/* Supervisor Review */}
                    {isSubmitted && canReview && !isApproved && (
                      <button
                        onClick={() => handleReviewReport(c.id)}
                        className="py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-blue-200 transition-all"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>Review Report</span>
                      </button>
                    )}

                    {/* Lead Engineer / GM Approve */}
                    {(isSubmitted || isReviewed) && canApprove && !isApproved && (
                      <button
                        onClick={() => handleApproveReport(c.id)}
                        className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <Shield className="w-3.5 h-3.5 text-emerald-200" />
                        <span>Approve Report</span>
                      </button>
                    )}

                    {/* GM Close */}
                    {isApproved && !isClosed && canClose && (
                      <button
                        onClick={() => handleCloseCall(c.id)}
                        className="py-2 px-3 bg-slate-800 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Close Call</span>
                      </button>
                    )}
                  </div>

                  {/* Right Buttons: Report Viewing & Distribution (ALL 7 ROLES CAN VIEW!) */}
                  <div className="flex items-center gap-1.5 ml-auto">
                    {/* Distribute Internally */}
                    {isApproved && (isGM || isEngineer || isSupervisor) && (
                      <button
                        onClick={() => setDistributeModalCall(c)}
                        className="py-2 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 transition-all"
                        title="Distribute Report Internally"
                      >
                        <Share2 className="w-3.5 h-3.5 text-blue-600" />
                        <span className="hidden sm:inline">Distribute</span>
                      </button>
                    )}

                    {/* VIEW FORMAL A4 PDF REPORT (ACCESSIBLE BY ALL 7 ROLES!) */}
                    <button
                      onClick={() => setSelectedCallForPDF(c)}
                      className="py-2 px-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View Report PDF</span>
                    </button>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS & OVERLAYS                                                         */}
      {/* ========================================================================= */}

      {/* CREATE EMERGENCY CALL MODAL */}
      {isCreateModalOpen && (
        <EmergencyCalloutModal
          onClose={() => setIsCreateModalOpen(false)}
          onSaved={() => loadCalls()}
        />
      )}

      {/* EDIT / DETAILS MODAL */}
      {selectedCallForModal && (
        <EmergencyCalloutModal
          call={selectedCallForModal}
          onClose={() => setSelectedCallForModal(null)}
          onSaved={() => loadCalls()}
        />
      )}

      {/* PDF REPORT VIEWER & GENERATOR MODAL */}
      {selectedCallForPDF && (
        <EmergencyCalloutPDF
          call={selectedCallForPDF}
          onClose={() => setSelectedCallForPDF(null)}
        />
      )}

      {/* AUDIT TRAIL MODAL */}
      {selectedCallForAudit && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl p-5 shadow-2xl text-xs space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-black text-slate-900">
                  Audit History: {selectedCallForAudit.call_number}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedCallForAudit(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5">
              {(selectedCallForAudit.audit_trail || []).map((step, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{step.action}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(step.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">{step.details}</p>
                  <p className="text-[10px] text-blue-700 font-bold mt-1">
                    By: {step.by_name} ({step.by_role})
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* INTERNAL DISTRIBUTION MODAL */}
      {distributeModalCall && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-5 shadow-2xl text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-black text-slate-900">
                  Internal Report Distribution
                </h3>
              </div>
              <button 
                onClick={() => setDistributeModalCall(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-slate-600 text-xs">
              Distribute confidential report <strong>{distributeModalCall.report_number || distributeModalCall.call_number}</strong> internally to authorized FIREX personnel.
            </p>

            <form onSubmit={handleDistributeSubmit} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Internal Recipient *</label>
                <select
                  value={distributionRecipient.email}
                  onChange={(e) => {
                    const email = e.target.value;
                    let name = 'Eng. Mohamed Hweidi';
                    let rRole = 'GM';
                    if (email.includes('chandiramohan')) { name = 'Eng. Chandiramohan Karunanithi'; rRole = 'Engineer'; }
                    else if (email.includes('sarath')) { name = 'Sarath Kr'; rRole = 'Supervisor'; }
                    else if (email.includes('alwadhi')) { name = 'Mohammed Alwadhi'; rRole = 'Sales'; }
                    setDistributionRecipient({ name, email, role: rRole });
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 text-xs"
                >
                  <option value="eng..mohamed.hweidi@firexbahrain.com">Eng. Mohamed Hweidi (General Manager)</option>
                  <option value="eng..chandiramohan.karunanithi@firexbahrain.com">Eng. Chandiramohan K. (Lead Engineer)</option>
                  <option value="sarath.kr@firexbahrain.com">Sarath Kr (Field Supervisor)</option>
                  <option value="mohammed.alwadhi@firexbahrain.com">Mohammed Alwadhi (Commercial Sales)</option>
                </select>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-600 space-y-0.5">
                <p><strong>Recipient:</strong> {distributionRecipient.name}</p>
                <p><strong>Email:</strong> {distributionRecipient.email}</p>
                <p><strong>Role:</strong> {distributionRecipient.role}</p>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDistributeModalCall(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={distributing}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-900/20 disabled:opacity-50"
                >
                  {distributing ? 'Sending...' : 'Confirm & Distribute'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
