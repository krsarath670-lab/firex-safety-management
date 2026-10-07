import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatBHD } from '../utils/formatters';
import SalesMonthlyReportModal from './SalesMonthlyReportModal';
import AMCChecklistModal from './AMCChecklistModal';
import AMCServiceReportModal from './AMCServiceReportModal';
import { 
  FileCheck, AlertOctagon, Calendar, Wrench, FileQuestion, 
  Flame, CheckCircle2, FileSpreadsheet, Building2, Plus, 
  ChevronRight, ArrowUpRight, Sparkles, Clock, ShieldAlert,
  FlameKindling, TrendingUp, DollarSign, Package, 
  Layers, UserCheck, ShieldCheck, FileText, ArrowRight, Users, Receipt, AlertTriangle,
  Briefcase, FolderKanban, CalendarClock, AlertCircle, CheckCircle, Clock4, ClipboardList
} from 'lucide-react';

export default function Dashboard({ onStartJob, onStartInspection, onNewAMC, onNewReport }) {
  const { dashboardStats, currentUser, setActiveTab, setActiveModal, fetchStats, setProjectsFilter } = useApp();

  const [upcomingTab, setUpcomingTab] = useState('next7Days'); // 'today' | 'next7Days' | 'next30Days'
  const [showSalesMonthlyReport, setShowSalesMonthlyReport] = useState(false);
  const [activeChecklistVisit, setActiveChecklistVisit] = useState(null);
  const [previewingReportVisit, setPreviewingReportVisit] = useState(null);
  const [duplicateModalVisit, setDuplicateModalVisit] = useState(null);

  const handleMakeReportClick = (visit) => {
    // Check if report already exists for this AMC visit (Requirement 9)
    const hasReport = visit.report_id || visit.has_report || visit.status === 'Completed' || visit.checklist_status === 'Submitted' || visit.checklist_status === 'Approved';
    if (hasReport) {
      setDuplicateModalVisit(visit);
    } else {
      setActiveChecklistVisit(visit);
    }
  };

  const isMD = currentUser?.role === 'Managing Director (MD)' || currentUser?.role === 'Managing Director' || currentUser?.role === 'managing_director';
  const isSales = currentUser?.role === 'Sales';
  const isTechnician = currentUser?.role === 'Technician';
  const isAccounts = currentUser?.role === 'Accounts';
  const isProjectsManager = ['Projects Manager', 'projects_manager', 'Project Manager', 'PM'].includes(currentUser?.role);
  const isGM = currentUser?.role === 'GM';
  const canPrepareReports = isMD || ['Projects Manager', 'projects_manager', 'Project Manager', 'Engineer', 'Supervisor', 'Technician'].includes(currentUser?.role);

  // Get active upcoming visits list
  const upcomingVisits = dashboardStats?.upcoming_amc?.[upcomingTab] || [];

  const getSystemColor = (sys) => {
    if (!sys) return 'bg-slate-100 text-slate-800 border-slate-200';
    if (sys.includes('Alarm')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (sys.includes('Fighting') || sys.includes('Pump')) return 'bg-red-50 text-red-700 border-red-200';
    if (sys.includes('Extinguisher')) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-purple-50 text-purple-700 border-purple-200';
  };

  // Reusable AMC Service Cards Widget (Requirement 9)
  const renderAmcServiceCardsWidget = () => {
    const cards = dashboardStats?.amc_service_cards || [];
    if (!cards || cards.length === 0) return null;

    return (
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>AMC Service Cards — Active Contracts &amp; Dynamic Cycles</span>
            </h2>
            <p className="text-[11px] text-slate-500">
              Contract service cycle tracking (Q1–Q4), actual completion dates &amp; next scheduled visits
            </p>
          </div>
          <button
            onClick={() => setActiveTab('amc')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
          >
            <span>View All AMC Contracts</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {cards.map(card => {
            const isOverdue = card.is_overdue;
            const daysRemaining = card.days_remaining;

            return (
              <div
                key={card.contract_id}
                className={`rounded-xl p-3.5 border transition-all flex flex-col justify-between ${
                  isOverdue 
                    ? 'bg-red-50/50 border-red-200 shadow-xs' 
                    : 'bg-slate-50/70 border-slate-200 hover:border-blue-300 hover:bg-blue-50/20'
                }`}
              >
                <div>
                  {/* Card Header: Contract # & Status */}
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="font-mono font-black text-xs text-navy-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {card.contract_number}
                    </span>
                    <div className="flex items-center gap-1">
                      {isOverdue && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-100 text-red-800 border border-red-300 flex items-center gap-0.5 animate-pulse">
                          <AlertTriangle className="w-3 h-3 text-red-600" />
                          <span>OVERDUE ({Math.abs(daysRemaining)}d)</span>
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {card.status || 'Active'}
                      </span>
                    </div>
                  </div>

                  {/* Customer & Site */}
                  <div className="mb-2.5">
                    <h4 className="text-xs font-black text-slate-900 truncate" title={card.customer_name}>
                      {card.customer_name}
                    </h4>
                    <p className="text-[11px] text-slate-600 flex items-center gap-1 truncate" title={card.site_name}>
                      <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{card.site_name}</span>
                    </p>
                  </div>

                  {/* Systems */}
                  {card.systems && card.systems.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {card.systems.map((sys, idx) => (
                        <span key={idx} className="text-[9px] font-bold px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-700">
                          {sys}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Key Metrics Grid (Requirement 9) */}
                  <div className="grid grid-cols-2 gap-2 text-left mb-3">
                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Current Cycle</span>
                      <span className="text-xs font-black text-blue-700 font-mono">
                        {card.current_cycle}
                      </span>
                    </div>

                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Days Remaining</span>
                      <span className={`text-xs font-black ${
                        isOverdue ? 'text-red-700' : (daysRemaining !== null && daysRemaining <= 7 ? 'text-amber-600' : 'text-slate-800')
                      }`}>
                        {daysRemaining !== null 
                          ? (isOverdue ? `${Math.abs(daysRemaining)}d Overdue` : `${daysRemaining} days`)
                          : 'Completed'}
                      </span>
                    </div>

                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Next Service Date</span>
                      <span className="text-xs font-bold text-slate-800">
                        {card.next_service_date || 'N/A'}
                      </span>
                    </div>

                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Next Scheduled</span>
                      <span className="text-xs font-bold text-slate-800">
                        {card.next_scheduled_date || 'N/A'}
                      </span>
                    </div>

                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Last Completed</span>
                      <span className="text-xs font-bold text-slate-700">
                        {card.last_completed_date 
                          ? `${card.last_completed_date} (${card.last_completed_cycle || 'Done'})` 
                          : 'Not Started'}
                      </span>
                    </div>

                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Contract Expiry</span>
                      <span className="text-xs font-bold text-slate-700">
                        {card.expiry_date || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action */}
                <button
                  onClick={() => setActiveTab('amc')}
                  className="w-full mt-1 py-1.5 px-3 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition-colors"
                >
                  <span>Open AMC Contract &amp; Cycles</span>
                  <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Reusable Upcoming AMC Visits Widget
  const renderUpcomingVisitsWidget = () => (
    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>Upcoming AMC Maintenance Visits</span>
          </h2>
          <p className="text-[11px] text-slate-500">
            {isSales 
              ? "Automated compliance visits scheduled for your accounts" 
              : "Civil Defence compliance visits by certified technicians"}
          </p>
        </div>
        <button
          onClick={() => setActiveTab('amc')}
          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
        >
          <span>View Schedule</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Time Horizon Filter Tabs */}
      <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs">
        <button
          onClick={() => setUpcomingTab('today')}
          className={`flex-1 py-1.5 rounded-lg font-bold text-center transition-all ${
            upcomingTab === 'today'
              ? 'bg-white text-navy-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Today ({dashboardStats?.upcoming_amc?.today?.length || 0})
        </button>
        <button
          onClick={() => setUpcomingTab('next7Days')}
          className={`flex-1 py-1.5 rounded-lg font-bold text-center transition-all ${
            upcomingTab === 'next7Days'
              ? 'bg-white text-navy-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Next 7 Days ({dashboardStats?.upcoming_amc?.next7Days?.length || 0})
        </button>
        <button
          onClick={() => setUpcomingTab('next30Days')}
          className={`flex-1 py-1.5 rounded-lg font-bold text-center transition-all ${
            upcomingTab === 'next30Days'
              ? 'bg-white text-navy-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Next 30 Days ({dashboardStats?.upcoming_amc?.next30Days?.length || 0})
        </button>
      </div>

      {/* Visits List */}
      <div className="space-y-2">
        {upcomingVisits.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
            No AMC visits scheduled in this timeframe.
          </div>
        ) : (
          upcomingVisits.slice(0, 5).map((v) => (
            <div
              key={v.id}
              className="bg-slate-50 hover:bg-blue-50/40 p-3 rounded-xl border border-slate-200 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-mono font-black text-white bg-navy-900 px-1.5 py-0.5 rounded">
                    {v.service_cycle || v.quarter || 'Q1'}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getSystemColor(v.system_type || v.system)}`}>
                    {v.system_type || v.system}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                    Visit #{v.service_sequence || v.visit_number}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-600 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{v.scheduled_date}</span>
                  </span>
                  {v.is_overdue && (
                    <span className="text-[9.5px] font-black text-red-700 bg-red-100 px-1.5 py-0.5 rounded border border-red-300 animate-pulse">
                      OVERDUE ({Math.abs(v.days_remaining)}d)
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{v.site_name}</h4>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {v.customer_name} • Tech: <span className="font-semibold text-slate-700">{v.technician_name || 'Abdul Majeed'}</span> • Supervisor: <span className="font-semibold text-slate-700">{v.supervisor_name || 'Sarath Kr'}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  v.status === 'Completed'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {v.status}
                </span>

                <button
                  type="button"
                  onClick={() => handleMakeReportClick(v)}
                  className="px-2.5 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-black flex items-center gap-1 shadow-sm transition-all"
                  title="Make or view AMC checklist and service report"
                >
                  <FileText className="w-3 h-3 text-emerald-200" />
                  <span>MAKE REPORT</span>
                </button>

                <button
                  onClick={() => onStartInspection(v)}
                  className="px-2.5 py-1 bg-navy-900 hover:bg-navy-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
                >
                  <Wrench className="w-3 h-3" />
                  <span>Start</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* DUPLICATE REPORT PREVENTION MODAL (Requirement 9) */}
      {duplicateModalVisit && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-900 leading-tight">
                  A report already exists for this AMC visit.
                </h3>
                <p className="text-xs text-slate-600">
                  A checklist or periodic service report has already been initiated or submitted for this scheduled visit. Please select an action below:
                </p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs space-y-1 font-mono">
              <div className="text-slate-800 font-bold">{duplicateModalVisit.site_name || duplicateModalVisit.customer_name}</div>
              <div className="text-slate-600">Contract: <span className="font-bold text-navy-900">{duplicateModalVisit.contract_number || duplicateModalVisit.amc_contract_number || 'AMC-2026'}</span> • Visit #{duplicateModalVisit.visit_number || duplicateModalVisit.service_sequence || 1} ({duplicateModalVisit.quarter || 'Q1'})</div>
              <div className="text-slate-600">Scheduled: <span className="font-bold">{duplicateModalVisit.scheduled_date}</span> • Status: <span className="font-bold text-emerald-700">{duplicateModalVisit.status}</span></div>
              <div className="text-slate-600">Supervisor: <span className="font-bold">{duplicateModalVisit.supervisor_name || 'Sarath Kr'}</span> • Tech: <span className="font-bold">{duplicateModalVisit.technician_name || 'Abdul Majeed'}</span></div>
            </div>

            <div className="space-y-2 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const v = duplicateModalVisit;
                    setDuplicateModalVisit(null);
                    setActiveChecklistVisit(v);
                  }}
                  className="px-3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-sm transition-all uppercase"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>OPEN REPORT</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const v = duplicateModalVisit;
                    setDuplicateModalVisit(null);
                    setActiveChecklistVisit(v);
                  }}
                  className="px-3 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-sm transition-all uppercase"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>EDIT REPORT</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  const v = duplicateModalVisit;
                  setDuplicateModalVisit(null);
                  setPreviewingReportVisit(v);
                }}
                className="w-full px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-sm transition-all uppercase"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                <span>VIEW FINAL REPORT</span>
              </button>

              <button
                type="button"
                onClick={() => setDuplicateModalVisit(null)}
                className="w-full px-3 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors uppercase"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AMC CHECKLIST MODAL */}
      {activeChecklistVisit && (
        <AMCChecklistModal
          visit={activeChecklistVisit}
          onClose={() => setActiveChecklistVisit(null)}
          onRefresh={() => {
            if (typeof fetchStats === 'function') fetchStats();
          }}
          onViewReport={(v) => {
            setActiveChecklistVisit(null);
            setPreviewingReportVisit(v);
          }}
        />
      )}

      {/* OFFICIAL CIVIL DEFENSE AMC SERVICE REPORT MODAL */}
      {previewingReportVisit && (
        <AMCServiceReportModal
          visit={previewingReportVisit}
          onClose={() => {
            setPreviewingReportVisit(null);
            if (typeof fetchStats === 'function') fetchStats();
          }}
        />
      )}
    </div>
  );

  // Reusable Emergency Call-Out & Rapid Response Widget
  const renderEmergencyCalloutWidget = () => {
    const eStats = dashboardStats?.emergencyStats || {
      total: 0,
      critical: 0,
      active: 0,
      pending_reports: 0,
      approved: 0,
      closed: 0
    };

    return (
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center text-safety-red">
              <Flame className="w-4 h-4 fill-safety-red" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <span>Emergency Call-Out &amp; Rapid Response</span>
                {eStats.critical > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-red-600 text-white animate-pulse">
                    {eStats.critical} Critical
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-slate-500">
                24/7 Field attendance, findings, fault rectification, photos &amp; customer sign-off
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('emergency')}
            className="text-xs font-bold text-safety-red hover:text-red-700 flex items-center gap-0.5 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg transition-colors"
          >
            <span>Open Call-Outs</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4 Mini KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div 
            onClick={() => setActiveTab('emergency')}
            className="p-2.5 rounded-xl bg-red-50 border border-red-200 cursor-pointer hover:bg-red-100/60 transition-colors"
          >
            <span className="text-[10px] font-black uppercase text-red-700 block">Active Calls</span>
            <span className="text-lg font-black text-red-950 font-mono block mt-0.5">{eStats.active}</span>
            <span className="text-[9px] text-red-600 font-semibold">In field / In progress</span>
          </div>

          <div 
            onClick={() => setActiveTab('emergency')}
            className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 cursor-pointer hover:bg-amber-100/60 transition-colors"
          >
            <span className="text-[10px] font-black uppercase text-amber-800 block">Critical / High</span>
            <span className="text-lg font-black text-amber-950 font-mono block mt-0.5">{eStats.critical}</span>
            <span className="text-[9px] text-amber-700 font-semibold">Immediate attention</span>
          </div>

          <div 
            onClick={() => setActiveTab('emergency')}
            className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 cursor-pointer hover:bg-blue-100/60 transition-colors"
          >
            <span className="text-[10px] font-black uppercase text-blue-800 block">Reports Pending</span>
            <span className="text-lg font-black text-blue-950 font-mono block mt-0.5">{eStats.pending_reports}</span>
            <span className="text-[9px] text-blue-700 font-semibold">Review &amp; sign-off</span>
          </div>

          <div 
            onClick={() => setActiveTab('emergency')}
            className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 cursor-pointer hover:bg-emerald-100/60 transition-colors"
          >
            <span className="text-[10px] font-black uppercase text-emerald-800 block">Approved &amp; Closed</span>
            <span className="text-lg font-black text-emerald-950 font-mono block mt-0.5">{(eStats.approved || 0) + (eStats.closed || 0)}</span>
            <span className="text-[9px] text-emerald-700 font-semibold">Signed &amp; archived</span>
          </div>
        </div>

        {/* 1-Click Launch Button */}
        <div className="pt-1 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-medium">
            Sequential auto-numbering ECO-2026-XXX &amp; ECR-2026-XXX
          </span>
          <button
            onClick={() => setActiveTab('emergency')}
            className="px-3 py-1.5 bg-safety-red hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Launch Emergency Call-Out</span>
          </button>
        </div>
      </div>
    );
  };

  // ----------------------------------------------------
  // DEDICATED MANAGING DIRECTOR EXECUTIVE DASHBOARD VIEW (Role: Managing Director)
  // ----------------------------------------------------
  if (isMD) {
    const stats = dashboardStats || {};
    const fin = stats.financials || {};
    const emp = stats.employeeSummary || {};
    const att = stats.attendanceSummary || {};
    const prj = stats.projectsStats || {};
    const expiringAMC = (stats.expiring30Days || 0) + (stats.expiring60Days || 0) + (stats.expiring90Days || 0);

    return (
      <div className="space-y-4 pb-28">
        {/* Managing Director Executive Welcome Banner */}
        <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-amber-950 rounded-2xl p-4 sm:p-5 text-white shadow-lg border border-amber-900/40 relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-amber-500/10 to-transparent pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-black tracking-wider uppercase bg-amber-500/20 text-amber-300 border border-amber-400/40 shadow-sm">
                  Executive Managing Director Mode • Full Access
                </span>
                <span className="text-xs text-slate-300 font-medium">
                  {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white mt-1 tracking-tight">
                Welcome, {currentUser?.name || 'Managing Director'}
              </h1>
              <p className="text-xs text-amber-200/80 mt-0.5 max-w-2xl font-medium">
                Executive command radar: Company-wide operational overview, real-time finances, field workforce, and system audit log.
              </p>
            </div>

            {/* Quick Executive Shortcuts */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setActiveTab('audit_logs')}
                className="px-3 py-2 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition-all"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Audit Trail Log</span>
              </button>
              <button
                onClick={() => setActiveTab('accounts')}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-white border border-slate-700 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Receipt className="w-3.5 h-3.5 text-teal-400" />
                <span>Accounts</span>
              </button>
            </div>
          </div>

          {/* Quick Actions Row */}
          <div className="mt-3.5 pt-3 border-t border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
            <span className="text-slate-300 font-semibold">Executive Actions:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={onStartJob}
                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold flex items-center gap-1"
              >
                <Plus className="w-3 h-3 text-emerald-400" />
                <span>New Job</span>
              </button>
              <button
                onClick={onNewAMC}
                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold flex items-center gap-1"
              >
                <Plus className="w-3 h-3 text-blue-400" />
                <span>New AMC</span>
              </button>
              <button
                onClick={onNewReport}
                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold flex items-center gap-1"
              >
                <Plus className="w-3 h-3 text-purple-400" />
                <span>New Report</span>
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold flex items-center gap-1"
              >
                <Users className="w-3 h-3 text-amber-400" />
                <span>Staff Management</span>
              </button>
            </div>
          </div>
        </div>

        {/* Payment & Operational Holds Alert Banner */}
        {((stats.paymentHoldsCount || 0) + (stats.operationalHoldsCount || 0) > 0) && (
          <div 
            onClick={() => setActiveTab('jobs')}
            className="bg-gradient-to-r from-red-50 to-amber-50 border border-red-300 rounded-2xl p-3.5 flex items-start justify-between cursor-pointer hover:shadow-md transition-all"
          >
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-xl bg-red-600 text-white shadow-sm mt-0.5">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-black text-red-950 uppercase tracking-wide">
                  Jobs on Hold ({((stats.paymentHoldsCount || 0) + (stats.operationalHoldsCount || 0))})
                </h2>
                <p className="text-xs text-red-900 mt-0.5 font-medium">
                  {stats.paymentHoldsCount > 0 && (
                    <span className="font-bold text-red-900">
                      🔴 {stats.paymentHoldsCount} Payment Hold(s){" "}
                    </span>
                  )}
                  {stats.operationalHoldsCount > 0 && (
                    <span className="font-bold text-amber-900">
                      🟠 {stats.operationalHoldsCount} Operational Hold(s)
                    </span>
                  )}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-red-600 self-center" />
          </div>
        )}

        {/* 20 EXECUTIVE METRICS OVERVIEW PANELS */}
        <div className="space-y-3">
          {/* Group 1: Commercial & Operations Overview (Cards 1 to 7) */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>Commercial &amp; Core Operations Radar</span>
              </h2>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Click any card to inspect</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
              {/* 1. Total Customers */}
              <div 
                onClick={() => setActiveTab('customers')}
                className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 cursor-pointer transition-all"
              >
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Total Customers</span>
                <span className="text-xl font-black text-slate-900 block mt-0.5">{stats.customersCount || 0}</span>
                <span className="text-[10px] text-blue-600 font-bold flex items-center gap-0.5 mt-1">View list &rarr;</span>
              </div>

              {/* 2. Active AMC */}
              <div 
                onClick={() => setActiveTab('amc')}
                className="p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 cursor-pointer transition-all"
              >
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Active AMC</span>
                <span className="text-xl font-black text-emerald-700 block mt-0.5">{stats.totalActiveAMC || 0}</span>
                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-1">Contracts &rarr;</span>
              </div>

              {/* 3. Expiring AMC */}
              <div 
                onClick={() => setActiveTab('amc')}
                className="p-3 rounded-xl bg-slate-50 hover:bg-amber-50/60 border border-slate-200 hover:border-amber-300 cursor-pointer transition-all"
              >
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Expiring AMC</span>
                <span className="text-xl font-black text-amber-700 block mt-0.5">{expiringAMC}</span>
                <span className="text-[10px] text-amber-600 font-bold flex items-center gap-0.5 mt-1">Next 90 days &rarr;</span>
              </div>

              {/* 4. AMC Scheduled Visits */}
              <div 
                onClick={() => setActiveTab('amc')}
                className="p-3 rounded-xl bg-slate-50 hover:bg-purple-50/60 border border-slate-200 hover:border-purple-300 cursor-pointer transition-all"
              >
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Scheduled Visits</span>
                <span className="text-xl font-black text-purple-700 block mt-0.5">
                  {stats.quarters_count?.details?.q1?.scheduled || upcomingVisits.length || 0}
                </span>
                <span className="text-[10px] text-purple-600 font-bold flex items-center gap-0.5 mt-1">Schedules &rarr;</span>
              </div>

              {/* 5. Today's Jobs */}
              <div 
                onClick={() => setActiveTab('jobs')}
                className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 cursor-pointer transition-all"
              >
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Today's Jobs</span>
                <span className="text-xl font-black text-blue-700 block mt-0.5">{stats.todayJobsCount || 0}</span>
                <span className="text-[10px] text-blue-600 font-bold flex items-center gap-0.5 mt-1">Field dispatch &rarr;</span>
              </div>

              {/* 6. Pending Jobs */}
              <div 
                onClick={() => setActiveTab('jobs')}
                className="p-3 rounded-xl bg-slate-50 hover:bg-amber-50/60 border border-slate-200 hover:border-amber-300 cursor-pointer transition-all"
              >
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Pending Jobs</span>
                <span className="text-xl font-black text-amber-600 block mt-0.5">{stats.pendingJobsCount || 0}</span>
                <span className="text-[10px] text-amber-600 font-bold flex items-center gap-0.5 mt-1">In progress &rarr;</span>
              </div>

              {/* 7. Completed Jobs */}
              <div 
                onClick={() => setActiveTab('jobs')}
                className="p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 cursor-pointer transition-all"
              >
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Completed Jobs</span>
                <span className="text-xl font-black text-emerald-600 block mt-0.5">{stats.completedJobsCount || 0}</span>
                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-1">Finished &rarr;</span>
              </div>
            </div>
          </div>

          {/* Group 2: Field Incidents & Projects (Cards 8 to 13) */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-indigo-600" />
                <span>Field Incidents, Projects &amp; Quotations</span>
              </h2>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Operational health</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {/* 8. Pending Breakdowns */}
              <div 
                onClick={() => setActiveTab('jobs')}
                className="p-3 rounded-xl bg-slate-50 hover:bg-red-50/60 border border-slate-200 hover:border-red-300 cursor-pointer transition-all"
              >
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Pending Breakdowns</span>
                <span className="text-xl font-black text-red-600 block mt-0.5">{stats.pendingBreakdownsCount || 0}</span>
                <span className="text-[10px] text-red-600 font-bold flex items-center gap-0.5 mt-1">Emergency repairs &rarr;</span>
              </div>

              {/* 9. Open Defects */}
              <div 
                onClick={() => setActiveTab('faults')}
                className="p-3 rounded-xl bg-slate-50 hover:bg-orange-50/60 border border-slate-200 hover:border-orange-300 cursor-pointer transition-all"
              >
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Open Defects</span>
                <span className="text-xl font-black text-orange-600 block mt-0.5">{stats.openFaultsCount || 0}</span>
                <span className="text-[10px] text-orange-600 font-bold flex items-center gap-0.5 mt-1">Defect ledger &rarr;</span>
              </div>

              {/* 10. Total Projects */}
              <div 
                onClick={() => setActiveTab('projects')}
                className="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-300 cursor-pointer transition-all"
              >
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Total Projects</span>
                <span className="text-xl font-black text-indigo-700 block mt-0.5">{prj.totalProjects || 0}</span>
                <span className="text-[10px] text-indigo-600 font-bold flex items-center gap-0.5 mt-1">Fit-outs &amp; Projects &rarr;</span>
              </div>

              {/* 11. Active Projects */}
              <div 
                onClick={() => setActiveTab('projects')}
                className="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-300 cursor-pointer transition-all"
              >
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Active Projects</span>
                <span className="text-xl font-black text-indigo-900 block mt-0.5">{prj.activeProjects || 0}</span>
                <span className="text-[10px] text-indigo-600 font-bold flex items-center gap-0.5 mt-1">On-site execution &rarr;</span>
              </div>

              {/* 12. Project Progress */}
              <div 
                onClick={() => setActiveTab('projects')}
                className="p-3 rounded-xl bg-slate-50 hover:bg-teal-50/60 border border-slate-200 hover:border-teal-300 cursor-pointer transition-all"
              >
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Avg Project Progress</span>
                <span className="text-xl font-black text-teal-700 block mt-0.5">{prj.avgCompletion || 0}%</span>
                <span className="text-[10px] text-teal-600 font-bold flex items-center gap-0.5 mt-1">Milestones &rarr;</span>
              </div>

              {/* 13. Quotations */}
              <div 
                onClick={() => setActiveTab('quotations')}
                className="p-3 rounded-xl bg-slate-50 hover:bg-amber-50/60 border border-slate-200 hover:border-amber-300 cursor-pointer transition-all"
              >
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Quotations Draft/Pending</span>
                <span className="text-xl font-black text-amber-700 block mt-0.5">{stats.pendingQuotationsCount || 0}</span>
                <span className="text-[10px] text-amber-600 font-bold flex items-center gap-0.5 mt-1">Commercial proposals &rarr;</span>
              </div>
            </div>
          </div>

          {/* Group 3: Financial Overview (Cards 14 to 17) */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-teal-600" />
                <span>Executive Financial Overview (Accounts &amp; Cash Flow)</span>
              </h2>
              <button
                onClick={() => setActiveTab('accounts')}
                className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-0.5"
              >
                <span>Full Accounts Module</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* 14. Total Invoiced */}
              <div 
                onClick={() => setActiveTab('accounts')}
                className="p-3.5 rounded-xl bg-teal-50/70 border border-teal-200 hover:border-teal-300 cursor-pointer transition-all"
              >
                <span className="text-[10px] font-black uppercase text-teal-900 block">Total Invoiced</span>
                <span className="text-xl font-black text-teal-950 font-mono block mt-1">
                  {formatBHD(fin.total_invoiced || 0)}
                </span>
                <span className="text-[10px] text-teal-700 font-semibold mt-1 block">BHD • {fin.invoice_count || 0} Invoices</span>
              </div>

              {/* 15. Collected Revenue */}
              <div 
                onClick={() => setActiveTab('accounts')}
                className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 hover:border-emerald-300 cursor-pointer transition-all"
              >
                <span className="text-[10px] font-black uppercase text-emerald-900 block">Collected Revenue</span>
                <span className="text-xl font-black text-emerald-950 font-mono block mt-1">
                  {formatBHD(fin.total_paid || 0)}
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold mt-1 block">BHD Paid in Full</span>
              </div>

              {/* 16. Outstanding Balance */}
              <div 
                onClick={() => setActiveTab('accounts')}
                className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 hover:border-amber-300 cursor-pointer transition-all"
              >
                <span className="text-[10px] font-black uppercase text-amber-900 block">Outstanding Balance</span>
                <span className="text-xl font-black text-amber-950 font-mono block mt-1">
                  {formatBHD(fin.total_outstanding || 0)}
                </span>
                <span className="text-[10px] text-amber-700 font-semibold mt-1 block">BHD Pending Collection</span>
              </div>

              {/* 17. Overdue Invoices */}
              <div 
                onClick={() => setActiveTab('accounts')}
                className="p-3.5 rounded-xl bg-red-50/70 border border-red-200 hover:border-red-300 cursor-pointer transition-all"
              >
                <span className="text-[10px] font-black uppercase text-red-900 block">Overdue Invoices</span>
                <span className="text-xl font-black text-red-950 font-mono block mt-1">
                  {stats.overdueInvoicesCount || 0}
                </span>
                <span className="text-[10px] text-red-700 font-semibold mt-1 block">
                  {formatBHD(stats.overdueInvoicesAmount || 0)} Overdue
                </span>
              </div>
            </div>
          </div>

          {/* Group 4: Workforce & Compliance (Cards 18 to 20) */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-purple-600" />
                <span>Workforce, Attendance &amp; Report Approvals</span>
              </h2>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Human Resources &amp; QA</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* 18. Employee Summary */}
              <div 
                onClick={() => setActiveTab('users')}
                className="p-3.5 rounded-xl bg-slate-50 hover:bg-purple-50/60 border border-slate-200 hover:border-purple-300 cursor-pointer transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-slate-500">Employee Summary</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-purple-100 text-purple-800">HR Directory</span>
                  </div>
                  <div className="text-2xl font-black text-slate-900 mt-1">
                    {emp.total || 0} Staff
                  </div>
                </div>
                <div className="text-[11px] text-slate-600 font-medium mt-2">
                  <span className="text-emerald-700 font-bold">{emp.active || 0} Active</span> • {emp.engineers || 0} Eng • {emp.supervisors || 0} Sup • {emp.technicians || 0} Tech • {emp.sales || 0} Sales • {emp.accounts || 0} Acct
                </div>
              </div>

              {/* 19. Attendance Summary */}
              <div 
                onClick={() => setActiveTab('users')}
                className="p-3.5 rounded-xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 cursor-pointer transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-slate-500">Attendance Summary</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-emerald-100 text-emerald-800">Today</span>
                  </div>
                  <div className="text-2xl font-black text-emerald-700 mt-1">
                    {att.onDuty || 0} On Duty
                  </div>
                </div>
                <div className="text-[11px] text-slate-600 font-medium mt-2">
                  {att.available || 0} Available for dispatch • {att.totalStaff || 0} Total rostered staff
                </div>
              </div>

              {/* 20. Reports Summary */}
              <div 
                onClick={() => setActiveTab('reports')}
                className="p-3.5 rounded-xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 cursor-pointer transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-slate-500">Technical Reports</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-blue-100 text-blue-800">Approvals</span>
                  </div>
                  <div className="text-2xl font-black text-blue-700 mt-1">
                    {stats.pendingReportsCount || 0} Pending
                  </div>
                </div>
                <div className="text-[11px] text-slate-600 font-medium mt-2">
                  Managing Director has full review and approval authorization on all reports &rarr;
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Call-Outs & Rapid Response */}
        {renderEmergencyCalloutWidget()}

        {/* AMC Service Cards — Active Contracts & Dynamic Cycles */}
        {renderAmcServiceCardsWidget()}

        {/* Upcoming AMC Visits Widget */}
        {renderUpcomingVisitsWidget()}
      </div>
    );
  }

  // ----------------------------------------------------
  // DEDICATED SALES DASHBOARD VIEW (Role: Sales)
  // ----------------------------------------------------
  if (isSales) {
    const stats = dashboardStats || {};

    return (
      <div className="space-y-4 pb-24">
        
        {/* Sales Welcome Banner: MY SALES / CONTRACTS */}
        <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-amber-950 rounded-2xl p-4 sm:p-5 text-white shadow-md border border-navy-800 relative overflow-hidden">
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  Sales Executive
                </span>
                <span className="text-xs text-slate-300">
                  {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white mt-1 uppercase tracking-tight">
                MY SALES / CONTRACTS
              </h1>
              <p className="text-xs text-amber-100/90 mt-0.5">
                Sales Specialist: <span className="font-bold text-white">{currentUser?.name}</span> • Isolated Portfolio &amp; Performance
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-900/60 border border-amber-600/40 flex items-center justify-center shadow-inner">
              <TrendingUp className="w-6 h-6 text-amber-400" />
            </div>
          </div>

          {/* Quick Statement Shortcut */}
          <div className="mt-3 pt-3 border-t border-navy-800/80 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1 rounded bg-amber-500/20 text-amber-400">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs text-slate-200 font-medium">
                Official Monthly Sales Commission &amp; Closed Work Statement
              </span>
            </div>
            <button
              onClick={() => setShowSalesMonthlyReport(true)}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-all shadow-sm"
            >
              <span>View Monthly Report</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* METRIC 13: REVENUE GENERATED (This Month / This Year / All Time) */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>13. Revenue Generated (BHD)</span>
            </h2>
            <span className="text-[10px] text-slate-400 font-semibold">Incl. VAT</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200">
              <span className="text-[10px] uppercase font-bold text-emerald-800 block">This Month</span>
              <div className="text-lg sm:text-xl font-black text-emerald-950 font-mono mt-0.5">
                {formatBHD(stats.revenue_this_month || 0)}
              </div>
              <span className="text-[10px] text-emerald-700">Current billing month</span>
            </div>
            <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
              <span className="text-[10px] uppercase font-bold text-blue-800 block">This Year ({new Date().getFullYear()})</span>
              <div className="text-lg sm:text-xl font-black text-blue-950 font-mono mt-0.5">
                {formatBHD(stats.revenue_this_year || 0)}
              </div>
              <span className="text-[10px] text-blue-700">YTD sales volume</span>
            </div>
            <div className="bg-gradient-to-br from-navy-900 to-navy-800 text-white rounded-xl p-3 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-amber-300 block">All Time Revenue</span>
              <div className="text-lg sm:text-xl font-black text-white font-mono mt-0.5">
                {formatBHD(stats.revenue_all_time || stats.total_including_vat || 0)}
              </div>
              <span className="text-[10px] text-slate-300">Lifetime closed deals</span>
            </div>
          </div>
        </div>

        {/* METRICS 1 to 5: AMC CONTRACTS & EXPIRY STATUS */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>1–5. AMC Contracts &amp; Expiry Radar</span>
            </h2>
            <button
              onClick={() => setActiveTab('amc')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
            >
              <span>View All AMC</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Metric 1: Total Active AMC Card with Full VAT Breakdown */}
          <div className="bg-gradient-to-r from-blue-900 to-navy-900 rounded-xl p-4 text-white shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200 block">
                  1. Total Active AMC Contracts
                </span>
                <div className="text-2xl sm:text-3xl font-black text-white mt-0.5">
                  {stats.active_amcs || 0} <span className="text-xs font-normal text-blue-200">contracts active</span>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-xs rounded-lg p-2.5 border border-white/20 text-right">
                <span className="text-[9px] uppercase font-bold text-amber-300 block">Total Value (Incl. VAT)</span>
                <span className="text-base sm:text-lg font-black text-white font-mono">
                  {formatBHD(stats.active_amc_total || stats.total_contract_value || 0)}
                </span>
              </div>
            </div>

            {/* Sub-breakdown: Excl. VAT & VAT Amount */}
            <div className="mt-3 pt-2.5 border-t border-white/15 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-blue-200 block">Value (Excl. VAT):</span>
                <span className="font-mono font-bold text-white">
                  {formatBHD(stats.active_amc_value || stats.total_contract_value || 0)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-blue-200 block">Calculated VAT Amount:</span>
                <span className="font-mono font-bold text-amber-300">
                  {formatBHD(stats.active_amc_vat || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Metrics 2 to 5: Expiry Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div 
              onClick={() => setActiveTab('amc')}
              className="bg-red-50 hover:bg-red-100 p-3 rounded-xl border border-red-200 cursor-pointer transition-all text-center"
            >
              <span className="text-[10px] font-bold uppercase text-red-800 block">2. Expiring in 30d</span>
              <div className="text-2xl font-black text-red-700 mt-0.5">
                {stats.amc_expiring_30_days || 0}
              </div>
              <span className="text-[10px] text-red-600 font-semibold">Immediate renewal</span>
            </div>

            <div 
              onClick={() => setActiveTab('amc')}
              className="bg-amber-50 hover:bg-amber-100 p-3 rounded-xl border border-amber-200 cursor-pointer transition-all text-center"
            >
              <span className="text-[10px] font-bold uppercase text-amber-800 block">3. Expiring in 60d</span>
              <div className="text-2xl font-black text-amber-700 mt-0.5">
                {stats.amc_expiring_60_days || 0}
              </div>
              <span className="text-[10px] text-amber-600 font-semibold">Upcoming renewal</span>
            </div>

            <div 
              onClick={() => setActiveTab('amc')}
              className="bg-blue-50 hover:bg-blue-100 p-3 rounded-xl border border-blue-200 cursor-pointer transition-all text-center"
            >
              <span className="text-[10px] font-bold uppercase text-blue-800 block">4. Expiring in 90d</span>
              <div className="text-2xl font-black text-blue-700 mt-0.5">
                {stats.amc_expiring_90_days || stats.expiring_amcs || 0}
              </div>
              <span className="text-[10px] text-blue-600 font-semibold">Planning horizon</span>
            </div>

            <div 
              onClick={() => setActiveTab('amc')}
              className="bg-slate-100 hover:bg-slate-200 p-3 rounded-xl border border-slate-300 cursor-pointer transition-all text-center"
            >
              <span className="text-[10px] font-bold uppercase text-slate-700 block">5. Expired AMC</span>
              <div className="text-2xl font-black text-slate-800 mt-0.5">
                {stats.expired_amcs || 0}
              </div>
              <span className="text-[10px] text-slate-500 font-semibold">Lapsed contracts</span>
            </div>
          </div>
        </div>

        {/* METRICS 6 to 10: ACTIVE JOBS, FIT-OUTS, PROJECTS, BREAKDOWN & SUPPLY */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-purple-600" />
              <span>6–10. Active Works &amp; Pipeline</span>
            </h2>
            <button
              onClick={() => setActiveTab('jobs')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
            >
              <span>View All Jobs</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            
            {/* Metric 6: Total Active Jobs */}
            <div 
              onClick={() => setActiveTab('jobs')}
              className="bg-slate-50 hover:bg-slate-100 p-3.5 rounded-xl border border-slate-200 cursor-pointer transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-slate-500">6. Active Jobs</span>
                <Briefcase className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-navy-900 mt-1">
                {stats.active_jobs || 0}
              </div>
              <div className="text-xs font-bold font-mono text-amber-800 mt-0.5">
                Value: {formatBHD(stats.active_jobs_value || 0)}
              </div>
            </div>

            {/* Metric 7: Total Active Fit-outs */}
            <div 
              onClick={() => onStartJob('Fit-out')}
              className="bg-slate-50 hover:bg-slate-100 p-3.5 rounded-xl border border-slate-200 cursor-pointer transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-slate-500">7. Active Fit-outs</span>
                <Building2 className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-black text-navy-900 mt-1">
                {stats.fitouts || 0}
              </div>
              <div className="text-xs font-bold font-mono text-amber-800 mt-0.5">
                Value: {formatBHD(stats.fitouts_value || 0)}
              </div>
            </div>

            {/* Metric 8: Total Active Projects */}
            <div 
              onClick={() => onStartJob('Project')}
              className="bg-slate-50 hover:bg-slate-100 p-3.5 rounded-xl border border-slate-200 cursor-pointer transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-slate-500">8. Active Projects</span>
                <Wrench className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-black text-navy-900 mt-1">
                {stats.projects || 0}
              </div>
              <div className="text-xs font-bold font-mono text-amber-800 mt-0.5">
                Value: {formatBHD(stats.projects_value || 0)}
              </div>
            </div>

            {/* Metric 9: Breakdowns Handled */}
            <div 
              onClick={() => onStartJob('Breakdown')}
              className="bg-slate-50 hover:bg-slate-100 p-3.5 rounded-xl border border-slate-200 cursor-pointer transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-slate-500">9. Breakdowns Handled</span>
                <Flame className="w-4 h-4 text-safety-red" />
              </div>
              <div className="text-2xl font-black text-navy-900 mt-1">
                {stats.breakdowns || 0}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Emergency service callouts
              </div>
            </div>

            {/* Metric 10: Total Supply Jobs */}
            <div 
              onClick={() => onStartJob('Supply')}
              className="bg-slate-50 hover:bg-slate-100 p-3.5 rounded-xl border border-slate-200 cursor-pointer transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-slate-500">10. Supply Jobs</span>
                <Package className="w-4 h-4 text-cyan-600" />
              </div>
              <div className="text-2xl font-black text-navy-900 mt-1">
                {stats.supply_jobs || 0}
              </div>
              <div className="text-xs font-bold font-mono text-amber-800 mt-0.5">
                Value: {formatBHD(stats.supply_jobs_value || 0)}
              </div>
            </div>

            {/* Metric 11 & 12: Quotations Summary */}
            <div 
              onClick={() => setActiveTab('jobs')}
              className="bg-slate-50 hover:bg-slate-100 p-3.5 rounded-xl border border-slate-200 cursor-pointer transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-slate-500">11–12. Quotations</span>
                <FileText className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <div>
                  <span className="text-[9px] uppercase font-bold text-amber-700 block">Pending</span>
                  <span className="text-lg font-black text-navy-900">{stats.quotations_pending || 0}</span>
                  <span className="text-[10px] font-mono block text-slate-500 truncate">{formatBHD(stats.quotations_pending_value || 0)}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-emerald-700 block">Approved</span>
                  <span className="text-lg font-black text-emerald-800">{stats.quotations_approved || 0}</span>
                  <span className="text-[10px] font-mono block text-emerald-700 truncate">{formatBHD(stats.quotations_approved_value || 0)}</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Sales Quick Action Buttons (1-touch shortcuts) */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
            Sales Quick Actions
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            <button
              onClick={() => onStartJob()}
              className="p-3 bg-navy-900 hover:bg-navy-800 active:bg-black text-white rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4 text-blue-400" />
              <span>+ New Work</span>
            </button>

            <button
              onClick={onNewAMC}
              className="p-3 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all shadow-sm"
            >
              <ShieldCheck className="w-4 h-4 text-white" />
              <span>+ New AMC</span>
            </button>

            <button
              onClick={() => onStartJob('Fit-out')}
              className="p-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all shadow-sm"
            >
              <Building2 className="w-4 h-4 text-white" />
              <span>+ New Fit-out</span>
            </button>

            <button
              onClick={() => onStartJob('Supply')}
              className="p-3 bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all shadow-sm"
            >
              <Package className="w-4 h-4 text-white" />
              <span>+ New Supply</span>
            </button>

            <button
              onClick={() => onStartJob('Project')}
              className="p-3 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all shadow-sm"
            >
              <Wrench className="w-4 h-4 text-white" />
              <span>+ New Project</span>
            </button>

            <button
              onClick={() => onStartJob('Breakdown')}
              className="p-3 bg-safety-red hover:bg-red-700 text-white rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all shadow-sm"
            >
              <Flame className="w-4 h-4 text-white" />
              <span>+ New Breakdown</span>
            </button>
          </div>
        </div>

        {/* Emergency Call-Outs & Rapid Response */}
        {renderEmergencyCalloutWidget()}

        {/* AMC Service Cards — Active Contracts & Dynamic Cycles (Requirement 9) */}
        {renderAmcServiceCardsWidget()}

        {/* Upcoming AMC Visits Widget */}
        {renderUpcomingVisitsWidget()}

        {/* Sales Monthly Report Modal */}
        {showSalesMonthlyReport && (
          <SalesMonthlyReportModal onClose={() => setShowSalesMonthlyReport(false)} />
        )}

      </div>
    );
  }

  // ----------------------------------------------------
  // ACCOUNTS DASHBOARD VIEW (Financial Management)
  // ----------------------------------------------------
  if (isAccounts) {
    const fin = dashboardStats?.financials || {};
    return (
      <div className="space-y-4 pb-24">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-teal-950 via-navy-900 to-teal-900 rounded-2xl p-4 sm:p-5 text-white shadow-md border border-teal-800/80 relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-teal-500/10 to-transparent pointer-events-none" />
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-black tracking-wider uppercase bg-teal-500/20 text-teal-300 border border-teal-400/30">
                  Accounts &amp; Finance Mode
                </span>
                <span className="text-xs text-slate-300">
                  {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-extrabold text-white mt-1">
                Welcome back, {currentUser?.name}
              </h1>
              <p className="text-xs text-slate-300 mt-0.5">
                Financial management, tax invoicing, customer statements, and financial hold control.
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-teal-900/60 border border-teal-700 flex items-center justify-center shadow-inner">
              <Receipt className="w-6 h-6 text-teal-400" />
            </div>
          </div>
        </div>

        {/* Overdue Receivables Alert */}
        {dashboardStats?.overdueInvoicesCount > 0 && (
          <div 
            onClick={() => setActiveTab('accounts')}
            className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-300 rounded-xl p-3.5 flex items-start justify-between cursor-pointer hover:shadow-md transition-all"
          >
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-lg bg-red-600 text-white shadow-sm mt-0.5">
                <AlertOctagon className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-red-950 uppercase tracking-wide">
                  Pending Overdue Invoices ({dashboardStats.overdueInvoicesCount})
                </h2>
                <p className="text-xs text-red-900 mt-0.5 font-medium">
                  Total outstanding overdue: <strong className="font-mono">{formatBHD(dashboardStats.overdueInvoicesAmount || 0)}</strong>. Follow up required or place payment hold on jobs.
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-red-600 self-center" />
          </div>
        )}

        {/* Active Payment Holds Alert */}
        {dashboardStats?.paymentHoldsCount > 0 && (
          <div 
            onClick={() => setActiveTab('jobs')}
            className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center justify-between cursor-pointer hover:bg-red-100/60 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span className="text-xs font-bold text-red-900">
                🔴 {dashboardStats.paymentHoldsCount} Work Order(s) Currently on Payment Hold
              </span>
            </div>
            <button className="text-xs font-bold text-red-700 hover:underline">
              Inspect Holds →
            </button>
          </div>
        )}

        {/* Financial KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          <div className="bg-white rounded-xl p-3 sm:p-3.5 border border-slate-200 shadow-sm">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Total Invoiced
            </span>
            <div className="mt-1 text-lg sm:text-xl font-mono font-black text-slate-900">
              {formatBHD(fin.total_invoiced || 0)}
            </div>
            <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">
              Excl: {formatBHD(fin.total_subtotal || 0)} | VAT: {formatBHD(fin.total_vat || 0)}
            </span>
          </div>

          <div className="bg-white rounded-xl p-3 sm:p-3.5 border border-slate-200 shadow-sm">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Collected Revenue
            </span>
            <div className="mt-1 text-lg sm:text-xl font-mono font-black text-emerald-700">
              {formatBHD(fin.total_paid || 0)}
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
              Bank receipts &amp; settlements
            </span>
          </div>

          <div className="bg-white rounded-xl p-3 sm:p-3.5 border border-slate-200 shadow-sm">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Pending Balance
            </span>
            <div className="mt-1 text-lg sm:text-xl font-mono font-black text-amber-700">
              {formatBHD(fin.total_outstanding || 0)}
            </div>
            <span className="text-[10px] text-amber-600 font-semibold block mt-0.5">
              Current receivables
            </span>
          </div>

          <div className="bg-white rounded-xl p-3 sm:p-3.5 border border-slate-200 shadow-sm">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Overdue Receivables
            </span>
            <div className="mt-1 text-lg sm:text-xl font-mono font-black text-red-700">
              {formatBHD(dashboardStats?.overdueInvoicesAmount || 0)}
            </div>
            <span className="text-[10px] text-red-600 font-semibold block mt-0.5">
              {dashboardStats?.overdueInvoicesCount || 0} overdue invoice(s)
            </span>
          </div>
        </div>

        {/* Quick Action Shortcuts */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Financial Management Shortcuts
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button
              onClick={() => setActiveTab('accounts')}
              className="p-3 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all shadow-sm"
            >
              <Receipt className="w-4 h-4 text-white" />
              <span>Invoices &amp; Accounts</span>
            </button>
            <button
              onClick={() => setActiveTab('jobs')}
              className="p-3 bg-navy-900 hover:bg-navy-800 text-white rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all shadow-sm"
            >
              <Briefcase className="w-4 h-4 text-white" />
              <span>Job Holds &amp; Orders</span>
            </button>
            <button
              onClick={() => setActiveTab('customers')}
              className="p-3 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all shadow-sm"
            >
              <Building2 className="w-4 h-4 text-white" />
              <span>Client Statements</span>
            </button>
            <button
              onClick={() => setActiveTab('accounts')}
              className="p-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4 text-white" />
              <span>Export Excel Ledger</span>
            </button>
          </div>
        </div>

        {/* Emergency Call-Outs & Rapid Response */}
        {renderEmergencyCalloutWidget()}

        {/* AMC Service Cards — Active Contracts & Dynamic Cycles (Requirement 9) */}
        {renderAmcServiceCardsWidget()}

        {/* Upcoming AMC Visits Widget */}
        {renderUpcomingVisitsWidget()}
      </div>
    );
  }

  // ----------------------------------------------------
  // PROJECTS MANAGER DASHBOARD VIEW
  // ----------------------------------------------------
  if (isProjectsManager) {
    const pStats = dashboardStats?.projectsStats || {};

    return (
      <div className="space-y-4 pb-24">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-cyan-950 via-navy-900 to-cyan-900 rounded-2xl p-4 sm:p-5 text-white shadow-md border border-cyan-800/80 relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-cyan-500/10 to-transparent pointer-events-none" />
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-black tracking-wider uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  Projects Manager Mode
                </span>
                <span className="text-xs text-slate-300">
                  {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-extrabold text-white mt-1">
                Welcome back, {currentUser?.name}
              </h1>
              <p className="text-xs text-slate-300 mt-0.5">
                Full operational control of fire protection installations, site milestones, engineering defects, and project jobs.
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-cyan-900/60 border border-cyan-700 flex items-center justify-center shadow-inner">
              <Briefcase className="w-6 h-6 text-cyan-400" />
            </div>
          </div>

          {/* Quick AI & Direct Actions Shortcut */}
          <div className="mt-3 pt-3 border-t border-cyan-800/60 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <div className="p-1 rounded bg-amber-500/20 text-amber-400">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs text-slate-200 font-medium">
                Need technical diction for site reports or handover remarks?
              </span>
            </div>
            <button
              onClick={() => setActiveModal({ type: 'ai_assistant' })}
              className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-all shadow-sm"
            >
              <span>AI Engineering Assistant</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Operational Holds Alert */}
        {dashboardStats?.operationalHoldsCount > 0 && (
          <div 
            onClick={() => setActiveTab('jobs')}
            className="bg-amber-50 border border-amber-300 rounded-xl p-3.5 flex items-start justify-between cursor-pointer hover:shadow-md transition-all"
          >
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-lg bg-amber-600 text-white shadow-sm mt-0.5">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                  Active Operational Holds ({dashboardStats.operationalHoldsCount})
                </h2>
                <p className="text-xs text-amber-800 mt-0.5 font-medium">
                  Project work order(s) held due to site constraints, civil delays, or pending approvals. Click to view.
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-amber-600 self-center" />
          </div>
        )}

        {/* 12 DEDICATED PROJECTS MANAGER KPI CARDS */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <FolderKanban className="w-4 h-4 text-cyan-700" />
              <span>Project Operations KPI Dashboard</span>
            </h2>
            <span className="text-[11px] text-slate-500 font-semibold">
              Live Real-Time Operational Metrics
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
            {/* 1. Total Projects */}
            <div 
              onClick={() => { setProjectsFilter('All'); setActiveTab('projects'); }}
              className="bg-white rounded-xl p-3 sm:p-3.5 border border-slate-200 shadow-sm cursor-pointer hover:shadow-md hover:border-cyan-300 transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Total Projects
                </span>
                <FolderKanban className="w-4 h-4 text-slate-400 group-hover:text-cyan-600 transition-colors" />
              </div>
              <div className="mt-1 text-2xl font-black text-slate-900">
                {pStats.totalProjects || 0}
              </div>
              <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                All registered project files
              </span>
            </div>

            {/* 2. Active Projects */}
            <div 
              onClick={() => { setProjectsFilter('Active'); setActiveTab('projects'); }}
              className="bg-white rounded-xl p-3 sm:p-3.5 border border-blue-200 bg-blue-50/20 shadow-sm cursor-pointer hover:shadow-md hover:border-blue-400 transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">
                  Active Projects
                </span>
                <CheckCircle2 className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
              </div>
              <div className="mt-1 text-2xl font-black text-blue-900">
                {pStats.activeProjects || 0}
              </div>
              <span className="text-[10px] text-blue-600 font-semibold block mt-0.5">
                In progress &amp; scheduled
              </span>
            </div>

            {/* 3. Projects Starting Soon */}
            <div 
              onClick={() => { setProjectsFilter('Starting Soon'); setActiveTab('projects'); }}
              className="bg-white rounded-xl p-3 sm:p-3.5 border border-slate-200 shadow-sm cursor-pointer hover:shadow-md hover:border-indigo-300 transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">
                  Starting Soon
                </span>
                <CalendarClock className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />
              </div>
              <div className="mt-1 text-2xl font-black text-indigo-900">
                {pStats.projectsStartingSoon || 0}
              </div>
              <span className="text-[10px] text-indigo-600 font-semibold block mt-0.5">
                Within next 14 days
              </span>
            </div>

            {/* 4. Projects Due Soon */}
            <div 
              onClick={() => { setProjectsFilter('Due Soon'); setActiveTab('projects'); }}
              className="bg-white rounded-xl p-3 sm:p-3.5 border border-amber-200 bg-amber-50/30 shadow-sm cursor-pointer hover:shadow-md hover:border-amber-400 transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                  Due Soon
                </span>
                <Clock className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
              </div>
              <div className="mt-1 text-2xl font-black text-amber-900">
                {pStats.projectsDueSoon || 0}
              </div>
              <span className="text-[10px] text-amber-700 font-semibold block mt-0.5">
                Handover in 14 days
              </span>
            </div>

            {/* 5. Completed Projects */}
            <div 
              onClick={() => { setProjectsFilter('Completed'); setActiveTab('projects'); }}
              className="bg-white rounded-xl p-3 sm:p-3.5 border border-emerald-200 bg-emerald-50/20 shadow-sm cursor-pointer hover:shadow-md hover:border-emerald-400 transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                  Completed Projects
                </span>
                <CheckCircle className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
              </div>
              <div className="mt-1 text-2xl font-black text-emerald-900">
                {pStats.completedProjects || 0}
              </div>
              <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">
                Handed over &amp; finished
              </span>
            </div>

            {/* 6. Delayed Projects */}
            <div 
              onClick={() => { setProjectsFilter('Delayed'); setActiveTab('projects'); }}
              className="bg-white rounded-xl p-3 sm:p-3.5 border border-rose-200 bg-rose-50/30 shadow-sm cursor-pointer hover:shadow-md hover:border-rose-400 transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">
                  Delayed Projects
                </span>
                <AlertCircle className="w-4 h-4 text-rose-600 group-hover:scale-110 transition-transform" />
              </div>
              <div className="mt-1 text-2xl font-black text-rose-900">
                {pStats.delayedProjects || 0}
              </div>
              <span className="text-[10px] text-rose-700 font-semibold block mt-0.5">
                Past planned deadline
              </span>
            </div>

            {/* 7. Today's Project Jobs */}
            <div 
              onClick={() => setActiveTab('jobs')}
              className="bg-white rounded-xl p-3 sm:p-3.5 border border-slate-200 shadow-sm cursor-pointer hover:shadow-md hover:border-blue-300 transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Today's Project Jobs
                </span>
                <Calendar className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
              </div>
              <div className="mt-1 text-2xl font-black text-slate-900">
                {pStats.todayProjectJobs || 0}
              </div>
              <span className="text-[10px] text-blue-600 font-semibold block mt-0.5">
                Active tasks scheduled today
              </span>
            </div>

            {/* 8. Pending Project Jobs */}
            <div 
              onClick={() => setActiveTab('jobs')}
              className="bg-white rounded-xl p-3 sm:p-3.5 border border-slate-200 shadow-sm cursor-pointer hover:shadow-md hover:border-indigo-300 transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Pending Project Jobs
                </span>
                <Clock4 className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
              </div>
              <div className="mt-1 text-2xl font-black text-slate-900">
                {pStats.pendingProjectJobs || 0}
              </div>
              <span className="text-[10px] text-indigo-600 font-semibold block mt-0.5">
                Awaiting site execution
              </span>
            </div>

            {/* 9. Open Project Defects */}
            <div 
              onClick={() => { setProjectsFilter('Defects'); setActiveTab('projects'); }}
              className="bg-white rounded-xl p-3 sm:p-3.5 border border-rose-200 bg-rose-50/20 shadow-sm cursor-pointer hover:shadow-md hover:border-rose-400 transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">
                  Open Project Defects
                </span>
                <AlertTriangle className="w-4 h-4 text-rose-600 group-hover:scale-110 transition-transform" />
              </div>
              <div className="mt-1 text-2xl font-black text-rose-800">
                {pStats.openProjectDefects || 0}
              </div>
              <span className="text-[10px] text-rose-600 font-semibold block mt-0.5">
                Snags &amp; punch list items
              </span>
            </div>

            {/* 10. Project Quotations */}
            <div 
              onClick={() => setActiveTab('quotations')}
              className="bg-white rounded-xl p-3 sm:p-3.5 border border-purple-200 bg-purple-50/20 shadow-sm cursor-pointer hover:shadow-md hover:border-purple-400 transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wider">
                  Project Quotations
                </span>
                <FileSpreadsheet className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
              </div>
              <div className="mt-1 text-2xl font-black text-purple-900">
                {pStats.projectQuotations || 0}
              </div>
              <span className="text-[10px] text-purple-700 font-semibold block mt-0.5">
                {formatBHD(pStats.projectQuotationsValue || 0)} BHD Total
              </span>
            </div>

            {/* 11. Project Invoices */}
            <div 
              onClick={() => setActiveTab('accounts')}
              className="bg-white rounded-xl p-3 sm:p-3.5 border border-teal-200 bg-teal-50/20 shadow-sm cursor-pointer hover:shadow-md hover:border-teal-400 transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider">
                  Project Invoices
                </span>
                <Receipt className="w-4 h-4 text-teal-600 group-hover:scale-110 transition-transform" />
              </div>
              <div className="mt-1 text-2xl font-black text-teal-900">
                {pStats.projectInvoices || 0}
              </div>
              <span className="text-[10px] text-teal-700 font-semibold block mt-0.5">
                {formatBHD(pStats.projectInvoicesValue || 0)} BHD Invoiced
              </span>
            </div>

            {/* 12. Outstanding Project Payments */}
            <div 
              onClick={() => setActiveTab('accounts')}
              className="bg-white rounded-xl p-3 sm:p-3.5 border border-amber-300 bg-amber-50/40 shadow-sm cursor-pointer hover:shadow-md hover:border-amber-500 transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">
                  Outstanding Payments
                </span>
                <DollarSign className="w-4 h-4 text-amber-700 group-hover:scale-110 transition-transform" />
              </div>
              <div className="mt-1 text-xl sm:text-2xl font-black text-amber-900 truncate">
                {formatBHD(pStats.outstandingProjectPayments || 0)}
              </div>
              <span className="text-[10px] text-amber-800 font-semibold block mt-0.5">
                BHD uncollected balance
              </span>
            </div>
          </div>
        </div>

        {/* Operational Shortcuts */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Projects Operational Shortcuts
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button
              onClick={() => { setProjectsFilter('All'); setActiveTab('projects'); }}
              className="p-3 bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all shadow-sm"
            >
              <Briefcase className="w-4 h-4 text-white" />
              <span>Projects Master</span>
            </button>
            <button
              onClick={() => onStartJob('Project')}
              className="p-3 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all shadow-sm"
            >
              <Wrench className="w-4 h-4 text-white" />
              <span>+ New Project Job</span>
            </button>
            <button
              onClick={() => onNewReport()}
              className="p-3 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all shadow-sm"
            >
              <FileText className="w-4 h-4 text-white" />
              <span>+ Create Report</span>
            </button>
            <button
              onClick={() => { setProjectsFilter('Defects'); setActiveTab('projects'); }}
              className="p-3 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all shadow-sm"
            >
              <AlertTriangle className="w-4 h-4 text-white" />
              <span>Manage Defects</span>
            </button>
          </div>
        </div>

        {/* Emergency Call-Outs & Rapid Response */}
        {renderEmergencyCalloutWidget()}

        {/* AMC Service Cards — Active Contracts & Dynamic Cycles */}
        {renderAmcServiceCardsWidget()}

        {/* Upcoming AMC Visits Widget */}
        {renderUpcomingVisitsWidget()}
      </div>
    );
  }

  // ----------------------------------------------------
  // MANAGEMENT / TECH DASHBOARD VIEW (GM, Engineer, Supervisor, Tech)
  // ----------------------------------------------------
  return (
    <div className="space-y-4 pb-24">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-navy-900 rounded-2xl p-4 sm:p-5 text-white shadow-md border border-navy-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-blue-600/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30">
                {currentUser?.role} Mode
              </span>
              <span className="text-xs text-slate-300">
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-extrabold text-white mt-1">
              Welcome back, {currentUser?.name}
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              {isTechnician 
                ? "You have jobs and inspection checklists ready to complete on site today."
                : "Operational overview of fire alarm & firefighting contracts and site teams."}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-navy-800/80 border border-navy-700 flex items-center justify-center shadow-inner">
            <Flame className="w-6 h-6 text-safety-red animate-pulse" />
          </div>
        </div>

        {/* Quick Voice / AI Shortcut */}
        <div className="mt-3 pt-3 border-t border-navy-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1 rounded bg-amber-500/20 text-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs text-slate-200 font-medium">
              Need technical wording assistance?
            </span>
          </div>
          <button
            onClick={() => setActiveModal({ type: 'ai_assistant' })}
            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-all shadow-sm"
          >
            <span>Open AI Assistant</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Payment & Operational Holds Alert Banner */}
      {!isTechnician && ((dashboardStats?.paymentHoldsCount || 0) + (dashboardStats?.operationalHoldsCount || 0) > 0) && (
        <div 
          onClick={() => setActiveTab('jobs')}
          className="bg-gradient-to-r from-red-50 to-amber-50 border border-red-300 rounded-xl p-3.5 flex items-start justify-between cursor-pointer hover:shadow-md transition-all"
        >
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-lg bg-red-600 text-white shadow-sm mt-0.5">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-red-950 uppercase tracking-wide">
                Jobs on Hold ({((dashboardStats?.paymentHoldsCount || 0) + (dashboardStats?.operationalHoldsCount || 0))})
              </h2>
              <p className="text-xs text-red-900 mt-0.5 font-medium">
                {dashboardStats?.paymentHoldsCount > 0 && (
                  <span className="font-bold text-red-900">
                    🔴 {dashboardStats.paymentHoldsCount} Payment Hold(s){" "}
                  </span>
                )}
                {dashboardStats?.operationalHoldsCount > 0 && (
                  <span className="font-bold text-amber-900">
                    🟠 {dashboardStats.operationalHoldsCount} Operational Hold(s)
                  </span>
                )}
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-red-600 self-center" />
        </div>
      )}

      {/* Emergency Call-Outs & Rapid Response Widget */}
      {renderEmergencyCalloutWidget()}

      {/* GM Financial & Invoicing Overview Widget (Strictly Hidden for Technicians) */}
      {isGM && dashboardStats?.financials && (
        <div className="bg-gradient-to-br from-navy-900 via-slate-900 to-navy-950 text-white p-4 rounded-2xl border border-navy-700 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-teal-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Financial &amp; Invoicing KPIs (GM Overview)
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('accounts')}
              className="text-[11px] font-bold text-teal-400 hover:text-teal-300 flex items-center gap-0.5"
            >
              <span>Open Accounts</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Invoiced</span>
              <span className="font-mono font-black text-sm text-white block mt-0.5">
                {formatBHD(dashboardStats.financials.total_invoiced)}
              </span>
            </div>
            <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Collected</span>
              <span className="font-mono font-black text-sm text-emerald-400 block mt-0.5">
                {formatBHD(dashboardStats.financials.total_paid)}
              </span>
            </div>
            <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Outstanding Balance</span>
              <span className="font-mono font-black text-sm text-amber-400 block mt-0.5">
                {formatBHD(dashboardStats.financials.total_outstanding)}
              </span>
            </div>
            <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Overdue Invoices</span>
              <span className="font-mono font-black text-sm text-red-400 block mt-0.5">
                {dashboardStats.overdueInvoicesCount || 0} ({formatBHD(dashboardStats.overdueInvoicesAmount || 0)})
              </span>
            </div>
          </div>
        </div>
      )}

      {/* AMC Quarterly Compliance Progress Badges */}
      {!isTechnician && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>AMC Quarterly Inspection Compliance (Q1–Q4)</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Civil Defence verified quarterly inspection cycles
              </p>
            </div>
            <button
              onClick={() => setActiveTab('amc')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
            >
              <span>View AMC</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
              <span className="text-[10px] font-black uppercase text-emerald-800 block">Q1 (Jan–Mar)</span>
              <span className="text-base font-black text-emerald-900 block mt-0.5">
                {dashboardStats?.quarters_count?.q1 || 0} Verified
              </span>
              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100/60 px-1.5 py-0.2 rounded mt-1 inline-block">
                {dashboardStats?.quarters_count?.q1_total > 0
                  ? `${Math.round(((dashboardStats?.quarters_count?.q1 || 0) / dashboardStats.quarters_count.q1_total) * 100)}% Completed`
                  : '0 Completed'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-center">
              <span className="text-[10px] font-black uppercase text-blue-800 block">Q2 (Apr–Jun)</span>
              <span className="text-base font-black text-blue-900 block mt-0.5">
                {dashboardStats?.quarters_count?.q2 || 0} Active
              </span>
              <span className="text-[9px] font-bold text-blue-700 bg-blue-100/60 px-1.5 py-0.2 rounded mt-1 inline-block">
                {dashboardStats?.quarters_count?.q2_total > 0
                  ? `${dashboardStats?.quarters_count?.q2 || 0} In Progress`
                  : '0 In Progress'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200 text-center">
              <span className="text-[10px] font-black uppercase text-sky-800 block">Q3 (Jul–Sep)</span>
              <span className="text-base font-black text-sky-900 block mt-0.5">
                {dashboardStats?.quarters_count?.q3 || 0} Scheduled
              </span>
              <span className="text-[9px] font-bold text-sky-700 bg-sky-100/60 px-1.5 py-0.2 rounded mt-1 inline-block">
                {dashboardStats?.quarters_count?.q3_total > 0
                  ? `${dashboardStats?.quarters_count?.q3 || 0} Upcoming`
                  : '0 Scheduled'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] font-black uppercase text-slate-700 block">Q4 (Oct–Dec)</span>
              <span className="text-base font-black text-slate-800 block mt-0.5">
                {dashboardStats?.quarters_count?.q4 || 0} Pending
              </span>
              <span className="text-[9px] font-bold text-slate-600 bg-slate-200/60 px-1.5 py-0.2 rounded mt-1 inline-block">
                {dashboardStats?.quarters_count?.q4_total > 0
                  ? `${dashboardStats?.quarters_count?.q4 || 0} Scheduled`
                  : '0 Pending'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Critical Expiry Alert Banner (if AMC expiring soon) */}
      {!isTechnician && (dashboardStats?.expiring30Days > 0 || dashboardStats?.expiredAMC > 0) && (
        <div 
          onClick={() => setActiveTab('amc')}
          className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300/80 rounded-xl p-3.5 flex items-start justify-between cursor-pointer hover:shadow-md transition-all"
        >
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-lg bg-amber-500 text-white shadow-sm mt-0.5">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                AMC Expiry Attention Required
              </h2>
              <p className="text-xs text-amber-800 mt-0.5">
                {dashboardStats?.expiring30Days > 0 && (
                  <span className="font-semibold text-amber-950">
                    {dashboardStats.expiring30Days} contract(s) expiring within 30 days.{" "}
                  </span>
                )}
                {dashboardStats?.expiredAMC > 0 && (
                  <span className="font-semibold text-red-700">
                    {dashboardStats.expiredAMC} contract(s) already expired.
                  </span>
                )}
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-amber-600 self-center" />
        </div>
      )}

      {/* Primary Key Statistics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
        
        {/* AMC Expiring Soon (Hidden for Tech) */}
        {!isTechnician && (
          <div 
            onClick={() => setActiveTab('amc')}
            className="bg-white rounded-xl p-3 sm:p-3.5 border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Expiring AMC
              </span>
              <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-100 transition-colors">
                <AlertOctagon className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-900">
                {dashboardStats?.expiring60Days || 0}
              </span>
              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                &lt; 60 Days
              </span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
              <span>{dashboardStats?.expiring30Days || 0} urgent (&lt;30d)</span>
              <span>•</span>
              <span className="text-red-600 font-semibold">{dashboardStats?.expiredAMC || 0} expired</span>
            </div>
          </div>
        )}

        {/* Active AMC Contracts (Hidden for Tech) */}
        {!isTechnician && (
          <div 
            onClick={() => setActiveTab('amc')}
            className="bg-white rounded-xl p-3 sm:p-3.5 border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Active AMC
              </span>
              <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
                <FileCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-900">
                {dashboardStats?.totalActiveAMC || 0}
              </span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                Protected
              </span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              Periodic site maintenance active
            </div>
          </div>
        )}

        {/* Today's Jobs */}
        <div 
          onClick={() => setActiveTab('jobs')}
          className="bg-white rounded-xl p-3 sm:p-3.5 border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Today's Jobs
            </span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">
              {dashboardStats?.todayJobsCount || 0}
            </span>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
              Scheduled
            </span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            {dashboardStats?.pendingJobsCount || 0} pending closeout
          </div>
        </div>

        {/* Pending Breakdowns */}
        <div 
          onClick={() => {
            onStartJob('Breakdown');
          }}
          className="bg-white rounded-xl p-3 sm:p-3.5 border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Pending Breakdowns
            </span>
            <div className="p-1.5 rounded-lg bg-red-50 text-safety-red group-hover:bg-red-100 transition-colors">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-safety-red">
              {dashboardStats?.pendingBreakdownsCount || 0}
            </span>
            <span className="text-[10px] font-bold text-red-700 bg-red-50 px-1.5 py-0.5 rounded animate-pulse">
              Urgent Callout
            </span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Emergency fire system faults
          </div>
        </div>

        {/* Outstanding Faults */}
        <div 
          onClick={() => setActiveTab('faults')}
          className="bg-white rounded-xl p-3 sm:p-3.5 border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Open Faults
            </span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-100 transition-colors">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">
              {dashboardStats?.openFaultsCount || 0}
            </span>
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
              {dashboardStats?.criticalFaultsCount || 0} Critical
            </span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Logged during inspections
          </div>
        </div>

        {/* Completed Jobs */}
        <div 
          onClick={() => setActiveTab('jobs')}
          className="bg-white rounded-xl p-3 sm:p-3.5 border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Completed Jobs
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 transition-colors">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">
              {dashboardStats?.completedJobsCount || 0}
            </span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              Verified
            </span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Successfully closed out
          </div>
        </div>

        {/* Pending Reports */}
        <div 
          onClick={() => setActiveTab('reports')}
          className="bg-white rounded-xl p-3 sm:p-3.5 border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Reports
            </span>
            <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600 group-hover:bg-purple-100 transition-colors">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">
              {dashboardStats?.pendingReportsCount || 0}
            </span>
            <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
              Pipeline
            </span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Draft &amp; submitted reviews
          </div>
        </div>

        {/* Customers / Sites (Hidden for Tech) */}
        {!isTechnician && (
          <div 
            onClick={() => setActiveTab('customers')}
            className="bg-white rounded-xl p-3 sm:p-3.5 border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Sites / Premises
              </span>
              <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700 group-hover:bg-slate-200 transition-colors">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-900">
                {dashboardStats?.sitesCount || 0}
              </span>
              <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                {dashboardStats?.customersCount || 0} Cust
              </span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              Multi-facility accounts
            </div>
          </div>
        )}

      </div>

      {/* QUICK ACTIONS SECTION (Mobile First - Large 48px+ touch targets) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center justify-between">
          <span>Quick Actions</span>
          <span className="text-[10px] text-blue-600 font-semibold">1-Touch Shortcuts</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          
          {/* New Job Button */}
          <button
            onClick={() => onStartJob()}
            className="h-16 rounded-xl bg-navy-900 hover:bg-navy-800 active:bg-black text-white p-2.5 flex flex-col justify-between transition-all shadow-sm hover:shadow text-left"
          >
            <div className="flex items-center justify-between w-full">
              <div className="p-1.5 rounded-lg bg-blue-600 text-white">
                <Plus className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-semibold text-slate-300">Action</span>
            </div>
            <span className="text-xs font-bold text-white tracking-tight">New Job</span>
          </button>

          {/* AMC Inspection */}
          <button
            onClick={onStartInspection}
            className="h-16 rounded-xl bg-gradient-to-br from-blue-700 to-blue-800 hover:from-blue-600 hover:to-blue-700 active:from-blue-900 active:to-blue-950 text-white p-2.5 flex flex-col justify-between transition-all shadow-sm text-left"
          >
            <div className="flex items-center justify-between w-full">
              <div className="p-1.5 rounded-lg bg-white/20 text-white">
                <FileCheck className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-semibold text-blue-200">On-Site</span>
            </div>
            <span className="text-xs font-bold text-white tracking-tight">AMC Inspection</span>
          </button>

          {/* New Breakdown Emergency / Call-Out */}
          <button
            onClick={() => setActiveTab('emergency')}
            className="h-16 rounded-xl bg-safety-red hover:bg-red-700 active:bg-safety-darkred text-white p-2.5 flex flex-col justify-between transition-all shadow-sm text-left"
          >
            <div className="flex items-center justify-between w-full">
              <div className="p-1.5 rounded-lg bg-white/20 text-white">
                <Flame className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-semibold text-red-200">24/7 Field</span>
            </div>
            <span className="text-xs font-bold text-white tracking-tight">Emergency Call-Out</span>
          </button>

          {/* Generate Report (for Preparers) or View Reports (for GM/Sales/Accounts) */}
          <button
            onClick={canPrepareReports ? onNewReport : () => setActiveTab('reports')}
            className="h-16 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-black text-white p-2.5 flex flex-col justify-between transition-all shadow-sm text-left"
          >
            <div className="flex items-center justify-between w-full">
              <div className="p-1.5 rounded-lg bg-indigo-600 text-white">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-semibold text-slate-300">
                {canPrepareReports ? 'A4 PDF' : 'Review'}
              </span>
            </div>
            <span className="text-xs font-bold text-white tracking-tight">
              {canPrepareReports ? 'Generate Report' : 'View Reports'}
            </span>
          </button>

          {/* New AMC Contract (Hidden for Tech) */}
          {!isTechnician && (
            <button
              onClick={onNewAMC}
              className="h-16 rounded-xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-900 p-2.5 border border-slate-200 flex flex-col justify-between transition-all text-left"
            >
              <div className="flex items-center justify-between w-full">
                <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
                  <FileCheck className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-semibold text-slate-500">Contract</span>
              </div>
              <span className="text-xs font-bold text-slate-900 tracking-tight">New AMC Contract</span>
            </button>
          )}

          {/* Fit-out Works (Hidden for Tech) */}
          {!isTechnician && (
            <button
              onClick={() => onStartJob('Fit-out')}
              className="h-16 rounded-xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-900 p-2.5 border border-slate-200 flex flex-col justify-between transition-all text-left"
            >
              <div className="flex items-center justify-between w-full">
                <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
                  <Building2 className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-semibold text-slate-500">Tenant</span>
              </div>
              <span className="text-xs font-bold text-slate-900 tracking-tight">Fit-out</span>
            </button>
          )}

          {/* Project (Hidden for Tech) */}
          {!isTechnician && (
            <button
              onClick={() => onStartJob('Project')}
              className="h-16 rounded-xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-900 p-2.5 border border-slate-200 flex flex-col justify-between transition-all text-left"
            >
              <div className="flex items-center justify-between w-full">
                <div className="p-1.5 rounded-lg bg-purple-100 text-purple-700">
                  <Wrench className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-semibold text-slate-500">Systems</span>
              </div>
              <span className="text-xs font-bold text-slate-900 tracking-tight">Project</span>
            </button>
          )}

          {/* Job History */}
          <button
            onClick={() => setActiveTab('jobs')}
            className="h-16 rounded-xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-900 p-2.5 border border-slate-200 flex flex-col justify-between transition-all text-left"
          >
            <div className="flex items-center justify-between w-full">
              <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                <Clock className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-semibold text-slate-500">Search</span>
            </div>
            <span className="text-xs font-bold text-slate-900 tracking-tight">Job History</span>
          </button>

          {/* Staff Access (GM, Engineer, Supervisor) */}
          {['GM', 'Engineer', 'Supervisor'].includes(currentUser?.role) && (
            <button
              onClick={() => setActiveTab('users')}
              className="h-16 rounded-xl bg-purple-50 hover:bg-purple-100 active:bg-purple-200 text-purple-950 p-2.5 border border-purple-200 flex flex-col justify-between transition-all text-left"
            >
              <div className="flex items-center justify-between w-full">
                <div className="p-1.5 rounded-lg bg-purple-600 text-white">
                  <Users className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-semibold text-purple-700">Team</span>
              </div>
              <span className="text-xs font-bold text-purple-950 tracking-tight">Staff Access</span>
            </button>
          )}

        </div>
      </div>

      {/* AMC Service Cards — Active Contracts & Dynamic Cycles (Requirement 9) */}
      {renderAmcServiceCardsWidget()}

      {/* Upcoming AMC Visits Widget */}
      {renderUpcomingVisitsWidget()}

    </div>
  );
}
