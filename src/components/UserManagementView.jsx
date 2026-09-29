import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Users, UserPlus, Shield, UserCheck, AlertTriangle, Search, 
  Phone, Mail, Key, CheckCircle, XCircle, Edit2, Trash2, 
  ArrowRightLeft, Sparkles, Filter, Wrench, Briefcase, Lock, 
  Check, X, AlertCircle, Eye
} from 'lucide-react';

export default function UserManagementView() {
  const { currentUser, showToast, fetchAllUsers, switchRole } = useApp();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All'); // 'All' | 'Technician' | 'Sales' | 'Management'
  
  // Modal State
  const [modalMode, setModalMode] = useState(null); // null | 'add' | 'edit'
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState(null);
  const [passwordModalUser, setPasswordModalUser] = useState(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Technician',
    phone: '+973 ',
    designation: 'Certified Fire Alarm Specialist',
    pin: '1234',
    password: '1234',
    status: 'Active',
    notes: ''
  });

  // Access control
  const isGM = currentUser?.role === 'GM';
  const isEngineer = currentUser?.role === 'Engineer';
  const isSupervisor = currentUser?.role === 'Supervisor';
  const canManageStaff = isGM || isEngineer || isSupervisor;

  // Load all users from backend
  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users', {
        headers: { 'x-user-role': currentUser.role, 'x-user-id': currentUser.id }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        const err = await res.json();
        showToast(err.message || 'Failed loading users', 'error');
      }
    } catch (e) {
      console.warn('Failed loading users', e);
      showToast('Network error loading users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canManageStaff) {
      loadUsers();
    }
  }, [currentUser]);

  // Open Add Modal
  const handleOpenAdd = () => {
    setFormData({
      name: '',
      email: '',
      role: 'Technician',
      phone: '+973 ',
      designation: 'Certified Fire Alarm Specialist',
      pin: Math.floor(1000 + Math.random() * 9000).toString(),
      status: 'Active',
      notes: ''
    });
    setModalMode('add');
  };

  // Open Edit Modal
  const handleOpenEdit = (user) => {
    // Check permissions: Engineer & Supervisor can only edit Technician & Sales
    if (!isGM && !['Technician', 'Sales'].includes(user.role)) {
      showToast('Engineers and Supervisors can only edit Technician and Sales staff.', 'error');
      return;
    }
    setSelectedUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'Technician',
      phone: user.phone || '+973 ',
      designation: user.designation || '',
      pin: user.pin || '1234',
      status: user.status || 'Active',
      notes: user.notes || ''
    });
    setModalMode('edit');
  };

  // Handle Form Submission (Add or Edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Please enter the full name', 'error');
      return;
    }

    try {
      const url = modalMode === 'edit' ? `/api/users/${selectedUser.id}` : '/api/users';
      const method = modalMode === 'edit' ? 'PUT' : 'POST';

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
        showToast(
          modalMode === 'edit' ? `Staff account updated for ${formData.name}` : `Staff access created for ${formData.name}!`,
          'success'
        );
        setModalMode(null);
        await loadUsers();
        if (fetchAllUsers) await fetchAllUsers();
      } else {
        const err = await res.json();
        showToast(err.message || 'Action failed', 'error');
      }
    } catch {
      showToast('Network error processing request', 'error');
    }
  };

  // Quick toggle active / inactive
  const handleToggleStatus = async (user) => {
    if (!isGM && !['Technician', 'Sales'].includes(user.role)) {
      showToast('Restricted: You can only toggle status for Technician and Sales staff.', 'error');
      return;
    }

    const newStatus = user.status === 'Inactive' ? 'Active' : 'Inactive';
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser.role,
          'x-user-id': currentUser.id
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        showToast(`${user.name} is now ${newStatus}`, 'info');
        await loadUsers();
        if (fetchAllUsers) await fetchAllUsers();
      }
    } catch {
      showToast('Error updating status', 'error');
    }
  };

  // Confirm and Delete User
  const handleDeleteUser = async () => {
    if (!deleteConfirmUser) return;
    try {
      const res = await fetch(`/api/users/${deleteConfirmUser.id}`, {
        method: 'DELETE',
        headers: {
          'x-user-role': currentUser.role,
          'x-user-id': currentUser.id
        }
      });

      if (res.ok) {
        showToast(`Staff account for ${deleteConfirmUser.name} deleted`, 'info');
        setDeleteConfirmUser(null);
        await loadUsers();
        if (fetchAllUsers) await fetchAllUsers();
      } else {
        const err = await res.json();
        showToast(err.message || 'Failed to delete user', 'error');
      }
    } catch {
      showToast('Network error deleting user', 'error');
    }
  };

  // Open Password Modal
  const handleOpenPasswordModal = (user) => {
    if (!isGM && !['Technician', 'Sales'].includes(user.role)) {
      showToast('Engineers and Supervisors can only manage passwords for Technicians and Sales staff.', 'error');
      return;
    }
    setPasswordModalUser(user);
    setNewPasswordInput(user.pin || user.password || '1234');
  };

  // Save New Password / PIN
  const handleSavePassword = async (e) => {
    if (e) e.preventDefault();
    if (!newPasswordInput || newPasswordInput.trim().length < 3) {
      showToast('Password / PIN must be at least 3 characters', 'error');
      return;
    }

    setSavingPassword(true);
    try {
      const res = await fetch(`/api/users/${passwordModalUser.id}/password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser.role,
          'x-user-id': currentUser.id
        },
        body: JSON.stringify({ newPassword: newPasswordInput.trim() })
      });

      if (res.ok) {
        showToast(`Password for ${passwordModalUser.name} updated to: ${newPasswordInput.trim()}`, 'success');
        setPasswordModalUser(null);
        await loadUsers();
      } else {
        const err = await res.json();
        showToast(err.message || 'Failed updating password', 'error');
      }
    } catch {
      showToast('Network error updating password', 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  // Quick switch role / test login
  const handleTestLogin = async (user) => {
    if (user.status === 'Inactive') {
      showToast(`Cannot switch to ${user.name}: Account is currently Inactive.`, 'warning');
      return;
    }
    await switchRole(user.role, user.id);
  };

  // Suggestions helper for designations
  const setPresetDesignation = (title) => {
    setFormData(p => ({ ...p, designation: title }));
  };

  // Gatekeeper: If Technician or Sales tries to open
  if (!canManageStaff) {
    return (
      <div className="p-6 text-center max-w-md mx-auto my-12 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="w-16 h-16 bg-red-50 text-safety-red rounded-2xl flex items-center justify-center mx-auto shadow-inner">
          <Lock className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-base font-black text-slate-900">Restricted Access</h2>
          <p className="text-xs text-slate-500 mt-1">
            Staff Directory and App Access provisioning is strictly reserved for <strong>General Managers (GM)</strong>, <strong>Engineers</strong>, and <strong>Supervisors</strong>.
          </p>
        </div>
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 text-left">
          Current logged-in account: <span className="font-bold text-navy-900">{currentUser?.name}</span> ({currentUser?.role})
        </div>
      </div>
    );
  }

  // Filter calculations
  const totalTechnicians = users.filter(u => u.role === 'Technician').length;
  const totalSales = users.filter(u => u.role === 'Sales').length;
  const totalManagement = users.filter(u => ['GM', 'Engineer', 'Supervisor'].includes(u.role)).length;
  const totalAccounts = users.filter(u => u.role === 'Accounts').length;
  const totalProjects = users.filter(u => u.role === 'Projects Manager').length;

  const filteredUsers = users.filter(u => {
    // Role filter
    if (activeFilter === 'Technician' && u.role !== 'Technician') return false;
    if (activeFilter === 'Sales' && u.role !== 'Sales') return false;
    if (activeFilter === 'Accounts' && u.role !== 'Accounts') return false;
    if (activeFilter === 'Projects' && u.role !== 'Projects Manager') return false;
    if (activeFilter === 'Management' && !['GM', 'Engineer', 'Supervisor'].includes(u.role)) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (u.name || '').toLowerCase().includes(q);
      const matchPhone = (u.phone || '').toLowerCase().includes(q);
      const matchEmail = (u.email || '').toLowerCase().includes(q);
      const matchDesig = (u.designation || '').toLowerCase().includes(q);
      const matchRole = (u.role || '').toLowerCase().includes(q);
      return matchName || matchPhone || matchEmail || matchDesig || matchRole;
    }
    return true;
  });

  return (
    <div className="space-y-4 pb-28 max-w-5xl mx-auto">
      
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Users className="w-5 h-5" />
            </span>
            <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Staff &amp; App Access Management
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Provision and control mobile app access for <strong className="text-emerald-700">Technicians</strong> and <strong className="text-amber-700">Sales Personnel</strong>.
          </p>
        </div>

        {/* Primary Action Button: + ADD TECHNICIAN / SALES */}
        <button
          onClick={handleOpenAdd}
          className="h-11 px-4 bg-navy-900 hover:bg-navy-800 active:bg-black text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-sm transition-all shrink-0 border border-navy-800"
        >
          <UserPlus className="w-4 h-4 text-emerald-400" />
          <span>+ ADD TECHNICIAN / SALES</span>
        </button>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div 
          onClick={() => setActiveFilter('All')}
          className={`p-3 rounded-2xl border transition-all cursor-pointer ${
            activeFilter === 'All' ? 'bg-navy-900 text-white border-navy-900 shadow-sm' : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className={`text-[10px] font-bold uppercase tracking-wider block ${activeFilter === 'All' ? 'text-slate-300' : 'text-slate-400'}`}>
            Total Staff
          </span>
          <div className="text-xl sm:text-2xl font-black mt-0.5">{users.length}</div>
          <span className={`text-[10px] font-medium ${activeFilter === 'All' ? 'text-slate-300' : 'text-slate-500'}`}>
            Company Directory
          </span>
        </div>

        <div 
          onClick={() => setActiveFilter('Technician')}
          className={`p-3 rounded-2xl border transition-all cursor-pointer ${
            activeFilter === 'Technician' ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm' : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className={`text-[10px] font-bold uppercase tracking-wider block ${activeFilter === 'Technician' ? 'text-emerald-200' : 'text-emerald-600'}`}>
            Technicians
          </span>
          <div className="text-xl sm:text-2xl font-black mt-0.5">{totalTechnicians}</div>
          <span className={`text-[10px] font-medium ${activeFilter === 'Technician' ? 'text-emerald-200' : 'text-slate-500'}`}>
            Field Service Team
          </span>
        </div>

        <div 
          onClick={() => setActiveFilter('Sales')}
          className={`p-3 rounded-2xl border transition-all cursor-pointer ${
            activeFilter === 'Sales' ? 'bg-amber-600 text-white border-amber-600 shadow-sm' : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className={`text-[10px] font-bold uppercase tracking-wider block ${activeFilter === 'Sales' ? 'text-amber-200' : 'text-amber-600'}`}>
            Sales Representatives
          </span>
          <div className="text-xl sm:text-2xl font-black mt-0.5">{totalSales}</div>
          <span className={`text-[10px] font-medium ${activeFilter === 'Sales' ? 'text-amber-200' : 'text-slate-500'}`}>
            AMC &amp; Contracting
          </span>
        </div>

        <div 
          onClick={() => setActiveFilter('Management')}
          className={`p-3 rounded-2xl border transition-all cursor-pointer ${
            activeFilter === 'Management' ? 'bg-purple-900 text-white border-purple-900 shadow-sm' : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className={`text-[10px] font-bold uppercase tracking-wider block ${activeFilter === 'Management' ? 'text-purple-200' : 'text-purple-600'}`}>
            Management
          </span>
          <div className="text-xl sm:text-2xl font-black mt-0.5">{totalManagement}</div>
          <span className={`text-[10px] font-medium ${activeFilter === 'Management' ? 'text-purple-200' : 'text-slate-500'}`}>
            GM, Eng &amp; Supervisors
          </span>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-sm space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, phone, email, designation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs">
          {[
            { id: 'All', label: `All Staff (${users.length})` },
            { id: 'Technician', label: `Technicians (${totalTechnicians})` },
            { id: 'Sales', label: `Sales Team (${totalSales})` },
            { id: 'Accounts', label: `Accounts (${totalAccounts})` },
            { id: 'Projects', label: `Projects Mgr (${totalProjects})` },
            { id: 'Management', label: `Management (${totalManagement})` }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
                activeFilter === f.id
                  ? 'bg-navy-900 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Staff Cards List */}
      {loading ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-400">
          Loading staff directory...
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
          <Users className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">No staff members found</h3>
          <p className="text-xs text-slate-400">Try adjusting your search criteria or add a new staff member.</p>
          <button
            onClick={handleOpenAdd}
            className="mt-2 px-3.5 py-2 bg-navy-900 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New Staff Member</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredUsers.map((u) => {
            const isSelf = u.id === currentUser.id;
            const isInactive = u.status === 'Inactive';
            const isTech = u.role === 'Technician';
            const isSalesRole = u.role === 'Sales';
            const canModifyThisUser = isGM || (['Engineer', 'Supervisor'].includes(currentUser?.role) && ['Technician', 'Sales'].includes(u.role));

            return (
              <div 
                key={u.id}
                className={`bg-white rounded-2xl p-4 border transition-all shadow-sm hover:shadow flex flex-col justify-between space-y-3 ${
                  isInactive ? 'opacity-70 border-slate-200 bg-slate-50/50' : 'border-slate-200'
                }`}
              >
                <div>
                  {/* Top Line: Avatar + Info + Role Badge */}
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-start space-x-3 min-w-0">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 shadow-sm ${
                        u.role === 'GM' ? 'bg-purple-900 text-white' :
                        u.role === 'Engineer' ? 'bg-indigo-700 text-white' :
                        u.role === 'Supervisor' ? 'bg-blue-600 text-white' :
                        u.role === 'Sales' ? 'bg-amber-500 text-white' :
                        u.role === 'Accounts' ? 'bg-teal-700 text-white' :
                        u.role === 'Projects Manager' ? 'bg-cyan-700 text-white' :
                        'bg-emerald-600 text-white'
                      }`}>
                        {u.avatar || (u.name?.slice(0, 2).toUpperCase())}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-xs sm:text-sm font-black text-slate-900 truncate">
                            {u.name}
                          </h3>
                          {isSelf && (
                            <span className="px-1.5 py-0.2 bg-blue-100 text-blue-800 text-[9px] font-bold rounded">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-semibold text-slate-600 truncate mt-0.5">
                          {u.designation || u.role}
                        </p>
                      </div>
                    </div>

                    {/* Role & Status Badge */}
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider ${
                        u.role === 'GM' ? 'bg-purple-50 text-purple-800 border-purple-200' :
                        u.role === 'Engineer' ? 'bg-indigo-50 text-indigo-800 border-indigo-200' :
                        u.role === 'Supervisor' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                        u.role === 'Sales' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                        u.role === 'Accounts' ? 'bg-teal-50 text-teal-800 border-teal-200' :
                        u.role === 'Projects Manager' ? 'bg-cyan-50 text-cyan-800 border-cyan-200' :
                        'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}>
                        {u.role}
                      </span>
                      <span className={`text-[10px] font-bold flex items-center gap-1 ${
                        isInactive ? 'text-slate-400' : 'text-emerald-600'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isInactive ? 'bg-slate-400' : 'bg-emerald-500'}`} />
                        <span>{u.status || 'Active'}</span>
                      </span>
                    </div>
                  </div>

                  {/* Contact Details & Credentials */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1.5 font-medium truncate">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <a href={`tel:${u.phone}`} className="hover:text-blue-600 font-mono font-semibold">
                          {u.phone || '+973 3000 0000'}
                        </a>
                      </span>
                      {u.pin && (
                        <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">
                          PIN: {u.pin}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate text-[11px] font-medium">{u.email || `${u.name?.toLowerCase().replace(/\s+/g, '.')}@firexbahrain.com`}</span>
                    </div>

                    {u.notes && (
                      <div className="text-[10px] text-slate-500 bg-slate-50 p-1.5 rounded-lg border border-slate-200/60 mt-1">
                        <strong>Note:</strong> {u.notes}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Actions Toolbar */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  
                  {/* Test Login Switcher (Quick verify how this user sees the app) */}
                  <button
                    onClick={() => handleTestLogin(u)}
                    disabled={isSelf || isInactive}
                    className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    title={`Preview and switch active session to ${u.name}`}
                  >
                    <ArrowRightLeft className="w-3 h-3 text-blue-600" />
                    <span>Switch</span>
                  </button>

                  {/* Password Button */}
                  {canModifyThisUser && (
                    <button
                      onClick={() => handleOpenPasswordModal(u)}
                      className="py-1.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors border border-amber-200/60"
                      title="Set or reset password / PIN"
                    >
                      <Key className="w-3.5 h-3.5 text-amber-600" />
                      <span className="hidden sm:inline">Password</span>
                    </button>
                  )}

                  {/* Edit Button */}
                  {canModifyThisUser && (
                    <button
                      onClick={() => handleOpenEdit(u)}
                      className="py-1.5 px-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                      title="Edit staff details"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Edit</span>
                    </button>
                  )}

                  {/* Toggle Status Button */}
                  {canModifyThisUser && !isSelf && (
                    <button
                      onClick={() => handleToggleStatus(u)}
                      className={`py-1.5 px-2.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
                        isInactive
                          ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                          : 'bg-amber-50 hover:bg-amber-100 text-amber-700'
                      }`}
                      title={isInactive ? "Activate user account" : "Deactivate user account"}
                    >
                      {isInactive ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                      <span className="hidden sm:inline">{isInactive ? 'Activate' : 'Deactivate'}</span>
                    </button>
                  )}

                  {/* Delete Button */}
                  {canModifyThisUser && !isSelf && (
                    <button
                      onClick={() => setDeleteConfirmUser(u)}
                      className="p-1.5 text-slate-400 hover:text-safety-red hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete staff account"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {modalMode && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 shadow-2xl text-xs space-y-4 max-h-[92vh] overflow-y-auto animate-in slide-in-from-bottom">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-xl bg-blue-50 text-blue-600">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900">
                    {modalMode === 'add' ? 'Add Staff Member (App Access)' : `Edit ${selectedUser?.name}`}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {isGM 
                      ? 'General Manager: Full provisioning across all roles.'
                      : 'Provision mobile app access for Technician or Sales personnel.'
                    }
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setModalMode(null)} 
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              
              {/* Role Selector */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Assigned App Role *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => {
                    const newRole = e.target.value;
                    let defaultDesig = formData.designation;
                    if (newRole === 'Technician') defaultDesig = 'Certified Fire Alarm Specialist';
                    else if (newRole === 'Sales') defaultDesig = 'Commercial Sales Representative';
                    else if (newRole === 'Supervisor') defaultDesig = 'Senior Field Supervisor';
                    else if (newRole === 'Engineer') defaultDesig = 'Lead Fire Protection Engineer';
                    else if (newRole === 'Accounts') defaultDesig = 'Senior Accountant & Billing Officer';
                    else if (newRole === 'Projects Manager') defaultDesig = 'Projects & Fit-out Operations Manager';
                    else if (newRole === 'GM') defaultDesig = 'General Manager';

                    setFormData(p => ({
                      ...p,
                      role: newRole,
                      designation: defaultDesig
                    }));
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Technician">Technician — (Mobile on-site execution, checklists, faults, jobs)</option>
                  <option value="Sales">Sales — (Client onboarding, quotation creation, own jobs &amp; AMC)</option>
                  {isGM && (
                    <>
                      <option value="Supervisor">Supervisor — (Field dispatch, job approvals, full ops)</option>
                      <option value="Engineer">Engineer — (Technical approval, inspections, full ops)</option>
                      <option value="Accounts">Accounts — (Finance, Invoices, Payments, Customer Ledgers &amp; Holds)</option>
                      <option value="Projects Manager">Projects Manager — (Projects, Fit-out, Installation, T&amp;C, Milestones &amp; Ops Holds)</option>
                      <option value="GM">GM — (Executive management &amp; system-wide access)</option>
                    </>
                  )}
                </select>
                {!isGM && (
                  <p className="text-[10px] text-slate-500 mt-1">
                    Engineers and Supervisors are authorized to provision <strong>Technicians</strong> and <strong>Sales</strong> personnel.
                  </p>
                )}
              </div>

              {/* Full Name */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jasim Al-Haddad"
                  value={formData.name}
                  onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Mobile Phone & App Access PIN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mobile / WhatsApp Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+973 3911 2233"
                    value={formData.phone}
                    onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-[10px] text-slate-400">Used for dispatch &amp; emergency on-site contacts.</span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-700">App Password / PIN *</label>
                    <button
                      type="button"
                      onClick={() => {
                        const randomPin = Math.floor(1000 + Math.random() * 9000).toString();
                        setFormData(p => ({ ...p, pin: randomPin, password: randomPin }));
                      }}
                      className="text-[10px] text-blue-600 font-bold hover:underline"
                    >
                      Random PIN
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="1234"
                    value={formData.pin}
                    onChange={(e) => setFormData(p => ({ ...p, pin: e.target.value, password: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 text-center tracking-widest text-sm"
                  />
                  <span className="text-[10px] text-slate-400">Staff password required to open mobile app.</span>
                </div>
              </div>

              {/* Email / Username */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Email / App Login ID</label>
                <input
                  type="email"
                  placeholder="e.g. jasim.tech@firexbahrain.com"
                  value={formData.email}
                  onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-[10px] text-slate-400">Leave blank to auto-generate from name.</span>
              </div>

              {/* Designation / Specialization */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Designation / Specialization</label>
                <input
                  type="text"
                  placeholder="e.g. Certified Fire Alarm Specialist"
                  value={formData.designation}
                  onChange={(e) => setFormData(p => ({ ...p, designation: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                />

                {/* Quick suggestions pills */}
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {formData.role === 'Technician' ? (
                    <>
                      {['Fire Alarm Tech', 'Firefighting Tech', 'Pump Specialist', 'FM200 / Clean Agent', 'Senior Maintenance Tech'].map(item => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setPresetDesignation(item)}
                          className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-[10px] font-semibold text-slate-600 transition-colors"
                        >
                          + {item}
                        </button>
                      ))}
                    </>
                  ) : (
                    <>
                      {['Commercial Sales Exec', 'AMC Contracting Specialist', 'Key Accounts Specialist', 'Senior Sales Consultant'].map(item => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setPresetDesignation(item)}
                          className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-[10px] font-semibold text-slate-600 transition-colors"
                        >
                          + {item}
                        </button>
                      ))}
                    </>
                  )}
                </div>
              </div>

              {/* Account Status */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Account Access Status</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, status: 'Active' }))}
                    className={`p-2 rounded-xl border text-center font-bold flex items-center justify-center gap-1.5 transition-colors ${
                      formData.status === 'Active'
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Active (Granted)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, status: 'Inactive' }))}
                    className={`p-2 rounded-xl border text-center font-bold flex items-center justify-center gap-1.5 transition-colors ${
                      formData.status === 'Inactive'
                        ? 'bg-amber-50 border-amber-400 text-amber-800'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Inactive (Suspended)</span>
                  </button>
                </div>
              </div>

              {/* Internal Notes */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Internal Notes / Certifications (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. CPR No., Civil Defence Card #, driving license, assigned vehicle..."
                  value={formData.notes}
                  onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>

              {/* Form Actions */}
              <div className="pt-2 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 active:bg-black text-white font-bold transition-colors shadow-sm"
                >
                  {modalMode === 'add' ? 'Create Staff Access' : 'Save Changes'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-2xl p-5 shadow-2xl space-y-3.5 text-xs animate-in fade-in">
            <div className="w-12 h-12 bg-red-100 text-safety-red rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-sm font-black text-slate-900">Delete Staff Account?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to remove <strong>{deleteConfirmUser.name}</strong> ({deleteConfirmUser.role})? This will revoke their app access.
              </p>
            </div>
            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmUser(null)}
                className="flex-1 py-2 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                className="flex-1 py-2 rounded-xl bg-safety-red hover:bg-red-700 text-white font-bold"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DEDICATED PASSWORD / PIN MODAL */}
      {passwordModalUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-2xl p-5 shadow-2xl space-y-4 text-xs animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 text-amber-800 rounded-xl flex items-center justify-center">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">Set App Password / PIN</h3>
                <p className="text-[11px] text-slate-500">
                  {passwordModalUser.name} ({passwordModalUser.role})
                </p>
              </div>
            </div>

            <form onSubmit={handleSavePassword} className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">New Password / PIN *</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setNewPasswordInput('1234')}
                      className="text-[10px] text-blue-600 font-bold hover:underline"
                    >
                      Default (1234)
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewPasswordInput(Math.floor(1000 + Math.random() * 9000).toString())}
                      className="text-[10px] text-emerald-600 font-bold hover:underline"
                    >
                      Random PIN
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Enter 4-digit PIN or password"
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-center text-base font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 tracking-wider"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  The user must enter this PIN/password to open the application on their mobile phone or laptop.
                </p>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setPasswordModalUser(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-sm"
                >
                  {savingPassword ? 'Saving...' : 'Save Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
