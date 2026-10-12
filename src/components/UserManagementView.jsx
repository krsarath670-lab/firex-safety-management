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
  const [activeFilter, setActiveFilter] = useState('All');
  
  // Modal State
  const [modalMode, setModalMode] = useState(null); // null | 'add' | 'edit'
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState(null);
  const [passwordModalUser, setPasswordModalUser] = useState(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [tempPasswordResult, setTempPasswordResult] = useState(null); // { tempPassword, expiresAt }
  const [copiedTemp, setCopiedTemp] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    employee_id: '',
    department: '',
    joining_date: '',
    photo: '',
    email: '',
    role: 'Technician',
    phone: '+973 ',
    designation: 'Certified Fire Alarm Specialist',
    pin: '',
    password: '',
    confirmPassword: '',
    status: 'Active',
    notes: ''
  });

  // Access control
  const isGM = currentUser?.role === 'GM';
  const isMD = currentUser?.role === 'Managing Director (MD)' || currentUser?.role === 'Managing Director' || currentUser?.role === 'managing_director';
  const isAdmin = currentUser?.role === 'Admin' || currentUser?.role === 'admin';
  const isCEO = currentUser?.role === 'CEO';
  const isExecutive = isGM || isMD || isAdmin;
  const isEngineer = currentUser?.role === 'Engineer';
  const isSupervisor = currentUser?.role === 'Supervisor';
  const canManageStaff = (isExecutive || isEngineer || isSupervisor) && !isCEO;

  // Load all users from backend
  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users', {
        headers: { 'x-user-role': currentUser.role, 'x-user-id': currentUser.id }
      });
      if (res.ok) {
        const data = await res.json();
        const mapped = Array.isArray(data) ? data.map(u => {
          if (u.role === 'Managing Director' || u.role === 'managing_director' || u.role === 'Managing Director (MD)') {
            return {
              ...u,
              role: 'Managing Director (MD)',
              designation: u.designation || 'Managing Director'
            };
          }
          return u;
        }) : [];
        setUsers(mapped);
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
      username: '',
      employee_id: '',
      department: '',
      joining_date: new Date().toISOString().slice(0, 10),
      photo: '',
      email: '',
      role: 'Technician',
      phone: '+973 ',
      designation: 'Certified Fire Alarm Specialist',
      pin: '',
      password: '',
      confirmPassword: '',
      status: 'Active',
      notes: ''
    });
    setModalMode('add');
  };

  // Open Edit Modal
  const handleOpenEdit = (user) => {
    // Check permissions: Engineer & Supervisor can only edit Technician & Sales
    if (!isExecutive && !['Technician', 'Sales'].includes(user.role)) {
      showToast('Engineers and Supervisors can only edit Technician and Sales staff.', 'error');
      return;
    }
    setSelectedUser(user);
    setFormData({
      name: user.name || '',
      username: user.username || '',
      employee_id: user.employee_id || '',
      department: user.department || '',
      joining_date: user.joining_date || '',
      photo: user.photo || '',
      email: user.email || '',
      role: user.role || 'Technician',
      phone: user.phone || '+973 ',
      designation: user.designation || '',
      pin: user.password || user.pin || '',
      password: user.password || user.pin || '',
      confirmPassword: '',
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
    if (modalMode === 'add' && !(formData.username || '').trim()) {
      showToast('Please enter a login username', 'error');
      return;
    }
    const pwChanged = modalMode === 'add' || formData.password !== (selectedUser?.password || selectedUser?.pin);
    if (pwChanged) {
      if (!formData.password || formData.password.trim().length < 3) {
        showToast('Password must be at least 3 characters', 'error');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        showToast('Password and Confirm Password do not match', 'error');
        return;
      }
    }

    try {
      const url = modalMode === 'edit' ? `/api/users/${selectedUser.id}` : '/api/users';
      const method = modalMode === 'edit' ? 'PUT' : 'POST';
      const { confirmPassword, ...payload } = formData;
      if (!pwChanged) {
        delete payload.password;
        delete payload.pin;
      }

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser.role,
          'x-user-id': currentUser.id
        },
        body: JSON.stringify(payload)
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
    if (!isExecutive && !['Technician', 'Sales'].includes(user.role)) {
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
        showToast('Staff member deleted successfully.', 'success');
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
    if (!isExecutive && !['Technician', 'Sales'].includes(user.role)) {
      showToast('Engineers and Supervisors can only manage passwords for Technicians and Sales staff.', 'error');
      return;
    }
    setPasswordModalUser(user);
    setNewPasswordInput('');
    setTempPasswordResult(null);
    setCopiedTemp(false);
  };

  // Generate 24-hour temporary password (shown once to Admin with copy button)
  const handleGenerateTempPassword = async () => {
    if (!passwordModalUser) return;
    setSavingPassword(true);
    try {
      const res = await fetch(`/api/users/${passwordModalUser.id}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser.role,
          'x-user-id': currentUser.id
        },
        body: JSON.stringify({ mode: 'temp' })
      });

      if (res.ok) {
        const data = await res.json();
        setTempPasswordResult({
          tempPassword: data.tempPassword,
          expiresAt: data.expiresAt
        });
        showToast(`Temporary password generated for ${passwordModalUser.name}. Valid for 24h.`, 'success');
        await loadUsers();
      } else {
        const err = await res.json();
        showToast(err.message || 'Failed generating temporary password', 'error');
      }
    } catch {
      showToast('Network error generating temporary password', 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  // Force password change on next login
  const handleForcePasswordChange = async () => {
    if (!passwordModalUser) return;
    setSavingPassword(true);
    try {
      const res = await fetch(`/api/users/${passwordModalUser.id}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser.role,
          'x-user-id': currentUser.id
        },
        body: JSON.stringify({ mode: 'force' })
      });

      if (res.ok) {
        showToast(`User ${passwordModalUser.name} will be prompted to set a new password on their next login.`, 'success');
        setPasswordModalUser(null);
        await loadUsers();
      } else {
        const err = await res.json();
        showToast(err.message || 'Failed forcing password change', 'error');
      }
    } catch {
      showToast('Network error forcing password change', 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  // Save New Password / PIN directly
  const handleSavePassword = async (e) => {
    if (e) e.preventDefault();
    if (!newPasswordInput || newPasswordInput.trim().length < 3) {
      showToast('Password / PIN must be at least 3 characters', 'error');
      return;
    }

    setSavingPassword(true);
    try {
      const res = await fetch(`/api/users/${passwordModalUser.id}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser.role,
          'x-user-id': currentUser.id
        },
        body: JSON.stringify({ mode: 'set', newPassword: newPasswordInput.trim() })
      });

      if (res.ok) {
        showToast(`Password for ${passwordModalUser.name} updated successfully`, 'success');
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

  // Filter calculations for all 10 roles
  const countMD = users.filter(u => ['Managing Director (MD)', 'Managing Director', 'managing_director'].includes(u.role)).length;
  const countCEO = users.filter(u => u.role === 'CEO').length;
  const countAdmin = users.filter(u => u.role === 'Admin').length;
  const countGM = users.filter(u => u.role === 'GM').length;
  const countEngineer = users.filter(u => u.role === 'Engineer').length;
  const countSupervisor = users.filter(u => u.role === 'Supervisor').length;
  const countTechnician = users.filter(u => u.role === 'Technician').length;
  const countSales = users.filter(u => u.role === 'Sales').length;
  const countAccounts = users.filter(u => u.role === 'Accounts').length;
  const countProjects = users.filter(u => ['Projects Manager', 'projects_manager', 'Project Manager', 'PM'].includes(u.role)).length;

  const filteredUsers = users.filter(u => {
    // Role filter
    if (activeFilter === 'MD' && !['Managing Director (MD)', 'Managing Director', 'managing_director'].includes(u.role)) return false;
    if (activeFilter === 'CEO' && u.role !== 'CEO') return false;
    if (activeFilter === 'Admin' && u.role !== 'Admin') return false;
    if (activeFilter === 'GM' && u.role !== 'GM') return false;
    if (activeFilter === 'Engineer' && u.role !== 'Engineer') return false;
    if (activeFilter === 'Supervisor' && u.role !== 'Supervisor') return false;
    if (activeFilter === 'Technician' && u.role !== 'Technician') return false;
    if (activeFilter === 'Sales' && u.role !== 'Sales') return false;
    if (activeFilter === 'Accounts' && u.role !== 'Accounts') return false;
    if (activeFilter === 'Projects Manager' && !['Projects Manager', 'projects_manager', 'Project Manager', 'PM'].includes(u.role)) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (u.name || '').toLowerCase().includes(q);
      const matchUsername = (u.username || '').toLowerCase().includes(q);
      const matchPhone = (u.phone || '').toLowerCase().includes(q);
      const matchEmail = (u.email || '').toLowerCase().includes(q);
      const matchDesig = (u.designation || '').toLowerCase().includes(q);
      const matchRole = (u.role || '').toLowerCase().includes(q);
      return matchName || matchUsername || matchPhone || matchEmail || matchDesig || matchRole;
    }
    return true;
  });

  if (!canManageStaff) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
        <Shield className="w-10 h-10 text-amber-500 mx-auto" />
        <h3 className="text-base font-bold text-slate-800">Restricted Administration Module</h3>
        <p className="text-xs text-slate-500">Only Executive Management and authorized supervisors have permission to manage staff credentials.</p>
      </div>
    );
  }

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
            {isExecutive 
              ? 'Provision and control mobile app access for Accounts, Projects Manager, Technicians, Sales, Engineers, and Management.'
              : 'Provision and control mobile app access for Technicians and Sales Personnel.'}
          </p>
        </div>

        {/* Primary Action Button */}
        <button
          onClick={handleOpenAdd}
          className="h-11 px-4 bg-navy-900 hover:bg-navy-800 active:bg-black text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-sm transition-all shrink-0 border border-navy-800"
        >
          <UserPlus className="w-4 h-4 text-emerald-400" />
          <span>{isExecutive ? '+ ADD STAFF MEMBER' : '+ ADD TECHNICIAN / SALES'}</span>
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

        {/* Filter Pills for All 10 Roles */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'All', label: `All Staff (${users.length})` },
            { id: 'MD', label: `MD (${countMD})` },
            { id: 'CEO', label: `CEO (${countCEO})` },
            { id: 'Admin', label: `Admin (${countAdmin})` },
            { id: 'GM', label: `GM (${countGM})` },
            { id: 'Engineer', label: `Engineer (${countEngineer})` },
            { id: 'Supervisor', label: `Supervisor (${countSupervisor})` },
            { id: 'Technician', label: `Technician (${countTechnician})` },
            { id: 'Sales', label: `Sales (${countSales})` },
            { id: 'Accounts', label: `Accounts (${countAccounts})` },
            { id: 'Projects Manager', label: `Projects Mgr (${countProjects})` }
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
            const canModifyThisUser = isExecutive || (['Engineer', 'Supervisor'].includes(currentUser?.role) && ['Technician', 'Sales'].includes(u.role));

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
                        (['Managing Director (MD)', 'Managing Director', 'managing_director'].includes(u.role)) ? 'bg-amber-600 text-white ring-2 ring-amber-400' :
                        u.role === 'CEO' ? 'bg-amber-700 text-white ring-2 ring-amber-500' :
                        u.role === 'Admin' ? 'bg-rose-700 text-white ring-2 ring-rose-500' :
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
                        (['Managing Director (MD)', 'Managing Director', 'managing_director'].includes(u.role)) ? 'bg-amber-50 text-amber-900 border-amber-300 font-extrabold shadow-sm' :
                        u.role === 'CEO' ? 'bg-amber-100 text-amber-900 border-amber-300 font-extrabold shadow-sm' :
                        u.role === 'Admin' ? 'bg-rose-50 text-rose-800 border-rose-300 font-extrabold shadow-sm' :
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

                  {/* Contact Details, Username, Credentials & Last Login */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 text-xs space-y-1.5">
                    {/* Username & Reset Status */}
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="font-mono text-[11px] font-bold text-navy-900 bg-slate-100 px-2 py-0.5 rounded">
                        @{u.username || u.id}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        u.password_reset_status === 'Temp Password Issued'
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : u.password_reset_status === 'Reset Required'
                          ? 'bg-orange-100 text-orange-800 border-orange-300'
                          : u.password_reset_status === 'Temp Expired'
                          ? 'bg-red-100 text-red-800 border-red-300'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {u.password_reset_status || (u.has_password ? 'Active' : 'No Password')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1.5 font-medium truncate">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <a href={`tel:${u.phone}`} className="hover:text-blue-600 font-mono font-semibold">
                          {u.phone || '+973 3000 0000'}
                        </a>
                      </span>
                      <span className="font-mono text-[10px] text-slate-500 font-medium">
                        Last login: {u.last_login ? new Date(u.last_login).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'Never'}
                      </span>
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
                    {isExecutive 
                      ? 'Executive Management: Full provisioning across all roles.'
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
                    if (newRole === 'CEO') defaultDesig = 'Chief Executive Officer';
                    else if (newRole === 'Admin') defaultDesig = 'System Administrator';
                    else if (newRole === 'Technician') defaultDesig = 'Certified Fire Alarm Specialist';
                    else if (newRole === 'Sales') defaultDesig = 'Commercial Sales Representative';
                    else if (newRole === 'Supervisor') defaultDesig = 'Senior Field Supervisor';
                    else if (newRole === 'Engineer') defaultDesig = 'Lead Fire Protection Engineer';
                    else if (newRole === 'Accounts') defaultDesig = 'Senior Accountant & Billing Officer';
                    else if (newRole === 'Projects Manager') defaultDesig = 'Projects & Fit-out Operations Manager';
                    else if (newRole === 'GM') defaultDesig = 'General Manager';
                    else if (newRole === 'Managing Director (MD)' || newRole === 'Managing Director' || newRole === 'managing_director') defaultDesig = 'Managing Director';

                    setFormData(p => ({
                      ...p,
                      role: newRole,
                      designation: defaultDesig
                    }));
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                >
                  {isExecutive ? (
                    <>
                      <option value="Admin">Admin</option>
                      <option value="CEO">CEO</option>
                      <option value="Managing Director (MD)">Managing Director (MD)</option>
                      <option value="GM">GM</option>
                      <option value="Engineer">Engineer</option>
                      <option value="Supervisor">Supervisor</option>
                      <option value="Technician">Technician</option>
                      <option value="Sales">Sales</option>
                      <option value="Accounts">Accounts</option>
                      <option value="Projects Manager">Projects Manager</option>
                    </>
                  ) : (
                    <>
                      <option value="Technician">Technician</option>
                      <option value="Sales">Sales</option>
                    </>
                  )}
                </select>
                {!isExecutive && (
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

              {/* Login Username & Employee ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Login Username *</label>
                  <input
                    type="text"
                    required={modalMode === 'add'}
                    autoComplete="off"
                    placeholder="e.g. jasim.eng"
                    value={formData.username || ''}
                    onChange={(e) => setFormData(p => ({ ...p, username: e.target.value.replace(/\s+/g, '') }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-[10px] text-slate-400">Used to sign in. Must be unique.</span>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Employee ID</label>
                  <input
                    type="text"
                    placeholder="e.g. FX-EMP-001"
                    value={formData.employee_id || ''}
                    onChange={(e) => setFormData(p => ({ ...p, employee_id: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Department & Joining Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    placeholder="e.g. Operations / Maintenance"
                    value={formData.department || ''}
                    onChange={(e) => setFormData(p => ({ ...p, department: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Joining Date</label>
                  <input
                    type="date"
                    value={formData.joining_date || ''}
                    onChange={(e) => setFormData(p => ({ ...p, joining_date: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Photo URL */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Photo URL (Optional)</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={formData.photo || ''}
                  onChange={(e) => setFormData(p => ({ ...p, photo: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
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
                  </div>
                  <input
                    type="password"
                    required={modalMode === 'add'}
                    placeholder={modalMode === 'add' ? "Enter secure password" : "Leave blank to keep unchanged"}
                    value={formData.password || ''}
                    onChange={(e) => setFormData(p => ({ ...p, pin: e.target.value, password: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 text-center tracking-widest text-sm"
                  />
                  <span className="text-[10px] text-slate-400">{modalMode === 'edit' ? 'Only needed if you change the password.' : 'Staff password required to open mobile app.'}</span>
                  <input
                    type="password"
                    placeholder="Confirm password"
                    value={formData.confirmPassword || ''}
                    onChange={(e) => setFormData(p => ({ ...p, confirmPassword: e.target.value }))}
                    className={`mt-1.5 w-full p-2.5 bg-slate-50 border rounded-xl font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 text-center tracking-widest text-sm ${
                      formData.confirmPassword && formData.confirmPassword !== formData.password ? 'border-red-400' : 'border-slate-200'
                    }`}
                  />
                  <span className="text-[10px] text-slate-400">{modalMode === 'edit' ? 'Re-enter only if changing password.' : 'Re-enter the password to verify.'}</span>
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

      {/* DEDICATED PASSWORD / PIN & RESET MODAL */}
      {passwordModalUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl p-5 shadow-2xl space-y-4 text-xs animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 text-amber-800 rounded-xl flex items-center justify-center">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Manage Password &amp; Access</h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {passwordModalUser.name} • <span className="font-bold text-navy-900">{passwordModalUser.role}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPasswordModalUser(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {/* Generated Temporary Password Display (Shown once to Admin) */}
            {tempPasswordResult && (
              <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl space-y-2.5 animate-in slide-in-from-top-2">
                <div className="flex items-center gap-2 text-amber-900 font-black text-xs uppercase tracking-wide">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Time-Limited Temporary Password (24h)</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Provide this one-time code to <strong>{passwordModalUser.name}</strong>. It will expire in 24 hours. They will be required to choose a new password upon signing in.
                </p>
                <div className="flex items-center justify-between bg-white px-3.5 py-2.5 rounded-xl border border-amber-200">
                  <span className="font-mono text-base font-black text-slate-900 tracking-widest select-all">
                    {tempPasswordResult.tempPassword}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(tempPasswordResult.tempPassword);
                      setCopiedTemp(true);
                      setTimeout(() => setCopiedTemp(false), 2500);
                      showToast('Temporary password copied to clipboard', 'success');
                    }}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow-sm"
                  >
                    {copiedTemp ? <Check className="w-3.5 h-3.5" /> : <Key className="w-3.5 h-3.5" />}
                    <span>{copiedTemp ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>
                <div className="text-[10px] text-amber-700 font-semibold">
                  ⏰ Expires at: {new Date(tempPasswordResult.expiresAt).toLocaleTimeString('en-US', { timeZone: 'Asia/Bahrain', hour: '2-digit', minute: '2-digit' })}, {new Date(tempPasswordResult.expiresAt).toLocaleDateString('en-GB', { timeZone: 'Asia/Bahrain' })} (Bahrain Time)
                </div>
              </div>
            )}

            {/* Admin Reset Options Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                disabled={savingPassword}
                onClick={handleGenerateTempPassword}
                className="p-3 bg-gradient-to-br from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border border-amber-200 rounded-xl text-left transition-all group disabled:opacity-50"
              >
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                  Option A
                </span>
                <span className="text-xs font-black text-slate-900 block mt-0.5 group-hover:text-amber-800">
                  Issue 24h Temp Password
                </span>
                <span className="text-[10px] text-slate-500 mt-1 block leading-snug">
                  Generates a random secure code shown once with copy button.
                </span>
              </button>

              <button
                type="button"
                disabled={savingPassword}
                onClick={handleForcePasswordChange}
                className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 rounded-xl text-left transition-all group disabled:opacity-50"
              >
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
                  Option B
                </span>
                <span className="text-xs font-black text-slate-900 block mt-0.5 group-hover:text-blue-800">
                  Force Password Change
                </span>
                <span className="text-[10px] text-slate-500 mt-1 block leading-snug">
                  Forces user to choose a new password on their next login attempt.
                </span>
              </button>
            </div>

            {/* Option C: Direct Manual Password Assignment */}
            <form onSubmit={handleSavePassword} className="pt-2 border-t border-slate-100 space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Option C: Set Specific Password / PIN Directly
                </label>
                <input
                  type="password"
                  placeholder="Enter new password / PIN (min 3 chars)"
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-1 flex gap-2">
                <button
                  type="button"
                  onClick={() => setPasswordModalUser(null)}
                  className="flex-1 py-2 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-100"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={savingPassword || !newPasswordInput}
                  className="flex-1 py-2 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold disabled:opacity-40 flex items-center justify-center gap-1.5 shadow-sm"
                >
                  {savingPassword ? 'Updating...' : 'Set Direct Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
