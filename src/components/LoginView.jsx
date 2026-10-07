import React, { useState, useEffect } from 'react';
import { 
  Shield, Lock, Eye, EyeOff, KeyRound, AlertCircle, CheckCircle2, 
  ChevronRight, User, UserPlus, Sparkles, Phone, Mail, Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function LoginView() {
  const { login, companySettings } = useApp();
  
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  
  // Normal Login state
  const [selectedUserId, setSelectedUserId] = useState('');
  const [loginUsername, setLoginUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Initial GM Setup state
  const [gmName, setGmName] = useState('');
  const [gmPhone, setGmPhone] = useState('+973 ');
  const [gmEmail, setGmEmail] = useState('');
  const [gmPassword, setGmPassword] = useState('');
  const [gmConfirmPassword, setGmConfirmPassword] = useState('');
  const [showGmPassword, setShowGmPassword] = useState(false);
  const [setupLoading, setSetupLoading] = useState(false);
  const [setupError, setSetupError] = useState('');

  // Fetch all available active staff users
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch('/api/auth/users-list');
      if (res.ok) {
        const data = await res.json();
        setUsersList(data);
        if (data.length > 0) {
          const gm = data.find(u => u.role === 'GM') || data[0];
          setSelectedUserId(gm.id);
        }
      }
    } catch (err) {
      console.warn('Failed loading users list:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSelectRole = (role) => {
    const found = usersList.find(u => u.role === role || (role === 'Managing Director (MD)' && ['Managing Director (MD)', 'Managing Director', 'managing_director'].includes(u.role)));
    if (found) {
      setSelectedUserId(found.id);
      setPassword('');
      setLoginError('');
    }
  };

  // Submit standard login
  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setLoginError('');

    const typedUsername = loginUsername.trim();
    if (!typedUsername && !selectedUserId) {
      setLoginError('Please enter your username or select a staff account');
      return;
    }
    if (!password) {
      setLoginError('Please enter your password or PIN');
      return;
    }

    setLoginLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(typedUsername ? { identifier: typedUsername, password } : { userId: selectedUserId, password })
      });

      const data = await res.json();
      if (res.ok) {
        login(data.user, data.permissions);
      } else {
        setLoginError(data.message || 'Incorrect password or PIN. Please try again.');
      }
    } catch {
      setLoginError('Network connection error. Please verify your connection.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Submit GM Initial Setup
  const handleSetupFirstUser = async (e) => {
    if (e) e.preventDefault();
    setSetupError('');

    if (!gmName.trim()) {
      setSetupError('Please enter the General Manager full name.');
      return;
    }

    const trimmedPass = gmPassword.trim();
    if (!trimmedPass || trimmedPass.length < 3) {
      setSetupError('Password / PIN must be at least 3 characters or digits.');
      return;
    }

    if (trimmedPass !== gmConfirmPassword.trim()) {
      setSetupError('Passwords do not match. Please re-enter.');
      return;
    }

    setSetupLoading(true);
    try {
      const res = await fetch('/api/auth/setup-first-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: gmName.trim(),
          phone: gmPhone.trim(),
          email: gmEmail.trim(),
          password: trimmedPass,
          pin: trimmedPass
        })
      });

      const data = await res.json();
      if (res.ok) {
        // Log in immediately
        login(data.user, data.permissions);
      } else {
        setSetupError(data.message || 'Setup failed. Please try again.');
      }
    } catch {
      setSetupError('Network connection error while initializing GM account.');
    } finally {
      setSetupLoading(false);
    }
  };

  const selectedUser = usersList.find(u => u.id === selectedUserId);
  const isSetupMode = !loadingUsers && usersList.length === 0;

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-3 sm:p-6 select-none">
      
      {/* App Container */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header Banner */}
        <div className="bg-navy-900 text-white p-6 text-center relative overflow-hidden border-b border-navy-800">
          
          <div className="relative z-10 flex flex-col items-center">
            {companySettings?.logo_url ? (
              <div className="w-16 h-16 rounded-2xl bg-white p-2 shadow-xl border border-navy-700 mb-3 flex items-center justify-center">
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
            
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-white">FIREX BAHRAIN</h1>
              <span className="text-[10px] font-bold bg-safety-red px-1.5 py-0.5 rounded tracking-normal">
                FIRE &amp; SAFETY
              </span>
            </div>
            
            <p className="text-xs text-slate-300 font-medium mt-1">
              Service Management Application
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              CR: 96850 1 • VAT: 220006271900002 • Tel: 17162240
            </p>
          </div>

          {/* Ambient background glow */}
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -left-8 -top-8 w-32 h-32 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* LOADING SPINNER */}
        {loadingUsers ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-600">Connecting to FIREX Service...</p>
          </div>
        ) : isSetupMode ? (
          /* ========================================================================= */
          /* INITIAL SETUP VIEW: CREATE GM ACCOUNT                                     */
          /* ========================================================================= */
          <form onSubmit={handleSetupFirstUser} className="p-5 sm:p-6 space-y-4">
            
            {/* Setup Header Badge */}
            <div className="text-center pb-1">
              <div className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mb-2">
                <Sparkles className="w-3 h-3 text-purple-600" />
                <span>Initial Setup • Clean System</span>
              </div>
              <h2 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-wider">
                Create General Manager (GM)
              </h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                All staff accounts are clear. Enter your details to create the primary GM account. You can then add your Engineers, Supervisors, Technicians, and Sales team with passwords.
              </p>
            </div>

            {/* Error Message Alert */}
            {setupError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2 animate-in slide-in-from-top-1">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                <div className="font-semibold leading-snug">{setupError}</div>
              </div>
            )}

            {/* GM Name */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                General Manager Full Name *
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-3 text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Eng. Mohamed Hweidi"
                  value={gmName}
                  onChange={(e) => setGmName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-600 text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* Mobile / Phone & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Mobile Number *
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-3 text-slate-400">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="tel"
                    required
                    placeholder="+973 17162240"
                    value={gmPhone}
                    onChange={(e) => setGmPhone(e.target.value)}
                    className="w-full pl-8 pr-2.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-600 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email (Optional)
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-3 text-slate-400">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="email"
                    placeholder="gm@firexbahrain.com"
                    value={gmEmail}
                    onChange={(e) => setGmEmail(e.target.value)}
                    className="w-full pl-8 pr-2.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-600 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Password / PIN Fields */}
            <div className="space-y-3 pt-1 border-t border-slate-100">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    GM Password / PIN *
                  </label>
                  <span className="text-[10px] text-slate-400">Minimum 3 characters/digits</span>
                </div>
                <div className="relative">
                  <div className="absolute left-3.5 top-3 text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showGmPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter your password or PIN"
                    value={gmPassword}
                    onChange={(e) => setGmPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowGmPassword(!showGmPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    {showGmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Confirm Password / PIN *
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-3 text-slate-400">
                    <Check className="w-4 h-4" />
                  </div>
                  <input
                    type={showGmPassword ? 'text' : 'password'}
                    required
                    placeholder="Re-enter password or PIN"
                    value={gmConfirmPassword}
                    onChange={(e) => setGmConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-600"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={setupLoading}
              className="w-full h-12 bg-purple-700 hover:bg-purple-800 active:bg-purple-900 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-900/20 transition-all disabled:opacity-50 mt-2"
            >
              {setupLoading ? (
                <span className="animate-pulse">Creating GM Account...</span>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 text-purple-200" />
                  <span>Create GM Account &amp; Launch App</span>
                </>
              )}
            </button>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-[11px] text-slate-600 font-medium">
                💡 After launching, go to <strong className="text-purple-700">Staff Management</strong> to add Engineers, Supervisors, Technicians, and Sales.
              </span>
            </div>

          </form>
        ) : (
          /* ========================================================================= */
          /* STANDARD SIGN IN VIEW                                                     */
          /* ========================================================================= */
          <form onSubmit={handleLogin} className="p-5 sm:p-6 space-y-4">
            
            <div className="text-center pb-1">
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                Sign In to Your Account
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Select your user profile and enter your PIN / password
              </p>
            </div>

            {/* Error Message Alert */}
            {loginError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2 animate-in slide-in-from-top-1">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                <div className="font-semibold leading-snug">{loginError}</div>
              </div>
            )}

            {/* Quick Role Selector Pills */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Quick Pick Role:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { role: 'Managing Director (MD)', label: 'Managing Director (MD)', color: 'bg-amber-600' },
                  { role: 'GM', label: 'GM', color: 'bg-purple-600' },
                  { role: 'Engineer', label: 'Engineer', color: 'bg-indigo-600' },
                  { role: 'Supervisor', label: 'Supervisor', color: 'bg-blue-600' },
                  { role: 'Technician', label: 'Technician', color: 'bg-emerald-600' },
                  { role: 'Sales', label: 'Sales', color: 'bg-amber-600' },
                  { role: 'Accounts', label: 'Accounts', color: 'bg-teal-600' },
                  { role: 'Projects Manager', label: 'Projects Mgr', color: 'bg-cyan-600' }
                ].map((r) => {
                  const isSelected = selectedUser?.role === r.role || (r.role === 'Managing Director (MD)' && ['Managing Director (MD)', 'Managing Director', 'managing_director'].includes(selectedUser?.role));
                  const hasUserInRole = usersList.some(u => u.role === r.role || (r.role === 'Managing Director (MD)' && ['Managing Director (MD)', 'Managing Director', 'managing_director'].includes(u.role)));
                  return (
                    <button
                      key={r.role}
                      type="button"
                      disabled={!hasUserInRole}
                      onClick={() => handleSelectRole(r.role)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                        isSelected
                          ? `${r.color} text-white border-transparent shadow-sm scale-105`
                          : hasUserInRole
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                            : 'bg-slate-50 text-slate-400 border-slate-100 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      {r.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Username Sign-in */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Username:
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-3.5 text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  autoComplete="username"
                  placeholder="Enter your username (or pick your name below)"
                  value={loginUsername}
                  onChange={(e) => { setLoginUsername(e.target.value); setLoginError(''); }}
                  className="w-full pl-10 pr-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* User Account Dropdown */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Select User Name:
              </label>
              <div className="relative">
                <select
                  value={selectedUserId}
                  onChange={(e) => {
                    setSelectedUserId(e.target.value);
                    setPassword('');
                    setLoginError('');
                  }}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 appearance-none pr-10 text-xs sm:text-sm"
                >
                  {usersList.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} — {u.role} ({u.designation || u.role})
                    </option>
                  ))}
                </select>
                <div className="absolute right-3.5 top-3.5 pointer-events-none text-slate-400">
                  <ChevronRight className="w-4 h-4 rotate-90" />
                </div>
              </div>

              {/* Selected User Info Preview Badge */}
              {selectedUser && (
                <div className="mt-2 flex items-center justify-between px-3 py-2 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black text-white ${
                      ['Managing Director (MD)', 'Managing Director', 'managing_director'].includes(selectedUser.role) ? 'bg-amber-600' :
                      selectedUser.role === 'Sales' ? 'bg-amber-600' :
                      selectedUser.role === 'GM' ? 'bg-purple-600' :
                      selectedUser.role === 'Engineer' ? 'bg-indigo-600' :
                      selectedUser.role === 'Technician' ? 'bg-emerald-600' :
                      selectedUser.role === 'Accounts' ? 'bg-teal-600' :
                      selectedUser.role === 'Projects Manager' ? 'bg-cyan-600' : 'bg-blue-600'
                    }`}>
                      {selectedUser.avatar || selectedUser.role?.[0]}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block leading-tight">{selectedUser.name}</span>
                      <span className="text-[10px] text-slate-500 block leading-tight">{selectedUser.designation || selectedUser.role}</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                    ['Managing Director (MD)', 'Managing Director', 'managing_director'].includes(selectedUser.role) ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                    selectedUser.role === 'Sales' ? 'bg-amber-100 text-amber-800' :
                    selectedUser.role === 'GM' ? 'bg-purple-100 text-purple-800' :
                    selectedUser.role === 'Technician' ? 'bg-emerald-100 text-emerald-800' :
                    selectedUser.role === 'Accounts' ? 'bg-teal-100 text-teal-800' :
                    selectedUser.role === 'Projects Manager' ? 'bg-cyan-100 text-cyan-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {selectedUser.role}
                  </span>
                </div>
              )}
            </div>

            {/* Password / PIN Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  Password / PIN:
                </label>
              </div>

              <div className="relative">
                <div className="absolute left-3.5 top-3.5 text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoFocus
                  placeholder="Enter password or PIN"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                GM, Engineer, and Supervisor can change passwords in Staff Management.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loginLoading}
              className="w-full h-12 bg-navy-900 hover:bg-navy-800 active:bg-black text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-navy-900/20 transition-all disabled:opacity-50 mt-1"
            >
              {loginLoading ? (
                <span className="animate-pulse">Checking credentials...</span>
              ) : (
                <>
                  <KeyRound className="w-4 h-4 text-emerald-400" />
                  <span>Sign In &amp; Open App</span>
                </>
              )}
            </button>

            {/* Helper Footer */}
            <div className="pt-2 text-center border-t border-slate-100">
              <span className="text-[11px] text-slate-500">
                Staff can be added or updated from <strong className="text-navy-900 font-bold">Staff Management</strong> inside the app.
              </span>
            </div>

          </form>
        )}

      </div>

    </div>
  );
}
