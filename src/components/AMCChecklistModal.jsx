import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  CheckCircle2, XCircle, MinusCircle, Camera, Shield, 
  AlertTriangle, Save, Send, Eye, Plus, Trash2, 
  ChevronDown, ChevronUp, ArrowLeft, Check, Sparkles,
  Flame, Wrench, FileText, UserCheck, Clock, MapPin, Building2
} from 'lucide-react';
import SignaturePad from './SignaturePad';

const EXTINGUISHER_TYPES = [
  'CO2 (Carbon Dioxide)',
  'DCP (Dry Chemical Powder)',
  'Water / AFFF Foam',
  'Wet Chemical (Class K/F)',
  'Clean Agent (FE-36 / FM-200)'
];

const EXTINGUISHER_CAPACITIES = [
  '2 kg', '3 kg', '4.5 kg', '5 kg', '6 kg', '9 kg', '10 kg', '12 kg',
  '6 Liters', '9 Liters', '25 kg (Trolley)', '50 kg (Trolley)'
];

export default function AMCChecklistModal({ visit, onClose, onRefresh, onViewReport }) {
  const { currentUser, showToast, allUsers = [] } = useApp();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('fire_alarm'); // 'fire_alarm' | 'fire_fighting' | 'extinguishers' | 'defects' | 'signoff'

  // Data states
  const [checklistMeta, setChecklistMeta] = useState(null);
  const [actualServiceDate, setActualServiceDate] = useState(new Date().toISOString().slice(0, 10));
  const [assignedSupervisorId, setAssignedSupervisorId] = useState(visit?.supervisor_id || '');
  const [assignedSupervisorName, setAssignedSupervisorName] = useState(visit?.supervisor_name || 'Sarath Kr');
  const [assignedTechnicianId, setAssignedTechnicianId] = useState(visit?.technician_id || '');
  const [assignedTechnicianName, setAssignedTechnicianName] = useState(visit?.technician_name || currentUser?.name || 'Abdul Majeed');
  const [fireAlarmItems, setFireAlarmItems] = useState([]);
  const [fireFightingItems, setFireFightingItems] = useState([]);
  const [extinguisherItems, setExtinguisherItems] = useState([]);
  const [customerSignature, setCustomerSignature] = useState(null);
  const [technicianNotes, setTechnicianNotes] = useState('');
  const [showSignPad, setShowSignPad] = useState(false);
  const [expandedItemId, setExpandedItemId] = useState(null);

  // New custom item form
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [newItemSystem, setNewItemSystem] = useState('Fire Alarm');
  const [newItemName, setNewItemName] = useState('');
  const [newItemMake, setNewItemMake] = useState('');
  const [newItemType, setNewItemType] = useState('');
  const [newItemQty, setNewItemQty] = useState('1');

  // Fetch visit checklist data from backend (auto-populating from previous visit or building equipment)
  useEffect(() => {
    if (!visit?.id) return;
    const fetchChecklist = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/amc-visits/${visit.id}/checklist`, {
          headers: {
            'x-user-role': currentUser.role,
            'x-user-id': currentUser.id
          }
        });
        if (res.ok) {
          const data = await res.json();
          setChecklistMeta(data);
          const chk = data.checklist || {};
          setFireAlarmItems(chk.fire_alarm_items || []);
          setFireFightingItems(chk.fire_fighting_items || []);
          setExtinguisherItems(chk.extinguisher_items || []);
          setActualServiceDate(data.visit.actual_service_date || new Date().toISOString().slice(0, 10));
          if (data.visit?.supervisor_id) setAssignedSupervisorId(data.visit.supervisor_id);
          if (data.visit?.supervisor_name) setAssignedSupervisorName(data.visit.supervisor_name);
          else if (data.contract?.assigned_supervisor) setAssignedSupervisorName(data.contract.assigned_supervisor);
          if (data.visit?.technician_id) setAssignedTechnicianId(data.visit.technician_id);
          if (data.visit?.technician_name) setAssignedTechnicianName(data.visit.technician_name);
          else if (data.contract?.assigned_technician) setAssignedTechnicianName(data.contract.assigned_technician);
          setCustomerSignature(chk.customer_signature || null);
          setTechnicianNotes(chk.technician_notes || '');
        } else {
          showToast('Failed to load checklist', 'error');
        }
      } catch (err) {
        console.error('Checklist error:', err);
        showToast('Network error loading checklist', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchChecklist();
  }, [visit?.id]);

  // Handle Photo Upload (reads as base64 data URL)
  const handlePhotoUpload = (e, targetArraySetter, itemId) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      showToast('Image size exceeds 8MB limit', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      targetArraySetter(prev => prev.map(item => {
        if (item.id === itemId) {
          const currentPhotos = item.photos || [];
          return {
            ...item,
            photos: [...currentPhotos, dataUrl]
          };
        }
        return item;
      }));
      showToast('Photo attached to checklist item', 'success');
    };
    reader.readAsDataURL(file);
  };

  // Remove photo
  const handleRemovePhoto = (targetArraySetter, itemId, photoIdx) => {
    targetArraySetter(prev => prev.map(item => {
      if (item.id === itemId) {
        const updated = [...(item.photos || [])];
        updated.splice(photoIdx, 1);
        return { ...item, photos: updated };
      }
      return item;
    }));
  };

  // Update item field
  const updateItem = (targetArraySetter, itemId, field, value) => {
    targetArraySetter(prev => prev.map(item => {
      if (item.id === itemId) {
        const updated = { ...item, [field]: value };
        // If switched to NOT OK, expand card to prompt defect entry
        if (field === 'status' && value === 'NOT OK') {
          setExpandedItemId(itemId);
          if (!updated.priority) updated.priority = 'High';
        }
        return updated;
      }
      return item;
    }));
  };

  // Add new extinguisher
  const handleAddExtinguisher = () => {
    const nextIdx = extinguisherItems.length + 1;
    const newExt = {
      id: `ext-custom-${Date.now()}`,
      type: 'DCP (Dry Chemical Powder)',
      make: 'FireX',
      capacity: '6 kg',
      quantity: 1,
      serial_number: `FX-EXT-${String(nextIdx).padStart(3, '0')}`,
      location: 'Main Corridor',
      floor: 'Ground',
      condition: 'Good',
      pressure_status: 'Normal',
      safety_pin: 'Intact',
      hose: 'Intact',
      nozzle: 'Clear',
      inspection_status: 'OK',
      status: 'OK',
      remarks: 'Certified operational',
      photos: [],
      date_done: actualServiceDate,
      next_due_date: new Date(Date.now() + 182 * 24 * 3600 * 1000).toISOString().slice(0, 10)
    };
    setExtinguisherItems(prev => [...prev, newExt]);
    setExpandedItemId(newExt.id);
    showToast('New extinguisher added to building inventory', 'info');
  };

  // Add custom general item
  const handleAddCustomItem = (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem = {
      id: `custom-${Date.now()}`,
      item_no: (newItemSystem === 'Fire Alarm' ? fireAlarmItems.length : fireFightingItems.length) + 1,
      item: newItemName,
      make: newItemMake,
      type: newItemType,
      quantity: newItemQty || '1',
      status: 'OK',
      remarks: '',
      photos: []
    };

    if (newItemSystem === 'Fire Alarm') {
      setFireAlarmItems(prev => [...prev, newItem]);
    } else {
      setFireFightingItems(prev => [...prev, newItem]);
    }

    setNewItemName('');
    setNewItemMake('');
    setNewItemType('');
    setNewItemQty('1');
    setShowAddItemModal(false);
    showToast(`Added ${newItem.item} to ${newItemSystem}`, 'success');
  };

  // Compile active defects from all NOT OK items
  const compiledDefects = [
    ...fireAlarmItems.filter(i => i.status === 'NOT OK').map(i => ({ ...i, category: 'Fire Alarm' })),
    ...fireFightingItems.filter(i => i.status === 'NOT OK').map(i => ({ ...i, category: 'Fire Fighting' })),
    ...extinguisherItems.filter(i => i.status === 'NOT OK').map(i => ({ ...i, category: 'Fire Extinguishers', item: `${i.type} (${i.capacity})` }))
  ];

  const canPrepareReports = ['GM', 'Projects Manager', 'Engineer', 'Supervisor', 'Technician'].includes(currentUser?.role);

  // Directly generate report: saves checklist progress and opens official A4 AMC Service Report
  const handleMakeReport = async () => {
    try {
      setSaving(true);
      const payload = {
        actual_service_date: actualServiceDate,
        supervisor_id: assignedSupervisorId,
        supervisor_name: assignedSupervisorName,
        technician_id: assignedTechnicianId,
        technician_name: assignedTechnicianName,
        fire_alarm_items: fireAlarmItems,
        fire_fighting_items: fireFightingItems,
        extinguisher_items: extinguisherItems,
        customer_signature: customerSignature,
        technician_notes: technicianNotes,
        submit: false,
        status: visit.status === 'Completed' || visit.status === 'Approved' ? visit.status : 'Checklist Completed'
      };

      const res = await fetch(`/api/amc-visits/${visit.id}/checklist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser.role,
          'x-user-id': currentUser.id
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showToast('Checklist saved! Opening AMC Service Report...', 'success');
        if (onRefresh) onRefresh();
        if (onViewReport) {
          onViewReport({
            ...visit,
            actual_service_date: actualServiceDate,
            supervisor_id: assignedSupervisorId,
            supervisor_name: assignedSupervisorName,
            technician_id: assignedTechnicianId,
            technician_name: assignedTechnicianName,
            checklist_data: payload,
            prepared_by_name: currentUser?.name || assignedTechnicianName,
            prepared_at: new Date().toISOString()
          });
        }
      } else {
        const err = await res.json();
        showToast(err.message || 'Error saving checklist', 'error');
      }
    } catch (err) {
      console.error('Make report error:', err);
      showToast('Network error generating report', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Save or Submit checklist
  const handleSaveChecklist = async (isSubmit = false) => {
    if (isSubmit && !customerSignature) {
      showToast('Please capture customer representative signature before submitting', 'warning');
      setActiveSection('signoff');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        actual_service_date: actualServiceDate,
        supervisor_id: assignedSupervisorId,
        supervisor_name: assignedSupervisorName,
        technician_id: assignedTechnicianId,
        technician_name: assignedTechnicianName,
        fire_alarm_items: fireAlarmItems,
        fire_fighting_items: fireFightingItems,
        extinguisher_items: extinguisherItems,
        customer_signature: customerSignature,
        technician_notes: technicianNotes,
        submit: isSubmit,
        status: isSubmit ? 'Submitted' : 'In Progress'
      };

      const res = await fetch(`/api/amc-visits/${visit.id}/checklist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser.role,
          'x-user-id': currentUser.id
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showToast(
          isSubmit
            ? 'AMC Checklist submitted successfully for Supervisor Review!'
            : 'Checklist progress saved successfully',
          'success'
        );
        if (onRefresh) onRefresh();
        if (isSubmit) {
          onClose();
        }
      } else {
        const err = await res.json();
        showToast(err.message || 'Error saving checklist', 'error');
      }
    } catch (err) {
      console.error('Save checklist error:', err);
      showToast('Network error saving checklist', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-navy-900 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-700">Loading Building Checklist & Equipment Register...</p>
        </div>
      </div>
    );
  }

  const contract = checklistMeta?.contract || {};
  const site = checklistMeta?.site || {};
  const cust = checklistMeta?.customer || {};

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm overflow-y-auto flex flex-col justify-between">
      
      {/* Top Header Bar */}
      <div className="sticky top-0 z-40 bg-navy-900 text-white shadow-xl border-b border-navy-700 px-3 sm:px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  {contract.contract_number || 'AMC-2026'} • Visit #{visit.visit_number}
                </span>
                {(visit.document_number || visit.report_number) && (
                  <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    {visit.document_number || visit.report_number}
                  </span>
                )}
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  visit.checklist_status === 'Approved' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                  visit.checklist_status === 'Submitted' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                  'bg-blue-500/20 text-blue-300'
                }`}>
                  {visit.checklist_status || 'In Progress'}
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-black text-white truncate">
                {site.site_name || cust.name || 'Building Service Visit'}
              </h1>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => handleSaveChecklist(false)}
              disabled={saving}
              className="px-2.5 sm:px-3 py-1.5 bg-navy-800 hover:bg-navy-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 border border-navy-700 transition-colors"
            >
              <Save className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Save Draft</span>
            </button>

            {canPrepareReports && onViewReport && (
              <button
                type="button"
                onClick={handleMakeReport}
                disabled={saving}
                className="px-3 sm:px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md shadow-emerald-950/40 transition-all border border-emerald-400/30"
                title="Save checklist & generate official AMC Service Report"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-200" />
                <span>MAKE REPORT</span>
              </button>
            )}

            <button
              onClick={() => handleSaveChecklist(true)}
              disabled={saving}
              className="px-3 sm:px-4 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-black flex items-center gap-1 shadow-lg shadow-emerald-900/30 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit</span>
            </button>
          </div>
        </div>

        {/* Visit & Personnel Quick Summary Banner */}
        <div className="max-w-5xl mx-auto mt-2 pt-2 border-t border-navy-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-300">
          <div>
            <span className="text-[9px] text-slate-400 uppercase font-semibold block">Scheduled Date</span>
            <span className="font-bold text-white">{visit.scheduled_date}</span>
          </div>
          <div>
            <span className="text-[9px] text-slate-400 uppercase font-semibold block">Actual Service Date</span>
            <input
              type="date"
              value={actualServiceDate}
              onChange={(e) => setActualServiceDate(e.target.value)}
              className="bg-navy-800 text-white text-[11px] font-bold px-2 py-0.5 rounded border border-navy-700 outline-none w-full max-w-[130px]"
            />
          </div>
          <div>
            <span className="text-[9px] text-slate-400 uppercase font-semibold block">Supervisor</span>
            <select
              value={assignedSupervisorId || ''}
              onChange={(e) => {
                const sId = e.target.value;
                setAssignedSupervisorId(sId);
                const u = allUsers.find(x => String(x.id) === String(sId));
                if (u) setAssignedSupervisorName(u.name);
              }}
              className="bg-navy-800 text-white text-[11px] font-bold px-1.5 py-0.5 rounded border border-navy-700 outline-none w-full"
            >
              <option value="">{assignedSupervisorName || 'Select Supervisor'}</option>
              {allUsers
                .filter(u => ['Supervisor', 'Engineer', 'Projects Manager', 'GM', 'Admin'].includes(u.role))
                .map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
            </select>
          </div>
          <div>
            <span className="text-[9px] text-slate-400 uppercase font-semibold block">Lead Technician</span>
            <select
              value={assignedTechnicianId || ''}
              onChange={(e) => {
                const tId = e.target.value;
                setAssignedTechnicianId(tId);
                const u = allUsers.find(x => String(x.id) === String(tId));
                if (u) setAssignedTechnicianName(u.name);
              }}
              className="bg-navy-800 text-white text-[11px] font-bold px-1.5 py-0.5 rounded border border-navy-700 outline-none w-full"
            >
              <option value="">{assignedTechnicianName || 'Select Technician'}</option>
              {allUsers
                .filter(u => ['Technician', 'Engineer', 'Supervisor'].includes(u.role))
                .map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="max-w-5xl w-full mx-auto p-2 sm:p-4 flex-1">

        {/* Section Navigation Tabs (Horizontal scroll on mobile) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-3">
          <button
            onClick={() => setActiveSection('fire_alarm')}
            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
              activeSection === 'fire_alarm'
                ? 'bg-navy-900 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>Fire Alarm ({fireAlarmItems.length})</span>
          </button>

          <button
            onClick={() => setActiveSection('fire_fighting')}
            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
              activeSection === 'fire_fighting'
                ? 'bg-navy-900 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Wrench className="w-3.5 h-3.5 text-blue-500" />
            <span>Fire Fighting ({fireFightingItems.length})</span>
          </button>

          <button
            onClick={() => setActiveSection('extinguishers')}
            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
              activeSection === 'extinguishers'
                ? 'bg-navy-900 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span>Extinguishers ({extinguisherItems.length})</span>
          </button>

          <button
            onClick={() => setActiveSection('defects')}
            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
              activeSection === 'defects'
                ? 'bg-red-700 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
            <span>Defects ({compiledDefects.length})</span>
          </button>

          <button
            onClick={() => setActiveSection('signoff')}
            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
              activeSection === 'signoff'
                ? 'bg-navy-900 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Sign-off {customerSignature ? '✓' : ''}</span>
          </button>
        </div>

        {/* SECTION 1: FIRE ALARM SYSTEM (23 Specific Items) */}
        {activeSection === 'fire_alarm' && (
          <div className="space-y-3">
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-600" />
                <div>
                  <h2 className="text-xs font-black text-amber-950 uppercase">Fire Alarm System Digital Checklist</h2>
                  <p className="text-[11px] text-amber-800">
                    23 Civil Defense required points. Pre-populated from building register.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setNewItemSystem('Fire Alarm');
                  setShowAddItemModal(true);
                }}
                className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-sm"
              >
                <Plus className="w-3 h-3" />
                <span>Add Item</span>
              </button>
            </div>

            {/* Item Cards List (Mobile-first responsive layout) */}
            <div className="space-y-2.5">
              {fireAlarmItems.map((item, idx) => (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl border transition-all p-3 shadow-sm ${
                    item.status === 'NOT OK'
                      ? 'border-red-300 ring-1 ring-red-400 bg-red-50/20'
                      : item.status === 'OK'
                      ? 'border-slate-200'
                      : 'border-slate-200 bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono font-black text-slate-400">
                          #{item.item_no || idx + 1}
                        </span>
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {item.item}
                        </h3>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-600">
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase font-semibold block">Make</span>
                          <input
                            type="text"
                            placeholder="e.g. Notifier"
                            value={item.make || ''}
                            onChange={(e) => updateItem(setFireAlarmItems, item.id, 'make', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-xs font-medium"
                          />
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase font-semibold block">Type / Spec</span>
                          <input
                            type="text"
                            placeholder="e.g. Optical Smoke"
                            value={item.type || ''}
                            onChange={(e) => updateItem(setFireAlarmItems, item.id, 'type', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-xs font-medium"
                          />
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <span className="text-[9px] text-slate-400 uppercase font-semibold block">Quantity</span>
                          <input
                            type="text"
                            placeholder="e.g. 24"
                            value={item.quantity || ''}
                            onChange={(e) => updateItem(setFireAlarmItems, item.id, 'quantity', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-xs font-medium"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Status Toggle Buttons */}
                    <div className="flex flex-col sm:flex-row items-center gap-1 bg-slate-100 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => updateItem(setFireAlarmItems, item.id, 'status', 'OK')}
                        className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all ${
                          item.status === 'OK'
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        OK
                      </button>
                      <button
                        type="button"
                        onClick={() => updateItem(setFireAlarmItems, item.id, 'status', 'NOT OK')}
                        className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all ${
                          item.status === 'NOT OK'
                            ? 'bg-red-600 text-white shadow-sm'
                            : 'text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        NOT OK
                      </button>
                      <button
                        type="button"
                        onClick={() => updateItem(setFireAlarmItems, item.id, 'status', 'N/A')}
                        className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all ${
                          item.status === 'N/A'
                            ? 'bg-slate-700 text-white shadow-sm'
                            : 'text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        N/A
                      </button>
                    </div>
                  </div>

                  {/* Remarks Input */}
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Remarks / Condition notes..."
                      value={item.remarks || ''}
                      onChange={(e) => updateItem(setFireAlarmItems, item.id, 'remarks', e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs"
                    />

                    {/* Camera Button */}
                    <label className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer flex items-center gap-1 text-[11px] font-bold">
                      <Camera className="w-3.5 h-3.5 text-blue-600" />
                      <span className="hidden sm:inline">Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={(e) => handlePhotoUpload(e, setFireAlarmItems, item.id)}
                      />
                    </label>

                    {item.photos?.length > 0 && (
                      <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                        {item.photos.length} 📷
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => setExpandedItemId(expandedItemId === item.id ? null : item.id)}
                      className="p-1.5 text-slate-400 hover:text-slate-700"
                    >
                      {expandedItemId === item.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Expandable Defect Details & Photos */}
                  {(expandedItemId === item.id || item.status === 'NOT OK') && (
                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-2.5 text-xs animate-in fade-in">
                      {item.status === 'NOT OK' && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase text-red-700 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Defect Details &amp; Proposed Rectification</span>
                            </span>
                            <select
                              value={item.priority || 'High'}
                              onChange={(e) => updateItem(setFireAlarmItems, item.id, 'priority', e.target.value)}
                              className="text-[10px] font-black bg-white border border-red-300 rounded px-1.5 py-0.5 text-red-900"
                            >
                              <option value="Critical">Critical</option>
                              <option value="High">High Priority</option>
                              <option value="Medium">Medium</option>
                              <option value="Low">Low</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-red-900 mb-0.5">Defect Description *</label>
                            <input
                              type="text"
                              placeholder="e.g. Battery dead (float voltage 18.2V), sensor contaminated with dust"
                              value={item.defect_description || ''}
                              onChange={(e) => updateItem(setFireAlarmItems, item.id, 'defect_description', e.target.value)}
                              className="w-full bg-white border border-red-200 rounded-lg p-2 text-xs font-medium text-slate-900"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-red-900 mb-0.5">Recommended Action / Parts</label>
                            <input
                              type="text"
                              placeholder="e.g. Supply and replace 2x 12V 17Ah Yuasa batteries immediately"
                              value={item.recommendation || ''}
                              onChange={(e) => updateItem(setFireAlarmItems, item.id, 'recommendation', e.target.value)}
                              className="w-full bg-white border border-red-200 rounded-lg p-2 text-xs font-medium text-slate-900"
                            />
                          </div>
                        </div>
                      )}

                      {/* Photo Thumbnails */}
                      {item.photos?.length > 0 && (
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Attached Photos</span>
                          <div className="flex flex-wrap gap-2">
                            {item.photos.map((p, pIdx) => (
                              <div key={pIdx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 group">
                                <img src={p} alt="item photo" className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => handleRemovePhoto(setFireAlarmItems, item.id, pIdx)}
                                  className="absolute top-0 right-0 p-1 bg-red-600 text-white rounded-bl opacity-90 hover:opacity-100"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 2: FIRE FIGHTING SYSTEM */}
        {activeSection === 'fire_fighting' && (
          <div className="space-y-3">
            <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-blue-600" />
                <div>
                  <h2 className="text-xs font-black text-blue-950 uppercase">Fire Fighting &amp; Sprinklers Checklist</h2>
                  <p className="text-[11px] text-blue-800">
                    Pumps, tank, valves, hydrants, landing valves, hose reels, blankets, exit lights.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setNewItemSystem('Fire Fighting');
                  setShowAddItemModal(true);
                }}
                className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-sm"
              >
                <Plus className="w-3 h-3" />
                <span>Add Item</span>
              </button>
            </div>

            {/* Fire Fighting Cards List */}
            <div className="space-y-2.5">
              {fireFightingItems.map((item, idx) => (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl border transition-all p-3 shadow-sm ${
                    item.status === 'NOT OK'
                      ? 'border-red-300 ring-1 ring-red-400 bg-red-50/20'
                      : item.status === 'OK'
                      ? 'border-slate-200'
                      : 'border-slate-200 bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono font-black text-slate-400">
                          #{item.item_no || idx + 1}
                        </span>
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {item.item}
                        </h3>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-600">
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase font-semibold block">Make</span>
                          <input
                            type="text"
                            placeholder="e.g. Peerless"
                            value={item.make || ''}
                            onChange={(e) => updateItem(setFireFightingItems, item.id, 'make', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-xs font-medium"
                          />
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase font-semibold block">Type / Model</span>
                          <input
                            type="text"
                            placeholder="e.g. 750 GPM Split Case"
                            value={item.type || ''}
                            onChange={(e) => updateItem(setFireFightingItems, item.id, 'type', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-xs font-medium"
                          />
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <span className="text-[9px] text-slate-400 uppercase font-semibold block">Quantity</span>
                          <input
                            type="text"
                            placeholder="e.g. 1"
                            value={item.quantity || ''}
                            onChange={(e) => updateItem(setFireFightingItems, item.id, 'quantity', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-xs font-medium"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Status Toggle Buttons */}
                    <div className="flex flex-col sm:flex-row items-center gap-1 bg-slate-100 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => updateItem(setFireFightingItems, item.id, 'status', 'OK')}
                        className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all ${
                          item.status === 'OK'
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        OK
                      </button>
                      <button
                        type="button"
                        onClick={() => updateItem(setFireFightingItems, item.id, 'status', 'NOT OK')}
                        className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all ${
                          item.status === 'NOT OK'
                            ? 'bg-red-600 text-white shadow-sm'
                            : 'text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        NOT OK
                      </button>
                      <button
                        type="button"
                        onClick={() => updateItem(setFireFightingItems, item.id, 'status', 'N/A')}
                        className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all ${
                          item.status === 'N/A'
                            ? 'bg-slate-700 text-white shadow-sm'
                            : 'text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        N/A
                      </button>
                    </div>
                  </div>

                  {/* Remarks Input */}
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Remarks / Operating pressures / Observations..."
                      value={item.remarks || ''}
                      onChange={(e) => updateItem(setFireFightingItems, item.id, 'remarks', e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs"
                    />

                    {/* Camera Button */}
                    <label className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer flex items-center gap-1 text-[11px] font-bold">
                      <Camera className="w-3.5 h-3.5 text-blue-600" />
                      <span className="hidden sm:inline">Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={(e) => handlePhotoUpload(e, setFireFightingItems, item.id)}
                      />
                    </label>

                    {item.photos?.length > 0 && (
                      <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                        {item.photos.length} 📷
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => setExpandedItemId(expandedItemId === item.id ? null : item.id)}
                      className="p-1.5 text-slate-400 hover:text-slate-700"
                    >
                      {expandedItemId === item.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Expandable Defect Details */}
                  {(expandedItemId === item.id || item.status === 'NOT OK') && (
                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-2.5 text-xs animate-in fade-in">
                      {item.status === 'NOT OK' && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase text-red-700 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Defect Details &amp; Proposed Rectification</span>
                            </span>
                            <select
                              value={item.priority || 'High'}
                              onChange={(e) => updateItem(setFireFightingItems, item.id, 'priority', e.target.value)}
                              className="text-[10px] font-black bg-white border border-red-300 rounded px-1.5 py-0.5 text-red-900"
                            >
                              <option value="Critical">Critical</option>
                              <option value="High">High Priority</option>
                              <option value="Medium">Medium</option>
                              <option value="Low">Low</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-red-900 mb-0.5">Defect Description *</label>
                            <input
                              type="text"
                              placeholder="e.g. Packing gland weeping excessively, gland follower corroded"
                              value={item.defect_description || ''}
                              onChange={(e) => updateItem(setFireFightingItems, item.id, 'defect_description', e.target.value)}
                              className="w-full bg-white border border-red-200 rounded-lg p-2 text-xs font-medium text-slate-900"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-red-900 mb-0.5">Recommended Action / Parts</label>
                            <input
                              type="text"
                              placeholder="e.g. Repack gland with Teflon braided packing and torque bolts"
                              value={item.recommendation || ''}
                              onChange={(e) => updateItem(setFireFightingItems, item.id, 'recommendation', e.target.value)}
                              className="w-full bg-white border border-red-200 rounded-lg p-2 text-xs font-medium text-slate-900"
                            />
                          </div>
                        </div>
                      )}

                      {/* Photo Thumbnails */}
                      {item.photos?.length > 0 && (
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Attached Photos</span>
                          <div className="flex flex-wrap gap-2">
                            {item.photos.map((p, pIdx) => (
                              <div key={pIdx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 group">
                                <img src={p} alt="item photo" className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => handleRemovePhoto(setFireFightingItems, item.id, pIdx)}
                                  className="absolute top-0 right-0 p-1 bg-red-600 text-white rounded-bl opacity-90 hover:opacity-100"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 3: FIRE EXTINGUISHERS SECTION */}
        {activeSection === 'extinguishers' && (
          <div className="space-y-3">
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-600" />
                <div>
                  <h2 className="text-xs font-black text-emerald-950 uppercase">Fire Extinguishers Inventory &amp; Inspection</h2>
                  <p className="text-[11px] text-emerald-800">
                    Pre-populated from Equipment Register. Tracks pins, hoses, pressures, serials &amp; due dates.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleAddExtinguisher}
                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-sm"
              >
                <Plus className="w-3 h-3" />
                <span>Add Extinguisher</span>
              </button>
            </div>

            {/* Extinguishers Cards */}
            <div className="space-y-3">
              {extinguisherItems.map((ext, idx) => (
                <div
                  key={ext.id}
                  className={`bg-white rounded-2xl border transition-all p-3 shadow-sm ${
                    ext.status === 'NOT OK'
                      ? 'border-red-300 ring-1 ring-red-400 bg-red-50/20'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="text-[10px] font-mono font-black text-slate-400">
                          #{idx + 1}
                        </span>
                        <span className="font-extrabold text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                          {ext.serial_number || `EXT-${idx + 1}`}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                          {ext.type}
                        </span>
                        <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                          {ext.capacity}
                        </span>
                      </div>

                      {/* Extinguisher Detailed Attributes */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-600 mb-2">
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase font-semibold block">Location</span>
                          <input
                            type="text"
                            placeholder="e.g. Electrical Room"
                            value={ext.location || ''}
                            onChange={(e) => updateItem(setExtinguisherItems, ext.id, 'location', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-xs font-medium"
                          />
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase font-semibold block">Floor</span>
                          <input
                            type="text"
                            placeholder="e.g. Basement 1"
                            value={ext.floor || ''}
                            onChange={(e) => updateItem(setExtinguisherItems, ext.id, 'floor', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-xs font-medium"
                          />
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase font-semibold block">Make</span>
                          <input
                            type="text"
                            placeholder="e.g. FireX"
                            value={ext.make || ''}
                            onChange={(e) => updateItem(setExtinguisherItems, ext.id, 'make', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-xs font-medium"
                          />
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase font-semibold block">Serial Number</span>
                          <input
                            type="text"
                            placeholder="e.g. FX-9842"
                            value={ext.serial_number || ''}
                            onChange={(e) => updateItem(setExtinguisherItems, ext.id, 'serial_number', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-xs font-medium"
                          />
                        </div>
                      </div>

                      {/* Physical Inspection Checkpoints */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <div>
                          <span className="text-slate-400 uppercase font-bold block">Safety Pin</span>
                          <select
                            value={ext.safety_pin || 'Intact'}
                            onChange={(e) => updateItem(setExtinguisherItems, ext.id, 'safety_pin', e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded p-1 text-[11px] font-bold"
                          >
                            <option value="Intact">Intact &amp; Sealed</option>
                            <option value="Missing">Missing / Broken</option>
                          </select>
                        </div>
                        <div>
                          <span className="text-slate-400 uppercase font-bold block">Pressure Gauge</span>
                          <select
                            value={ext.pressure_status || 'Normal'}
                            onChange={(e) => updateItem(setExtinguisherItems, ext.id, 'pressure_status', e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded p-1 text-[11px] font-bold"
                          >
                            <option value="Normal">Normal (Green Zone)</option>
                            <option value="Low">Low (Needs Recharge)</option>
                            <option value="High">Overcharged</option>
                            <option value="N/A">N/A (CO2 Cyl)</option>
                          </select>
                        </div>
                        <div>
                          <span className="text-slate-400 uppercase font-bold block">Hose &amp; Horn</span>
                          <select
                            value={ext.hose || 'Intact'}
                            onChange={(e) => updateItem(setExtinguisherItems, ext.id, 'hose', e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded p-1 text-[11px] font-bold"
                          >
                            <option value="Intact">Good / Flexible</option>
                            <option value="Cracked">Cracked / Damaged</option>
                            <option value="Missing">Missing Horn</option>
                          </select>
                        </div>
                        <div>
                          <span className="text-slate-400 uppercase font-bold block">Next Due Date</span>
                          <input
                            type="date"
                            value={ext.next_due_date || ''}
                            onChange={(e) => updateItem(setExtinguisherItems, ext.id, 'next_due_date', e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded p-0.5 text-[11px] font-bold"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Status Toggle Buttons */}
                    <div className="flex flex-col items-center gap-1 bg-slate-100 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => updateItem(setExtinguisherItems, ext.id, 'status', 'OK')}
                        className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all ${
                          ext.status === 'OK'
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        OK
                      </button>
                      <button
                        type="button"
                        onClick={() => updateItem(setExtinguisherItems, ext.id, 'status', 'NOT OK')}
                        className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all ${
                          ext.status === 'NOT OK'
                            ? 'bg-red-600 text-white shadow-sm'
                            : 'text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        NOT OK
                      </button>
                      <button
                        type="button"
                        onClick={() => updateItem(setExtinguisherItems, ext.id, 'status', 'N/A')}
                        className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all ${
                          ext.status === 'N/A'
                            ? 'bg-slate-700 text-white shadow-sm'
                            : 'text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        N/A
                      </button>
                    </div>
                  </div>

                  {/* Remarks & Photo row */}
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Inspection notes / service tag number..."
                      value={ext.remarks || ''}
                      onChange={(e) => updateItem(setExtinguisherItems, ext.id, 'remarks', e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs"
                    />

                    {/* Camera */}
                    <label className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer flex items-center gap-1 text-[11px] font-bold">
                      <Camera className="w-3.5 h-3.5 text-blue-600" />
                      <span className="hidden sm:inline">Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={(e) => handlePhotoUpload(e, setExtinguisherItems, ext.id)}
                      />
                    </label>

                    {ext.photos?.length > 0 && (
                      <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                        {ext.photos.length} 📷
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => setExtinguisherItems(prev => prev.filter(e => e.id !== ext.id))}
                      className="p-1.5 text-slate-400 hover:text-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* If NOT OK defect row */}
                  {ext.status === 'NOT OK' && (
                    <div className="mt-2.5 bg-red-50 border border-red-200 rounded-xl p-2.5 space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-black text-red-900">
                        <span>Extinguisher Defect Logged</span>
                        <span className="text-red-700">Auto-synced to Defect Register</span>
                      </div>
                      <input
                        type="text"
                        placeholder="Defect: e.g. Discharged, missing safety pin, hose split"
                        value={ext.defect_description || ''}
                        onChange={(e) => updateItem(setExtinguisherItems, ext.id, 'defect_description', e.target.value)}
                        className="w-full bg-white border border-red-200 rounded p-1.5 text-xs text-slate-900"
                      />
                      <input
                        type="text"
                        placeholder="Recommendation: e.g. Workshop refilling, hydro-test & new pin required"
                        value={ext.recommendation || ''}
                        onChange={(e) => updateItem(setExtinguisherItems, ext.id, 'recommendation', e.target.value)}
                        className="w-full bg-white border border-red-200 rounded p-1.5 text-xs text-slate-900"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 4: DEFECTS & RECOMMENDATIONS SUMMARY */}
        {activeSection === 'defects' && (
          <div className="space-y-3">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-red-950 font-black text-sm mb-1">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span>Defects &amp; Engineering Recommendations ({compiledDefects.length})</span>
              </div>
              <p className="text-xs text-red-800 leading-relaxed">
                Items marked <strong>NOT OK</strong> are automatically registered into the FIREX Defect Register, Customer History, Building Records, and the official AMC Service Report.
              </p>
            </div>

            {compiledDefects.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-slate-900">Zero Outstanding Defects</h3>
                <p className="text-xs text-slate-500 mt-1">
                  All inspected systems and equipment verified in 100% operational condition.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {compiledDefects.map((def, idx) => (
                  <div key={idx} className="bg-white rounded-2xl border border-red-200 p-3.5 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-red-100 text-red-800 uppercase">
                          {def.category}
                        </span>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900">{def.item}</h4>
                      </div>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-600 text-white">
                        {def.priority || 'High'} Priority
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="bg-slate-50 p-2 rounded-lg">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Defect</span>
                        <p className="text-slate-800 font-semibold">{def.defect_description || def.remarks || 'Defect noted'}</p>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-lg">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Recommendation</span>
                        <p className="text-emerald-800 font-semibold">{def.recommendation || 'Technical replacement proposed'}</p>
                      </div>
                    </div>

                    {def.photos?.length > 0 && (
                      <div className="flex gap-2 pt-1">
                        {def.photos.map((ph, pIdx) => (
                          <img key={pIdx} src={ph} alt="defect" className="w-12 h-12 rounded object-cover border border-slate-200" />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SECTION 5: CUSTOMER SIGN-OFF & SERVICE NOTES */}
        {activeSection === 'signoff' && (
          <div className="space-y-4">
            
            {/* General Technician Notes */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2">
              <label className="block text-xs font-black text-slate-800 uppercase flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Overall Technician Notes &amp; Observations</span>
              </label>
              <textarea
                rows={3}
                placeholder="Summary of service completed, special remarks for customer or Civil Defense audit..."
                value={technicianNotes}
                onChange={(e) => setTechnicianNotes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800"
              />
            </div>

            {/* Customer Representative Signature Section */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1.5 uppercase">
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    <span>Customer Representative Approval &amp; Signature</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Client acknowledgment of preventive maintenance inspection performed on site.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowSignPad(true)}
                  className="px-3 py-1.5 bg-navy-900 hover:bg-navy-800 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  {customerSignature ? 'Re-Sign Canvas' : 'Capture Signature'}
                </button>
              </div>

              {customerSignature ? (
                <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3">
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold text-slate-900">{customerSignature.repName}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 font-medium">
                      Designation: {customerSignature.designation || 'Facility Representative'}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Signed: {customerSignature.signedDate} • Recorded on device
                    </p>
                  </div>

                  {customerSignature.signatureDataUrl && (
                    <div className="h-16 w-32 bg-white rounded border border-slate-200 p-1 flex items-center justify-center">
                      <img
                        src={customerSignature.signatureDataUrl}
                        alt="Customer Signature"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center">
                  <UserCheck className="w-8 h-8 text-slate-400 mx-auto mb-1" />
                  <p className="text-xs text-slate-600 font-bold">Signature Pending</p>
                  <p className="text-[11px] text-slate-400">Tap "Capture Signature" to draw signature on screen.</p>
                </div>
              )}
            </div>

            {/* Submission Card */}
            <div className="bg-gradient-to-br from-navy-900 to-navy-950 text-white rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-black uppercase">Ready for Supervisor Review</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Submitting this checklist will mark the inspection as <strong>Checklist Completed</strong> and advance it to <strong>Supervisor Review</strong>. The assigned Supervisor will review findings, defects, and photo evidence before authorizing the final Civil Defense AMC Service Report PDF.
              </p>
              
              <div className="pt-2 flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => handleSaveChecklist(false)}
                  disabled={saving}
                  className="px-4 py-2 bg-navy-800 hover:bg-navy-700 text-white text-xs font-bold rounded-xl"
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveChecklist(true)}
                  disabled={saving}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Checklist</span>
                </button>
                {canPrepareReports && onViewReport && (
                  <button
                    type="button"
                    onClick={handleMakeReport}
                    disabled={saving}
                    className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-black rounded-xl shadow-lg shadow-emerald-900/50 flex items-center gap-1.5 transform hover:scale-[1.02] transition-all"
                  >
                    <FileText className="w-4 h-4" />
                    <span>MAKE REPORT</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Signature Pad Modal Overlay */}
      {showSignPad && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3">
          <SignaturePad
            title="Customer Sign-off Signature"
            initialName={cust.contact_person || ''}
            initialDesignation="Facility Representative"
            onSave={(sigData) => {
              setCustomerSignature(sigData);
              setShowSignPad(false);
              showToast('Customer signature captured', 'success');
            }}
            onCancel={() => setShowSignPad(false)}
          />
        </div>
      )}

      {/* Add Custom Item Modal */}
      {showAddItemModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl p-5 shadow-2xl max-w-sm w-full space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-black text-slate-900 uppercase flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-blue-600" />
                <span>Add Equipment Item</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddItemModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCustomItem} className="space-y-2.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">System Category *</label>
                <select
                  value={newItemSystem}
                  onChange={(e) => setNewItemSystem(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold"
                >
                  <option value="Fire Alarm">Fire Alarm System</option>
                  <option value="Fire Fighting">Fire Fighting System</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Item Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aspirating Smoke Detector (VESDA)"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Make</label>
                  <input
                    type="text"
                    placeholder="e.g. Xtralis"
                    value={newItemMake}
                    onChange={(e) => setNewItemMake(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Type / Model</label>
                  <input
                    type="text"
                    placeholder="e.g. VLP-002"
                    value={newItemType}
                    onChange={(e) => setNewItemType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Quantity</label>
                <input
                  type="text"
                  placeholder="1"
                  value={newItemQty}
                  onChange={(e) => setNewItemQty(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddItemModal(false)}
                  className="w-1/2 py-2 border border-slate-200 rounded-xl font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 bg-navy-900 text-white rounded-xl font-bold"
                >
                  Add to List
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
