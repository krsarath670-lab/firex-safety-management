import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Flame, Shield, Wrench, AlertTriangle, Sparkles, Bell, 
  Save, Plus, Trash2, Edit3, CheckCircle2, RotateCcw, Info
} from 'lucide-react';

const SYSTEM_DEFINITIONS = [
  { key: 'fire_alarm', label: 'Fire Alarm System', icon: Flame },
  { key: 'fire_fighting', label: 'Fire Fighting System', icon: Shield },
  { key: 'fire_hose_reels', label: 'Fire Hose Reel System', icon: Wrench },
  { key: 'landing_valves', label: 'Landing Valve System', icon: Wrench },
  { key: 'fire_extinguishers', label: 'Fire Extinguishers', icon: Flame },
  { key: 'fm200_suppression', label: 'FM200 / Clean Agent System', icon: Shield },
  { key: 'lpg_detection', label: 'LPG Gas Detection System', icon: AlertTriangle },
  { key: 'emergency_lights', label: 'Emergency Lights', icon: Sparkles },
  { key: 'exit_lights', label: 'Exit Lights', icon: Sparkles },
  { key: 'voice_evacuation', label: 'Voice Evacuation / Other', icon: Bell }
];

export default function ChecklistTemplateSettings() {
  const { currentUser, showToast } = useApp();
  const [selectedSystem, setSelectedSystem] = useState('fire_alarm');
  const [templates, setTemplates] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // New item modal / state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemType, setNewItemType] = useState('');
  const [newItemMake, setNewItemMake] = useState('FireX');

  // Fetch templates from backend
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/checklist-templates', {
          headers: {
            'x-user-role': currentUser.role,
            'x-user-id': currentUser.id
          }
        });
        if (res.ok) {
          const data = await res.json();
          setTemplates(data.templates || {});
        }
      } catch (err) {
        console.error('Error fetching checklist templates:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, [currentUser]);

  const activeTemplate = templates[selectedSystem] || { items: [] };
  const items = activeTemplate.items || [];

  // Update an item in state
  const handleItemChange = (idx, field, value) => {
    setTemplates(prev => {
      const currentList = [...(prev[selectedSystem]?.items || [])];
      currentList[idx] = { ...currentList[idx], [field]: value };
      return {
        ...prev,
        [selectedSystem]: {
          ...prev[selectedSystem],
          items: currentList
        }
      };
    });
  };

  // Remove an item
  const handleRemoveItem = (idx) => {
    setTemplates(prev => {
      const currentList = [...(prev[selectedSystem]?.items || [])];
      currentList.splice(idx, 1);
      return {
        ...prev,
        [selectedSystem]: {
          ...prev[selectedSystem],
          items: currentList
        }
      };
    });
    showToast('Item removed from template', 'info');
  };

  // Add new item
  const handleAddItem = () => {
    if (!newItemName.trim()) {
      showToast('Item name is required', 'warning');
      return;
    }
    const newItem = {
      id: `${selectedSystem.slice(0, 3)}-custom-${Date.now()}`,
      item: newItemName.trim(),
      reel_id: newItemName.trim(),
      valve_id: newItemName.trim(),
      type: newItemType.trim(),
      make: newItemMake.trim(),
      quantity: '1',
      status: 'OK',
      remarks: ''
    };

    setTemplates(prev => {
      const currentList = [...(prev[selectedSystem]?.items || [])];
      return {
        ...prev,
        [selectedSystem]: {
          ...prev[selectedSystem],
          items: [...currentList, newItem]
        }
      };
    });

    setShowAddModal(false);
    setNewItemName('');
    setNewItemType('');
    showToast('Added item to template', 'success');
  };

  // Save template to backend
  const handleSaveTemplate = async () => {
    try {
      setSaving(true);
      const res = await fetch(`/api/checklist-templates/${selectedSystem}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser.role,
          'x-user-id': currentUser.id
        },
        body: JSON.stringify({
          items: items
        })
      });

      if (res.ok) {
        showToast(`Checklist template for ${SYSTEM_DEFINITIONS.find(s => s.key === selectedSystem)?.label} saved successfully!`, 'success');
      } else {
        const err = await res.json();
        showToast(err.message || 'Error saving template', 'error');
      }
    } catch (err) {
      console.error('Error saving template:', err);
      showToast('Network error saving template', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
        <p className="text-xs text-slate-500">Loading checklist configurations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      
      {/* Notice Banner (Part 9 Requirement) */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-3">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-900">
          <strong className="font-bold">Checklist Template Configuration:</strong> Customized items and defaults configured here will be used for all future AMC inspections across all customer sites and buildings. Historical completed reports are permanently preserved and will not be altered.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Systems List */}
        <div className="bg-white rounded-2xl border border-slate-200 p-2 space-y-1 md:col-span-1 shadow-sm">
          <span className="text-[10px] font-black uppercase text-slate-400 px-3 py-1.5 block tracking-wider">
            Fire &amp; Safety Systems
          </span>
          {SYSTEM_DEFINITIONS.map(sys => {
            const Icon = sys.icon;
            const isSelected = selectedSystem === sys.key;
            const count = (templates[sys.key]?.items || []).length;

            return (
              <button
                key={sys.key}
                onClick={() => setSelectedSystem(sys.key)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                  isSelected
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                  <span className="truncate">{sys.label}</span>
                </div>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                  isSelected ? 'bg-black/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Template Items Table */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 md:col-span-3 space-y-4 shadow-sm">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900">
                {SYSTEM_DEFINITIONS.find(s => s.key === selectedSystem)?.label} Standard Checklist
              </h3>
              <p className="text-xs text-slate-500">
                Configure default inspection questions, equipment types, and verification items.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddModal(true)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-600" />
                <span>Add Item</span>
              </button>

              <button
                onClick={handleSaveTemplate}
                disabled={saving}
                className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving...' : 'Save Template'}</span>
              </button>
            </div>
          </div>

          {/* Items List */}
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {items.map((item, idx) => (
              <div
                key={item.id || idx}
                className="border border-slate-200 rounded-xl p-3 hover:border-slate-300 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-mono font-black text-[10px] flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  
                  <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={item.item || item.reel_id || item.valve_id || ''}
                      onChange={(e) => handleItemChange(idx, item.item ? 'item' : (item.reel_id ? 'reel_id' : 'valve_id'), e.target.value)}
                      placeholder="Item Name / Tag"
                      className="text-xs font-bold rounded-lg border-slate-200 p-1.5 bg-white"
                    />
                    <input
                      type="text"
                      value={item.type || ''}
                      onChange={(e) => handleItemChange(idx, 'type', e.target.value)}
                      placeholder="Type / Specification"
                      className="text-xs rounded-lg border-slate-200 p-1.5 bg-white text-slate-600"
                    />
                    <input
                      type="text"
                      value={item.make || ''}
                      onChange={(e) => handleItemChange(idx, 'make', e.target.value)}
                      placeholder="Manufacturer / Make"
                      className="text-xs rounded-lg border-slate-200 p-1.5 bg-white text-slate-600"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => handleRemoveItem(idx)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

      {/* Add Custom Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-black text-slate-900">
              Add Item to {SYSTEM_DEFINITIONS.find(s => s.key === selectedSystem)?.label}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Item Description / Name</label>
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="e.g. Optical Smoke Sensor, 2.5 inch PRV Landing Valve"
                  className="w-full text-xs rounded-xl border-slate-300 p-2.5 font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Type / Specification (Optional)</label>
                <input
                  type="text"
                  value={newItemType}
                  onChange={(e) => setNewItemType(e.target.value)}
                  placeholder="e.g. Addressable Loop, Oblique PRV"
                  className="w-full text-xs rounded-xl border-slate-300 p-2.5"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Make / Manufacturer (Optional)</label>
                <input
                  type="text"
                  value={newItemMake}
                  onChange={(e) => setNewItemMake(e.target.value)}
                  placeholder="e.g. FireX, Notifier, Angus"
                  className="w-full text-xs rounded-xl border-slate-300 p-2.5"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleAddItem}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black shadow-md"
              >
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
