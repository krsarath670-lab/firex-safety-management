import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  CheckCircle2, XCircle, AlertTriangle, ShieldCheck, 
  MessageSquare, UserCheck, ArrowLeft, Send, Sparkles,
  Camera, FileText, Check, RotateCcw
} from 'lucide-react';

export default function AMCSupervisorReviewModal({ visit, onClose, onRefresh, onViewReport }) {
  const { currentUser, showToast } = useApp();
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!visit) return null;

  const chk = visit.checklist_data || {};
  const faItems = chk.fire_alarm_items || [];
  const ffItems = chk.fire_fighting_items || [];
  const extItems = chk.extinguisher_items || [];

  const totalPoints = faItems.length + ffItems.length + extItems.length;
  const okPoints = [...faItems, ...ffItems, ...extItems].filter(i => i.status === 'OK').length;
  const notOkPoints = [...faItems, ...ffItems, ...extItems].filter(i => i.status === 'NOT OK').length;
  const naPoints = [...faItems, ...ffItems, ...extItems].filter(i => i.status === 'N/A').length;

  const defects = [
    ...faItems.filter(i => i.status === 'NOT OK').map(i => ({ ...i, sys: 'Fire Alarm' })),
    ...ffItems.filter(i => i.status === 'NOT OK').map(i => ({ ...i, sys: 'Fire Fighting' })),
    ...extItems.filter(i => i.status === 'NOT OK').map(i => ({ ...i, sys: 'Fire Extinguishers', item: `${i.type} (${i.capacity})` }))
  ];

  const handleReviewAction = async (action) => {
    if (action === 'Return' && !remarks.trim()) {
      showToast('Please provide review notes explaining why the checklist is returned', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`/api/amc-visits/${visit.id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser.role,
          'x-user-id': currentUser.id
        },
        body: JSON.stringify({
          action,
          remarks,
          supervisor_signature: null // verified by logged in role
        })
      });

      if (res.ok) {
        showToast(
          action === 'Approve'
            ? 'AMC Visit & Checklist APPROVED! Official AMC Service Report PDF generated.'
            : 'Checklist returned to technician with review remarks.',
          'success'
        );
        if (onRefresh) onRefresh();
        onClose();
      } else {
        const err = await res.json();
        showToast(err.message || 'Error processing review', 'error');
      }
    } catch (err) {
      console.error('Review error:', err);
      showToast('Network error reviewing checklist', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col my-auto max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-navy-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-blue-300 block">
                Civil Defense Compliance &amp; Engineering Audit
              </span>
              <h2 className="text-sm sm:text-base font-black text-white">
                Supervisor Review: Visit #{visit.visit_number} ({visit.contract_number})
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-navy-800"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Total Points</span>
              <span className="text-sm font-black text-slate-900">{totalPoints}</span>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5">
              <span className="text-[9px] uppercase font-bold text-emerald-700 block">Verified OK</span>
              <span className="text-sm font-black text-emerald-900">{okPoints}</span>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-2.5">
              <span className="text-[9px] uppercase font-bold text-red-700 block">Defects Logged</span>
              <span className="text-sm font-black text-red-900">{notOkPoints}</span>
            </div>
            <div className="bg-slate-100 border border-slate-200 rounded-xl p-2.5">
              <span className="text-[9px] uppercase font-bold text-slate-500 block">Not Applicable</span>
              <span className="text-sm font-black text-slate-700">{naPoints}</span>
            </div>
          </div>

          {/* Inspection Metadata */}
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-[11px]">
            <div>
              <span className="text-[9px] text-slate-400 uppercase font-semibold block">Client Premises</span>
              <span className="font-bold text-slate-900 truncate block">{visit.site_name || visit.customer_name}</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 uppercase font-semibold block">Inspection Date</span>
              <span className="font-bold text-slate-900 block">{visit.actual_service_date || visit.scheduled_date}</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 uppercase font-semibold block">Lead Technician</span>
              <span className="font-bold text-slate-900 block">{visit.technician_name || 'Technician'}</span>
            </div>
          </div>

          {/* Defects & Recommendations Summary */}
          <div>
            <h3 className="text-xs font-black uppercase text-slate-800 mb-1.5 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
              <span>Flagged Defects &amp; Proposed Rectifications ({defects.length})</span>
            </h3>

            {defects.length === 0 ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-bold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Zero defects logged. All circuits, sensors, and pumps passed test.</span>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {defects.map((d, i) => (
                  <div key={i} className="p-2.5 bg-red-50/60 border border-red-200 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">
                        {d.sys}: {d.item}
                      </span>
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-red-600 text-white">
                        {d.priority || 'High'}
                      </span>
                    </div>
                    <p className="text-slate-700 text-[11px]"><strong className="text-slate-900">Defect:</strong> {d.defect_description || d.remarks}</p>
                    {d.recommendation && (
                      <p className="text-emerald-800 text-[11px]"><strong className="text-emerald-900">Recommendation:</strong> {d.recommendation}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Customer Signature Verification */}
          {chk.customer_signature ? (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
              <div>
                <span className="text-[9px] font-black uppercase text-slate-400 block">Customer Sign-off</span>
                <span className="font-bold text-slate-900 text-xs block">{chk.customer_signature.repName}</span>
                <span className="text-[10px] text-slate-500 font-medium block">
                  {chk.customer_signature.designation} • {chk.customer_signature.signedDate}
                </span>
              </div>
              {chk.customer_signature.signatureDataUrl && (
                <div className="h-12 w-28 bg-white border border-slate-200 rounded p-1 flex items-center justify-center">
                  <img src={chk.customer_signature.signatureDataUrl} alt="Signature" className="max-h-full max-w-full object-contain" />
                </div>
              )}
            </div>
          ) : (
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-[11px] font-semibold">
              ⚠️ Warning: Customer signature was not captured for this visit.
            </div>
          )}

          {/* Supervisor Directives & Review Notes */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase text-slate-800 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
              <span>Supervisor Review Remarks &amp; Official Approval Notes *</span>
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Reviewed loop impedance and pump discharge curve. Civil Defense periodic compliance verified. Approved for official client distribution."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            {onViewReport && (
              <button
                type="button"
                onClick={() => onViewReport(visit)}
                className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold"
              >
                Inspect Draft PDF
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleReviewAction('Return')}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold flex items-center gap-1 shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Return to Technician</span>
            </button>

            <button
              type="button"
              disabled={submitting}
              onClick={() => handleReviewAction('Approve')}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black flex items-center gap-1.5 shadow-lg shadow-emerald-900/30"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Approve &amp; Generate Final Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
