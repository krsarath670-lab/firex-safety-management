import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatBHD } from '../utils/formatters';
import SalesMonthlyReportModal from './SalesMonthlyReportModal';
import { 
  FileCheck, AlertOctagon, Calendar, Wrench, FileQuestion, 
  Flame, CheckCircle2, FileSpreadsheet, Building2, Plus, 
  ChevronRight, ArrowUpRight, Sparkles, Clock, ShieldAlert,
  FlameKindling, PhoneCall, TrendingUp, DollarSign, Package, 
  Layers, UserCheck, ShieldCheck, FileText, ArrowRight, Users
} from 'lucide-react';

export default function Dashboard({ onStartJob, onStartInspection, onNewAMC, onNewReport }) {
  const { dashboardStats, currentUser, setActiveTab, setActiveModal } = useApp();

  const [upcomingTab, setUpcomingTab] = useState('next7Days'); // 'today' | 'next7Days' | 'next30Days'
  const [showSalesMonthlyReport, setShowSalesMonthlyReport] = useState(false);

  const isSales = currentUser?.role === 'Sales';
  const isTechnician = currentUser?.role === 'Technician';

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

        {/* Upcoming AMC Visits Widget */}
        {renderUpcomingVisitsWidget()}

        {/* Emergency Hotline */}
        <div className="bg-slate-900 text-white rounded-xl p-3 flex items-center justify-between border border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-full bg-safety-red text-white animate-pulse">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-300">
                FIREX 24/7 Bahrain Emergency Hotline
              </p>
              <p className="text-xs font-bold text-white">8000-FIREX / +973 1716 2240</p>
            </div>
          </div>
          <span className="text-[10px] bg-navy-800 text-blue-300 px-2 py-1 rounded font-semibold border border-navy-700">
            Bahrain Standby
          </span>
        </div>

        {/* Sales Monthly Report Modal */}
        {showSalesMonthlyReport && (
          <SalesMonthlyReportModal onClose={() => setShowSalesMonthlyReport(false)} />
        )}

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

          {/* New Breakdown Emergency */}
          <button
            onClick={() => onStartJob('Breakdown')}
            className="h-16 rounded-xl bg-safety-red hover:bg-red-700 active:bg-safety-darkred text-white p-2.5 flex flex-col justify-between transition-all shadow-sm text-left"
          >
            <div className="flex items-center justify-between w-full">
              <div className="p-1.5 rounded-lg bg-white/20 text-white">
                <Flame className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-semibold text-red-200">Urgent</span>
            </div>
            <span className="text-xs font-bold text-white tracking-tight">Breakdown</span>
          </button>

          {/* Generate Report */}
          <button
            onClick={onNewReport}
            className="h-16 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-black text-white p-2.5 flex flex-col justify-between transition-all shadow-sm text-left"
          >
            <div className="flex items-center justify-between w-full">
              <div className="p-1.5 rounded-lg bg-indigo-600 text-white">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-semibold text-slate-300">A4 PDF</span>
            </div>
            <span className="text-xs font-bold text-white tracking-tight">Generate Report</span>
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

      {/* Emergency 24/7 Hotline Bar */}
      <div className="bg-slate-900 text-white rounded-xl p-3 flex items-center justify-between border border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-full bg-safety-red text-white animate-pulse">
            <PhoneCall className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-300">
              FIREX 24/7 Bahrain Emergency Hotline
            </p>
            <p className="text-xs font-bold text-white">8000-FIREX / +973 1716 2240</p>
          </div>
        </div>
        <span className="text-[10px] bg-navy-800 text-blue-300 px-2 py-1 rounded font-semibold border border-navy-700">
          24/7 Bahrain Standby
        </span>
      </div>

    </div>
  );
}
