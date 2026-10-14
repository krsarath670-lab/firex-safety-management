import React from 'react';
import { 
  FileSpreadsheet, Flame, X, ShieldCheck, Wrench, 
  ArrowRight, Shield, AlertTriangle, Sparkles, Building2, CheckCircle2 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

/**
 * GenerateReportModal
 * Requirement:
 * - Only 4 authorized roles can prepare reports: Projects Manager, Engineer, Supervisor, Technician
 * - Displays ONLY TWO large report options:
 *   1. AMC SERVICE REPORT
 *   2. EMERGENCY CALL-OUT REPORT
 * - Responsive on mobile phones and laptops
 */
export default function GenerateReportModal({ 
  isOpen, 
  onClose, 
  onSelectAMC, 
  onSelectEmergency 
}) {
  const { currentUser } = useApp();

  if (!isOpen) return null;

  const role = currentUser?.role || '';
  const isAuthorized = [
    'Projects Manager', 'projects_manager', 'Project Manager', 'PM',
    'Engineer', 'engineer',
    'Supervisor', 'supervisor',
    'Technician', 'technician',
    'Admin', 'admin'
  ].includes(role);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden my-auto">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-navy-900 text-white p-5 sm:p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-400/30">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                  Generate Report
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  FIREX Field Module
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight mt-0.5">
                Select Report Type
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4">
          
          {/* Identity & Role Badge */}
          <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-600 font-medium">Logged in as:</span>
              <strong className="text-slate-900 font-bold">{currentUser?.name}</strong>
            </div>
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-navy-900 text-white">
              {role}
            </span>
          </div>

          {!isAuthorized ? (
            <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-center space-y-3">
              <div className="w-12 h-12 bg-red-100 text-safety-red rounded-full flex items-center justify-center mx-auto">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-black text-red-900 uppercase">
                Report Creation Restricted
              </h3>
              <p className="text-xs text-red-700 leading-relaxed max-w-md mx-auto">
                Operational reports can only be prepared by authorized field and technical roles:
                <strong className="block text-slate-900 mt-1 font-black">
                  Projects Manager • Engineer • Supervisor • Technician
                </strong>
              </p>
              <button
                onClick={onClose}
                className="mt-2 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
              >
                Close
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 font-medium">
                Choose the operational report you want to prepare. Only the two approved operational report types are available:
              </p>

              {/* OPTION 1: AMC SERVICE REPORT */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSelectAMC();
                }}
                className="w-full text-left p-4 sm:p-5 rounded-2xl border-2 border-slate-200 hover:border-blue-600 bg-white hover:bg-blue-50/40 transition-all duration-200 shadow-sm hover:shadow-md group flex items-start gap-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-sm sm:text-base font-black text-navy-900 group-hover:text-blue-700 transition-colors uppercase tracking-tight">
                      1. AMC Service Report
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 shrink-0">
                      Scheduled Visit
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Periodic maintenance inspection report linked to AMC contract &amp; scheduled quarter. Includes multi-building and multi-panel checklists, OK / NOT OK / N/A findings, defect logging, and official NFPA certificate.
                  </p>
                  <div className="flex items-center gap-1.5 mt-2.5 text-[11px] font-bold text-blue-700">
                    <span>Open AMC Report Workflow</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </button>

              {/* OPTION 2: EMERGENCY CALL-OUT REPORT */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSelectEmergency();
                }}
                className="w-full text-left p-4 sm:p-5 rounded-2xl border-2 border-slate-200 hover:border-red-600 bg-white hover:bg-red-50/40 transition-all duration-200 shadow-sm hover:shadow-md group flex items-start gap-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-safety-red to-red-700 text-white flex items-center justify-center shrink-0 shadow-md shadow-red-500/20 group-hover:scale-105 transition-transform">
                  <Flame className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-sm sm:text-base font-black text-navy-900 group-hover:text-red-700 transition-colors uppercase tracking-tight">
                      2. Emergency Call-Out Report
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 shrink-0">
                      24/7 Breakdown
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Urgent call-out and breakdown service report. Records client complaint, troubleshooting findings, corrective action taken, spare parts used, photo evidence, and client acknowledgement sign-off.
                  </p>
                  <div className="flex items-center gap-1.5 mt-2.5 text-[11px] font-bold text-red-700">
                    <span>Open Emergency Report Workflow</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </button>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-medium">
            Civil Defense &amp; NFPA Compliance Standard
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl font-bold text-xs border border-slate-200 shadow-xs"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}
