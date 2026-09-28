import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { formatBHD } from '../utils/formatters';
import { 
  FileText, Calendar, DollarSign, CheckCircle2, Clock, 
  Printer, ArrowLeft, X, TrendingUp, Briefcase, Building2 
} from 'lucide-react';

export default function SalesMonthlyReportModal({ onClose, defaultSalesPersonId = null }) {
  const { currentUser, companySettings, fetchSalesMonthlyReport } = useApp();
  
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1); // 1-12
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  const loadReport = async () => {
    setLoading(true);
    const targetSalesPersonId = defaultSalesPersonId || (currentUser?.role === 'Sales' ? currentUser.id : null);
    const data = await fetchSalesMonthlyReport(selectedYear, selectedMonth, targetSalesPersonId);
    setReportData(data);
    setLoading(false);
  };

  useEffect(() => {
    loadReport();
  }, [selectedYear, selectedMonth, currentUser]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm overflow-y-auto p-2 sm:p-6 flex flex-col items-center">
      
      {/* Action Bar */}
      <div className="sticky top-2 z-50 bg-navy-900/95 backdrop-blur-md text-white rounded-2xl px-4 py-2.5 shadow-2xl border border-navy-700 flex items-center justify-between w-full max-w-3xl mb-4">
        <button
          onClick={onClose}
          className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 bg-navy-800 hover:bg-navy-700 rounded-lg text-xs font-bold text-white flex items-center gap-1.5 transition-colors border border-navy-700"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print Report</span>
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Report Container */}
      <div className="w-full max-w-3xl bg-white shadow-2xl rounded-2xl p-5 sm:p-8 text-slate-900 font-sans border border-slate-300 mb-12">
        
        {/* Header & Company Brand */}
        <div className="border-b-2 border-navy-900 pb-4 flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-white bg-navy-900 px-2.5 py-0.5 rounded tracking-wide uppercase">
                Sales Work Report
              </span>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Official Monthly Statement
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
              {companySettings?.company_name || 'FIREX BAHRAIN FOR SAFETY ITEMS W.L.L'}
            </h1>
            <p className="text-xs text-slate-600 font-medium">
              Salesperson: <span className="font-bold text-navy-900">{reportData?.sales_person_name || currentUser?.name}</span>
            </p>
          </div>

          {/* Month / Year Picker Controls */}
          <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-50 p-1.5 rounded-xl border border-slate-200">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="p-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-navy-900"
            >
              {months.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="p-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-navy-900"
            >
              {[2025, 2026, 2027].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs text-slate-500 font-medium">
            Loading monthly sales statement...
          </div>
        ) : !reportData ? (
          <div className="py-16 text-center text-xs text-slate-400">
            No report data available.
          </div>
        ) : (
          <div className="mt-5 space-y-6">
            
            {/* Top Key Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Total Work Count</span>
                <span className="text-2xl font-black text-navy-900">{reportData.summary?.total_jobs || 0}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Assigned works</span>
              </div>

              <div className="bg-amber-50 rounded-xl p-3 border border-amber-200">
                <span className="text-[10px] font-bold uppercase text-amber-800 block">Total Booked Value</span>
                <span className="text-lg sm:text-xl font-black text-amber-900">
                  {formatBHD(reportData.summary?.total_amount_bhd || 0)}
                </span>
                <span className="text-[10px] text-amber-700 block mt-0.5">Bahrain Dinar</span>
              </div>

              <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200">
                <span className="text-[10px] font-bold uppercase text-emerald-800 block">Completed Value</span>
                <span className="text-lg sm:text-xl font-black text-emerald-900">
                  {formatBHD(reportData.summary?.completed_amount_bhd || 0)}
                </span>
                <span className="text-[10px] text-emerald-700 block mt-0.5">{reportData.summary?.completed_count || 0} job(s) done</span>
              </div>

              <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
                <span className="text-[10px] font-bold uppercase text-blue-800 block">In Progress / Pending</span>
                <span className="text-lg sm:text-xl font-black text-blue-900">
                  {formatBHD(reportData.summary?.pending_amount_bhd || 0)}
                </span>
                <span className="text-[10px] text-blue-700 block mt-0.5">{reportData.summary?.pending_count || 0} active/pending</span>
              </div>
            </div>

            {/* Breakdown by Job Type */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-2.5 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span>Work Type Breakdown ({months.find(m => m.value === selectedMonth)?.label} {selectedYear})</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {Object.entries(reportData.by_type || {}).map(([type, stats]) => (
                  <div key={type} className="bg-white rounded-xl p-2.5 border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">{type}</span>
                      <span className="text-[11px] font-mono font-bold text-blue-700">
                        {formatBHD(stats.amount)}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-slate-100 text-slate-700">
                      {stats.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Individual Jobs Table */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-2.5 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-navy-900" />
                <span>Work Order Details ({reportData.jobs?.length || 0})</span>
              </h3>

              {reportData.jobs?.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                  No jobs logged for this period.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500">
                      <tr>
                        <th className="p-2.5">Job #</th>
                        <th className="p-2.5">Type</th>
                        <th className="p-2.5">Customer &amp; Site</th>
                        <th className="p-2.5">Status</th>
                        <th className="p-2.5 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {reportData.jobs?.map((j) => (
                        <tr key={j.id} className="hover:bg-slate-50/80">
                          <td className="p-2.5 font-mono font-bold text-navy-900">
                            {j.job_number}
                            {j.quotation_number && (
                              <span className="block text-[10px] text-slate-400 font-normal">
                                Quot: {j.quotation_number}
                              </span>
                            )}
                          </td>
                          <td className="p-2.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
                              {j.job_type}
                            </span>
                            <span className="block text-[10px] text-slate-500 mt-0.5 truncate max-w-[120px]">
                              {j.system}
                            </span>
                          </td>
                          <td className="p-2.5">
                            <span className="font-bold text-slate-900 block truncate max-w-[180px]">
                              {j.site_name}
                            </span>
                            <span className="text-[10px] text-slate-500 block truncate max-w-[180px]">
                              {j.customer_name}
                            </span>
                          </td>
                          <td className="p-2.5">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              j.status === 'Completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : j.status === 'In Progress'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {j.status}
                            </span>
                          </td>
                          <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                            {formatBHD(j.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Footer Sign-off Note */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
              <span>FIREX BAHRAIN FOR SAFETY ITEMS W.L.L • Commercial Registration #124891-1</span>
              <span>Generated on {today.toLocaleDateString()}</span>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
