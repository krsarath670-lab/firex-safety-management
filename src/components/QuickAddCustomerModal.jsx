import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Building2, Plus, AlertTriangle, CheckCircle2, User, Phone, Mail, MapPin } from 'lucide-react';

export default function QuickAddCustomerModal({ isOpen, onClose, onCustomerCreated }) {
  const { currentUser, showToast } = useApp();

  const defaultForm = () => ({
    name: '',
    customer_code: '',
    cr_no: '',
    vat_no: '',
    villa_unit: '',
    building_no: '',
    road_no: '',
    block_no: '',
    area: '',
    country: 'Bahrain',
    contact_person: '',
    contact_mobile: '',
    phone: '',
    email: '',
    remarks: '',
    status: 'Active',
    primary_site_name: 'Main Facility / Head Office'
  });

  const [formData, setFormData] = useState(defaultForm);
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  // Live address preview
  const getAddressPreview = () => {
    const parts = [];
    if (formData.villa_unit) {
      const v = formData.villa_unit.trim();
      parts.push(v.toLowerCase().startsWith('villa') || v.toLowerCase().startsWith('unit') ? v : `Villa ${v}`);
    }
    if (formData.building_no) {
      const b = formData.building_no.trim();
      parts.push(b.toLowerCase().startsWith('building') || b.toLowerCase().startsWith('bldg') ? b : `Building ${b}`);
    }
    if (formData.road_no) {
      const r = formData.road_no.trim();
      parts.push(r.toLowerCase().startsWith('road') ? r : `Road ${r}`);
    }
    if (formData.area) parts.push(formData.area.trim());
    if (formData.block_no) {
      const blk = formData.block_no.trim();
      parts.push(blk.toLowerCase().startsWith('block') ? blk : `Block ${blk}`);
    }
    if (formData.country) parts.push(formData.country.trim());
    return parts.length > 0 ? parts.join(', ') : 'Address preview will appear here...';
  };

  const handleSave = async (force = false) => {
    if (!formData.name.trim()) {
      showToast('Customer name is required', 'error');
      return;
    }

    try {
      setSaving(true);
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser?.id,
          'x-user-role': currentUser?.role
        },
        body: JSON.stringify({
          ...formData,
          force
        })
      });

      if (res.status === 409) {
        const data = await res.json();
        setDuplicateWarning(data.duplicates || []);
        setSaving(false);
        return;
      }

      if (res.ok) {
        const created = await res.json();
        showToast(`Customer ${created.name} created successfully!`, 'success');
        setFormData(defaultForm());
        setDuplicateWarning(null);
        if (onCustomerCreated) onCustomerCreated(created);
        onClose();
      } else {
        const err = await res.json();
        showToast(err.message || 'Failed to save customer', 'error');
      }
    } catch {
      showToast('Network error saving customer', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 p-5 text-xs animate-in slide-in-from-bottom">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <span>+ Add New Customer</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Create customer without losing current workflow. CR &amp; VAT are editable.
            </p>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1"
          >
            ✕
          </button>
        </div>

        {/* Duplicate Warning Dialog */}
        {duplicateWarning && (
          <div className="mt-3 p-3.5 bg-amber-50 border border-amber-200 rounded-2xl space-y-2.5 animate-in fade-in">
            <div className="flex items-center gap-2 text-amber-900 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Possible Existing Customer Found</span>
            </div>
            <p className="text-amber-800 text-[11px]">
              A customer matching the Name, CR No., VAT No., or Phone already exists in the system:
            </p>
            <div className="space-y-1.5">
              {duplicateWarning.map(dup => (
                <div key={dup.id} className="p-2 bg-white rounded-xl border border-amber-200 text-slate-800">
                  <div className="font-bold flex justify-between">
                    <span>{dup.name} ({dup.customer_code})</span>
                    <span className="text-[10px] text-amber-700 font-semibold">{dup.reasons?.join(', ')}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    CR: {dup.cr_no || 'None'} • VAT: {dup.vat_no || 'None'} • Phone: {dup.phone || 'None'}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setDuplicateWarning(null)}
                className="flex-1 py-2 rounded-xl border border-amber-300 text-amber-900 font-bold hover:bg-amber-100"
              >
                Review &amp; Edit
              </button>
              <button
                type="button"
                onClick={() => handleSave(true)}
                className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-xs"
              >
                Proceed &amp; Create Anyway
              </button>
            </div>
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); handleSave(false); }} className="mt-4 space-y-3.5">
          
          {/* Customer Information */}
          <div className="space-y-2">
            <h4 className="font-black text-slate-800 text-xs uppercase tracking-wider text-[11px] pb-1 border-b border-slate-100">
              1. Customer Information
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Customer / Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Al Seef Fire & Safety Commercial Co. W.L.L"
                  value={formData.name}
                  onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 font-medium text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Customer Code (Optional)</label>
                <input
                  type="text"
                  placeholder="Auto-generated if blank (e.g. CUST-BH-005)"
                  value={formData.customer_code}
                  onChange={(e) => setFormData(p => ({ ...p, customer_code: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">CR No. (Editable) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 96850 1"
                  value={formData.cr_no}
                  onChange={(e) => setFormData(p => ({ ...p, cr_no: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-navy-900 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">VAT No. (Editable) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 220006271900002"
                  value={formData.vat_no}
                  onChange={(e) => setFormData(p => ({ ...p, vat_no: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-navy-900 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Structured Bahrain Address */}
          <div className="space-y-2 pt-1">
            <h4 className="font-black text-slate-800 text-xs uppercase tracking-wider text-[11px] pb-1 border-b border-slate-100 flex items-center justify-between">
              <span>2. Address (Structured Bahrain Fields)</span>
              <span className="text-[10px] text-blue-600 font-bold capitalize">Bahrain Address Standard</span>
            </h4>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block font-bold text-slate-600 mb-1">Villa / Unit</label>
                <input
                  type="text"
                  placeholder="e.g. 13"
                  value={formData.villa_unit}
                  onChange={(e) => setFormData(p => ({ ...p, villa_unit: e.target.value }))}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-600 mb-1">Building No.</label>
                <input
                  type="text"
                  placeholder="e.g. 2373"
                  value={formData.building_no}
                  onChange={(e) => setFormData(p => ({ ...p, building_no: e.target.value }))}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-600 mb-1">Road No.</label>
                <input
                  type="text"
                  placeholder="e.g. 2831"
                  value={formData.road_no}
                  onChange={(e) => setFormData(p => ({ ...p, road_no: e.target.value }))}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block font-bold text-slate-600 mb-1">Block No.</label>
                <input
                  type="text"
                  placeholder="e.g. 428"
                  value={formData.block_no}
                  onChange={(e) => setFormData(p => ({ ...p, block_no: e.target.value }))}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-600 mb-1">Area / City *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Al Seef"
                  value={formData.area}
                  onChange={(e) => setFormData(p => ({ ...p, area: e.target.value }))}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-600 mb-1">Country</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData(p => ({ ...p, country: e.target.value }))}
                  className="w-full p-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
                />
              </div>
            </div>

            {/* Combined Address Preview */}
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600">
              <span className="font-bold text-slate-800 block text-[10px] uppercase">Combined Address Preview:</span>
              <span className="font-mono text-slate-700">{getAddressPreview()}</span>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-2 pt-1">
            <h4 className="font-black text-slate-800 text-xs uppercase tracking-wider text-[11px] pb-1 border-b border-slate-100">
              3. Contact Details
            </h4>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Contact Person *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Yousif Al-Majid"
                  value={formData.contact_person}
                  onChange={(e) => setFormData(p => ({ ...p, contact_person: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Mobile Number</label>
                <input
                  type="text"
                  placeholder="e.g. +973 3922 4488"
                  value={formData.contact_mobile}
                  onChange={(e) => setFormData(p => ({ ...p, contact_mobile: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Office Telephone *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. +973 1758 1122"
                  value={formData.phone}
                  onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. info@seefsafety.bh"
                  value={formData.email}
                  onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Initial Primary Site Name</label>
              <input
                type="text"
                placeholder="e.g. Main Facility / Head Office"
                value={formData.primary_site_name}
                onChange={(e) => setFormData(p => ({ ...p, primary_site_name: e.target.value }))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Automatically creates this site so you can immediately assign jobs or AMC contracts.
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Remarks</label>
              <textarea
                rows={2}
                placeholder="Notes or operational comments..."
                value={formData.remarks}
                onChange={(e) => setFormData(p => ({ ...p, remarks: e.target.value }))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold shadow-md flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save & Select Customer'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
