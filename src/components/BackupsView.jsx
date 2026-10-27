import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Database, ShieldCheck, Download, RotateCcw, AlertTriangle, 
  CheckCircle, Plus, RefreshCw, HardDrive, Clock, FileText, 
  Calendar, Layers, ShieldAlert, X
} from 'lucide-react';

export default function BackupsView() {
  const { currentUser, showToast, isOffline, dataRevision } = useApp();
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [backupNotes, setBackupNotes] = useState('');
  const [backupVersion, setBackupVersion] = useState('v1.0');

  // Restore Modal State
  const [restoreTarget, setRestoreTarget] = useState(null);
  const [confirmText, setConfirmText] = useState('');
  const [restoring, setRestoring] = useState(false);

  const isAdminOrCEO = ['Admin', 'admin', 'CEO', 'Managing Director (MD)', 'Managing Director', 'GM'].includes(currentUser?.role);
  const canRestore = ['Admin', 'admin', 'CEO'].includes(currentUser?.role);

  const fetchBackups = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/backups', {
        headers: {
          'x-user-role': currentUser?.role || 'Admin',
          'x-user-id': currentUser?.id || ''
        }
      });
      if (res.ok) {
        const data = await res.json();
        setBackups(data);
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to load backups list', 'error');
      }
    } catch (e) {
      console.error('Error loading backups:', e);
      showToast('Network error loading backups', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, [currentUser, dataRevision]);

  const handleCreateBackup = async (e) => {
    e.preventDefault();
    if (creating) return;
    try {
      setCreating(true);
      const res = await fetch('/api/backups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser?.role || 'Admin',
          'x-user-id': currentUser?.id || ''
        },
        body: JSON.stringify({
          notes: backupNotes || 'Manual administrative backup',
          version: backupVersion || 'v1.0'
        })
      });
      if (res.ok) {
        const data = await res.json();
        showToast(`Permanent backup created: ${data.backup?.name}`, 'success');
        setShowCreateModal(false);
        setBackupNotes('');
        fetchBackups();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to create backup', 'error');
      }
    } catch (e) {
      console.error('Error creating backup:', e);
      showToast('Network error creating backup', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleDownload = (backup) => {
    window.open(`/api/backups/${backup.id}/download`, '_blank');
  };

  const handleExecuteRestore = async () => {
    if (!restoreTarget) return;
    if (confirmText !== 'CONFIRM_RESTORE') {
      showToast('Please type CONFIRM_RESTORE to proceed', 'error');
      return;
    }
    try {
      setRestoring(true);
      const res = await fetch(`/api/backups/${restoreTarget.id}/restore`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser?.role || 'Admin',
          'x-user-id': currentUser?.id || ''
        },
        body: JSON.stringify({
          confirmation: 'CONFIRM_RESTORE'
        })
      });
      if (res.ok) {
        const data = await res.json();
        showToast(`Database successfully restored to: ${data.restored_name}`, 'success');
        setRestoreTarget(null);
        setConfirmText('');
        fetchBackups();
        // Trigger app refresh to reload all active context stats
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } else {
        const err = await res.json();
        showToast(err.error || 'Restore failed', 'error');
      }
    } catch (e) {
      console.error('Error restoring backup:', e);
      showToast('Network error restoring backup', 'error');
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div className="space-y-5 pb-24">
      {/* Top Banner & Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-navy-950 flex items-center gap-2">
                <span>System Backups &amp; Disaster Recovery</span>
                <span className="text-[10px] uppercase font-bold tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  Permanent Protection
                </span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Cloud persistent snapshots, historical restore points, and disaster recovery registry.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchBackups}
            disabled={loading}
            className="px-3 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl flex items-center gap-1.5 transition-colors"
            title="Refresh backups list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          {isAdminOrCEO && (
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 text-xs font-bold bg-navy-900 hover:bg-navy-800 text-white rounded-xl flex items-center gap-2 shadow-sm transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Create Backup Now</span>
            </button>
          )}
        </div>
      </div>

      {/* Critical Protection Guarantee Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-slate-900 to-navy-950 text-white rounded-2xl p-4 border border-navy-800 shadow-sm space-y-1.5">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Never Auto-Deleted</span>
          </div>
          <p className="text-xs text-slate-300">
            Backups are permanent records. Application updates and Render deployments never delete or overwrite historical backups.
          </p>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-navy-950 text-white rounded-2xl p-4 border border-navy-800 shadow-sm space-y-1.5">
          <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider">
            <HardDrive className="w-4 h-4" />
            <span>Persistent Cloud Store</span>
          </div>
          <p className="text-xs text-slate-300">
            Backed by PostgreSQL durable storage. Backups survive server restarts, dyno redeployments, and code updates.
          </p>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-navy-950 text-white rounded-2xl p-4 border border-navy-800 shadow-sm space-y-1.5">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <RotateCcw className="w-4 h-4" />
            <span>Safe Rollback Protection</span>
          </div>
          <p className="text-xs text-slate-300">
            Every restore action automatically generates a pre-restore safety snapshot before applying older database states.
          </p>
        </div>
      </div>

      {/* Backups Table / Card List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Available Restore Points ({backups.length})
            </span>
          </div>
          <span className="text-[11px] text-slate-500">
            Sorted by most recent creation date
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-xs font-medium">Loading permanent backups from cloud database...</span>
          </div>
        ) : backups.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <Database className="w-8 h-8 mx-auto text-slate-400" />
            <p className="text-sm font-bold text-slate-700">No backups registered yet</p>
            <p className="text-xs text-slate-400">Click "Create Backup Now" to record your first permanent checkpoint.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 overflow-x-auto">
            {backups.map((bkp) => {
              const createdDate = new Date(bkp.created_at);
              const formattedDate = !isNaN(createdDate.getTime()) 
                ? createdDate.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
                : bkp.created_at;
              const sizeKb = bkp.size_bytes ? (bkp.size_bytes / 1024).toFixed(1) + ' KB' : 'Archive';

              return (
                <div key={bkp.id} className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs sm:text-sm font-bold text-navy-950 font-mono">
                        {bkp.name}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                        {bkp.version || 'v1.0'}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>Verified</span>
                      </span>
                      {bkp.storage && (
                        <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          {bkp.storage}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formattedDate}</span>
                      </span>
                      <span>?</span>
                      <span className="font-mono">{sizeKb}</span>
                      {bkp.notes && (
                        <>
                          <span>?</span>
                          <span className="italic text-slate-600">"{bkp.notes}"</span>
                        </>
                      )}
                    </div>

                    {bkp.records_summary && Object.keys(bkp.records_summary).length > 0 && (
                      <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-600 flex-wrap">
                        <span className="text-slate-400 font-semibold">Records Snapshot:</span>
                        {bkp.records_summary.customers !== undefined && (
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                            <strong>{bkp.records_summary.customers}</strong> Customers
                          </span>
                        )}
                        {bkp.records_summary.amc_contracts !== undefined && (
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                            <strong>{bkp.records_summary.amc_contracts}</strong> AMCs
                          </span>
                        )}
                        {bkp.records_summary.amc_visits !== undefined && (
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                            <strong>{bkp.records_summary.amc_visits}</strong> Visits
                          </span>
                        )}
                        {bkp.records_summary.reports !== undefined && (
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                            <strong>{bkp.records_summary.reports}</strong> Reports
                          </span>
                        )}
                        {bkp.records_summary.invoices !== undefined && (
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                            <strong>{bkp.records_summary.invoices}</strong> Invoices
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleDownload(bkp)}
                      className="px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-navy-950 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-1.5 transition-colors border border-slate-200"
                      title="Download full JSON backup snapshot"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>

                    {canRestore && (
                      <button
                        type="button"
                        onClick={() => {
                          setRestoreTarget(bkp);
                          setConfirmText('');
                        }}
                        className="px-3 py-1.5 text-xs font-bold text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 rounded-xl flex items-center gap-1.5 transition-colors border border-amber-200"
                        title="Restore application to this backup snapshot"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                        <span>Restore</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CREATE BACKUP MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-black text-navy-950">Create Permanent Backup</h3>
              </div>
              <button 
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBackup} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Application Version Tag
                </label>
                <input
                  type="text"
                  value={backupVersion}
                  onChange={(e) => setBackupVersion(e.target.value)}
                  placeholder="v1.0"
                  className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Backup Notes / Reason
                </label>
                <textarea
                  rows="3"
                  value={backupNotes}
                  onChange={(e) => setBackupNotes(e.target.value)}
                  placeholder="e.g. Pre-deployment safe checkpoint, quarterly audit backup, etc."
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Permanent Cloud Storage Guarantee</span>
                </p>
                <p className="text-[11px] text-blue-800">
                  This backup is written to durable PostgreSQL storage and local archive. It will never be deleted automatically during future app updates.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 text-xs font-bold bg-navy-900 hover:bg-navy-800 text-white rounded-xl flex items-center gap-2 disabled:opacity-50"
                >
                  {creating && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{creating ? 'Saving Backup...' : 'Create Backup'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESTORE CONFIRMATION MODAL */}
      {restoreTarget && (
        <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-red-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-red-100 pb-3">
              <div className="flex items-center gap-2 text-red-600">
                <ShieldAlert className="w-6 h-6" />
                <h3 className="text-base font-black text-navy-950">Confirm Database Restoration</h3>
              </div>
              <button 
                type="button"
                onClick={() => setRestoreTarget(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 text-xs text-amber-900 space-y-2">
                <p className="font-bold text-amber-950 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Important: You are about to restore an earlier snapshot</span>
                </p>
                <div className="space-y-1 bg-white/70 p-2.5 rounded-xl border border-amber-200 font-mono text-[11px]">
                  <div><strong>Backup Name:</strong> {restoreTarget.name}</div>
                  <div><strong>Created:</strong> {new Date(restoreTarget.created_at).toLocaleString()}</div>
                  <div><strong>Version:</strong> {restoreTarget.version}</div>
                  {restoreTarget.notes && <div><strong>Notes:</strong> {restoreTarget.notes}</div>}
                </div>
                <p className="text-[11px] text-amber-800">
                  <strong>Automatic Safety Protection:</strong> A safety backup of the current database state will be automatically created before restoring, ensuring you can undo this action at any time.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Type <span className="font-mono text-red-600 font-black">CONFIRM_RESTORE</span> to authorize:
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="CONFIRM_RESTORE"
                  className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRestoreTarget(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteRestore}
                disabled={confirmText !== 'CONFIRM_RESTORE' || restoring}
                className="px-5 py-2 text-xs font-bold bg-safety-red hover:bg-red-700 disabled:opacity-40 text-white rounded-xl flex items-center gap-2 shadow transition-all"
              >
                {restoring && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{restoring ? 'Restoring Snapshot...' : 'Authorize & Restore Database'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
