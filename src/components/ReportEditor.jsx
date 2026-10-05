import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  FileText, Sparkles, PenTool, Check, Camera, Plus, 
  Trash2, Shield, Calendar, Building2, User, ArrowLeft, UserCheck
} from 'lucide-react';
import SignaturePad from './SignaturePad';

export default function ReportEditor({ initialData, onSave, onCancel }) {
  const { currentUser, showToast, setActiveModal } = useApp();

  const [customers, setCustomers] = useState([]);
  const [sites, setSites] = useState([]);
  const [amcs, setAmcs] = useState([]);
  const [materials, setMaterials] = useState([]);

  const [formData, setFormData] = useState({
    report_type: initialData?.report_type || 'AMC Service Report',
    quarter: initialData?.quarter || 'Q1',
    customer_id: initialData?.customer_id || '',
    site_id: initialData?.site_id || '',
    amc_id: initialData?.amc_id || '',
    amc_contract_number: initialData?.amc_contract_number || '',
    job_number: initialData?.job_number || '',
    date: initialData?.date || new Date().toISOString().slice(0, 10),
    amc_start_date: initialData?.amc_start_date || '',
    amc_end_date: initialData?.amc_end_date || '',
    visit_number: initialData?.visit_number || 'Visit #3 of 4',
    system: initialData?.system || 'Fire Alarm & Firefighting Systems',
    work_description: initialData?.work_description || '',
    faults_found: initialData?.faults_found || '',
    rectifications: initialData?.rectifications || '',
    pending_works: initialData?.pending_works || '',
    recommendations: initialData?.recommendations || '',
    testing_performed: initialData?.testing_performed || 'Full functional evacuation alarm and pump flow test completed.',
    result: initialData?.result || 'Satisfactory. System left fully operational and normal.',
    remarks: initialData?.remarks || '',
    materials_used: initialData?.materials_used || [],
    photos: initialData?.photos || [],
    customer_rep_name: initialData?.customer_rep_name || 'Omar Farooq',
    customer_rep_designation: initialData?.customer_rep_designation || 'Director of Facilities Management',
    customer_signature: initialData?.customer_signature || '',
    supervisor_signature: initialData?.supervisor_signature || '',
    status: initialData?.status || 'Draft'
  });

  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signatureTarget, setSignatureTarget] = useState('customer'); // 'customer' | 'supervisor'

  const [docNumberPreview, setDocNumberPreview] = useState(
    initialData?.document_number || initialData?.report_number || ''
  );

  // Fetch real-time preview of next available FX Document Number
  useEffect(() => {
    if (initialData?.id) return;
    let isCancelled = false;
    const fetchNextNumber = async () => {
      try {
        const res = await fetch(`/api/reports/next-number?job_type=${encodeURIComponent(formData.report_type || 'AMC')}&date=${encodeURIComponent(formData.date || new Date().toISOString().slice(0, 10))}`, {
          headers: { 'x-user-role': currentUser.role, 'x-user-id': currentUser.id }
        });
        if (res.ok) {
          const data = await res.json();
          if (!isCancelled && data.document_number) {
            setDocNumberPreview(data.document_number);
          }
        }
      } catch (e) {
        console.warn('Failed previewing next document number', e);
      }
    };
    fetchNextNumber();
    return () => { isCancelled = true; };
  }, [formData.report_type, formData.date, initialData?.id, currentUser]);

  // Load auxiliary data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resCust, resSites, resAmc, resMat] = await Promise.all([
          fetch('/api/customers', { headers: { 'x-user-role': currentUser.role, 'x-user-id': currentUser.id } }),
          fetch('/api/sites', { headers: { 'x-user-role': currentUser.role, 'x-user-id': currentUser.id } }),
          fetch('/api/amc-contracts', { headers: { 'x-user-role': currentUser.role, 'x-user-id': currentUser.id } }),
          fetch('/api/materials', { headers: { 'x-user-role': currentUser.role, 'x-user-id': currentUser.id } })
        ]);
        if (resCust.ok) setCustomers(await resCust.json());
        if (resSites.ok) setSites(await resSites.json());
        if (resAmc.ok) setAmcs(await resAmc.json());
        if (resMat.ok) setMaterials(await resMat.json());
      } catch (e) {
        console.warn('Failed loading editor dropdowns', e);
      }
    };
    fetchData();
  }, [currentUser]);

  // When Customer is changed, update customer and filter AMC contracts/sites
  const handleCustomerChange = (customerId) => {
    const custAmcs = amcs.filter((a) => a.customer_id === customerId);
    const custSites = sites.filter((s) => s.customer_id === customerId);
    const keepAmc = custAmcs.find((a) => a.id === formData.amc_id);
    const keepSite = custSites.find((s) => s.id === formData.site_id);

    setFormData((prev) => ({
      ...prev,
      customer_id: customerId,
      site_id: keepSite ? prev.site_id : (custSites.length > 0 ? custSites[0].id : ''),
      amc_id: keepAmc ? prev.amc_id : ''
    }));

    if (keepAmc) {
      handleAMCChange(keepAmc.id);
    } else if (custAmcs.length === 1) {
      handleAMCChange(custAmcs[0].id);
    }
  };

  // When AMC is selected, automatically populate start date, end date, contract period, customer and site
  const handleAMCChange = (amcId) => {
    const selected = amcs.find((a) => a.id === amcId);
    if (selected) {
      const period = selected.start_date && selected.end_date ? `${selected.start_date} to ${selected.end_date}` : '';
      setFormData((prev) => ({
        ...prev,
        amc_id: amcId,
        amc_contract_number: selected.contract_number,
        customer_id: selected.customer_id || prev.customer_id,
        site_id: selected.site_id || prev.site_id,
        amc_start_date: selected.start_date,
        amc_end_date: selected.end_date,
        contract_start_date: selected.start_date,
        contract_end_date: selected.end_date,
        contract_period: period,
        sales_person_id: selected.sales_person_id,
        sales_person_name: selected.sales_person_name
      }));
    } else {
      setFormData((prev) => ({ ...prev, amc_id: amcId }));
    }
  };

  // Add material to list
  const addMaterialItem = (matId) => {
    const mat = materials.find((m) => m.id === matId);
    if (!mat) return;
    setFormData((prev) => ({
      ...prev,
      materials_used: [
        ...prev.materials_used,
        { material_id: mat.id, name: mat.name, quantity: 1 }
      ]
    }));
  };

  const removeMaterialItem = (idx) => {
    setFormData((prev) => ({
      ...prev,
      materials_used: prev.materials_used.filter((_, i) => i !== idx)
    }));
  };

  // Compress image
  const compressImage = (file, callback) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const scale = MAX_WIDTH / img.width;
        canvas.width = Math.min(img.width, MAX_WIDTH);
        canvas.height = img.width > MAX_WIDTH ? img.height * scale : img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        callback(canvas.toDataURL('image/jpeg', 0.7));
      };
    };
  };

  const handlePhotoUpload = (e, tag = 'Before') => {
    const file = e.target.files?.[0];
    if (!file) return;
    compressImage(file, (dataUrl) => {
      setFormData((prev) => ({
        ...prev,
        photos: [
          ...prev.photos,
          {
            url: dataUrl,
            tag,
            caption: `${tag} service photo`
          }
        ]
      }));
      showToast('Photo added', 'success');
    });
  };

  const canPrepare = ['Projects Manager', 'Engineer', 'Supervisor', 'Technician'].includes(currentUser?.role);

  // If user is not authorized to prepare reports and this is a new report draft, block access
  if (!canPrepare && !initialData?.id) {
    return (
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm text-center space-y-4 max-w-lg mx-auto mt-6">
        <div className="w-14 h-14 bg-red-50 text-safety-red rounded-full flex items-center justify-center mx-auto border border-red-200">
          <Shield className="w-7 h-7" />
        </div>
        <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">Report Preparation Restricted</h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          Operational reports in the FIREX Safety Management System can strictly only be prepared by authorized technical and project roles:
          <span className="block font-black text-navy-900 mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            Projects Manager • Engineer • Supervisor • Technician
          </span>
        </p>
        <p className="text-[11px] text-slate-500">
          Your current authenticated role is <strong className="text-slate-800">{currentUser?.role}</strong> ({currentUser?.name}). You have view/review/approval access according to system permissions, but cannot create operational reports.
        </p>
        <button
          onClick={onCancel}
          className="px-5 py-2.5 bg-navy-900 text-white rounded-xl text-xs font-bold hover:bg-navy-800 transition-colors shadow-sm"
        >
          Return to Reports
        </button>
      </div>
    );
  }

  const handleSubmit = (targetStatus) => {
    if (!formData.site_id) {
      showToast('Please select a customer and site', 'error');
      return;
    }
    const finalReport = {
      ...formData,
      status: targetStatus,
      document_number: initialData?.document_number || docNumberPreview || undefined,
      report_number: initialData?.report_number || docNumberPreview || undefined,
      // Immutable Prepared By Identity
      prepared_by_name: initialData?.prepared_by_name || currentUser.name,
      prepared_by_role: initialData?.prepared_by_role || currentUser.role,
      prepared_by_user_id: initialData?.prepared_by_user_id || currentUser.id,
      created_by_user_id: initialData?.created_by_user_id || currentUser.id,
      technician_name: currentUser.role === 'Technician' ? currentUser.name : (formData.technician_name || currentUser.name),
      supervisor_name: currentUser.role === 'Supervisor' ? currentUser.name : (formData.supervisor_name || 'Tariq Mahmoud')
    };
    onSave(finalReport);
  };

  const ALL_REPORT_TYPES = [
    'AMC Service Report',
    'Work Completion Report',
    'Fault Report',
    'Inspection Report',
    'Testing & Commissioning Report',
    'Emergency Call-Out Report',
    'Project Report',
    'Fit-Out Report',
    'Installation Report',
    'Breakdown Report',
    'Supply Report'
  ];

  return (
    <div className="space-y-4 pb-28">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
        <button
          onClick={onCancel}
          className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Cancel</span>
        </button>
        <h1 className="text-sm sm:text-base font-extrabold text-slate-900">
          {initialData?.id ? `Edit Report: ${initialData.report_number}` : 'Create Service Report'}
        </h1>
        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800">
          {formData.status}
        </span>
      </div>

      {/* Main Form Fields */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4 text-xs">
        
        {/* Creator Identity & Audit Card (Automatic Server-Side Capture) */}
        <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-navy-900 text-white p-3.5 rounded-xl border border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-300 block">Report Preparation Identity</span>
                <span className="text-xs font-bold text-white">
                  {initialData?.prepared_by_name || currentUser?.name}
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white/10 text-white border border-white/20">
              {initialData?.prepared_by_role || currentUser?.role}
            </span>
          </div>
          <div className="pt-2 border-t border-white/10 grid grid-cols-2 gap-2 text-[10px] text-slate-300">
            <div>
              <span className="text-slate-400 block">User ID Reference:</span>
              <span className="font-mono text-white">{initialData?.prepared_by_user_id || currentUser?.id}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Prepared Date:</span>
              <span className="font-mono text-emerald-400 font-bold">
                {initialData?.prepared_date || new Date().toISOString().slice(0, 10)} {initialData?.prepared_time ? `(${initialData.prepared_time})` : '(Auto-Recorded)'}
              </span>
            </div>
          </div>
          <p className="text-[9px] text-slate-400 italic">
            * Identity is automatically captured server-side from your authenticated account and locked into the permanent audit trail. Manual name entry is strictly disallowed.
          </p>
        </div>

        {/* Official Document Number Banner (Requirements 1-5, 9) */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-navy-900 text-white flex items-center justify-center font-black text-sm tracking-wider shadow-sm">
              FX
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                Official Document Number (Automatic Sequence)
              </span>
              <span className="text-sm sm:text-base font-mono font-black text-navy-900 tracking-tight">
                {docNumberPreview || 'Generating FX Sequence...'}
              </span>
            </div>
          </div>
          <div className="sm:text-right">
            <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-900 border border-blue-200">
              FX [JOB TYPE] RPT-[MM]-[RUNNING NUMBER]
            </span>
            <span className="block text-[9px] text-slate-500 mt-1">
              • Sequence resets to 001 each month • Zero manual entry • Duplicate protected
            </span>
          </div>
        </div>

        {/* Report Type Selector */}
        <div>
          <label className="block font-bold text-slate-700 mb-1">Report Document Type *</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5">
            {ALL_REPORT_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFormData((p) => ({ ...p, report_type: type }))}
                className={`py-2 px-2 rounded-xl font-bold border transition-colors text-center text-[11px] ${
                  formData.report_type === type
                    ? 'bg-navy-900 text-white border-navy-900 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* 1. Customer & Site Selection (Must precede AMC contract) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Customer / Company *</label>
            <select
              required
              value={formData.customer_id}
              onChange={(e) => handleCustomerChange(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
            >
              <option value="">-- Select Registered Customer --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Site / Facility *</label>
            <select
              required
              value={formData.site_id}
              onChange={(e) => setFormData((p) => ({ ...p, site_id: e.target.value }))}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
            >
              <option value="">-- Select Site --</option>
              {(formData.customer_id ? sites.filter(s => s.customer_id === formData.customer_id) : sites).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.site_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 2. AMC Contract & Quarter Selection (Filtered strictly to Customer) */}
        {formData.report_type === 'AMC Service Report' && (
          <div className="bg-blue-50/60 p-3.5 rounded-xl border border-blue-200 space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-bold text-blue-900 text-xs">
                  Select AMC Contract (Filtered to Customer) *
                </label>
                {formData.customer_id && (
                  <span className="text-[10px] text-blue-700 font-bold">
                    {(amcs.filter(a => a.customer_id === formData.customer_id)).length} active contracts found
                  </span>
                )}
              </div>
              <select
                value={formData.amc_id}
                onChange={(e) => handleAMCChange(e.target.value)}
                className="w-full p-2.5 bg-white border border-blue-300 rounded-xl font-medium text-xs"
              >
                <option value="">
                  {formData.customer_id ? '-- Choose AMC Contract --' : '-- Please Select Customer First --'}
                </option>
                {(formData.customer_id ? amcs.filter(a => a.customer_id === formData.customer_id) : amcs).map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.contract_number} • {a.site_name} ({a.contract_status || 'Active'})
                  </option>
                ))}
              </select>
            </div>

            {/* Quarter Selector (Q1, Q2, Q3, Q4) */}
            <div>
              <label className="block font-bold text-blue-900 text-xs mb-1.5">
                AMC Quarter / Service Cycle *
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['Q1', 'Q2', 'Q3', 'Q4'].map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, quarter: q, visit_number: `Visit #${q.replace('Q', '')} of 4` }))}
                    className={`py-2 rounded-xl font-black text-xs transition-all border ${
                      formData.quarter === q
                        ? 'bg-blue-700 text-white border-blue-800 shadow-sm'
                        : 'bg-white text-slate-700 border-blue-200 hover:bg-blue-100/50'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Auto Filled Start / End Dates */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-700 block">
                  AMC Start Date (Auto-filled)
                </span>
                <input
                  type="date"
                  value={formData.amc_start_date}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData((p) => ({
                      ...p,
                      amc_start_date: val,
                      contract_period: val && p.amc_end_date ? `${val} to ${p.amc_end_date}` : p.contract_period
                    }));
                  }}
                  className="w-full p-2 bg-white border border-blue-200 rounded-lg text-xs"
                />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-700 block">
                  AMC End Date (Auto-filled)
                </span>
                <input
                  type="date"
                  value={formData.amc_end_date}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData((p) => ({
                      ...p,
                      amc_end_date: val,
                      contract_period: p.amc_start_date && val ? `${p.amc_start_date} to ${val}` : p.contract_period
                    }));
                  }}
                  className="w-full p-2 bg-white border border-blue-200 rounded-lg text-xs"
                />
              </div>
            </div>

            {/* AMC Contract Period & Sales Specialist Banner */}
            <div className="bg-white/80 p-2.5 rounded-lg border border-blue-200 text-xs flex items-center justify-between flex-wrap gap-2">
              <div>
                <span className="text-[10px] font-bold text-blue-800 uppercase block">AMC Contract Period</span>
                <span className="font-mono font-bold text-slate-800">
                  {formData.amc_start_date && formData.amc_end_date 
                    ? `${formData.amc_start_date} to ${formData.amc_end_date}` 
                    : (formData.contract_period || '01-Jan-2026 to 31-Dec-2026')}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-blue-800 uppercase block">Sales Specialist</span>
                <span className="font-bold text-slate-800">
                  {formData.sales_person_name || 'Unassigned'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* System & Job Number */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">System Inspected</label>
            <input
              type="text"
              value={formData.system}
              onChange={(e) => setFormData((p) => ({ ...p, system: e.target.value }))}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Job Number Ref</label>
            <input
              type="text"
              value={formData.job_number}
              onChange={(e) => setFormData((p) => ({ ...p, job_number: e.target.value }))}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
            />
          </div>
        </div>

        {/* Work Description with AI Assistant Shortcut */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="font-bold text-slate-700">Work Description &amp; Scope *</label>
            <button
              type="button"
              onClick={() => setActiveModal({
                type: 'ai_assistant',
                onApply: (text) => setFormData((p) => ({ ...p, work_description: text }))
              })}
              className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Polish with AI</span>
            </button>
          </div>
          <textarea
            rows={3}
            required
            value={formData.work_description}
            onChange={(e) => setFormData((p) => ({ ...p, work_description: e.target.value }))}
            placeholder="Describe maintenance or rectification performed..."
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600"
          />
        </div>

        {/* Faults & Rectifications */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Faults Detected</label>
            <textarea
              rows={2}
              value={formData.faults_found}
              onChange={(e) => setFormData((p) => ({ ...p, faults_found: e.target.value }))}
              placeholder="Faults observed on site..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Rectification Carried Out</label>
            <textarea
              rows={2}
              value={formData.rectifications}
              onChange={(e) => setFormData((p) => ({ ...p, rectifications: e.target.value }))}
              placeholder="Action taken to rectify..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
        </div>

        {/* Materials Used Picker */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="font-bold text-slate-700">Materials &amp; Spares Consumed</label>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  addMaterialItem(e.target.value);
                  e.target.value = '';
                }
              }}
              className="text-[11px] p-1 bg-slate-100 rounded-lg border border-slate-300 font-semibold"
            >
              <option value="">+ Add Material</option>
              {materials.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} (Stock: {m.stock})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            {formData.materials_used.map((m, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 bg-slate-50 rounded-xl border border-slate-200 text-xs"
              >
                <span className="font-semibold text-slate-800">{m.name}</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    value={m.quantity}
                    onChange={(e) => {
                      const qty = Number(e.target.value) || 1;
                      setFormData((p) => {
                        const copy = [...p.materials_used];
                        copy[idx].quantity = qty;
                        return { ...p, materials_used: copy };
                      });
                    }}
                    className="w-14 p-1 border border-slate-300 rounded text-center font-bold"
                  />
                  <span className="text-slate-500">Pcs</span>
                  <button
                    type="button"
                    onClick={() => removeMaterialItem(idx)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Photos (Before & After) */}
        <div>
          <label className="block font-bold text-slate-700 mb-1">Site Evidence Photos</label>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <label className="p-3 border border-dashed border-slate-300 rounded-xl bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors">
              <Camera className="w-5 h-5 text-blue-600 mb-1" />
              <span className="font-bold text-slate-700 text-[11px]">+ Add Before Photo</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => handlePhotoUpload(e, 'Before')}
                className="hidden"
              />
            </label>
            <label className="p-3 border border-dashed border-slate-300 rounded-xl bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors">
              <Camera className="w-5 h-5 text-emerald-600 mb-1" />
              <span className="font-bold text-slate-700 text-[11px]">+ Add After Photo</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => handlePhotoUpload(e, 'After')}
                className="hidden"
              />
            </label>
          </div>

          {/* Photo gallery preview */}
          {formData.photos.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {formData.photos.map((p, idx) => (
                <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-200">
                  <img src={p.url} alt="Site" className="w-full h-20 object-cover" />
                  <span className="absolute top-1 left-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                    {p.tag}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        photos: prev.photos.filter((_, i) => i !== idx)
                      }))
                    }
                    className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full text-[10px]"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Digital Signatures Box */}
        <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
          
          {/* Customer Signature Card */}
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
            <span className="font-bold text-slate-800 block">Customer Representative</span>
            <div className="h-16 border border-dashed border-slate-300 rounded-lg bg-white flex items-center justify-center p-1">
              {formData.customer_signature ? (
                <img src={formData.customer_signature} alt="Customer signature" className="max-h-full object-contain" />
              ) : (
                <span className="text-slate-300 text-[11px]">No signature captured</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                setSignatureTarget('customer');
                setShowSignatureModal(true);
              }}
              className="w-full py-2 bg-navy-900 hover:bg-navy-800 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Capture Customer Signature</span>
            </button>
          </div>

          {/* Supervisor / Engineer Sign-off Card */}
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
            <span className="font-bold text-slate-800 block">Supervisor / Engineer Sign-off</span>
            <div className="h-16 border border-dashed border-slate-300 rounded-lg bg-white flex items-center justify-center p-1">
              {formData.supervisor_signature ? (
                <img src={formData.supervisor_signature} alt="Supervisor signature" className="max-h-full object-contain" />
              ) : (
                <span className="text-slate-400 text-[11px] italic">Sign-off pending</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                setSignatureTarget('supervisor');
                setShowSignatureModal(true);
              }}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1 shadow-sm"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Sign as Supervisor / Engineer</span>
            </button>
          </div>

        </div>

      </div>

      {/* Sticky Bottom Save / Submit Bar */}
      <div className="fixed bottom-16 left-0 right-0 z-30 p-3 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg">
        <div className="max-w-md mx-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleSubmit('Draft')}
            className="flex-1 py-3 px-3 rounded-xl border border-slate-300 font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 text-xs transition-colors"
          >
            Save as Draft
          </button>
          <button
            type="button"
            onClick={() => handleSubmit('Submitted')}
            className="flex-1 py-3 px-3 rounded-xl bg-navy-900 hover:bg-navy-800 active:bg-black text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Submit Report</span>
          </button>
        </div>
      </div>

      {/* Signature Modal */}
      {showSignatureModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <SignaturePad
            title={signatureTarget === 'customer' ? "Customer Sign-off" : "Supervisor / Engineer Sign-off"}
            initialName={signatureTarget === 'customer' ? formData.customer_rep_name : (currentUser?.role === 'Supervisor' || currentUser?.role === 'Engineer' || currentUser?.role === 'Projects Manager' ? currentUser.name : (formData.supervisor_name || 'David Thomas'))}
            initialDesignation={signatureTarget === 'customer' ? formData.customer_rep_designation : (currentUser?.role || 'Senior Field Supervisor')}
            onSave={({ signatureDataUrl, repName, designation }) => {
              if (signatureTarget === 'customer') {
                setFormData((p) => ({
                  ...p,
                  customer_signature: signatureDataUrl,
                  customer_rep_name: repName,
                  customer_rep_designation: designation
                }));
              } else {
                setFormData((p) => ({
                  ...p,
                  supervisor_signature: signatureDataUrl,
                  supervisor_name: repName
                }));
              }
              setShowSignatureModal(false);
              showToast('Signature saved', 'success');
            }}
            onCancel={() => setShowSignatureModal(false)}
          />
        </div>
      )}

    </div>
  );
}
