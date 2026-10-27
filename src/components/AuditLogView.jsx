import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  FileText, Search, Filter, Download, RefreshCw, 
  ShieldAlert, Clock, User, CheckCircle2, AlertCircle, ArrowUpDown,
  Printer, Eye, Calendar, X
} from 'lucide-react';
import { exportAuditLogsToExcel } from '../utils/excelExport';

export default function AuditLogView() {
  const { currentUser, showToast, dataRevision } = useApp();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState('ALL');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [userFilter, setUserFilter] = useState('ALL');
  const [dateRangeFilter, setDateRangeFilter] = useState('ALL'); // ALL, TODAY, YESTERDAY, 7DAYS, 30DAYS
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' (newest first) or 'asc'
  const [selectedLog, setSelectedLog] = useState(null); // Detail modal

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/audit-logs', {
        headers: {
          'x-user-role': currentUser?.role || 'Managing Director (MD)',
          'x-user-id': currentUser?.id || 'usr-md-1'
        }
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(Array.isArray(data) ? data : []);
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.message || 'Failed to load audit logs', 'error');
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      showToast('Network error loading audit logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [currentUser, dataRevision]);

  // Unique filter choices
  const modulesList = ['ALL', ...Array.from(new Set(logs.map(l => l.resource || l.module).filter(Boolean)))];
  const actionsList = ['ALL', ...Array.from(new Set(logs.map(l => l.action).filter(Boolean)))];
  const usersList = ['ALL', ...Array.from(new Set(logs.map(l => l.user_name || l.user_id).filter(Boolean)))];

  // Helper date checking
  const now = new Date();
  const todayStr = new Date(now.getTime() + (3 * 60 * 60 * 1000)).toISOString().slice(0, 10);
  const yesterday = new Date(now.getTime() - (24 * 60 * 60 * 1000) + (3 * 60 * 60 * 1000));
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  // Filtering
  const filteredLogs = logs.filter(l => {
    if (moduleFilter !== 'ALL' && (l.resource || l.module) !== moduleFilter) return false;
    if (actionFilter !== 'ALL' && l.action !== actionFilter) return false;
    if (userFilter !== 'ALL' && (l.user_name || l.user_id) !== userFilter) return false;

    // Date range filter
    if (dateRangeFilter !== 'ALL') {
      const logTime = new Date(l.timestamp || 0).getTime();
      const diffMs = now.getTime() - logTime;
      const logDate = l.formatted_date || (l.timestamp ? new Date(l.timestamp).toISOString().slice(0, 10) : '');

      if (dateRangeFilter === 'TODAY') {
        if (!logDate.includes(todayStr) && diffMs > 24 * 60 * 60 * 1000) return false;
      } else if (dateRangeFilter === 'YESTERDAY') {
        if (!logDate.includes(yesterdayStr)) return false;
      } else if (dateRangeFilter === '7DAYS') {
        if (diffMs > 7 * 24 * 60 * 60 * 1000) return false;
      } else if (dateRangeFilter === '30DAYS') {
        if (diffMs > 30 * 24 * 60 * 60 * 1000) return false;
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchUser = (l.user_name || '').toLowerCase().includes(q);
      const matchRole = (l.user_role || '').toLowerCase().includes(q);
      const matchAction = (l.action || '').toLowerCase().includes(q);
      const matchModule = (l.resource || l.module || '').toLowerCase().includes(q);
      const matchId = (l.resource_id || l.record_id || '').toLowerCase().includes(q);
      const matchDetails = (l.details || '').toLowerCase().includes(q);
      return matchUser || matchRole || matchAction || matchModule || matchId || matchDetails;
    }
    return true;
  });

  // Sorting
  const sortedLogs = [...filteredLogs].sort((a, b) => {
    const timeA = new Date(a.timestamp || 0).getTime();
    const timeB = new Date(b.timestamp || 0).getTime();
    return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
  });

  const handleExportExcel = () => {
    if (sortedLogs.length === 0) {
      showToast('No audit logs to export', 'warning');
      return;
    }
    exportAuditLogsToExcel(sortedLogs, `FIREX_Audit_Trail_${new Date().toISOString().slice(0, 10)}.xlsx`);
    showToast('Audit trail exported successfully to Excel', 'success');
  };

  const handleExportCSV = () => {
    if (sortedLogs.length === 0) {
      showToast('No audit logs to export', 'warning');
      return;
    }
    const headers = ['Timestamp', 'Date', 'Time (Bahrain UTC+3)', 'User Name', 'User Role', 'Action', 'Module', 'Record ID', 'Details'];
    const rows = sortedLogs.map(l => [
      `"${(l.timestamp || '').replace(/"/g, '""')}"`,
      `"${(l.formatted_date || '').replace(/"/g, '""')}"`,
      `"${(l.formatted_time || '').replace(/"/g, '""')}"`,
      `"${(l.user_name || l.user_id || '').replace(/"/g, '""')}"`,
      `"${(l.user_role || '').replace(/"/g, '""')}"`,
      `"${(l.action || '').replace(/"/g, '""')}"`,
      `"${(l.resource || l.module || '').replace(/"/g, '""')}"`,
      `"${(l.resource_id || l.record_id || '').replace(/"/g, '""')}"`,
      `"${(l.details || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FIREX_Audit_Logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Audit trail exported to CSV', 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  const getActionBadgeColor = (action = '') => {
    const act = action.toUpperCase();
    if (act.includes('DELETE')) return 'bg-red-50 text-red-700 border-red-200';
    if (act.includes('CREATE') || act.includes('ADD')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (act.includes('UPDATE') || act.includes('SET_PASSWORD') || act.includes('RESET')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (act.includes('LOGIN_FAILED')) return 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
    if (act.includes('LOGIN')) return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold';
    if (act.includes('LOGOUT')) return 'bg-slate-100 text-slate-700 border-slate-300';
    if (act.includes('APPROVE') || act.includes('COMPLETE')) return 'bg-purple-50 text-purple-700 border-purple-200';
    if (act.includes('HOLD')) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-slate-50 text-slate-700 border-slate-200';
  };

  return (
    <div className="space-y-4 pb-28 max-w-7xl mx-auto">
      {/* Header Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 print:hidden">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Executive System Audit Trail &amp; Activity Log
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Immutable log of all user activities, security events, logins, reports, and data modifications across FireX. All times shown in Bahrain Local Time (UTC+3).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="h-10 px-3 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
            title="Refresh logs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="h-10 px-3.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="h-10 px-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Excel</span>
          </button>

          <button
            onClick={handlePrint}
            className="h-10 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
            title="Print audit report"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3 print:hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search user, action, details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Module Filter */}
          <div>
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-amber-500"
            >
              <option value="ALL">All Modules ({logs.length})</option>
              {modulesList.filter(m => m !== 'ALL').map(m => (
                <option key={m} value={m}>{m.toUpperCase()}</option>
              ))}
            </select>
          </div>

          {/* Action Filter */}
          <div>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-amber-500"
            >
              <option value="ALL">All Actions ({logs.length})</option>
              {actionsList.filter(a => a !== 'ALL').map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          {/* User Filter */}
          <div>
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-amber-500"
            >
              <option value="ALL">All Users</option>
              {usersList.filter(u => u !== 'ALL').map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>

          {/* Date Range Filter */}
          <div>
            <select
              value={dateRangeFilter}
              onChange={(e) => setDateRangeFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-amber-500"
            >
              <option value="ALL">All Time</option>
              <option value="TODAY">Today</option>
              <option value="YESTERDAY">Yesterday</option>
              <option value="7DAYS">Last 7 Days</option>
              <option value="30DAYS">Last 30 Days</option>
            </select>
          </div>
        </div>

        {/* Toolbar Footer & Summary */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <span>Showing <strong>{sortedLogs.length}</strong> of <strong>{logs.length}</strong> recorded audit events</span>
            <button
              onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
              className="text-slate-600 hover:text-slate-900 font-bold flex items-center gap-1"
            >
              <ArrowUpDown className="w-3 h-3 text-slate-400" />
              <span>{sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
            </button>
          </div>
          {(moduleFilter !== 'ALL' || actionFilter !== 'ALL' || userFilter !== 'ALL' || dateRangeFilter !== 'ALL' || searchQuery) && (
            <button
              onClick={() => { setModuleFilter('ALL'); setActionFilter('ALL'); setUserFilter('ALL'); setDateRangeFilter('ALL'); setSearchQuery(''); }}
              className="text-amber-600 font-bold hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Audit Log Table */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-400 text-xs">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-500" />
          Loading audit trail records...
        </div>
      ) : sortedLogs.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-500">
          <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700">No audit trail records found</h3>
          <p className="text-xs text-slate-400 mt-1">Try clearing filters or search terms.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3.5">Bahrain Date &amp; Time</th>
                  <th className="py-3 px-3.5">User</th>
                  <th className="py-3 px-3.5">Action</th>
                  <th className="py-3 px-3.5">Module</th>
                  <th className="py-3 px-3.5">Record ID</th>
                  <th className="py-3 px-3.5">Details</th>
                  <th className="py-3 px-3.5 text-right print:hidden">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {sortedLogs.map((log, idx) => (
                  <tr 
                    key={log.id || idx} 
                    onClick={() => setSelectedLog(log)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-3.5 whitespace-nowrap text-slate-600">
                      <div className="font-bold text-slate-900">{log.formatted_date || (log.timestamp ? new Date(log.timestamp).toLocaleDateString() : '')}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{log.formatted_time || (log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : '')}</div>
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <div className="font-bold text-slate-900">{log.user_name || log.user_id}</div>
                      <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase tracking-wide bg-slate-100 text-slate-600">
                        {log.user_role || 'System'}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black border ${getActionBadgeColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span className="font-mono text-[11px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                        {log.resource || log.module || 'system'}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap font-mono text-[11px] text-slate-500">
                      {log.resource_id || log.record_id || '—'}
                    </td>
                    <td className="py-3 px-3.5 text-slate-700 text-xs max-w-md break-words">
                      {log.details || '—'}
                    </td>
                    <td className="py-3 px-3.5 text-right print:hidden">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedLog(log); }}
                        className="p-1 rounded-lg text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-colors"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DETAIL INSPECT MODAL */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-2xl shadow-2xl p-5 space-y-4 text-xs animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-black text-slate-900">Audit Log Event Details</h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Bahrain Date &amp; Time</span>
                  <span className="font-bold text-slate-800 text-xs">{selectedLog.formatted_date} {selectedLog.formatted_time}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Action</span>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black border mt-0.5 ${getActionBadgeColor(selectedLog.action)}`}>
                    {selectedLog.action}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">User Name &amp; ID</span>
                  <span className="font-bold text-slate-800 text-xs block">{selectedLog.user_name || selectedLog.user_id}</span>
                  <span className="text-[10px] font-mono text-slate-500">{selectedLog.user_id}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">User Role</span>
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700 mt-0.5">
                    {selectedLog.user_role || 'System'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Module / Resource</span>
                  <span className="font-mono font-bold text-slate-800 text-xs">{selectedLog.resource || selectedLog.module}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Record ID</span>
                  <span className="font-mono font-bold text-slate-800 text-xs">{selectedLog.resource_id || selectedLog.record_id || '—'}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Details &amp; Description</span>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 text-xs leading-relaxed">
                  {selectedLog.details || 'No additional details provided.'}
                </div>
              </div>

              {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Metadata / Changed Attributes</span>
                  <pre className="p-2.5 bg-slate-900 text-emerald-400 rounded-xl text-[10px] font-mono overflow-x-auto max-h-36">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
