import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  FileText, Search, Filter, Download, RefreshCw, 
  ShieldAlert, Clock, User, CheckCircle2, AlertCircle, ArrowUpDown
} from 'lucide-react';
import { exportAuditLogsToExcel } from '../utils/excelExport';

export default function AuditLogView() {
  const { currentUser, showToast } = useApp();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState('ALL');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' (newest first) or 'asc'

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/audit-logs', {
        headers: {
          'x-user-role': currentUser?.role || 'CEO',
          'x-user-id': currentUser?.id || 'usr-ceo-1'
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
  }, [currentUser]);

  // Unique modules and actions for filters
  const modulesList = ['ALL', ...Array.from(new Set(logs.map(l => l.resource || l.module).filter(Boolean)))];
  const actionsList = ['ALL', ...Array.from(new Set(logs.map(l => l.action).filter(Boolean)))];

  // Filtering
  const filteredLogs = logs.filter(l => {
    if (moduleFilter !== 'ALL' && (l.resource || l.module) !== moduleFilter) return false;
    if (actionFilter !== 'ALL' && l.action !== actionFilter) return false;
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

  const getActionBadgeColor = (action = '') => {
    const act = action.toUpperCase();
    if (act.includes('DELETE')) return 'bg-red-50 text-red-700 border-red-200';
    if (act.includes('CREATE') || act.includes('ADD')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (act.includes('UPDATE') || act.includes('SET_PASSWORD')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (act.includes('APPROVE') || act.includes('COMPLETE')) return 'bg-purple-50 text-purple-700 border-purple-200';
    if (act.includes('HOLD')) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-slate-50 text-slate-700 border-slate-200';
  };

  return (
    <div className="space-y-4 pb-28 max-w-7xl mx-auto">
      {/* Header Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Executive System Audit Trail
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Immutable log of all user activities, security changes, deletions, and operational modifications across FireX.
          </p>
        </div>

        <div className="flex items-center gap-2">
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
            onClick={handleExportExcel}
            className="h-10 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-sm transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
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

          {/* Sort Order Toggle */}
          <div>
            <button
              onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
              className="w-full h-9 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-between"
            >
              <span>Sort: {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Count summary */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
          <span>Showing <strong>{sortedLogs.length}</strong> of <strong>{logs.length}</strong> recorded audit events</span>
          {(moduleFilter !== 'ALL' || actionFilter !== 'ALL' || searchQuery) && (
            <button
              onClick={() => { setModuleFilter('ALL'); setActionFilter('ALL'); setSearchQuery(''); }}
              className="text-amber-600 font-bold hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Audit Log Table / Cards */}
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
                  <th className="py-3 px-3.5">Date &amp; Time</th>
                  <th className="py-3 px-3.5">User</th>
                  <th className="py-3 px-3.5">Action</th>
                  <th className="py-3 px-3.5">Module</th>
                  <th className="py-3 px-3.5">Record ID</th>
                  <th className="py-3 px-3.5">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {sortedLogs.map((log, idx) => (
                  <tr key={log.id || idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3.5 whitespace-nowrap text-slate-600">
                      <div className="font-bold text-slate-900">{log.formatted_date || (log.timestamp ? new Date(log.timestamp).toLocaleDateString() : '')}</div>
                      <div className="text-[10px] text-slate-400">{log.formatted_time || (log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : '')}</div>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
