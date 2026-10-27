import React, { useState } from 'react';
import { 
  CheckCircle2, AlertTriangle, Calendar, Clock, 
  FileText, ShieldCheck, X, Check, ArrowRight
} from 'lucide-react';

export default function MarkQuarterFinishedModal({
  isOpen,
  contract,
  quarterKey,
  quarterData,
  onClose,
  onSuccess
}) {
  if (!isOpen || !contract) return null;

  const currentStatus = quarterData?.status || 'Pending';
  const defaultDate = quarterData?.actual_visit_date || quarterData?.scheduled_date || new Date().toISOString().split('T')[0];

  const [selectedStatus, setSelectedStatus] = useState(
    currentStatus === 'Finished' || currentStatus === 'Completed' ? 'Finished' : 'Finished'
  );
  const [actualDate, setActualDate] = useState(defaultDate);
  const [isHistoricalNoReport, setIsHistoricalNoReport] = useState(!quarterData?.report_id);
  const [notes, setNotes] = useState(quarterData?.status_notes || '');
  const [saving, setSaving] = useState(false);

  const availableStatuses = [
    { id: 'Finished', label: 'Finished', color: 'bg-emerald-600 text-white', desc: 'Work completed (with report or historical)' },
    { id: 'Pending', label: 'Pending', color: 'bg-slate-700 text-white', desc: 'Waiting to be serviced' },
    { id: 'In Progress', label: 'In Progress', color: 'bg-sky-600 text-white', desc: 'Inspection currently underway' },
    { id: 'Not Required', label: 'Not Required', color: 'bg-gray-500 text-white', desc: 'Visit waived or not applicable' },
  ];

  const handleSave = async (e) => {
    e.preventDefault();
    if (saving) return;

    try {
      setSaving(true);
      const res = await fetch(`/api/amc-contracts/${contract.id}/quarters/${quarterKey}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': localStorage.getItem('firex_user_id') || '',
          'x-user-role': localStorage.getItem('firex_user_role') || ''
        },
        body: JSON.stringify({
          status: selectedStatus,
          actual_date: actualDate,
          notes: notes || (selectedStatus === 'Finished' ? (isHistoricalNoReport ? 'Marked finished (Historical work prior to app adoption)' : 'Marked finished') : '')
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (onSuccess) onSuccess(data);
        onClose();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update quarter status');
      }
    } catch (err) {
      console.error('Error updating quarter status:', err);
      alert('Network error while updating quarter status');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-navy-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              selectedStatus === 'Finished' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {selectedStatus === 'Finished' ? <CheckCircle2 className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-black text-navy-950">
                {selectedStatus === 'Finished' ? `Mark ${quarterKey} as Finished` : `Update ${quarterKey} Status`}
              </h3>
              <p className="text-xs text-slate-500">
                AMC Contract: <span className="font-mono font-bold text-slate-800">{contract.contract_number}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contract & Quarter Context Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Customer</span>
              <span className="font-bold text-navy-950 block truncate">{contract.customer_name || 'N/A'}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Facility / Site</span>
              <span className="font-bold text-navy-950 block truncate">{contract.site_name || 'Main Facility'}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Contract Period</span>
              <span className="font-semibold text-slate-700">{contract.start_date} → {contract.end_date}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Scheduled Date</span>
              <span className="font-semibold text-slate-700">{quarterData?.scheduled_date || 'Periodic Cycle'}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-medium">Current Status:</span>
            <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
              currentStatus === 'Finished' || currentStatus === 'Completed'
                ? 'bg-emerald-100 text-emerald-800'
                : currentStatus === 'Overdue'
                ? 'bg-rose-100 text-rose-800'
                : 'bg-blue-100 text-blue-800'
            }`}>
              {currentStatus}
            </span>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          
          {/* Status Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Select Quarter Status:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {availableStatuses.map(st => (
                <button
                  type="button"
                  key={st.id}
                  onClick={() => setSelectedStatus(st.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    selectedStatus === st.id
                      ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20 shadow-sm'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                      st.id === 'Finished' ? 'bg-emerald-600 text-white' :
                      st.id === 'In Progress' ? 'bg-sky-600 text-white' :
                      st.id === 'Pending' ? 'bg-slate-700 text-white' : 'bg-gray-500 text-white'
                    }`}>
                      {st.label}
                    </span>
                    {selectedStatus === st.id && (
                      <Check className="w-3.5 h-3.5 text-blue-600 stroke-[3]" />
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-1 leading-tight">{st.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* If Status is FINISHED: Show Date & Historical Report Options */}
          {selectedStatus === 'Finished' && (
            <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-3.5 space-y-3 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-950 font-bold text-xs border-b border-emerald-200/80 pb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Marking {quarterKey} as Completed / Finished</span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Actual Service / Completion Date:
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={actualDate}
                    onChange={(e) => setActualDate(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                    required
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Original contract starting and expiry dates will remain intact.
                </span>
              </div>

              {/* Report Association */}
              <div className="pt-2 border-t border-emerald-200/60 space-y-1.5">
                <span className="block text-[11px] font-bold text-slate-700">Service Report Record:</span>
                {quarterData?.report_id || quarterData?.report_number ? (
                  <div className="p-2 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-bold">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span>Linked Report: {quarterData.report_number || quarterData.report_id}</span>
                    </div>
                    <span className="text-[10px] font-bold bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded">
                      Report Attached
                    </span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="flex items-start gap-2 cursor-pointer p-2 bg-white rounded-xl border border-emerald-200 hover:bg-emerald-50/40">
                      <input
                        type="checkbox"
                        checked={isHistoricalNoReport}
                        onChange={(e) => setIsHistoricalNoReport(e.target.checked)}
                        className="mt-0.5 h-3.5 w-3.5 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded"
                      />
                      <span className="text-[11px] text-slate-700 font-medium">
                        <strong>Historical Work (No Report Attached):</strong> Work was completed prior to app adoption. Mark as finished without forcing a new report.
                      </span>
                    </label>
                    <span className="text-[10px] text-slate-500 block px-1">
                      Distinguishes completed visits with an attached report from historical completions without a report.
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Completion Remarks / Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Remarks / Audit Notes (Optional):
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Verified from client signed physical maintenance sheet"
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className={`px-5 py-2 text-xs font-bold rounded-xl text-white shadow-sm transition-all flex items-center gap-1.5 ${
                selectedStatus === 'Finished'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-700/20'
                  : 'bg-navy-900 hover:bg-navy-800'
              }`}
            >
              {saving ? (
                <>
                  <Clock className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : selectedStatus === 'Finished' ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm &amp; Mark Finished</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save Status</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
