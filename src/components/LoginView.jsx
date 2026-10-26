import React, { useState } from 'react';
import { 
  Shield, Lock, Eye, EyeOff, KeyRound, AlertCircle, CheckCircle2, 
  User, Check, ArrowRight, ShieldCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function LoginView() {
  const { login, companySettings } = useApp();
  
  // Normal Login state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Password reset/migration modal state
  const [mustChangeData, setMustChangeData] = useState(null); // { user, permissions }
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [changeLoading, setChangeLoading] = useState(false);
  const [changeError, setChangeError] = useState('');

  // 6-Character alphanumeric validation checker
  const isLength6 = newPassword.length === 6;
  const isAlphanumeric = /^[a-zA-Z0-9]+$/.test(newPassword);
  const hasLetterAndDigit = /(?=.*[a-zA-Z])(?=.*[0-9])/.test(newPassword);
  const isValidFormat = isLength6 && isAlphanumeric && hasLetterAndDigit;
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  // Handle standard login submit
  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError('');

    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (!trimmedUsername) {
      setError('Please enter your username.');
      return;
    }
    if (!trimmedPassword) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: trimmedUsername, password: trimmedPassword })
      });

      const data = await res.json();
      if (res.ok) {
        if (data.must_change_password) {
          // Trigger the 6-character password setup modal
          setMustChangeData({ user: data.user, permissions: data.permissions });
        } else {
          login(data.user, data.permissions);
        }
      } else {
        setError(data.message || data.error || 'Authentication failed. Please check your credentials.');
      }
    } catch {
      setError('Network connection error. Please verify the server is running and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle password migration / reset submit
  const handleChangePassword = async (e) => {
    if (e) e.preventDefault();
    setChangeError('');

    if (!isValidFormat) {
      setChangeError('Password must be exactly 6 characters with both letters and numbers (no special characters).');
      return;
    }

    if (!passwordsMatch) {
      setChangeError('The passwords do not match. Please re-enter.');
      return;
    }

    setChangeLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': mustChangeData.user.id,
          'x-user-role': mustChangeData.user.role
        },
        body: JSON.stringify({ 
          currentPassword: password, 
          newPassword: newPassword.trim() 
        })
      });

      const data = await res.json();
      if (res.ok) {
        // Complete login with updated user data
        login(data.user || mustChangeData.user, mustChangeData.permissions);
      } else {
        setChangeError(data.message || data.error || 'Failed to update password. Please try again.');
      }
    } catch {
      setChangeError('Network error while updating password.');
    } finally {
      setChangeLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 select-none relative overflow-hidden">
      
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Section: Logo & Application Name */}
        <div className="bg-navy-950 text-white p-7 text-center relative overflow-hidden border-b border-navy-800">
          <div className="relative z-10 flex flex-col items-center">
            
            {/* Logo */}
            {companySettings?.logo_url ? (
              <div className="w-16 h-16 rounded-2xl bg-white p-2 shadow-xl border border-navy-700 mb-3 flex items-center justify-center">
                <img
                  src={companySettings.logo_url}
                  alt="FireX Logo"
                  className="w-full h-full object-contain"
                  onError={(e) => { e.target.src = '/logo.png'; }}
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-safety-red to-orange-500 shadow-xl flex items-center justify-center mb-3">
                <Shield className="w-8 h-8 text-white" />
              </div>
            )}
            
            {/* Application Branding */}
            <h1 className="text-xl font-black tracking-tight text-white">
              FIREX BAHRAIN
            </h1>
            <p className="text-xs font-semibold text-red-400 uppercase tracking-widest mt-0.5">
              Fire &amp; Safety Service Management
            </p>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">
              Enterprise Field Operations &amp; Compliance Portal
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="p-6 sm:p-8 space-y-5">
          
          {/* Error Message Banner */}
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-start gap-2.5 animate-in slide-in-from-top-1">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <div className="font-semibold leading-relaxed">{error}</div>
            </div>
          )}

          {/* 1. Username Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Username
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                autoFocus
                autoComplete="username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (error) setError('');
                }}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900 text-sm transition-all"
              />
            </div>
          </div>

          {/* 2. Password Field & 3. Show/Hide Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Password
              </label>
            </div>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900 text-sm transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                title={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* 4. Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-navy-950 hover:bg-navy-900 active:scale-[0.99] text-white font-bold rounded-xl shadow-lg shadow-navy-950/20 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Secure System Notice Footer */}
          <div className="pt-2 text-center border-t border-slate-100">
            <p className="text-[11px] text-slate-400 font-medium">
              Authorized personnel only. Sessions are monitored and audited.
            </p>
          </div>
        </form>
      </div>

      {/* ========================================================================= */}
      {/* 6-CHARACTER PASSWORD REQUIREMENT / UPDATE MODAL                             */}
      {/* ========================================================================= */}
      {mustChangeData && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="bg-navy-950 text-white p-5 border-b border-navy-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">
                  Update Password Requirement
                </h3>
                <p className="text-[11px] text-slate-300">
                  Account: <strong className="text-white">{mustChangeData.user.name}</strong> ({mustChangeData.user.role})
                </p>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleChangePassword} className="p-5 sm:p-6 space-y-4">
              
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
                For security compliance, please set your personal password. It must be <strong>exactly 6 characters</strong> using letters and numbers.
              </div>

              {changeError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div className="font-semibold">{changeError}</div>
                </div>
              )}

              {/* New Password Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  New 6-Character Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    maxLength={6}
                    required
                    autoFocus
                    placeholder="e.g. FX7B2K"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                    className="w-full px-3.5 py-2.5 pr-10 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm font-bold text-slate-900 tracking-widest focus:bg-white focus:ring-2 focus:ring-navy-900 uppercase"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Confirm Password
                </label>
                <input
                  type={showNewPassword ? "text" : "password"}
                  maxLength={6}
                  required
                  placeholder="Re-enter 6-character password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm font-bold text-slate-900 tracking-widest focus:bg-white focus:ring-2 focus:ring-navy-900 uppercase"
                />
              </div>

              {/* Live Format Checklist */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
                <span className="font-bold text-slate-700 block text-[11px] uppercase tracking-wider">
                  Password Requirements:
                </span>
                <div className="flex items-center gap-2">
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${isLength6 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                    {isLength6 ? <Check className="w-2.5 h-2.5" /> : '•'}
                  </span>
                  <span className={isLength6 ? 'text-emerald-700 font-semibold' : 'text-slate-600'}>
                    Exactly 6 characters ({newPassword.length}/6)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${hasLetterAndDigit ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                    {hasLetterAndDigit ? <Check className="w-2.5 h-2.5" /> : '•'}
                  </span>
                  <span className={hasLetterAndDigit ? 'text-emerald-700 font-semibold' : 'text-slate-600'}>
                    Contains both letters and numbers
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${passwordsMatch ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                    {passwordsMatch ? <Check className="w-2.5 h-2.5" /> : '•'}
                  </span>
                  <span className={passwordsMatch ? 'text-emerald-700 font-semibold' : 'text-slate-600'}>
                    Passwords match
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={changeLoading || !isValidFormat || !passwordsMatch}
                className="w-full py-3 bg-navy-950 hover:bg-navy-900 text-white font-bold rounded-xl shadow transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-40 cursor-pointer"
              >
                {changeLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving Password...</span>
                  </>
                ) : (
                  <>
                    <span>Save &amp; Continue to App</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Skip / Continue to App */}
              <button
                type="button"
                onClick={() => login(mustChangeData.user, mustChangeData.permissions)}
                className="w-full py-2 text-slate-500 hover:text-slate-800 text-xs font-semibold transition-colors cursor-pointer text-center"
              >
                Skip for now &amp; Continue to App
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
