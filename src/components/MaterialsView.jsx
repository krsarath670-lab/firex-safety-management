import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Layers, Plus, Search, Package, AlertCircle } from 'lucide-react';

export default function MaterialsView() {
  const { currentUser, showToast } = useApp();
  const [materials, setMaterials] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMat, setNewMat] = useState({
    name: '',
    code: '',
    category: 'Fire Alarm',
    unit: 'Pcs',
    stock: 20,
    unit_cost: 35
  });

  const isTechnician = currentUser?.role === 'Technician';

  const loadMaterials = async () => {
    try {
      const res = await fetch('/api/materials', {
        headers: { 'x-user-role': currentUser.role, 'x-user-id': currentUser.id }
      });
      if (res.ok) setMaterials(await res.json());
    } catch (e) {
      console.warn('Failed to load materials', e);
    }
  };

  useEffect(() => {
    loadMaterials();
  }, [currentUser]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/materials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser.role,
          'x-user-id': currentUser.id
        },
        body: JSON.stringify(newMat)
      });
      if (res.ok) {
        showToast('Material added to inventory', 'success');
        setShowAddModal(false);
        loadMaterials();
      }
    } catch (e) {
      showToast('Error creating material', 'error');
    }
  };

  const filtered = materials.filter(m => {
    if (categoryFilter !== 'all' && m.category !== categoryFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return m.name.toLowerCase().includes(q) || m.code?.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-4 pb-24">
      {/* Header */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            <span>Spare Parts &amp; Materials</span>
          </h1>
          <p className="text-xs text-slate-500">
            Field consumables, replacement sensors, and firefighting fittings inventory.
          </p>
        </div>
        {!isTechnician && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-2 bg-navy-900 hover:bg-navy-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </button>
        )}
      </div>

      {/* Search and Category Filters */}
      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search parts by name or part code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
          {['all', 'Fire Alarm', 'Firefighting', 'Cable', 'Accessories'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                categoryFilter === cat ? 'bg-navy-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'all' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Materials List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {filtered.map(m => (
          <div key={m.id} className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[9px] font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                {m.code}
              </span>
              <h4 className="text-xs font-bold text-slate-900 mt-1">{m.name}</h4>
              <p className="text-[11px] text-slate-400">{m.category} • {m.unit}</p>
            </div>
            <div className="text-right">
              <span className={`text-base font-black ${m.stock < 15 ? 'text-amber-600' : 'text-slate-900'}`}>
                {m.stock}
              </span>
              <span className="text-[10px] text-slate-400 block">in stock</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-sm rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl animate-in slide-in-from-bottom text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Add Spare Part / Material</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 text-lg font-bold">✕</button>
            </div>
            <form onSubmit={handleCreate} className="mt-3 space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Item Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Optical Smoke Detector (UL Listed)"
                  value={newMat.name}
                  onChange={(e) => setNewMat(p => ({ ...p, name: e.target.value }))}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={newMat.category}
                    onChange={(e) => setNewMat(p => ({ ...p, category: e.target.value }))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Fire Alarm">Fire Alarm</option>
                    <option value="Firefighting">Firefighting</option>
                    <option value="Cable">Cable</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Initial Stock</label>
                  <input
                    type="number"
                    value={newMat.stock}
                    onChange={(e) => setNewMat(p => ({ ...p, stock: Number(e.target.value) }))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
              <div className="pt-2 flex gap-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-navy-900 text-white font-bold">
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
