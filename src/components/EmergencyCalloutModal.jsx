import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Flame, X, Check, AlertTriangle, Clock, MapPin, 
  Phone, User, Wrench, Camera, PenTool, Plus, Trash2, 
  Upload, Shield, FileText, CheckCircle2, ChevronRight, AlertOctagon
} from 'lucide-react';
import SignaturePad from './SignaturePad';

export default function EmergencyCalloutModal({ call, onClose, onSaved }) {
  const { currentUser, showToast } = useApp();

  const isNew = !call || !call.id;
  const isGM = currentUser?.role === 'GM';
  const isEngineer = currentUser?.role === 'Engineer';
  const isSupervisor = currentUser?.role === 'Supervisor';
  const isTech = currentUser?.role === 'Technician';
  const isSales = currentUser?.role === 'Sales';
  const isAccounts = currentUser?.role === 'Accounts';
  const isPM = currentUser?.role === 'Projects Manager';

  // Read-only logic: if approved/closed and not GM, or if Sales/Accounts for technical fields
  const isLocked = !isNew && ['Approved', 'Closed'].includes(call?.report_status) && !isGM;
  const canEditTechnical = !isLocked && !isSales && !isAccounts;
  const canAssign = isGM || isEngineer || isSupervisor || isPM;

  // Form State
  const [formData, setFormData] = useState({
    call_number: call?.call_number || '',
    customer_id: call?.customer_id || '',
    customer_name: call?.customer_name || '',
    site_id: call?.site_id || '',
    site_name: call?.site_name || '',
    site_address: call?.site_address || '',
    contact_person: call?.contact_person || '',
    contact_phone: call?.contact_phone || '+973 ',
    call_date: call?.call_date || new Date().toISOString().slice(0, 10),
    call_time: call?.call_time || new Date().toTimeString().slice(0, 5),
    emergency_type: call?.emergency_type || 'Main Fire Pump Controller Malfunction',
    system: call?.system || 'Fire Alarm',
    priority: call?.priority || 'High',
    emergency_description: call?.emergency_description || '',
    reported_problem: call?.reported_problem || '',
    assigned_supervisor_id: call?.assigned_supervisor_id || (isSupervisor ? currentUser.id : ''),
    assigned_supervisor_name: call?.assigned_supervisor_name || (isSupervisor ? currentUser.name : ''),
    assigned_technician_id: call?.assigned_technician_id || (isTech ? currentUser.id : ''),
    assigned_technician_name: call?.assigned_technician_name || (isTech ? currentUser.name : ''),
    arrival_date: call?.arrival_date || '',
    arrival_time: call?.arrival_time || '',
    completion_date: call?.completion_date || '',
    completion_time: call?.completion_time || '',
    findings: call?.findings || '',
    cause: call?.cause || '',
    action_taken: call?.action_taken || '',
    rectification: call?.rectification || '',
    materials_used: call?.materials_used || [],
    additional_work_required: call?.additional_work_required || false,
    additional_work_details: call?.additional_work_details || '',
    recommendations: call?.recommendations || '',
    customer_remarks: call?.customer_remarks || '',
    technician_remarks: call?.technician_remarks || '',
    supervisor_remarks: call?.supervisor_remarks || '',
    status: call?.status || 'New',
    report_status: call?.report_status || 'Draft',
    customer_rep_name: call?.customer_rep_name || '',
    customer_rep_phone: call?.customer_rep_phone || '',
    customer_rep_designation: call?.customer_rep_designation || '',
    customer_signature: call?.customer_signature || null,
    customer_signature_date: call?.customer_signature_date || null,
    technician_signature: call?.technician_signature || null,
    supervisor_signature: call?.supervisor_signature || null,
    photos: call?.photos || []
  });

  const [customersList, setCustomersList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [signatureTarget, setSignatureTarget] = useState('customer'); // 'customer' | 'technician' | 'supervisor'
  const [submitting, setSubmitting] = useState(false);

  // Material item draft state
  const [newMaterial, setNewMaterial] = useState({ name: '', part_number: '', quantity: 1, unit: 'pcs' });

  // Photo upload draft state
  const [photoCategory, setPhotoCategory] = useState('During'); // 'Before' | 'During' | 'After'
  const [photoCaption, setPhotoCaption] = useState('');

  // Fetch customers and users for selectors
  useEffect(() => {
    const loadData = async () => {
      try {
        const [cRes, uRes] = await Promise.all([
          fetch('/api/customers'),
          fetch('/api/auth/users-list')
        ]);
        if (cRes.ok) {
          const cData = await cRes.json();
          setCustomersList(cData);
          if (isNew && cData.length > 0 && !formData.customer_id) {
            const first = cData[0];
            const firstSite = first.sites?.[0];
            setFormData(p => ({
              ...p,
              customer_id: first.id,
              customer_name: first.name,
              site_id: firstSite?.id || '',
              site_name: firstSite?.site_name || 'Main Facility',
              site_address: firstSite?.address || first.address || 'Bahrain',
              contact_person: first.contact_person || '',
              contact_phone: first.phone || '+973 '
            }));
          }
        }
        if (uRes.ok) {
          const uData = await uRes.json();
          setUsersList(uData);
        }
      } catch (err) {
        console.warn('Error loading support data:', err);
      }
    };
    loadData();
  }, []);

  const handleCustomerChange = (customerId) => {
    const cust = customersList.find(c => c.id === customerId);
    if (!cust) return;
    const firstSite = cust.sites?.[0];
    setFormData(p => ({
      ...p,
      customer_id: cust.id,
      customer_name: cust.name,
      site_id: firstSite?.id || '',
      site_name: firstSite?.site_name || 'Main Facility',
      site_address: firstSite?.address || cust.address || 'Bahrain',
      contact_person: cust.contact_person || '',
      contact_phone: cust.phone || '+973 '
    }));
  };

  const handleSiteChange = (siteId) => {
    const cust = customersList.find(c => c.id === formData.customer_id);
    if (!cust) return;
    const site = (cust.sites || []).find(s => s.id === siteId);
    if (site) {
      setFormData(p => ({
        ...p,
        site_id: site.id,
        site_name: site.site_name,
        site_address: site.address || cust.address || 'Bahrain'
      }));
    }
  };

  // Add material
  const handleAddMaterial = (e) => {
    e.preventDefault();
    if (!newMaterial.name.trim()) {
      showToast('Enter material name', 'error');
      return;
    }
    setFormData(p => ({
      ...p,
      materials_used: [...p.materials_used, { ...newMaterial, quantity: Number(newMaterial.quantity) || 1 }]
    }));
    setNewMaterial({ name: '', part_number: '', quantity: 1, unit: 'pcs' });
  };

  const handleRemoveMaterial = (index) => {
    setFormData(p => ({
      ...p,
      materials_used: p.materials_used.filter((_, i) => i !== index)
    }));
  };

  // Photo upload
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('Photo is too large (max 5MB)', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      const newPhotoObj = {
        id: `pho-${Date.now()}`,
        url: dataUrl,
        caption: photoCaption.trim() || `${photoCategory} emergency evidence`,
        category: photoCategory,
        uploaded_at: new Date().toISOString(),
        uploaded_by: currentUser?.name || 'Technician'
      };
      setFormData(p => ({
        ...p,
        photos: [...p.photos, newPhotoObj]
      }));
      setPhotoCaption('');
      showToast(`Added ${photoCategory} photo`, 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = (id) => {
    setFormData(p => ({
      ...p,
      photos: p.photos.filter(p => p.id !== id)
    }));
  };

  // 1-Click Record Arrival
  const handleRecordArrivalNow = () => {
    const now = new Date();
    setFormData(p => ({
      ...p,
      arrival_date: now.toISOString().slice(0, 10),
      arrival_time: now.toTimeString().slice(0, 5),
      status: 'On Site'
    }));
    showToast('Arrival time recorded as On Site!', 'info');
  };

  // 1-Click Record Completion
  const handleRecordCompletionNow = () => {
    const now = new Date();
    setFormData(p => ({
      ...p,
      completion_date: now.toISOString().slice(0, 10),
      completion_time: now.toTimeString().slice(0, 5),
      status: p.status === 'On Site' || p.status === 'In Progress' ? 'Rectified' : p.status
    }));
    showToast('Completion time recorded!', 'info');
  };

  // Save form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customer_name) {
      showToast('Customer name is required', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const url = isNew ? '/api/emergency-calls' : `/api/emergency-calls/${call.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser.role,
          'x-user-id': currentUser.id
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        const saved = await res.json();
        showToast(
          isNew 
            ? `Emergency Call-Out ${saved.call_number} logged successfully!` 
            : `Emergency Call ${saved.call_number} updated`, 
          'success'
        );
        if (onSaved) onSaved(saved);
        onClose();
      } else {
        const err = await res.json();
        showToast(err.message || 'Failed saving emergency call', 'error');
      }
    } catch (err) {
      showToast('Network error saving emergency call', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCustomerObj = customersList.find(c => c.id === formData.customer_id);
  const supervisorsList = usersList.filter(u => ['Supervisor', 'Engineer', 'GM', 'Projects Manager'].includes(u.role));
  const techniciansList = usersList.filter(u => ['Technician', 'Supervisor'].includes(u.role));

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto select-none">
      <div className="bg-white w-full max-w-3xl rounded-t-3xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl text-xs space-y-4 max-h-[94vh] overflow-y-auto animate-in slide-in-from-bottom">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-red-100 text-red-700 animate-pulse">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-slate-900">
                  {isNew ? 'Log Emergency Call-Out' : `Emergency Call: ${call.call_number}`}
                </h3>
                {!isNew && (
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                    formData.priority === 'Critical' ? 'bg-red-600 text-white' :
                    formData.priority === 'High' ? 'bg-orange-500 text-white' : 'bg-amber-100 text-amber-900'
                  }`}>
                    {formData.priority}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                {isNew 
                  ? 'Immediate response protocol • Auto-assigns sequential ECO & ECR numbers' 
                  : `Report Status: ${formData.report_status} • Status: ${formData.status}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-sm"
          >
            ✕
          </button>
        </div>

        {/* Warning if report is locked */}
        {isLocked && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-amber-900">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>This report is officially Approved and locked. You are viewing it in read-only mode.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* SECTION 1: INCIDENT & SITE INFO */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="font-black text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 pb-1 border-b border-slate-200">
              <MapPin className="w-3.5 h-3.5 text-red-600" />
              <span>1. Incident Classification &amp; Location</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Priority */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Emergency Priority *</label>
                <select
                  disabled={isLocked}
                  value={formData.priority}
                  onChange={(e) => setFormData(p => ({ ...p, priority: e.target.value }))}
                  className={`w-full p-2.5 rounded-xl font-black text-xs border ${
                    formData.priority === 'Critical' ? 'bg-red-50 text-red-700 border-red-300' :
                    formData.priority === 'High' ? 'bg-orange-50 text-orange-700 border-orange-300' :
                    formData.priority === 'Medium' ? 'bg-amber-50 text-amber-800 border-amber-300' :
                    'bg-blue-50 text-blue-700 border-blue-300'
                  }`}
                >
                  <option value="Critical">🔴 Critical (Immediate Life / Property Threat)</option>
                  <option value="High">🟠 High (Fire Protection Impairment / Leak)</option>
                  <option value="Medium">🟡 Medium (Intermittent Device / Warning)</option>
                  <option value="Low">🔵 Low (Minor Sensor Notice / Non-Urgent)</option>
                </select>
              </div>

              {/* Protected System */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Protected System *</label>
                <select
                  disabled={isLocked}
                  value={formData.system}
                  onChange={(e) => setFormData(p => ({ ...p, system: e.target.value }))}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 text-xs"
                >
                  <option value="Fire Alarm">Fire Alarm &amp; Detection (FACP)</option>
                  <option value="Fire Fighting">Fire Fighting Pumps &amp; Hydrants</option>
                  <option value="Sprinkler">Sprinkler System (Pendant / Upright)</option>
                  <option value="Suppression">Gas Suppression (FM200 / Novec)</option>
                  <option value="Smoke Control">Smoke Ventilation / Extract Damper</option>
                  <option value="Other Emergency">Other Emergency System</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Current Status</label>
                <select
                  disabled={isLocked}
                  value={formData.status}
                  onChange={(e) => setFormData(p => ({ ...p, status: e.target.value }))}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 text-xs"
                >
                  <option value="New">New</option>
                  <option value="Assigned">Assigned</option>
                  <option value="En Route">En Route</option>
                  <option value="On Site">On Site</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Pending Material">Pending Material</option>
                  <option value="Pending Customer">Pending Customer</option>
                  <option value="Rectified">Rectified</option>
                  <option value="Report Submitted">Report Submitted</option>
                  {isGM && <option value="Approved">Approved</option>}
                  {isGM && <option value="Closed">Closed</option>}
                  {isGM && <option value="Cancelled">Cancelled</option>}
                </select>
              </div>
            </div>

            {/* Customer & Site Pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Customer *</label>
                {customersList.length > 0 ? (
                  <select
                    disabled={isLocked}
                    value={formData.customer_id}
                    onChange={(e) => handleCustomerChange(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 text-xs"
                  >
                    {customersList.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    disabled={isLocked}
                    placeholder="Customer Name"
                    value={formData.customer_name}
                    onChange={(e) => setFormData(p => ({ ...p, customer_name: e.target.value }))}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 text-xs"
                  />
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Facility / Site Name *</label>
                {selectedCustomerObj?.sites?.length > 0 ? (
                  <select
                    disabled={isLocked}
                    value={formData.site_id}
                    onChange={(e) => handleSiteChange(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 text-xs"
                  >
                    {selectedCustomerObj.sites.map(s => (
                      <option key={s.id} value={s.id}>{s.site_name}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    disabled={isLocked}
                    placeholder="Site / Building Name"
                    value={formData.site_name}
                    onChange={(e) => setFormData(p => ({ ...p, site_name: e.target.value }))}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 text-xs"
                  />
                )}
              </div>
            </div>

            {/* Emergency Type & Description */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Emergency Nature / Type *</label>
                <input
                  type="text"
                  required
                  disabled={isLocked}
                  placeholder="e.g. Main Fire Pump Controller Malfunction & Pressure Bleed"
                  value={formData.emergency_type}
                  onChange={(e) => setFormData(p => ({ ...p, emergency_type: e.target.value }))}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Client Contact &amp; Phone</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    disabled={isLocked}
                    placeholder="Contact Person"
                    value={formData.contact_person}
                    onChange={(e) => setFormData(p => ({ ...p, contact_person: e.target.value }))}
                    className="w-1/2 p-2.5 bg-white border border-slate-200 rounded-xl font-semibold text-xs"
                  />
                  <input
                    type="text"
                    disabled={isLocked}
                    placeholder="+973 3900 0000"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData(p => ({ ...p, contact_phone: e.target.value }))}
                    className="w-1/2 p-2.5 bg-white border border-slate-200 rounded-xl font-mono text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Reported Problem */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Reported Problem Description *</label>
              <textarea
                rows={2}
                required
                disabled={isLocked}
                placeholder="Describe the urgent symptom reported by client or alarm panel..."
                value={formData.reported_problem}
                onChange={(e) => setFormData(p => ({ ...p, reported_problem: e.target.value, emergency_description: e.target.value }))}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
              />
            </div>
          </div>

          {/* SECTION 2: DISPATCH & TEAM ASSIGNMENT */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="font-black text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 pb-1 border-b border-slate-200">
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span>2. Field Team &amp; Operational Timings</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Supervisor Assignment */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Assigned Supervisor *</label>
                <select
                  disabled={!canAssign || isLocked}
                  value={formData.assigned_supervisor_id}
                  onChange={(e) => {
                    const u = usersList.find(x => x.id === e.target.value);
                    setFormData(p => ({
                      ...p,
                      assigned_supervisor_id: e.target.value,
                      assigned_supervisor_name: u ? u.name : ''
                    }));
                  }}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 text-xs"
                >
                  <option value="">-- Select Supervisor --</option>
                  {supervisorsList.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>

              {/* Technician Assignment */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Assigned Technician *</label>
                <select
                  disabled={!canAssign || isLocked}
                  value={formData.assigned_technician_id}
                  onChange={(e) => {
                    const u = usersList.find(x => x.id === e.target.value);
                    setFormData(p => ({
                      ...p,
                      assigned_technician_id: e.target.value,
                      assigned_technician_name: u ? u.name : '',
                      status: p.status === 'New' ? 'Assigned' : p.status
                    }));
                  }}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 text-xs"
                >
                  <option value="">-- Select Technician --</option>
                  {techniciansList.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Timings: Call Time, Arrival Time, Completion Time */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Call Logged Time</label>
                <div className="flex gap-1.5">
                  <input
                    type="date"
                    disabled={isLocked}
                    value={formData.call_date}
                    onChange={(e) => setFormData(p => ({ ...p, call_date: e.target.value }))}
                    className="w-1/2 p-2 bg-white border border-slate-200 rounded-lg text-[11px]"
                  />
                  <input
                    type="time"
                    disabled={isLocked}
                    value={formData.call_time}
                    onChange={(e) => setFormData(p => ({ ...p, call_time: e.target.value }))}
                    className="w-1/2 p-2 bg-white border border-slate-200 rounded-lg text-[11px] font-mono"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-600">Arrival On Site</label>
                  {!isLocked && (
                    <button
                      type="button"
                      onClick={handleRecordArrivalNow}
                      className="text-[10px] font-black text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200"
                    >
                      ⚡ Now
                    </button>
                  )}
                </div>
                <div className="flex gap-1.5">
                  <input
                    type="date"
                    disabled={isLocked}
                    value={formData.arrival_date || formData.call_date}
                    onChange={(e) => setFormData(p => ({ ...p, arrival_date: e.target.value }))}
                    className="w-1/2 p-2 bg-white border border-slate-200 rounded-lg text-[11px]"
                  />
                  <input
                    type="time"
                    disabled={isLocked}
                    value={formData.arrival_time}
                    onChange={(e) => setFormData(p => ({ ...p, arrival_time: e.target.value }))}
                    className="w-1/2 p-2 bg-white border border-slate-200 rounded-lg text-[11px] font-mono"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-600">Completion Time</label>
                  {!isLocked && (
                    <button
                      type="button"
                      onClick={handleRecordCompletionNow}
                      className="text-[10px] font-black text-blue-600 hover:text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200"
                    >
                      ⚡ Now
                    </button>
                  )}
                </div>
                <div className="flex gap-1.5">
                  <input
                    type="date"
                    disabled={isLocked}
                    value={formData.completion_date || formData.call_date}
                    onChange={(e) => setFormData(p => ({ ...p, completion_date: e.target.value }))}
                    className="w-1/2 p-2 bg-white border border-slate-200 rounded-lg text-[11px]"
                  />
                  <input
                    type="time"
                    disabled={isLocked}
                    value={formData.completion_time}
                    onChange={(e) => setFormData(p => ({ ...p, completion_time: e.target.value }))}
                    className="w-1/2 p-2 bg-white border border-slate-200 rounded-lg text-[11px] font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: TECHNICAL FINDINGS & RECTIFICATION (Field Entry) */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="font-black text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 pb-1 border-b border-slate-200">
              <Wrench className="w-3.5 h-3.5 text-emerald-600" />
              <span>3. Technical Findings, Cause &amp; Rectification</span>
            </h4>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Inspection Findings on Arrival</label>
              <textarea
                rows={2}
                disabled={!canEditTechnical}
                placeholder="Observed physical status, panel logs, pressure gauges, device addresses..."
                value={formData.findings}
                onChange={(e) => setFormData(p => ({ ...p, findings: e.target.value }))}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Root Cause</label>
                <textarea
                  rows={2}
                  disabled={!canEditTechnical}
                  placeholder="e.g. Electrical surge, water intrusion, AC dust, cable break..."
                  value={formData.cause}
                  onChange={(e) => setFormData(p => ({ ...p, cause: e.target.value }))}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Action Taken</label>
                <textarea
                  rows={2}
                  disabled={!canEditTechnical}
                  placeholder="Immediate emergency measures and field tasks executed..."
                  value={formData.action_taken}
                  onChange={(e) => setFormData(p => ({ ...p, action_taken: e.target.value }))}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Final Rectification &amp; Testing</label>
              <textarea
                rows={2}
                disabled={!canEditTechnical}
                placeholder="Details of test results, reset verified, NFPA normalization confirmation..."
                value={formData.rectification}
                onChange={(e) => setFormData(p => ({ ...p, rectification: e.target.value }))}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
              />
            </div>

            {/* Materials Used */}
            <div className="pt-2 border-t border-slate-200">
              <label className="block font-bold text-slate-700 mb-1.5">Materials &amp; Replacement Parts Supplied</label>
              
              {/* Existing items table */}
              {formData.materials_used.length > 0 && (
                <div className="mb-2 border border-slate-200 rounded-xl overflow-hidden bg-white">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold text-[10px] uppercase">
                      <tr>
                        <th className="p-2">Item</th>
                        <th className="p-2">Part No</th>
                        <th className="p-2 text-right">Qty</th>
                        {!isLocked && <th className="p-2 text-center w-8"></th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {formData.materials_used.map((m, idx) => (
                        <tr key={idx}>
                          <td className="p-2 font-bold text-slate-900">{m.name}</td>
                          <td className="p-2 font-mono text-[11px] text-slate-600">{m.part_number || '-'}</td>
                          <td className="p-2 text-right font-bold text-slate-900">{m.quantity} {m.unit}</td>
                          {!isLocked && (
                            <td className="p-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveMaterial(idx)}
                                className="text-red-500 hover:text-red-700 p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Add Material row */}
              {!isLocked && canEditTechnical && (
                <div className="flex flex-wrap sm:flex-nowrap gap-2 items-center bg-white p-2 rounded-xl border border-slate-200">
                  <input
                    type="text"
                    placeholder="Item / Spare part name"
                    value={newMaterial.name}
                    onChange={(e) => setNewMaterial(p => ({ ...p, name: e.target.value }))}
                    className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                  />
                  <input
                    type="text"
                    placeholder="Part #"
                    value={newMaterial.part_number}
                    onChange={(e) => setNewMaterial(p => ({ ...p, part_number: e.target.value }))}
                    className="w-24 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                  <input
                    type="number"
                    min="1"
                    placeholder="Qty"
                    value={newMaterial.quantity}
                    onChange={(e) => setNewMaterial(p => ({ ...p, quantity: e.target.value }))}
                    className="w-16 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-center"
                  />
                  <button
                    type="button"
                    onClick={handleAddMaterial}
                    className="px-3 py-2 bg-navy-900 hover:bg-navy-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              )}
            </div>

            {/* Recommendations */}
            <div className="pt-2 border-t border-slate-200">
              <label className="block font-bold text-slate-700 mb-1">Engineering Recommendations</label>
              <input
                type="text"
                disabled={!canEditTechnical}
                placeholder="Recommendations for future maintenance or preventative actions..."
                value={formData.recommendations}
                onChange={(e) => setFormData(p => ({ ...p, recommendations: e.target.value }))}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
              />
            </div>
          </div>

          {/* SECTION 4: EMERGENCY PHOTOS (Before / During / After) */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="font-black text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 pb-1 border-b border-slate-200">
              <Camera className="w-3.5 h-3.5 text-blue-600" />
              <span>4. Emergency Photographic Evidence (Before / During / After)</span>
            </h4>

            {/* Photo list */}
            {formData.photos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {formData.photos.map((p, idx) => (
                  <div key={p.id || idx} className="border border-slate-200 rounded-xl overflow-hidden bg-white flex flex-col relative group">
                    <div className="relative aspect-video bg-slate-900">
                      <img src={p.url} alt={p.caption} className="w-full h-full object-cover" />
                      <span className={`absolute top-1 left-1 px-1.5 py-0.2 rounded text-[9px] font-black text-white ${
                        p.category === 'Before' ? 'bg-red-600' :
                        p.category === 'After' ? 'bg-emerald-600' : 'bg-blue-600'
                      }`}>
                        {p.category}
                      </span>
                      {!isLocked && (
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(p.id)}
                          className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-80 hover:opacity-100 shadow"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <p className="p-1.5 text-[10px] text-slate-700 font-medium truncate">{p.caption}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center bg-white rounded-xl border border-dashed border-slate-300 text-slate-400 text-xs">
                No site photos attached yet. Add Before, During, or After evidence photos.
              </div>
            )}

            {/* Photo Upload Controls */}
            {!isLocked && canEditTechnical && (
              <div className="p-3 bg-white rounded-xl border border-slate-200 flex flex-wrap sm:flex-nowrap gap-2 items-center">
                <select
                  value={photoCategory}
                  onChange={(e) => setPhotoCategory(e.target.value)}
                  className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                >
                  <option value="Before">🔴 Before (Damage / Leak)</option>
                  <option value="During">🔵 During (Work in Progress)</option>
                  <option value="After">🟢 After (Rectified &amp; Clean)</option>
                </select>

                <input
                  type="text"
                  placeholder="Photo caption (e.g. Broken sensing pipe on jockey pump)"
                  value={photoCaption}
                  onChange={(e) => setPhotoCaption(e.target.value)}
                  className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
                />

                <label className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-all shrink-0">
                  <Camera className="w-3.5 h-3.5" />
                  <span>Take / Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>

          {/* SECTION 5: SIGNATURES & SIGN-OFFS */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="font-black text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 pb-1 border-b border-slate-200">
              <PenTool className="w-3.5 h-3.5 text-navy-900" />
              <span>5. Digital Signatures &amp; Customer Verification</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              {/* Customer Representative Card */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 flex flex-col justify-between h-44">
                <div>
                  <span className="text-[10px] font-black uppercase text-red-700 block">Customer Representative</span>
                  <input
                    type="text"
                    disabled={isLocked}
                    placeholder="Rep Full Name"
                    value={formData.customer_rep_name}
                    onChange={(e) => setFormData(p => ({ ...p, customer_rep_name: e.target.value }))}
                    className="w-full mt-1 p-1 bg-slate-50 border border-slate-200 rounded text-xs font-bold"
                  />
                  <input
                    type="text"
                    disabled={isLocked}
                    placeholder="Designation"
                    value={formData.customer_rep_designation}
                    onChange={(e) => setFormData(p => ({ ...p, customer_rep_designation: e.target.value }))}
                    className="w-full mt-1 p-1 bg-slate-50 border border-slate-200 rounded text-[10px]"
                  />
                </div>

                <div className="h-16 flex items-center justify-center my-1 bg-slate-50 rounded border border-dashed border-red-200 overflow-hidden">
                  {formData.customer_signature ? (
                    <img src={formData.customer_signature} alt="Customer Sig" className="max-h-full object-contain" />
                  ) : (
                    <span className="text-[10px] text-slate-400">Not signed</span>
                  )}
                </div>

                {!isLocked && (
                  <button
                    type="button"
                    onClick={() => {
                      setSignatureTarget('customer');
                      setShowSignaturePad(true);
                    }}
                    className="w-full py-1.5 bg-red-50 hover:bg-red-100 text-red-800 rounded font-bold text-[10px] border border-red-200"
                  >
                    {formData.customer_signature ? 'Re-capture Signature' : '✍️ Capture Signature'}
                  </button>
                )}
              </div>

              {/* Technician Signature Card */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 flex flex-col justify-between h-44">
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-500 block">Field Technician</span>
                  <p className="font-bold text-slate-900 mt-1 truncate">{formData.assigned_technician_name || currentUser.name}</p>
                </div>

                <div className="h-16 flex items-center justify-center my-1 bg-slate-50 rounded border border-dashed border-slate-200 overflow-hidden">
                  {formData.technician_signature ? (
                    <img src={formData.technician_signature} alt="Tech Sig" className="max-h-full object-contain" />
                  ) : (
                    <span className="text-[10px] text-slate-400">Not signed</span>
                  )}
                </div>

                {!isLocked && (
                  <button
                    type="button"
                    onClick={() => {
                      setSignatureTarget('technician');
                      setShowSignaturePad(true);
                    }}
                    className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-bold text-[10px] border border-slate-300"
                  >
                    {formData.technician_signature ? 'Re-sign Technician' : '✍️ Sign as Technician'}
                  </button>
                )}
              </div>

              {/* Supervisor Signature Card */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 flex flex-col justify-between h-44">
                <div>
                  <span className="text-[10px] font-black uppercase text-blue-700 block">Supervisor Sign-off</span>
                  <p className="font-bold text-slate-900 mt-1 truncate">{formData.assigned_supervisor_name || 'Supervisor'}</p>
                </div>

                <div className="h-16 flex items-center justify-center my-1 bg-slate-50 rounded border border-dashed border-blue-200 overflow-hidden">
                  {formData.supervisor_signature ? (
                    <img src={formData.supervisor_signature} alt="Supervisor Sig" className="max-h-full object-contain" />
                  ) : (
                    <span className="text-[10px] text-slate-400">Not signed</span>
                  )}
                </div>

                {!isLocked && (isSupervisor || isEngineer || isGM) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSignatureTarget('supervisor');
                      setShowSignaturePad(true);
                    }}
                    className="w-full py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded font-bold text-[10px] border border-blue-200"
                  >
                    {formData.supervisor_signature ? 'Re-sign Supervisor' : '✍️ Sign as Supervisor'}
                  </button>
                )}
              </div>

            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs"
            >
              Cancel
            </button>

            {!isLocked && (
              <div className="w-full sm:w-auto flex items-center gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 sm:flex-none px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-xs shadow-md shadow-red-900/20 disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{submitting ? 'Saving...' : (isNew ? 'Create Emergency Call' : 'Save Emergency Record')}</span>
                </button>
              </div>
            )}
          </div>

        </form>

        {/* Signature Pad Modal Overlay */}
        {showSignaturePad && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 animate-in fade-in">
            <SignaturePad
              title={
                signatureTarget === 'customer' ? 'Customer Representative Signature' :
                signatureTarget === 'technician' ? 'Field Technician Signature' :
                'Service Supervisor Sign-off'
              }
              initialName={
                signatureTarget === 'customer' ? formData.customer_rep_name :
                signatureTarget === 'technician' ? formData.assigned_technician_name :
                formData.assigned_supervisor_name
              }
              initialDesignation={
                signatureTarget === 'customer' ? formData.customer_rep_designation :
                signatureTarget === 'technician' ? 'Certified Fire Technician' :
                'Senior Field Supervisor'
              }
              onSave={({ signatureDataUrl, repName, designation, signedDate }) => {
                if (signatureTarget === 'customer') {
                  setFormData(p => ({
                    ...p,
                    customer_signature: signatureDataUrl,
                    customer_rep_name: repName || p.customer_rep_name,
                    customer_rep_designation: designation || p.customer_rep_designation,
                    customer_signature_date: signedDate
                  }));
                } else if (signatureTarget === 'technician') {
                  setFormData(p => ({
                    ...p,
                    technician_signature: signatureDataUrl,
                    technician_signed_date: signedDate
                  }));
                } else {
                  setFormData(p => ({
                    ...p,
                    supervisor_signature: signatureDataUrl,
                    supervisor_signed_date: signedDate
                  }));
                }
                setShowSignaturePad(false);
                showToast('Signature captured successfully', 'success');
              }}
              onCancel={() => setShowSignaturePad(false)}
            />
          </div>
        )}

      </div>
    </div>
  );
}
