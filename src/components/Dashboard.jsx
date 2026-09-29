import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatBHD } from '../utils/formatters';
import SalesMonthlyReportModal from './SalesMonthlyReportModal';
import { 
  FileCheck, AlertOctagon, Calendar, Wrench, FileQuestion, 
  Flame, CheckCircle2, FileSpreadsheet, Building2, Plus, 
  ChevronRight, ArrowUpRight, Sparkles, Clock, ShieldAlert,
  FlameKindling, TrendingUp, DollarSign, Package, 
  Layers, UserCheck, ShieldCheck, FileText, ArrowRight, Users, Receipt, AlertTriangle
} from 'lucide-react';

export default function Dashboard({ onStartJob, onStartInspection, onNewAMC, onNewReport }) {
  const { dashboardStats, currentUser, setActiveTab, setActiveModal } = useApp();

  const [upcomingTab, setUpcomingTab] = useState('next7Days'); // 'today' | 'next7Days' | 'next30Days'
  const [showSalesMonthlyReport, setShowSalesMonthlyReport] = useState(false);

  const isSales = currentUser?.role === 'Sales';
  const isTechnician = currentUser?.role === 'Technician';
  const isAccounts = currentUser?.role === 'Accounts';
  const isProjectsManager = currentUser?.role === 'Projects Manager';
  const isGM = currentUser?.role === 'GM';
  const canPrepareReports = ['Projects Manager', 'Engineer', 'Supervisor', 'Technician'].includes(currentUser?.role);

  // Get active upcoming visits list
  const upcomingVisits = dashboardStats?.upcoming_amc?.[upcomingTab] || [];

  const getSystemColor = (sys) => {
    if (!sys) return 'bg-slate-100 text-slate-800 border-slate-200';
    if (sys.includes('Alarm')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (sys.includes('Fighting') || sys.includes('Pump')) return 'bg-red-50 text-red-700 border-red-200';
    if (sys.includes('Extinguisher')) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-purple-50 text-purple-700 border-purple-200';
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
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getSystemColor(v.system_type || v.system)}`}>
                    {v.system_type || v.system}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                    Visit #{v.visit_number}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-600 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{v.scheduled_date}</span>
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{v.site_name}</h4>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {v.customer_name} • Tech: <span className="font-semibold text-slate-700">{v.technician_name || 'Rajesh Kumar'}</span>
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

        {/* Upcoming AMC Visits Widget */}
        {renderUpcomingVisitsWidget()}
      </div>
    );
  }

  // ----------------------------------------------------
  // PROJECTS MANAGER DASHBOARD VIEW
  // ----------------------------------------------------
  if (isProjectsManager) {
    return (
      <div className="space-y-4 pb-24">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-cyan-950 via-navy-900 to-cyan-900 rounded-2xl p-4 sm:p-5 text-white shadow-md border border-cyan-800/80 relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-cyan-500/10 to-transparent pointer-events-none" />
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-black tracking-wider uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  Projects &amp; Operations Mode
                </span>
                <span className="text-xs text-slate-300">
                  {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-extrabold text-white mt-1">
                Welcome back, {currentUser?.name}
              </h1>
              <p className="text-xs text-slate-300 mt-0.5">
                Fit-out contracts, installation milestones, testing &amp; commissioning, and operational holds.
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-cyan-900/60 border border-cyan-700 flex items-center justify-center shadow-inner">
              <Layers className="w-6 h-6 text-cyan-400" />
            </div>
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
                  Project or work order(s) held due to site constraints, permits, civil contractor delays or drawing approvals.
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-amber-600 self-center" />
          </div>
        )}

        {/* Projects Statistics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          <div 
            onClick={() => { setActiveTab('jobs'); }}
            className="bg-white rounded-xl p-3 sm:p-3.5 border border-slate-200 shadow-sm cursor-pointer hover:shadow-md transition-all"
          >
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Active Projects &amp; Fit-out
            </span>
            <div className="mt-1 text-2xl font-black text-slate-900">
              {dashboardStats?.pendingJobsCount || 0}
            </div>
            <span className="text-[10px] text-blue-600 font-semibold block mt-0.5">
              In progress installations
            </span>
          </div>

          <div 
            onClick={() => setActiveTab('amc')}
            className="bg-white rounded-xl p-3 sm:p-3.5 border border-slate-200 shadow-sm cursor-pointer hover:shadow-md transition-all"
          >
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Expiring AMC Contracts
            </span>
            <div className="mt-1 text-2xl font-black text-amber-700">
              {dashboardStats?.expiring30Days || 0}
            </div>
            <span className="text-[10px] text-amber-600 font-semibold block mt-0.5">
              Urgent renewal tracking
            </span>
          </div>

          <div 
            onClick={() => setActiveTab('faults')}
            className="bg-white rounded-xl p-3 sm:p-3.5 border border-slate-200 shadow-sm cursor-pointer hover:shadow-md transition-all"
          >
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Site Faults &amp; Rectification
            </span>
            <div className="mt-1 text-2xl font-black text-rose-700">
              {dashboardStats?.openFaultsCount || 0}
            </div>
            <span className="text-[10px] text-rose-600 font-semibold block mt-0.5">
              Open defect tickets
            </span>
          </div>

          <div 
            onClick={() => setActiveTab('jobs')}
            className="bg-white rounded-xl p-3 sm:p-3.5 border border-slate-200 shadow-sm cursor-pointer hover:shadow-md transition-all"
          >
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Operational Holds
            </span>
            <div className="mt-1 text-2xl font-black text-amber-600">
              {dashboardStats?.operationalHoldsCount || 0}
            </div>
            <span className="text-[10px] text-amber-600 font-semibold block mt-0.5">
              Site delays / constraints
            </span>
          </div>
        </div>

        {/* Quick Action Shortcuts */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Operational Shortcuts
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button
              onClick={() => onStartJob('Project')}
              className="p-3 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all shadow-sm"
            >
              <Wrench className="w-4 h-4 text-white" />
              <span>+ New Project</span>
            </button>
            <button
              onClick={() => onStartJob('Fit-out')}
              className="p-3 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all shadow-sm"
            >
              <Building2 className="w-4 h-4 text-white" />
              <span>+ New Fit-Out Job</span>
            </button>
            <button
              onClick={() => onStartJob('Testing & Commissioning')}
              className="p-3 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>+ T&amp;C Inspection</span>
            </button>
            <button
              onClick={() => setActiveTab('jobs')}
              className="p-3 bg-navy-900 hover:bg-navy-800 text-white rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all shadow-sm"
            >
              <Briefcase className="w-4 h-4 text-white" />
              <span>All Work Orders</span>
            </button>
          </div>
        </div>

        {/* Emergency Call-Outs & Rapid Response */}
        {renderEmergencyCalloutWidget()}

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
              <span className="text-base font-black text-emerald-900 block mt-0.5">{dashboardStats?.quarters_count?.q1 || 12} Verified</span>
              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100/60 px-1.5 py-0.2 rounded mt-1 inline-block">100% Completed</span>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-center">
              <span className="text-[10px] font-black uppercase text-blue-800 block">Q2 (Apr–Jun)</span>
              <span className="text-base font-black text-blue-900 block mt-0.5">{dashboardStats?.quarters_count?.q2 || 8} Active</span>
              <span className="text-[9px] font-bold text-blue-700 bg-blue-100/60 px-1.5 py-0.2 rounded mt-1 inline-block">In Progress</span>
            </div>
            <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200 text-center">
              <span className="text-[10px] font-black uppercase text-sky-800 block">Q3 (Jul–Sep)</span>
              <span className="text-base font-black text-sky-900 block mt-0.5">{dashboardStats?.quarters_count?.q3 || 14} Scheduled</span>
              <span className="text-[9px] font-bold text-sky-700 bg-sky-100/60 px-1.5 py-0.2 rounded mt-1 inline-block">Upcoming</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] font-black uppercase text-slate-700 block">Q4 (Oct–Dec)</span>
              <span className="text-base font-black text-slate-800 block mt-0.5">{dashboardStats?.quarters_count?.q4 || 14} Pending</span>
              <span className="text-[9px] font-bold text-slate-600 bg-slate-200/60 px-1.5 py-0.2 rounded mt-1 inline-block">Scheduled</span>
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

      {/* Upcoming AMC Visits Widget */}
      {renderUpcomingVisitsWidget()}

    </div>
  );
}
