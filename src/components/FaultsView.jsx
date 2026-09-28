import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Wrench, AlertTriangle, CheckCircle2, Clock, Plus, Search, 
  Camera, Image as ImageIcon, Flame, Building2, ChevronRight, Shield
} from 'lucide-react';

export default function FaultsView() {
  const { currentUser, showToast } = useApp();
  const [faults, setFaults] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [showNewFaultModal, setShowNewFaultModal] = useState(false);
  const [selectedFaultForEdit, setSelectedFaultForEdit] = useState(null);

  // New Fault Form
  const [newFault, setNewFault] = useState({
    customer_id: '',
    site_id: '',
    system: 'Fire Alarm',
    location: '',
    device_equipment: '',
    fault_description: '',
    cause: '',
    action_taken: '',
    materials_used: '',
    status: 'Open',
    before_photo: '',
    after_photo: ''
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [resFaults, resCust, resSites] = await Promise.all([
        fetch('/api/faults', { headers: { 'x-user-role': currentUser.role, 'x-user-id': currentUser.id } }),
        fetch('/api/customers', { headers: { 'x-user-role': currentUser.role, 'x-user-id': currentUser.id } }),
        fetch('/api/sites', { headers: { 'x-user-role': currentUser.role, 'x-user-id': currentUser.id } })
      ]);
      if (resFaults.ok) setFaults(await resFaults.json());
      if (resCust.ok) setCustomers(await resCust.json());
      if (resSites.ok) setSites(await resSites.json());
    } catch (e) {
      console.warn('Failed to load faults:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  // Compress photo
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

  const handleCreateFault = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/faults', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
          'x-user-role': currentUser.role
        },
        body: JSON.stringify(newFault)
      });
      if (res.ok) {
        showToast('Fault logged successfully', 'success');
        setShowNewFaultModal(false);
        loadData();
      }
    } catch (e) {
      showToast('Error saving fault', 'error');
    }
  };

  const handleUpdateFault = async (e) => {
    e.preventDefault();
    if (!selectedFaultForEdit) return;
    try {
      const res = await fetch(`/api/faults/${selectedFaultForEdit.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
          'x-user-role': currentUser.role
        },
        body: JSON.stringify(selectedFaultForEdit)
      });
      if (res.ok) {
        showToast('Fault rectification updated', 'success');
        setSelectedFaultForEdit(null);
        loadData();
      }
    } catch (e) {
      showToast('Failed to update fault', 'error');
    }
  };

  const filteredFaults = faults.filter((f) => {
    if (statusFilter !== 'all' && f.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        f.fault_number?.toLowerCase().includes(q) ||
        f.customer_name?.toLowerCase().includes(q) ||
        f.site_name?.toLowerCase().includes(q) ||
        f.device_equipment?.toLowerCase().includes(q) ||
        f.fault_description?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Open':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'In Progress':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Rectified':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Pending Material':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Pending Customer':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Monitoring':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-4 pb-24">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-safety-red" />
            <span>Fault Management</span>
          </h1>
          <p className="text-xs text-slate-500">
            Defect tracking, before/after evidence, and rectification workflow.
          </p>
        </div>
        <button
          onClick={() => setShowNewFaultModal(true)}
          className="px-3 py-2 bg-safety-red hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Log Fault</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search faults by number, equipment, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
          {['all', 'Open', 'In Progress', 'Rectified', 'Pending Material', 'Pending Customer', 'Monitoring'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-navy-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'all' ? 'All Faults' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Faults List */}
      {loading ? (
        <div className="p-8 text-center text-xs text-slate-400">Loading faults...</div>
      ) : filteredFaults.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center text-xs text-slate-400 border border-slate-200">
          No faults found matching current filter.
        </div>
      ) : (
        filteredFaults.map((f) => (
          <div
            key={f.id}
            className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded">
                    {f.fault_number}
                  </span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${getStatusBadge(f.status)}`}>
                    {f.status}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {f.system}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mt-1.5">
                  {f.device_equipment}
                </h3>
                <p className="text-xs text-slate-500">
                  {f.site_name} • {f.location}
                </p>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold">{f.date}</span>
            </div>

            {/* Description */}
            <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1">
              <div><strong className="text-slate-900">Issue:</strong> {f.fault_description}</div>
              {f.cause && <div><strong className="text-slate-900">Cause:</strong> {f.cause}</div>}
              {f.action_taken && <div><strong className="text-slate-900">Action:</strong> {f.action_taken}</div>}
              {f.materials_used && <div><strong className="text-slate-900">Materials:</strong> {f.materials_used}</div>}
            </div>

            {/* Photos (Before & After) */}
            {(f.before_photo || f.after_photo) && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                {f.before_photo && (
                  <div className="relative">
                    <img
                      src={f.before_photo}
                      alt="Before rectification"
                      className="w-full h-28 object-cover rounded-xl border border-slate-200"
                    />
                    <span className="absolute top-1 left-1 bg-red-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow">
                      BEFORE
                    </span>
                  </div>
                )}
                {f.after_photo ? (
                  <div className="relative">
                    <img
                      src={f.after_photo}
                      alt="After rectification"
                      className="w-full h-28 object-cover rounded-xl border border-slate-200"
                    />
                    <span className="absolute top-1 left-1 bg-emerald-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow">
                      AFTER
                    </span>
                  </div>
                ) : (
                  <div className="h-28 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 text-[10px]">
                    <Camera className="w-5 h-5 mb-1 text-slate-300" />
                    <span>After photo pending</span>
                  </div>
                )}
              </div>
            )}

            {/* Action Bar */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">
                Logged on {f.date}
              </span>
              <button
                onClick={() => setSelectedFaultForEdit({ ...f })}
                className="px-3 py-1.5 bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1"
              >
                <Wrench className="w-3.5 h-3.5 text-blue-400" />
                <span>Update / Rectify</span>
              </button>
            </div>
          </div>
        ))
      )}

      {/* Log Fault Modal */}
      {showNewFaultModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-safety-red" />
                <span>Log New Equipment Fault</span>
              </h3>
              <button onClick={() => setShowNewFaultModal(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateFault} className="mt-4 space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Customer / Site *</label>
                <select
                  required
                  value={newFault.site_id}
                  onChange={(e) => {
                    const sid = e.target.value;
                    const s = sites.find(x => x.id === sid);
                    setNewFault(prev => ({ ...prev, site_id: sid, customer_id: s ? s.customer_id : '' }));
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="">-- Select Site --</option>
                  {sites.map(s => (
                    <option key={s.id} value={s.id}>{s.site_name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">System</label>
                  <select
                    value={newFault.system}
                    onChange={(e) => setNewFault(prev => ({ ...prev, system: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Fire Alarm">Fire Alarm</option>
                    <option value="Firefighting">Firefighting</option>
                    <option value="Sprinkler">Sprinkler System</option>
                    <option value="Clean Agent">Clean Agent FM200</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={newFault.status}
                    onChange={(e) => setNewFault(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Pending Material">Pending Material</option>
                    <option value="Pending Customer">Pending Customer</option>
                    <option value="Rectified">Rectified</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Specific Location</label>
                <input
                  type="text"
                  placeholder="e.g. Basement 2, Carpark Zone B near Pillar P-42"
                  value={newFault.location}
                  onChange={(e) => setNewFault(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Device / Equipment *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Optical Smoke Detector (Loop 2 Addr 45)"
                  value={newFault.device_equipment}
                  onChange={(e) => setNewFault(prev => ({ ...prev, device_equipment: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Fault Description *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Detailed description of defect or signal..."
                  value={newFault.fault_description}
                  onChange={(e) => setNewFault(prev => ({ ...prev, fault_description: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              {/* Before Photo */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Before Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      compressImage(e.target.files[0], (data) => setNewFault(p => ({ ...p, before_photo: data })));
                    }
                  }}
                  className="w-full p-1.5 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewFaultModal(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-safety-red text-white font-bold shadow-md"
                >
                  Save Fault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit / Rectify Fault Modal */}
      {selectedFaultForEdit && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-blue-600" />
                <span>Update Fault: {selectedFaultForEdit.fault_number}</span>
              </h3>
              <button onClick={() => setSelectedFaultForEdit(null)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateFault} className="mt-4 space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Status</label>
                <select
                  value={selectedFaultForEdit.status}
                  onChange={(e) => setSelectedFaultForEdit(p => ({ ...p, status: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Pending Material">Pending Material</option>
                  <option value="Pending Customer">Pending Customer</option>
                  <option value="Monitoring">Monitoring</option>
                  <option value="Rectified">Rectified (Resolved)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Root Cause</label>
                <input
                  type="text"
                  placeholder="Root cause identified..."
                  value={selectedFaultForEdit.cause || ''}
                  onChange={(e) => setSelectedFaultForEdit(p => ({ ...p, cause: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Action Taken / Rectification Details</label>
                <textarea
                  rows={2}
                  placeholder="Describe repair, cleaning, or replacement steps performed..."
                  value={selectedFaultForEdit.action_taken || ''}
                  onChange={(e) => setSelectedFaultForEdit(p => ({ ...p, action_taken: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Materials Used</label>
                <input
                  type="text"
                  placeholder="e.g. 1x Optical Smoke Detector XP95, 1x Reset Key"
                  value={selectedFaultForEdit.materials_used || ''}
                  onChange={(e) => setSelectedFaultForEdit(p => ({ ...p, materials_used: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              {/* After Photo Upload */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">After Photo (Proof of Rectification)</label>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      compressImage(e.target.files[0], (data) => setSelectedFaultForEdit(p => ({ ...p, after_photo: data })));
                    }
                  }}
                  className="w-full p-1.5 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedFaultForEdit(null)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-navy-900 text-white font-bold shadow-md"
                >
                  Update Fault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
