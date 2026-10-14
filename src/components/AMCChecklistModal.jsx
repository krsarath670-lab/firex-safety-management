import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  CheckCircle2, XCircle, MinusCircle, Camera, Shield, 
  AlertTriangle, Save, Send, Eye, Plus, Trash2, 
  ChevronDown, ChevronUp, ArrowLeft, Check, Sparkles,
  Flame, Wrench, FileText, UserCheck, Clock, MapPin, Building2,
  Bell, Edit3, Layers, Info, RefreshCw
} from 'lucide-react';
import SignaturePad from './SignaturePad';

// 10 Fire & Safety Systems
const SYSTEM_CONFIGS = [
  { key: 'fire_alarm', label: 'Fire Alarm System', short: 'Fire Alarm', icon: Flame, badgeColor: 'bg-red-50 text-red-700 border-red-200' },
  { key: 'fire_fighting', label: 'Fire Fighting System', short: 'Fire Fighting', icon: Shield, badgeColor: 'bg-blue-50 text-blue-700 border-blue-200' },
  { key: 'fire_hose_reels', label: 'Fire Hose Reel System', short: 'Hose Reels', icon: Wrench, badgeColor: 'bg-amber-50 text-amber-700 border-amber-200' },
  { key: 'landing_valves', label: 'Landing Valve System', short: 'Landing Valves', icon: Wrench, badgeColor: 'bg-orange-50 text-orange-700 border-orange-200' },
  { key: 'fire_extinguishers', label: 'Fire Extinguishers', short: 'Extinguishers', icon: Flame, badgeColor: 'bg-rose-50 text-rose-700 border-rose-200' },
  { key: 'fm200_suppression', label: 'FM200 / Clean Agent System', short: 'FM200', icon: Shield, badgeColor: 'bg-purple-50 text-purple-700 border-purple-200' },
  { key: 'lpg_detection', label: 'LPG Gas Detection System', short: 'LPG Gas', icon: AlertTriangle, badgeColor: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  { key: 'emergency_lights', label: 'Emergency Lights', short: 'Emergency Lights', icon: Sparkles, badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { key: 'exit_lights', label: 'Exit Lights', short: 'Exit Lights', icon: Sparkles, badgeColor: 'bg-teal-50 text-teal-700 border-teal-200' },
  { key: 'voice_evacuation', label: 'Voice Evacuation / Other', short: 'Voice Evac', icon: Bell, badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200' }
];

const EXTINGUISHER_TYPES = [
  'ABC Dry Chemical Powder',
  'CO2 (Carbon Dioxide)',
  'AFFF Foam',
  'Water',
  'Wet Chemical (Class K/F)',
  'Clean Agent (FM-200 / FE-36 / Novec 1230)',
  'Other'
];

const EXTINGUISHER_CAPACITIES = [
  '1 kg', '2 kg', '3 kg', '4.5 kg', '5 kg (CO2)', '6 kg', '9 kg', '10 kg', '12 kg',
  '6 Liters', '9 Liters', '25 kg (Trolley)', '50 kg (Trolley)'
];

export default function AMCChecklistModal({ visit, onClose, onRefresh, onViewReport }) {
  const { currentUser, showToast, allUsers = [] } = useApp();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Buildings State: Array of building objects with separate independent checklists
  const [buildings, setBuildings] = useState([]);
  const [activeBuildingIndex, setActiveBuildingIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('systems_select'); // 'systems_select' | systemKey | 'signoff' | 'defects'

  // Visit Meta State
  const [actualServiceDate, setActualServiceDate] = useState(new Date().toISOString().slice(0, 10));
  const [assignedSupervisorId, setAssignedSupervisorId] = useState(visit?.supervisor_id || '');
  const [assignedSupervisorName, setAssignedSupervisorName] = useState(visit?.supervisor_name || 'Sarath Kr');
  const [assignedTechnicianId, setAssignedTechnicianId] = useState(visit?.technician_id || '');
  const [assignedTechnicianName, setAssignedTechnicianName] = useState(visit?.technician_name || currentUser?.name || 'Abdul Majeed');
  const [customerSignature, setCustomerSignature] = useState(null);
  const [technicianNotes, setTechnicianNotes] = useState('');
  const [showSignPad, setShowSignPad] = useState(false);
  const [expandedItemId, setExpandedItemId] = useState(null);

  // Building Add/Edit Modal
  const [showBuildingModal, setShowBuildingModal] = useState(false);
  const [editingBuildingIndex, setEditingBuildingIndex] = useState(null);
  const [bldFormNumber, setBldFormNumber] = useState('');
  const [bldFormName, setBldFormName] = useState('');
  const [bldFormLocation, setBldFormLocation] = useState('');

  // Add Item to active system modal
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [newItemIdentifier, setNewItemIdentifier] = useState('');
  const [newItemFloor, setNewItemFloor] = useState('');
  const [newItemLocation, setNewItemLocation] = useState('');
  const [newItemType, setNewItemType] = useState('');
  const [newItemMake, setNewItemMake] = useState('FireX');
  const [newItemCapacity, setNewItemCapacity] = useState('6 kg');

  // Load visit and checklist data
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
          const chk = data.checklist || {};
          
          if (Array.isArray(chk.buildings) && chk.buildings.length > 0) {
            setBuildings(chk.buildings);
          } else {
            // Create default building 1
            const defaultBld = {
              building_id: `bld-1`,
              building_number: '1',
              building_name: visit.site_name ? `${visit.site_name} - Tower A` : 'Building 1 - Main Tower',
              location: visit.site_address || 'Main Site',
              selected_systems: ['fire_alarm', 'fire_fighting', 'fire_hose_reels', 'landing_valves', 'fire_extinguishers'],
              checklists: {
                fire_alarm: chk.fire_alarm_items || [],
                fire_fighting: chk.fire_fighting_items || [],
                fire_extinguishers: chk.extinguisher_items || []
              },
              defects: chk.defects || [],
              remarks: chk.technician_notes || '',
              photos: []
            };
            setBuildings([defaultBld]);
          }

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

  // Current Active Building
  const currentBuilding = buildings[activeBuildingIndex] || buildings[0] || null;

  // Toggle a system for current building
  const handleToggleSystem = (sysKey) => {
    if (!currentBuilding) return;
    const currentSelected = currentBuilding.selected_systems || [];
    const isCurrentlySelected = currentSelected.includes(sysKey);

    if (isCurrentlySelected) {
      // Check if user has entered data in this system's checklist
      const existingItems = currentBuilding.checklists?.[sysKey] || [];
      const hasModifiedData = existingItems.some(i => i.status !== 'OK' || i.remarks || (i.photos && i.photos.length > 0));
      if (hasModifiedData) {
        if (!window.confirm(`Warning: System "${sysKey.replace(/_/g, ' ')}" already has recorded observations or defect items in Building ${currentBuilding.building_number}. Deselecting will hide it from the final report, but will preserve entered data. Do you wish to continue?`)) {
          return;
        }
      }
      const updated = currentSelected.filter(k => k !== sysKey);
      updateBuildingProperty('selected_systems', updated);
      if (activeTab === sysKey) {
        setActiveTab('systems_select');
      }
    } else {
      const updated = [...currentSelected, sysKey];
      updateBuildingProperty('selected_systems', updated);
      // Initialize system checklist items if empty
      if (!currentBuilding.checklists?.[sysKey] || currentBuilding.checklists[sysKey].length === 0) {
        initSystemChecklistForBuilding(sysKey, currentBuilding.building_number);
      }
    }
  };

  // Update a property on current building
  const updateBuildingProperty = (field, value) => {
    setBuildings(prev => prev.map((bld, idx) => {
      if (idx === activeBuildingIndex) {
        return { ...bld, [field]: value };
      }
      return bld;
    }));
  };

  // Initialize system items for active building
  const initSystemChecklistForBuilding = async (sysKey, bNumber) => {
    try {
      const res = await fetch('/api/checklist-templates');
      let defaultItems = [];
      if (res.ok) {
        const tplData = await res.json();
        defaultItems = tplData.templates?.[sysKey]?.items || [];
      }
      setBuildings(prev => prev.map((bld, idx) => {
        if (idx === activeBuildingIndex) {
          const currentChks = bld.checklists || {};
          return {
            ...bld,
            checklists: {
              ...currentChks,
              [sysKey]: (defaultItems.length > 0 ? defaultItems : []).map((item, i) => ({
                ...item,
                id: `${sysKey.slice(0, 3)}-${bld.building_number}-${i + 1}`,
                building_number: bld.building_number,
                photos: []
              }))
            }
          };
        }
        return bld;
      }));
    } catch (e) {
      console.warn('Failed to load template items, using client defaults');
    }
  };

  // Update an individual checklist item for current building & system
  const updateChecklistItem = (sysKey, itemId, field, value) => {
    setBuildings(prev => prev.map((bld, idx) => {
      if (idx === activeBuildingIndex) {
        const currentList = bld.checklists?.[sysKey] || [];
        const updatedList = currentList.map(item => {
          if (item.id === itemId) {
            const updated = { ...item, [field]: value };
            if (field === 'status' && value === 'NOT OK') {
              setExpandedItemId(itemId);
              if (!updated.priority) updated.priority = 'High';
            }
            return updated;
          }
          return item;
        });
        return {
          ...bld,
          checklists: {
            ...bld.checklists,
            [sysKey]: updatedList
          }
        };
      }
      return bld;
    }));
  };

  // Add a new item to current system checklist
  const handleAddNewItem = () => {
    if (!activeTab || activeTab === 'systems_select' || activeTab === 'signoff') return;
    const sysKey = activeTab;
    const bNumber = currentBuilding?.building_number || '1';

    let newItem = {
      id: `${sysKey.slice(0, 3)}-${bNumber}-${Date.now()}`,
      building_number: bNumber,
      status: 'OK',
      remarks: '',
      photos: []
    };

    if (sysKey === 'fire_hose_reels') {
      newItem.reel_id = newItemIdentifier || `HR-${bNumber}-${Date.now().toString().slice(-3)}`;
      newItem.floor = newItemFloor || 'Ground Floor';
      newItem.location = newItemLocation || 'Corridor';
      newItem.type = newItemType || 'Manual Swing Arm Drum';
      newItem.make = newItemMake || 'FireX';
      newItem.cabinet_condition = 'OK';
      newItem.hose_condition = 'OK';
      newItem.nozzle_operation = 'OK';
      newItem.valve_operation = 'OK';
      newItem.leakage_test = 'OK';
      newItem.water_flow_test = 'OK';
    } else if (sysKey === 'landing_valves') {
      newItem.valve_id = newItemIdentifier || `LV-${bNumber}-${Date.now().toString().slice(-3)}`;
      newItem.floor = newItemFloor || 'Ground Floor';
      newItem.location = newItemLocation || 'Staircase Landing';
      newItem.valve_condition = 'OK';
      newItem.accessibility = 'OK';
      newItem.cabinet_condition = 'OK';
      newItem.cap_chain = 'OK';
      newItem.handwheel_operation = 'OK';
      newItem.coupling_condition = 'OK';
      newItem.leakage_check = 'OK';
      newItem.pressure_flow_test = 'OK';
    } else if (sysKey === 'fire_extinguishers') {
      newItem.ext_id = newItemIdentifier || `EXT-${bNumber}-${Date.now().toString().slice(-3)}`;
      newItem.serial_number = newItemIdentifier || `FX-${Date.now().toString().slice(-4)}`;
      newItem.type = newItemType || 'ABC Dry Chemical Powder';
      newItem.capacity = newItemCapacity || '6 kg';
      newItem.make = newItemMake || 'FireX';
      newItem.floor = newItemFloor || 'Ground Floor';
      newItem.location = newItemLocation || 'Corridor';
      newItem.condition = 'OK';
      newItem.pressure_gauge = newItem.type.includes('CO2') ? 'N/A' : 'OK';
      newItem.weight_status = 'OK';
      newItem.safety_pin = 'OK';
      newItem.hose_nozzle = 'OK';
      newItem.cylinder_body = 'OK';
      newItem.signage_bracket = 'OK';
      newItem.date_done = actualServiceDate;
      newItem.next_due_date = new Date(Date.now() + 182 * 24 * 3600 * 1000).toISOString().slice(0, 10);
    } else if (sysKey === 'fm200_suppression') {
      newItem.system_tag = newItemIdentifier || `FM200-${bNumber}-${Date.now().toString().slice(-3)}`;
      newItem.room_name = newItemLocation || 'Server Room';
      newItem.floor = newItemFloor || '1st Floor';
      newItem.cylinder_pressure = 'OK';
      newItem.liquid_weight = 'OK';
      newItem.piping_nozzles = 'OK';
      newItem.actuator_solenoid = 'OK';
      newItem.manual_release = 'OK';
      newItem.abort_switch = 'OK';
      newItem.cross_zoning_detection = 'OK';
      newItem.warning_devices = 'OK';
      newItem.damper_interlock = 'OK';
      newItem.room_integrity_enclosure = 'OK';
      newItem.main_reserve_switch = 'OK';
    } else if (sysKey === 'lpg_detection') {
      newItem.detector_id = newItemIdentifier || `LPG-${bNumber}-${Date.now().toString().slice(-3)}`;
      newItem.location = newItemLocation || 'Kitchen Gas Bank';
      newItem.floor = newItemFloor || 'Ground Floor';
      newItem.type = newItemType || 'Catalytic Gas Detector';
      newItem.panel_status = 'OK';
      newItem.power_battery = 'OK';
      newItem.sensor_head = 'OK';
      newItem.shutoff_valve = 'OK';
      newItem.fan_interlock = 'OK';
      newItem.sounder_strobe = 'OK';
      newItem.calibration_record = 'OK';
    } else if (sysKey === 'emergency_lights') {
      newItem.light_id = newItemIdentifier || `EM-${bNumber}-${Date.now().toString().slice(-3)}`;
      newItem.floor = newItemFloor || 'Ground Floor';
      newItem.location = newItemLocation || 'Corridor';
      newItem.type = newItemType || 'Twin Spot 2x5W LED Unit';
      newItem.ac_power_indicator = 'OK';
      newItem.duration_test_passed = 'OK';
      newItem.lamp_condition = 'OK';
      newItem.charging_circuit = 'OK';
    } else if (sysKey === 'exit_lights') {
      newItem.sign_id = newItemIdentifier || `EX-${bNumber}-${Date.now().toString().slice(-3)}`;
      newItem.floor = newItemFloor || 'Ground Floor';
      newItem.location = newItemLocation || 'Exit Door';
      newItem.illumination = 'OK';
      newItem.battery_backup = 'OK';
      newItem.pictogram_condition = 'OK';
      newItem.housing_condition = 'OK';
    } else {
      newItem.item = newItemIdentifier || `Safety Equipment Device`;
      newItem.make = newItemMake || '';
      newItem.type = newItemType || '';
      newItem.quantity = '1';
    }

    setBuildings(prev => prev.map((bld, idx) => {
      if (idx === activeBuildingIndex) {
        const currentList = bld.checklists?.[sysKey] || [];
        return {
          ...bld,
          checklists: {
            ...bld.checklists,
            [sysKey]: [...currentList, newItem]
          }
        };
      }
      return bld;
    }));

    setShowAddItemModal(false);
    setNewItemIdentifier('');
    setNewItemFloor('');
    setNewItemLocation('');
    showToast(`Added new item to ${sysKey.replace(/_/g, ' ')}`, 'success');
  };

  // Remove checklist item
  const handleRemoveItem = (sysKey, itemId) => {
    setBuildings(prev => prev.map((bld, idx) => {
      if (idx === activeBuildingIndex) {
        const currentList = bld.checklists?.[sysKey] || [];
        return {
          ...bld,
          checklists: {
            ...bld.checklists,
            [sysKey]: currentList.filter(i => i.id !== itemId)
          }
        };
      }
      return bld;
    }));
    showToast('Item removed', 'info');
  };

  // Handle Photo upload
  const handlePhotoUpload = (e, sysKey, itemId) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      showToast('Image size exceeds 8MB limit', 'warning');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setBuildings(prev => prev.map((bld, idx) => {
        if (idx === activeBuildingIndex) {
          const currentList = bld.checklists?.[sysKey] || [];
          return {
            ...bld,
            checklists: {
              ...bld.checklists,
              [sysKey]: currentList.map(item => {
                if (item.id === itemId) {
                  return {
                    ...item,
                    photos: [...(item.photos || []), dataUrl]
                  };
                }
                return item;
              })
            }
          };
        }
        return bld;
      }));
      showToast('Photo attached to inspection item', 'success');
    };
    reader.readAsDataURL(file);
  };

  // Handle Building Add / Save
  const handleSaveBuilding = () => {
    if (!bldFormName.trim()) {
      showToast('Building name is required', 'warning');
      return;
    }
    const bNumber = bldFormNumber.trim() || String(buildings.length + 1);

    if (editingBuildingIndex !== null) {
      // Editing existing building
      setBuildings(prev => prev.map((b, idx) => {
        if (idx === editingBuildingIndex) {
          return {
            ...b,
            building_number: bNumber,
            building_name: bldFormName.trim(),
            location: bldFormLocation.trim()
          };
        }
        return b;
      }));
      showToast('Building updated', 'success');
    } else {
      // Add new building with default systems
      const newBuilding = {
        building_id: `bld-${Date.now()}-${bNumber}`,
        building_number: bNumber,
        building_name: bldFormName.trim(),
        location: bldFormLocation.trim(),
        selected_systems: ['fire_alarm', 'fire_hose_reels', 'landing_valves', 'fire_extinguishers'],
        checklists: {},
        defects: [],
        remarks: '',
        photos: []
      };
      setBuildings(prev => [...prev, newBuilding]);
      setActiveBuildingIndex(buildings.length); // Switch to newly created building
      showToast(`Building ${bNumber} — ${bldFormName} added!`, 'success');
    }
    setShowBuildingModal(false);
    setEditingBuildingIndex(null);
    setBldFormNumber('');
    setBldFormName('');
    setBldFormLocation('');
  };

  // Delete a building
  const handleDeleteBuilding = (bldIdx) => {
    if (buildings.length <= 1) {
      showToast('At least one building is required for the inspection visit', 'warning');
      return;
    }
    const bName = buildings[bldIdx]?.building_name || `Building ${bldIdx + 1}`;
    if (!window.confirm(`Are you sure you want to remove ${bName}? All its inspection results will be removed.`)) {
      return;
    }
    setBuildings(prev => prev.filter((_, idx) => idx !== bldIdx));
    if (activeBuildingIndex >= bldIdx) {
      setActiveBuildingIndex(Math.max(0, activeBuildingIndex - 1));
    }
    showToast(`${bName} removed`, 'info');
  };

  // Save or Submit checklist
  const handleSaveChecklist = async (isSubmit = false) => {
    if (isSubmit && !customerSignature) {
      showToast('Please capture customer representative signature before submitting', 'warning');
      setActiveTab('signoff');
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
        buildings: buildings,
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
        const savedData = await res.json().catch(() => null);
        showToast(
          isSubmit
            ? 'AMC Checklists submitted successfully across all buildings!'
            : 'Checklist progress saved successfully',
          'success'
        );
        if (onRefresh) onRefresh();
        if (isSubmit) {
          onClose();
        }
        return savedData;
      } else {
        const err = await res.json();
        showToast(err.message || 'Error saving checklist', 'error');
        return null;
      }
    } catch (err) {
      console.error('Save checklist error:', err);
      showToast('Network error saving checklist', 'error');
      return null;
    } finally {
      setSaving(false);
    }
  };

  // Generate / View Report directly from Checklist
  const handleMakeReport = async () => {
    const saved = await handleSaveChecklist(false);
    if (!saved) return;
    showToast('Checklist saved! Opening AMC Service Report...', 'success');
    if (onRefresh) onRefresh();
    if (onViewReport) {
      const reportId = saved?.report_id || visit.report_id;
      const reportNumber = saved?.report_number || visit.report_number;
      onViewReport({
        ...visit,
        ...(saved || {}),
        report_id: reportId,
        report_number: reportNumber,
        actual_service_date: actualServiceDate,
        supervisor_id: assignedSupervisorId,
        supervisor_name: assignedSupervisorName,
        technician_id: assignedTechnicianId,
        technician_name: assignedTechnicianName,
        buildings: buildings,
        checklist_data: {
          ...saved.checklist,
          buildings: buildings,
          customer_signature: customerSignature,
          technician_notes: technicianNotes
        },
        prepared_by_name: currentUser?.name || assignedTechnicianName,
        prepared_at: new Date().toISOString()
      });
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
          <RefreshCw className="w-10 h-10 text-red-600 animate-spin mx-auto mb-4" />
          <h3 className="text-base font-black text-slate-800">Loading AMC Checklists</h3>
          <p className="text-xs text-slate-500 mt-1">Preparing multi-building inspection sheets...</p>
        </div>
      </div>
    );
  }

  const selectedSystems = currentBuilding?.selected_systems || [];
  const currentSystemConfig = SYSTEM_CONFIGS.find(s => s.key === activeTab);
  const currentItems = (currentBuilding && currentBuilding.checklists?.[activeTab]) || [];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex flex-col justify-between overflow-hidden">
      
      {/* 1. TOP HEADER BAR */}
      <div className="bg-navy-950 text-white px-4 sm:px-6 py-3 border-b border-navy-800 flex items-center justify-between shadow-xl shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-red-600 text-white px-2 py-0.5 rounded shadow-sm">
                AMC Periodic Inspection
              </span>
              <span className="text-xs font-mono text-amber-300 font-bold">
                {visit.contract_number} • Visit #{visit.visit_number} ({visit.quarter || 'Q1'})
              </span>
            </div>
            <h1 className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-2 mt-0.5">
              <span>{visit.customer_name || 'Customer'}</span>
              <span className="text-slate-400 font-normal">•</span>
              <span className="text-slate-300 text-xs sm:text-sm font-semibold">{visit.site_name || 'Site'}</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSaveChecklist(false)}
            disabled={saving}
            className="px-3.5 py-1.5 rounded-xl bg-navy-800 hover:bg-navy-700 text-white text-xs font-bold flex items-center gap-1.5 border border-navy-700 shadow-sm transition-colors"
          >
            <Save className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Save Progress</span>
          </button>

          <button
            onClick={handleMakeReport}
            disabled={saving}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-black flex items-center gap-1.5 shadow-lg shadow-red-950/40 transition-all"
          >
            <FileText className="w-3.5 h-3.5 text-white" />
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      {/* 2. MULTI-BUILDING TAB BAR (PART 1) */}
      <div className="bg-navy-900 px-4 sm:px-6 py-2 border-b border-navy-800 flex items-center justify-between gap-2 overflow-x-auto shrink-0 scrollbar-none">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5 pr-2 border-r border-navy-700">
            <Building2 className="w-3.5 h-3.5 text-red-500" />
            <span>Buildings:</span>
          </span>

          {buildings.map((bld, idx) => {
            const isActive = idx === activeBuildingIndex;
            const sysCount = (bld.selected_systems || []).length;
            return (
              <div key={bld.building_id || idx} className="flex items-center">
                <button
                  onClick={() => {
                    setActiveBuildingIndex(idx);
                    setActiveTab('systems_select');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all border ${
                    isActive 
                      ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-950/50' 
                      : 'bg-navy-800 text-slate-300 hover:bg-navy-700 border-navy-700 hover:text-white'
                  }`}
                >
                  <span className="font-mono text-[10px] bg-black/20 px-1.5 py-0.5 rounded font-black">
                    B-{bld.building_number || idx + 1}
                  </span>
                  <span>{bld.building_name || `Building ${bld.building_number || idx + 1}`}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${isActive ? 'bg-white/20 text-white' : 'bg-navy-950 text-slate-400'}`}>
                    {sysCount} sys
                  </span>
                </button>

                {isActive && (
                  <button
                    onClick={() => {
                      setEditingBuildingIndex(idx);
                      setBldFormNumber(bld.building_number || String(idx + 1));
                      setBldFormName(bld.building_name || '');
                      setBldFormLocation(bld.location || '');
                      setShowBuildingModal(true);
                    }}
                    className="ml-1 p-1 text-slate-400 hover:text-white rounded hover:bg-navy-800 transition-colors"
                    title="Edit Building Details"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}

          <button
            onClick={() => {
              setEditingBuildingIndex(null);
              setBldFormNumber(String(buildings.length + 1));
              setBldFormName(`Tower ${String.fromCharCode(65 + buildings.length)}`);
              setBldFormLocation('');
              setShowBuildingModal(true);
            }}
            className="px-2.5 py-1.5 rounded-xl bg-navy-800/80 hover:bg-navy-700 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1 border border-dashed border-navy-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Add Building</span>
          </button>
        </div>

        {buildings.length > 1 && (
          <button
            onClick={() => handleDeleteBuilding(activeBuildingIndex)}
            className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 shrink-0 px-2 py-1 rounded hover:bg-red-500/10 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            <span>Delete Building</span>
          </button>
        )}
      </div>

      {/* 3. ACTIVE BUILDING SUB-NAV: SYSTEMS CHECKLIST SELECTOR & ACTIVE SYSTEM TABS */}
      <div className="bg-slate-100 border-b border-slate-200 px-4 sm:px-6 py-2 flex items-center justify-between gap-3 overflow-x-auto shrink-0 scrollbar-none">
        <div className="flex items-center gap-1.5">
          {/* Systems Select / Manager Tab */}
          <button
            onClick={() => setActiveTab('systems_select')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'systems_select'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-amber-500" />
            <span>Select Systems ({selectedSystems.length}/10)</span>
          </button>

          {/* Individual System Tabs for Selected Systems in this Building */}
          {selectedSystems.map(sysKey => {
            const cfg = SYSTEM_CONFIGS.find(s => s.key === sysKey);
            if (!cfg) return null;
            const Icon = cfg.icon;
            const isActive = activeTab === sysKey;
            const items = currentBuilding?.checklists?.[sysKey] || [];
            const notOkCount = items.filter(i => i.status === 'NOT OK').length;

            return (
              <button
                key={sysKey}
                onClick={() => setActiveTab(sysKey)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{cfg.short}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${isActive ? 'bg-black/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {items.length}
                </span>
                {notOkCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title={`${notOkCount} defect(s)`} />
                )}
              </button>
            );
          })}

          {/* Sign-off & Completion Tab */}
          <button
            onClick={() => setActiveTab('signoff')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'signoff'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Sign-off &amp; Review</span>
          </button>
        </div>
      </div>

      {/* 4. MAIN CONTENT AREA */}
      <div className="flex-1 overflow-y-auto bg-slate-50 p-3 sm:p-6">
        <div className="max-w-5xl mx-auto space-y-4">
          
          {/* TAB 1: SELECT FIRE & SAFETY SYSTEMS (PART 2) */}
          {activeTab === 'systems_select' && (
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-5 animate-in fade-in duration-150">
              <div className="border-b border-slate-200 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-navy-100 text-navy-800 px-2 py-0.5 rounded">
                      Building {currentBuilding?.building_number}: {currentBuilding?.building_name}
                    </span>
                    <span className="text-xs text-slate-500">{currentBuilding?.location}</span>
                  </div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 mt-1">
                    Select Fire &amp; Safety Systems to Inspect
                  </h2>
                  <p className="text-xs text-slate-600">
                    Enable the systems present in this building. Only checklists for selected systems will appear and be saved.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const allKeys = SYSTEM_CONFIGS.map(s => s.key);
                      updateBuildingProperty('selected_systems', allKeys);
                      allKeys.forEach(k => {
                        if (!currentBuilding?.checklists?.[k] || currentBuilding.checklists[k].length === 0) {
                          initSystemChecklistForBuilding(k, currentBuilding?.building_number);
                        }
                      });
                    }}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded text-xs font-bold text-slate-700"
                  >
                    Select All
                  </button>
                  <button
                    onClick={() => updateBuildingProperty('selected_systems', ['fire_alarm', 'fire_hose_reels', 'fire_extinguishers'])}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded text-xs font-bold text-slate-700"
                  >
                    Standard (3 Systems)
                  </button>
                </div>
              </div>

              {/* 10 Systems Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {SYSTEM_CONFIGS.map(sys => {
                  const isChecked = selectedSystems.includes(sys.key);
                  const Icon = sys.icon;
                  const itemsCount = (currentBuilding?.checklists?.[sys.key] || []).length;

                  return (
                    <div
                      key={sys.key}
                      onClick={() => handleToggleSystem(sys.key)}
                      className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-start justify-between gap-3 ${
                        isChecked 
                          ? 'border-red-600 bg-red-50/50 shadow-sm' 
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${isChecked ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-black text-slate-900">
                              {sys.label}
                            </span>
                            {isChecked && (
                              <span className="text-[10px] font-mono bg-red-100 text-red-800 font-bold px-1.5 py-0.2 rounded">
                                Active ({itemsCount} items)
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {sys.key === 'fire_hose_reels' && 'Dedicated swing drums, 30m hose, nozzle & flow test'}
                            {sys.key === 'landing_valves' && 'Dedicated landing valves, couplings, handwheels & pressure'}
                            {sys.key === 'fire_extinguishers' && 'DCP, CO2, Foam, Wet Chemical with selective gauge verification'}
                            {sys.key === 'fm200_suppression' && 'Cylinders, pressure/weight, abort switch & room enclosure'}
                            {sys.key === 'lpg_detection' && 'Gas sensors, control panel, shutoff valve & bump test'}
                            {sys.key === 'fire_alarm' && 'Addressable panels, loops, detectors, call points & interlocks'}
                            {sys.key === 'fire_fighting' && 'Pumps, water tank, hydrants & sprinkler system'}
                            {sys.key === 'emergency_lights' && 'Twin spots & emergency luminaires with battery duration test'}
                            {sys.key === 'exit_lights' && 'Illuminated exit signs with pictogram & battery backup'}
                            {sys.key === 'voice_evacuation' && 'Master voice alarm console, announcements & zone clarity'}
                          </p>
                        </div>
                      </div>

                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // handled by div onClick
                        className="w-5 h-5 text-red-600 rounded border-slate-300 focus:ring-red-500 shrink-0 mt-1 cursor-pointer"
                      />
                    </div>
                  );
                })}
              </div>

              {selectedSystems.length > 0 && (
                <div className="pt-3 border-t border-slate-200 flex justify-end">
                  <button
                    onClick={() => setActiveTab(selectedSystems[0])}
                    className="px-5 py-2 rounded-xl bg-navy-950 hover:bg-navy-900 text-white text-xs font-black flex items-center gap-2 shadow-md transition-all"
                  >
                    <span>Proceed to Checklist ({SYSTEM_CONFIGS.find(s => s.key === selectedSystems[0])?.short})</span>
                    <Check className="w-4 h-4 text-emerald-400" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SYSTEM CHECKLISTS (PARTS 3-8) */}
          {activeTab !== 'systems_select' && activeTab !== 'signoff' && currentSystemConfig && (
            <div className="space-y-4 animate-in fade-in duration-150">
              
              {/* System Header Card */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-navy-100 text-navy-800 px-2 py-0.5 rounded">
                      Building {currentBuilding?.building_number}: {currentBuilding?.building_name}
                    </span>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${currentSystemConfig.badgeColor}`}>
                      {currentSystemConfig.label}
                    </span>
                  </div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 mt-1 flex items-center gap-2">
                    <span>{currentSystemConfig.label} Inspection</span>
                    <span className="text-xs font-mono font-bold text-slate-500">
                      ({currentItems.length} items recorded)
                    </span>
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setNewItemIdentifier('');
                      setShowAddItemModal(true);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Add {currentSystemConfig.short} Unit</span>
                  </button>
                </div>
              </div>

              {/* Items List */}
              {currentItems.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                  <p className="text-sm font-bold text-slate-600">No inspection items found for this system in this building.</p>
                  <p className="text-xs text-slate-400 mt-1">Click below to initialize standard civil defense items or add custom units.</p>
                  <button
                    onClick={() => initSystemChecklistForBuilding(activeTab, currentBuilding?.building_number)}
                    className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Load Standard Items</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {currentItems.map((item, idx) => {
                    const isExpanded = expandedItemId === item.id;
                    const isNotOk = item.status === 'NOT OK';
                    const isNa = item.status === 'N/A';

                    return (
                      <div
                        key={item.id || idx}
                        className={`bg-white rounded-2xl border transition-all ${
                          isNotOk 
                            ? 'border-red-400 shadow-md shadow-red-950/5' 
                            : 'border-slate-200 hover:border-slate-300 shadow-sm'
                        }`}
                      >
                        <div className="p-4 sm:p-5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-mono font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                                {idx + 1}
                              </span>

                              <div className="flex-1 min-w-0">
                                {/* Title and Sub-details */}
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="text-xs sm:text-sm font-black text-slate-900 truncate">
                                    {item.item || item.reel_id || item.valve_id || item.ext_id || item.system_tag || item.detector_id || item.light_id || item.sign_id || 'Inspection Item'}
                                  </h3>
                                  
                                  {/* Floor / Location tag */}
                                  {(item.floor || item.location) && (
                                    <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded flex items-center gap-1">
                                      <MapPin className="w-2.5 h-2.5 text-slate-500" />
                                      <span>{[item.floor, item.location].filter(Boolean).join(' • ')}</span>
                                    </span>
                                  )}

                                  {/* Extinguisher specific badges */}
                                  {activeTab === 'fire_extinguishers' && (
                                    <>
                                      <span className="text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded">
                                        {item.type} ({item.capacity})
                                      </span>
                                      {item.serial_number && (
                                        <span className="text-[10px] font-mono text-slate-500 font-bold">
                                          SN: {item.serial_number}
                                        </span>
                                      )}
                                    </>
                                  )}
                                </div>

                                {/* Spec or item description */}
                                <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
                                  {item.make && <span>Make: <strong className="text-slate-700">{item.make}</strong></span>}
                                  {item.type && activeTab !== 'fire_extinguishers' && <span>Type: <strong className="text-slate-700">{item.type}</strong></span>}
                                  {item.quantity && <span>Qty: <strong className="text-slate-700">{item.quantity}</strong></span>}
                                </div>
                              </div>
                            </div>

                            {/* Status Buttons: OK / NOT OK / N/A */}
                            <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                              <button
                                onClick={() => updateChecklistItem(activeTab, item.id, 'status', 'OK')}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-black flex items-center gap-1 transition-all ${
                                  item.status === 'OK'
                                    ? 'bg-emerald-600 text-white shadow-sm'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>OK</span>
                              </button>

                              <button
                                onClick={() => updateChecklistItem(activeTab, item.id, 'status', 'NOT OK')}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-black flex items-center gap-1 transition-all ${
                                  item.status === 'NOT OK'
                                    ? 'bg-red-600 text-white shadow-sm'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>NOT OK</span>
                              </button>

                              <button
                                onClick={() => updateChecklistItem(activeTab, item.id, 'status', 'N/A')}
                                className={`px-2 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                                  item.status === 'N/A'
                                    ? 'bg-slate-600 text-white shadow-sm'
                                    : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                }`}
                              >
                                <MinusCircle className="w-3.5 h-3.5" />
                                <span>N/A</span>
                              </button>

                              <button
                                onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                                title="Expand / Collapse Details"
                              >
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          {/* Specific Technical Parameters (Parts 3, 4, 5, 6, 7) */}
                          <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                            
                            {/* HOSE REEL SPECIFIC CHECKS (PART 3) */}
                            {activeTab === 'fire_hose_reels' && (
                              <>
                                <div>
                                  <span className="text-slate-500 font-bold block">Cabinet Condition</span>
                                  <select
                                    value={item.cabinet_condition || 'OK'}
                                    onChange={(e) => updateChecklistItem(activeTab, item.id, 'cabinet_condition', e.target.value)}
                                    className="w-full text-xs font-semibold rounded border-slate-200 p-1 bg-slate-50"
                                  >
                                    <option value="OK">OK - Sound</option>
                                    <option value="NOT OK">NOT OK - Damaged / Glass Broken</option>
                                    <option value="N/A">N/A</option>
                                  </select>
                                </div>
                                <div>
                                  <span className="text-slate-500 font-bold block">Hose Integrity</span>
                                  <select
                                    value={item.hose_condition || 'OK'}
                                    onChange={(e) => updateChecklistItem(activeTab, item.id, 'hose_condition', e.target.value)}
                                    className="w-full text-xs font-semibold rounded border-slate-200 p-1 bg-slate-50"
                                  >
                                    <option value="OK">OK - 30m Sound</option>
                                    <option value="NOT OK">NOT OK - Kinked / Cracked</option>
                                  </select>
                                </div>
                                <div>
                                  <span className="text-slate-500 font-bold block">Shutoff Nozzle</span>
                                  <select
                                    value={item.nozzle_operation || 'OK'}
                                    onChange={(e) => updateChecklistItem(activeTab, item.id, 'nozzle_operation', e.target.value)}
                                    className="w-full text-xs font-semibold rounded border-slate-200 p-1 bg-slate-50"
                                  >
                                    <option value="OK">OK - Jet/Spray Operates</option>
                                    <option value="NOT OK">NOT OK - Jammed / Missing</option>
                                  </select>
                                </div>
                                <div>
                                  <span className="text-slate-500 font-bold block">Water Flow / Leakage</span>
                                  <select
                                    value={item.leakage_test || 'OK'}
                                    onChange={(e) => updateChecklistItem(activeTab, item.id, 'leakage_test', e.target.value)}
                                    className="w-full text-xs font-semibold rounded border-slate-200 p-1 bg-slate-50"
                                  >
                                    <option value="OK">OK - No Leaks, Flow Normal</option>
                                    <option value="NOT OK">NOT OK - Valve Leaking</option>
                                  </select>
                                </div>
                              </>
                            )}

                            {/* LANDING VALVE SPECIFIC CHECKS (PART 4) */}
                            {activeTab === 'landing_valves' && (
                              <>
                                <div>
                                  <span className="text-slate-500 font-bold block">Handwheel Operation</span>
                                  <select
                                    value={item.handwheel_operation || 'OK'}
                                    onChange={(e) => updateChecklistItem(activeTab, item.id, 'handwheel_operation', e.target.value)}
                                    className="w-full text-xs font-semibold rounded border-slate-200 p-1 bg-slate-50"
                                  >
                                    <option value="OK">OK - Smooth Spindle</option>
                                    <option value="NOT OK">NOT OK - Stiff / Jammed</option>
                                  </select>
                                </div>
                                <div>
                                  <span className="text-slate-500 font-bold block">Cap &amp; Chain</span>
                                  <select
                                    value={item.cap_chain || 'OK'}
                                    onChange={(e) => updateChecklistItem(activeTab, item.id, 'cap_chain', e.target.value)}
                                    className="w-full text-xs font-semibold rounded border-slate-200 p-1 bg-slate-50"
                                  >
                                    <option value="OK">OK - Intact &amp; Chained</option>
                                    <option value="NOT OK">NOT OK - Cap/Chain Missing</option>
                                  </select>
                                </div>
                                <div>
                                  <span className="text-slate-500 font-bold block">Coupling &amp; Washer</span>
                                  <select
                                    value={item.coupling_condition || 'OK'}
                                    onChange={(e) => updateChecklistItem(activeTab, item.id, 'coupling_condition', e.target.value)}
                                    className="w-full text-xs font-semibold rounded border-slate-200 p-1 bg-slate-50"
                                  >
                                    <option value="OK">OK - 2.5" Instantaneous Sound</option>
                                    <option value="NOT OK">NOT OK - Rubber Washer Perished</option>
                                  </select>
                                </div>
                                <div>
                                  <span className="text-slate-500 font-bold block">Pressure / Flow Test</span>
                                  <select
                                    value={item.pressure_flow_test || 'OK'}
                                    onChange={(e) => updateChecklistItem(activeTab, item.id, 'pressure_flow_test', e.target.value)}
                                    className="w-full text-xs font-semibold rounded border-slate-200 p-1 bg-slate-50"
                                  >
                                    <option value="OK">OK - Full Flow, No Weeping</option>
                                    <option value="NOT OK">NOT OK - Gland Leak Detected</option>
                                  </select>
                                </div>
                              </>
                            )}

                            {/* FIRE EXTINGUISHER SPECIFIC CHECKS (PART 5) */}
                            {activeTab === 'fire_extinguishers' && (
                              <>
                                <div>
                                  <span className="text-slate-500 font-bold block">Extinguisher Type</span>
                                  <select
                                    value={item.type || 'ABC Dry Chemical Powder'}
                                    onChange={(e) => {
                                      const newType = e.target.value;
                                      updateChecklistItem(activeTab, item.id, 'type', newType);
                                      if (newType.includes('CO2')) {
                                        updateChecklistItem(activeTab, item.id, 'pressure_gauge', 'N/A');
                                      } else if (item.pressure_gauge === 'N/A') {
                                        updateChecklistItem(activeTab, item.id, 'pressure_gauge', 'OK');
                                      }
                                    }}
                                    className="w-full text-xs font-semibold rounded border-slate-200 p-1 bg-slate-50"
                                  >
                                    {EXTINGUISHER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                  </select>
                                </div>
                                <div>
                                  <span className="text-slate-500 font-bold block">Pressure Gauge Check</span>
                                  {item.type?.includes('CO2') ? (
                                    <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-1 rounded block border border-amber-200 font-bold">
                                      N/A (Weight Tested)
                                    </span>
                                  ) : (
                                    <select
                                      value={item.pressure_gauge || 'OK'}
                                      onChange={(e) => updateChecklistItem(activeTab, item.id, 'pressure_gauge', e.target.value)}
                                      className="w-full text-xs font-semibold rounded border-slate-200 p-1 bg-slate-50"
                                    >
                                      <option value="OK">OK - Green Zone</option>
                                      <option value="NOT OK">NOT OK - Undercharged / Low</option>
                                      <option value="N/A">N/A</option>
                                    </select>
                                  )}
                                </div>
                                <div>
                                  <span className="text-slate-500 font-bold block">Gross Weight Check</span>
                                  <select
                                    value={item.weight_status || 'OK'}
                                    onChange={(e) => updateChecklistItem(activeTab, item.id, 'weight_status', e.target.value)}
                                    className="w-full text-xs font-semibold rounded border-slate-200 p-1 bg-slate-50"
                                  >
                                    <option value="OK">OK - Full Weight</option>
                                    <option value="NOT OK">NOT OK - Loss &gt; 10%</option>
                                  </select>
                                </div>
                                <div>
                                  <span className="text-slate-500 font-bold block">Pin &amp; Tamper Seal</span>
                                  <select
                                    value={item.safety_pin || 'OK'}
                                    onChange={(e) => updateChecklistItem(activeTab, item.id, 'safety_pin', e.target.value)}
                                    className="w-full text-xs font-semibold rounded border-slate-200 p-1 bg-slate-50"
                                  >
                                    <option value="OK">OK - Intact &amp; Wired</option>
                                    <option value="NOT OK">NOT OK - Missing / Broken</option>
                                  </select>
                                </div>
                              </>
                            )}

                            {/* FM200 SPECIFIC CHECKS (PART 6) */}
                            {activeTab === 'fm200_suppression' && (
                              <>
                                <div>
                                  <span className="text-slate-500 font-bold block">Cylinder Pressure (25 Bar)</span>
                                  <select
                                    value={item.cylinder_pressure || 'OK'}
                                    onChange={(e) => updateChecklistItem(activeTab, item.id, 'cylinder_pressure', e.target.value)}
                                    className="w-full text-xs font-semibold rounded border-slate-200 p-1 bg-slate-50"
                                  >
                                    <option value="OK">OK - In Green Band</option>
                                    <option value="NOT OK">NOT OK - Pressure Dropped</option>
                                  </select>
                                </div>
                                <div>
                                  <span className="text-slate-500 font-bold block">Abort Control Switch</span>
                                  <select
                                    value={item.abort_switch || 'OK'}
                                    onChange={(e) => updateChecklistItem(activeTab, item.id, 'abort_switch', e.target.value)}
                                    className="w-full text-xs font-semibold rounded border-slate-200 p-1 bg-slate-50"
                                  >
                                    <option value="OK">OK - Holds Discharge Timer</option>
                                    <option value="NOT OK">NOT OK - Switch Faulty</option>
                                  </select>
                                </div>
                                <div>
                                  <span className="text-slate-500 font-bold block">Room Enclosure Seals</span>
                                  <select
                                    value={item.room_integrity_enclosure || 'OK'}
                                    onChange={(e) => updateChecklistItem(activeTab, item.id, 'room_integrity_enclosure', e.target.value)}
                                    className="w-full text-xs font-semibold rounded border-slate-200 p-1 bg-slate-50"
                                  >
                                    <option value="OK">OK - Room Sealed Tight</option>
                                    <option value="NOT OK">NOT OK - Penetrations / Openings</option>
                                  </select>
                                </div>
                                <div>
                                  <span className="text-slate-500 font-bold block">Solenoid &amp; Actuator</span>
                                  <select
                                    value={item.actuator_solenoid || 'OK'}
                                    onChange={(e) => updateChecklistItem(activeTab, item.id, 'actuator_solenoid', e.target.value)}
                                    className="w-full text-xs font-semibold rounded border-slate-200 p-1 bg-slate-50"
                                  >
                                    <option value="OK">OK - Wiring Sound</option>
                                    <option value="NOT OK">NOT OK - Actuator Disconnected</option>
                                  </select>
                                </div>
                              </>
                            )}

                            {/* LPG GAS DETECTION CHECKS (PART 7) */}
                            {activeTab === 'lpg_detection' && (
                              <>
                                <div>
                                  <span className="text-slate-500 font-bold block">Control Panel Status</span>
                                  <select
                                    value={item.panel_status || 'OK'}
                                    onChange={(e) => updateChecklistItem(activeTab, item.id, 'panel_status', e.target.value)}
                                    className="w-full text-xs font-semibold rounded border-slate-200 p-1 bg-slate-50"
                                  >
                                    <option value="OK">OK - Normal Standby</option>
                                    <option value="NOT OK">NOT OK - Panel Faulty</option>
                                  </select>
                                </div>
                                <div>
                                  <span className="text-slate-500 font-bold block">Shut-off Solenoid Valve</span>
                                  <select
                                    value={item.shutoff_valve || 'OK'}
                                    onChange={(e) => updateChecklistItem(activeTab, item.id, 'shutoff_valve', e.target.value)}
                                    className="w-full text-xs font-semibold rounded border-slate-200 p-1 bg-slate-50"
                                  >
                                    <option value="OK">OK - Auto Cut-off Tripped</option>
                                    <option value="NOT OK">NOT OK - Valve Fails to Trip</option>
                                  </select>
                                </div>
                                <div>
                                  <span className="text-slate-500 font-bold block">Exhaust Fan Interlock</span>
                                  <select
                                    value={item.fan_interlock || 'OK'}
                                    onChange={(e) => updateChecklistItem(activeTab, item.id, 'fan_interlock', e.target.value)}
                                    className="w-full text-xs font-semibold rounded border-slate-200 p-1 bg-slate-50"
                                  >
                                    <option value="OK">OK - Fan Starts on Gas Alert</option>
                                    <option value="NOT OK">NOT OK - Fan Interlock Failed</option>
                                  </select>
                                </div>
                                <div>
                                  <span className="text-slate-500 font-bold block">Bump Test Calibration</span>
                                  <select
                                    value={item.calibration_record || 'OK'}
                                    onChange={(e) => updateChecklistItem(activeTab, item.id, 'calibration_record', e.target.value)}
                                    className="w-full text-xs font-semibold rounded border-slate-200 p-1 bg-slate-50"
                                  >
                                    <option value="OK">OK - Valid Calibration</option>
                                    <option value="NOT OK">NOT OK - Calibration Expired</option>
                                  </select>
                                </div>
                              </>
                            )}

                          </div>

                          {/* Remarks & Photos Expanded View */}
                          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div className="flex-1 w-full">
                              <input
                                type="text"
                                value={item.remarks || ''}
                                onChange={(e) => updateChecklistItem(activeTab, item.id, 'remarks', e.target.value)}
                                placeholder="Technician remarks / findings / corrective recommendations..."
                                className="w-full text-xs rounded-xl border-slate-200 focus:border-red-500 focus:ring-red-500 px-3 py-1.5 bg-slate-50"
                              />
                            </div>

                            {/* Photo Attachments */}
                            <div className="flex items-center gap-2 shrink-0">
                              <label className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-slate-200 transition-colors">
                                <Camera className="w-3.5 h-3.5 text-blue-600" />
                                <span>Attach Photo ({(item.photos || []).length})</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  capture="environment"
                                  className="hidden"
                                  onChange={(e) => handlePhotoUpload(e, activeTab, item.id)}
                                />
                              </label>

                              <button
                                onClick={() => handleRemoveItem(activeTab, item.id)}
                                className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                title="Delete item"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Render Photo Thumbnails */}
                          {item.photos && item.photos.length > 0 && (
                            <div className="mt-2.5 flex items-center gap-2 overflow-x-auto py-1">
                              {item.photos.map((p, pIdx) => (
                                <div key={pIdx} className="relative group shrink-0">
                                  <img
                                    src={p}
                                    alt="Observation Photo"
                                    className="w-14 h-14 object-cover rounded-lg border border-slate-300 shadow-sm"
                                  />
                                </div>
                              ))}
                            </div>
                          )}

                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

          {/* TAB 3: SIGNOFF & SUPERVISOR REVIEW TAB */}
          {activeTab === 'signoff' && (
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-6 animate-in fade-in duration-150">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  Customer Sign-off &amp; Inspection Certification
                </h2>
                <p className="text-xs text-slate-500">
                  Review assignments and capture the facility representative signature.
                </p>
              </div>

              {/* Assignment Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Inspection Service Date</label>
                  <input
                    type="date"
                    value={actualServiceDate}
                    onChange={(e) => setActualServiceDate(e.target.value)}
                    className="w-full text-xs rounded-xl border-slate-300 font-semibold p-2.5"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Assigned Field Supervisor</label>
                  <select
                    value={assignedSupervisorName}
                    onChange={(e) => setAssignedSupervisorName(e.target.value)}
                    className="w-full text-xs rounded-xl border-slate-300 font-semibold p-2.5 bg-slate-50"
                  >
                    <option value="Sarath Kr">Sarath Kr (Field Supervisor)</option>
                    <option value="Eng. Mohamed Hweidi">Eng. Mohamed Hweidi (GM / Lead Engineer)</option>
                    <option value="Wissam Jamal Hussein">Wissam Jamal Hussein (Managing Director)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Inspecting Service Technician</label>
                  <input
                    type="text"
                    value={assignedTechnicianName}
                    onChange={(e) => setAssignedTechnicianName(e.target.value)}
                    placeholder="Technician Name"
                    className="w-full text-xs rounded-xl border-slate-300 font-semibold p-2.5"
                  />
                </div>
              </div>

              {/* Multi-Building Inspection Summary */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
                <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider">
                  Multi-Building Inspection Summary ({buildings.length} Buildings)
                </h3>
                <div className="divide-y divide-slate-200">
                  {buildings.map((bld, idx) => {
                    const chks = bld.checklists || {};
                    let totalItems = 0;
                    let notOkCount = 0;
                    Object.values(chks).forEach(list => {
                      if (Array.isArray(list)) {
                        totalItems += list.length;
                        notOkCount += list.filter(i => i.status === 'NOT OK').length;
                      }
                    });

                    return (
                      <div key={bld.building_id || idx} className="py-2 flex items-center justify-between text-xs">
                        <div>
                          <strong className="text-slate-900">Building {bld.building_number}: {bld.building_name}</strong>
                          <span className="text-slate-500 ml-2">({(bld.selected_systems || []).length} systems inspected)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-600">{totalItems} items</span>
                          {notOkCount > 0 ? (
                            <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded font-mono">
                              {notOkCount} Defect(s) Logged
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">
                              All Clear
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Technician General Remarks */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Overall Inspection Observations &amp; Notes</label>
                <textarea
                  rows={3}
                  value={technicianNotes}
                  onChange={(e) => setTechnicianNotes(e.target.value)}
                  placeholder="Enter overall summary of site conditions, access details, pump room cleanout, or urgent notes..."
                  className="w-full text-xs rounded-xl border-slate-300 p-3"
                />
              </div>

              {/* Customer Representative Signature Box */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Customer Facility Representative Signature &amp; Acknowledgment
                </label>
                {customerSignature ? (
                  <div className="border border-slate-300 rounded-xl p-3 bg-slate-50 flex items-center justify-between">
                    <img src={customerSignature} alt="Customer Signature" className="h-16 object-contain" />
                    <button
                      onClick={() => setCustomerSignature(null)}
                      className="text-xs text-red-600 hover:underline font-bold"
                    >
                      Clear Signature
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowSignPad(true)}
                    className="w-full py-4 border-2 border-dashed border-slate-300 hover:border-slate-400 rounded-xl text-center text-xs font-bold text-slate-600 hover:text-slate-800 transition-colors"
                  >
                    Tap to Capture Customer Signature
                  </button>
                )}
              </div>

              {/* Final Submit Button */}
              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  onClick={() => handleSaveChecklist(false)}
                  disabled={saving}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold"
                >
                  Save as Draft
                </button>

                <button
                  onClick={() => handleSaveChecklist(true)}
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-lg shadow-emerald-950/20 flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit for Supervisor Review</span>
                </button>
              </div>

            </div>
          )}

        </div>
      </div>

      {/* 5. ADD BUILDING MODAL */}
      {showBuildingModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in duration-150">
            <h3 className="text-base font-black text-slate-900">
              {editingBuildingIndex !== null ? 'Edit Building' : 'Add Building to Site'}
            </h3>
            <p className="text-xs text-slate-500">
              Each building has its own separate independent checklist. Checklist results will never be combined.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Building Number / ID</label>
                <input
                  type="text"
                  value={bldFormNumber}
                  onChange={(e) => setBldFormNumber(e.target.value)}
                  placeholder="e.g. 1, 2, B-01"
                  className="w-full text-xs rounded-xl border-slate-300 p-2.5 font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Building Name</label>
                <input
                  type="text"
                  value={bldFormName}
                  onChange={(e) => setBldFormName(e.target.value)}
                  placeholder="e.g. Tower A, Main Tower, Parking Building"
                  className="w-full text-xs rounded-xl border-slate-300 p-2.5 font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Location / Address (Optional)</label>
                <input
                  type="text"
                  value={bldFormLocation}
                  onChange={(e) => setBldFormLocation(e.target.value)}
                  placeholder="e.g. Block 428, Road 2831"
                  className="w-full text-xs rounded-xl border-slate-300 p-2.5"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setShowBuildingModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveBuilding}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black shadow-md"
              >
                {editingBuildingIndex !== null ? 'Save Changes' : 'Add Building'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. ADD CUSTOM ITEM MODAL */}
      {showAddItemModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in duration-150">
            <h3 className="text-base font-black text-slate-900">
              Add Item to {currentSystemConfig?.label}
            </h3>
            <p className="text-xs text-slate-500">
              Building {currentBuilding?.building_number}: {currentBuilding?.building_name}
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Item ID / Tag / Serial</label>
                <input
                  type="text"
                  value={newItemIdentifier}
                  onChange={(e) => setNewItemIdentifier(e.target.value)}
                  placeholder="e.g. HR-03, LV-05, EXT-12, Smoke Sensor 46"
                  className="w-full text-xs rounded-xl border-slate-300 p-2.5 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Floor</label>
                  <input
                    type="text"
                    value={newItemFloor}
                    onChange={(e) => setNewItemFloor(e.target.value)}
                    placeholder="e.g. Ground Floor, 2nd Floor"
                    className="w-full text-xs rounded-xl border-slate-300 p-2.5"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Location</label>
                  <input
                    type="text"
                    value={newItemLocation}
                    onChange={(e) => setNewItemLocation(e.target.value)}
                    placeholder="e.g. Staircase A, Corridor"
                    className="w-full text-xs rounded-xl border-slate-300 p-2.5"
                  />
                </div>
              </div>

              {activeTab === 'fire_extinguishers' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Extinguisher Type</label>
                    <select
                      value={newItemType || 'ABC Dry Chemical Powder'}
                      onChange={(e) => setNewItemType(e.target.value)}
                      className="w-full text-xs rounded-xl border-slate-300 p-2.5 font-semibold bg-slate-50"
                    >
                      {EXTINGUISHER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Capacity</label>
                    <select
                      value={newItemCapacity}
                      onChange={(e) => setNewItemCapacity(e.target.value)}
                      className="w-full text-xs rounded-xl border-slate-300 p-2.5 font-semibold bg-slate-50"
                    >
                      {EXTINGUISHER_CAPACITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setShowAddItemModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNewItem}
                className="px-5 py-2 rounded-xl bg-navy-950 text-white text-xs font-black shadow-md"
              >
                Save Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. SIGNATURE PAD MODAL */}
      {showSignPad && (
        <SignaturePad
          onSave={(sigData) => {
            setCustomerSignature(sigData);
            setShowSignPad(false);
            showToast('Customer signature captured', 'success');
          }}
          onClose={() => setShowSignPad(false)}
        />
      )}

    </div>
  );
}
