import React, { useState, useEffect } from 'react';
import { Shield, Lock, Eye, EyeOff, CheckCircle, AlertCircle, KeyRound, ChevronRight, User } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function LoginModal({ isOpen, onClose }) {
  const { login, companySettings } = useApp();
  
  const [usersList, setUsersList] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch available users list on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/auth/users-list');
        if (res.ok) {
          const data = await res.json();
          setUsersList(data);
          if (data.length > 0 && !selectedUserId) {
            // Default to first user or Supervisor
            const def = data.find(u => u.role === 'Supervisor') || data[0];
            setSelectedUserId(def.id);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch users list:', err);
      }
    };
    fetchUsers();
  }, []);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError('');

    if (!selectedUserId) {
      setError('Please select an account');
      return;
    }
    if (!password) {
      setError('Please enter your password or PIN');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUserId, password })
      });

      const data = await res.json();
      if (res.ok) {
        login(data.user, data.permissions);
        if (onClose) onClose();
      } else {
        setError(data.message || 'Incorrect password or PIN. Please try again.');
      }
    } catch {
      setError('Connection error. Please verify your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  const selectedUser = usersList.find(u => u.id === selectedUserId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        
        {/* Header / Brand Banner */}
        <div className="bg-navy-900 text-white p-6 text-center relative overflow-hidden border-b border-navy-800">
          <div className="relative z-10 flex flex-col items-center">
            {companySettings?.logo_url ? (
              <div className="w-16 h-16 rounded-2xl bg-white p-1.5 shadow-xl border border-navy-700 mb-3 flex items-center justify-center">
                <img
                  src={companySettings.logo_url}
                  alt="FIREX Logo"
                  className="w-full h-full object-contain"
                  onError={(e) => { e.target.src = '/logo.png'; }}
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-safety-red to-orange-500 shadow-xl flex items-center justify-center mb-3">
                <Shield className="w-8 h-8 text-white" />
              </div>
            )}
            
            <h1 className="text-lg font-black tracking-tight flex items-center gap-1.5">
              <span>FIREX BAHRAIN</span>
              <span className="text-[10px] font-bold bg-safety-red px-1.5 py-0.5 rounded tracking-normal">
                FIRE &amp; SAFETY
              </span>
            </h1>
            <p className="text-xs text-slate-300 font-medium mt-0.5">
              Service Management App Login
            </p>
            <p className="text-[10px] text-slate-400 mt-1">
              Villa 13, Building 2373, Road 2831, Al Seef, Bahrain
            </p>
          </div>

          <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -left-6 -top-6 w-28 h-28 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Body Form */}
        <form onSubmit={handleLogin} className="p-6 space-y-4">
          
          {/* Error banner */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2 animate-in slide-in-from-top-1">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <div className="font-semibold">{error}</div>
            </div>
          )}

          {/* Account Select */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Select User Account
            </label>
            <div className="relative">
              <select
                value={selectedUserId}
                onChange={(e) => {
                  setSelectedUserId(e.target.value);
                  setPassword('');
                  setError('');
                }}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 appearance-none pr-10 text-sm"
              >
                {usersList.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} — {u.role} ({u.designation || u.role})
                  </option>
                ))}
              </select>
              <div className="absolute right-3.5 top-3.5 pointer-events-none text-slate-400">
                <ChevronRight className="w-4 h-4 rotate-90" />
              </div>
            </div>

            {selectedUser && (
              <div className="mt-2 flex items-center justify-between px-3 py-2 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-black text-white ${
                    selectedUser.role === 'Sales' ? 'bg-amber-600' :
                    selectedUser.role === 'GM' ? 'bg-purple-600' :
                    selectedUser.role === 'Engineer' ? 'bg-indigo-600' :
                    selectedUser.role === 'Technician' ? 'bg-emerald-600' : 'bg-blue-600'
                  }`}>
                    {selectedUser.avatar || selectedUser.role?.[0]}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800">{selectedUser.name}</span>
                    <span className="text-[10px] text-slate-500 block leading-tight">{selectedUser.designation}</span>
                  </div>
                </div>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                  selectedUser.role === 'Sales' ? 'bg-amber-100 text-amber-800' :
                  selectedUser.role === 'GM' ? 'bg-purple-100 text-purple-800' :
                  selectedUser.role === 'Technician' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {selectedUser.role}
                </span>
              </div>
            )}
          </div>

          {/* Password / PIN input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Enter Password / PIN
              </label>
              <span className="text-[11px] text-blue-600 font-semibold cursor-pointer" onClick={() => setPassword('1234')}>
                Fill Default (1234)
              </span>
            </div>

            <div className="relative">
              <div className="absolute left-3.5 top-3.5 text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                autoFocus
                placeholder="Enter password or 4-digit PIN"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Managers (GM, Engineer, Supervisor) can create or change passwords in Staff Management.
            </p>
          </div>

          {/* Login Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-navy-900 hover:bg-navy-800 active:bg-black text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-navy-900/20 transition-all disabled:opacity-50 mt-2"
          >
            {loading ? (
              <span className="animate-pulse">Verifying credentials...</span>
            ) : (
              <>
                <KeyRound className="w-4 h-4 text-emerald-400" />
                <span>Sign In &amp; Open App</span>
              </>
            )}
          </button>

          {/* Note / Hint */}
          <div className="pt-2 text-center border-t border-slate-100">
            <span className="text-[11px] text-slate-500">
              Initial Testing Password for all accounts is: <strong className="text-navy-900 font-mono">1234</strong>
            </span>
          </div>

        </form>

      </div>
    </div>
  );
}
