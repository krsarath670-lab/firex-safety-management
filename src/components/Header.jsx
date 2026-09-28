import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Shield, Bell, Wifi, WifiOff, Smartphone, Monitor, Tablet, UserCheck, ChevronDown, CheckCircle, AlertTriangle, Lock, Key, LogOut } from 'lucide-react';

export default function Header() {
  const {
    currentUser,
    switchRole,
    isOffline,
    setIsOffline,
    notifications,
    unreadCount,
    deviceView,
    setDeviceView,
    offlineQueue,
    syncOfflineData,
    setActiveTab,
    companySettings,
    logout,
    setIsLoginModalOpen
  } = useApp();

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);

  const roles = [
    { role: 'GM', label: 'GM (Full Access)', badgeColor: 'bg-purple-600' },
    { role: 'Engineer', label: 'Engineer (Operational)', badgeColor: 'bg-indigo-600' },
    { role: 'Supervisor', label: 'Supervisor (Field Lead)', badgeColor: 'bg-blue-600' },
    { role: 'Technician', label: 'Technician (No Finances)', badgeColor: 'bg-emerald-600' },
    { role: 'Sales', label: 'Sales (Own Work Only)', badgeColor: 'bg-amber-600' },
  ];

  const salesUsers = [
    { id: 'usr-sales-1', name: 'Hussain Al-Saeed', role: 'Sales', label: 'Salesperson A (Hussain)' },
    { id: 'usr-sales-2', name: 'Noor Al-Qassim', role: 'Sales', label: 'Salesperson B (Noor)' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-navy-900 text-white shadow-md border-b border-navy-800">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between">
        
        {/* Brand & Logo */}
        <div 
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center space-x-2.5 cursor-pointer select-none group"
        >
          {companySettings?.logo_url ? (
            <div className="w-9 h-9 rounded-xl bg-white p-0.5 flex items-center justify-center shadow-lg shadow-red-900/40 group-hover:scale-105 transition-transform overflow-hidden border border-navy-700">
              <img
                src={companySettings.logo_url}
                alt="FIREX Logo"
                className="w-full h-full object-contain"
                onError={(e) => { e.target.src = '/logo.png'; }}
              />
            </div>
          ) : (
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-safety-red to-orange-500 flex items-center justify-center shadow-lg shadow-red-900/40 group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5 text-white" />
            </div>
          )}
          <div>
            <div className="text-base font-bold tracking-tight leading-none text-white flex items-center gap-1.5">
              <span>FIREX BAHRAIN</span>
              <span className="text-[10px] font-semibold bg-safety-red/90 text-white px-1.5 py-0.5 rounded tracking-normal">
                FIRE &amp; SAFETY
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-medium tracking-wide">
              Safety Items W.L.L • Al Seef, Bahrain
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-1.5 sm:space-x-2.5">
          
          {/* Device Frame Viewport Toggle (Desktop simulation) */}
          <div className="hidden lg:flex items-center bg-navy-800/80 rounded-lg p-0.5 border border-navy-700">
            <button
              onClick={() => setDeviceView('mobile')}
              title="Android Phone View"
              className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1 transition-colors ${
                deviceView === 'mobile' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Mobile</span>
            </button>
            <button
              onClick={() => setDeviceView('tablet')}
              title="Tablet View"
              className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1 transition-colors ${
                deviceView === 'tablet' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Tablet className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Tablet</span>
            </button>
            <button
              onClick={() => setDeviceView('desktop')}
              title="Desktop View"
              className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1 transition-colors ${
                deviceView === 'desktop' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Full</span>
            </button>
          </div>

          {/* Offline / Online Toggle Indicator */}
          <button
            onClick={() => {
              if (isOffline) {
                setIsOffline(false);
                syncOfflineData();
              } else {
                setIsOffline(true);
              }
            }}
            title={isOffline ? "Currently Offline (Click to go Online)" : "Online (Click to simulate Offline field work)"}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              isOffline
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
            }`}
          >
            {isOffline ? (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden xs:inline">Offline</span>
                {(offlineQueue.reports.length > 0 || offlineQueue.faults.length > 0) && (
                  <span className="ml-0.5 px-1 py-0.2 bg-amber-500 text-navy-950 font-bold text-[10px] rounded-full">
                    {offlineQueue.reports.length + offlineQueue.faults.length}
                  </span>
                )}
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden xs:inline">Online</span>
              </>
            )}
          </button>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setNotifMenuOpen(!notifMenuOpen)}
              className="relative p-2 rounded-lg bg-navy-800/80 hover:bg-navy-700 text-slate-200 border border-navy-700 transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-safety-red text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {notifMenuOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Notifications ({notifications.length})
                  </span>
                  <span className="text-[11px] text-blue-600 font-medium">All Read</span>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">No active alerts</div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          setNotifMenuOpen(false);
                          if (n.link === '/amc') setActiveTab('amc');
                          else if (n.link === '/reports') setActiveTab('reports');
                          else if (n.link === '/faults') setActiveTab('faults');
                        }}
                        className={`p-3 text-xs hover:bg-slate-50 cursor-pointer transition-colors flex items-start gap-2.5 ${
                          !n.read ? 'bg-blue-50/50' : ''
                        }`}
                      >
                        <div className="mt-0.5">
                          {n.type === 'amc_expiry' ? (
                            <AlertTriangle className="w-4 h-4 text-amber-600" />
                          ) : (
                            <CheckCircle className="w-4 h-4 text-blue-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900 leading-tight">{n.title}</p>
                          <p className="text-slate-600 text-[11px] mt-0.5 leading-snug">{n.message}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile & Session Menu */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center space-x-1.5 bg-navy-800 hover:bg-navy-700 border border-navy-700 px-2.5 py-1.5 rounded-lg text-xs font-medium text-white transition-all shadow-sm"
            >
              <div className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] text-white ${
                currentUser?.role === 'Sales' ? 'bg-amber-600' : currentUser?.role === 'GM' ? 'bg-purple-600' : currentUser?.role === 'Technician' ? 'bg-emerald-600' : 'bg-blue-600'
              }`}>
                {currentUser?.avatar || currentUser?.role?.[0] || 'U'}
              </div>
              <div className="text-left hidden sm:block">
                <span className="block text-[11px] font-bold leading-tight truncate max-w-[90px]">
                  {currentUser?.name?.split(' ')[0]}
                </span>
                <span className={`block text-[9px] font-semibold uppercase leading-none ${
                  currentUser?.role === 'Sales' ? 'text-amber-400' : 'text-blue-300'
                }`}>
                  {currentUser?.role}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* User Session Dropdown */}
            {roleMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-navy-900 text-white rounded-2xl shadow-2xl border border-navy-700 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3.5 py-2.5 border-b border-navy-800">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Active Session
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                      currentUser?.role === 'Sales' ? 'bg-amber-500/20 text-amber-300' :
                      currentUser?.role === 'GM' ? 'bg-purple-500/20 text-purple-300' :
                      currentUser?.role === 'Technician' ? 'bg-emerald-500/20 text-emerald-300' :
                      'bg-blue-500/20 text-blue-300'
                    }`}>
                      {currentUser?.role}
                    </span>
                  </div>
                  <div className="text-sm text-white font-bold mt-1">
                    {currentUser?.name}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {currentUser?.designation || currentUser?.role}
                  </div>
                </div>

                <div className="p-2 space-y-1">
                  {/* Switch Account (requires password) */}
                  <button
                    onClick={() => {
                      setRoleMenuOpen(false);
                      setIsLoginModalOpen(true);
                    }}
                    className="w-full px-3 py-2 text-xs flex items-center justify-between rounded-xl bg-navy-800/60 hover:bg-navy-800 text-slate-200 hover:text-white transition-colors border border-navy-700/60"
                  >
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-amber-400" />
                      <span className="font-semibold">Switch Account (Enter PIN)</span>
                    </div>
                    <ChevronDown className="w-3 h-3 text-slate-400 -rotate-90" />
                  </button>

                  {/* If GM, Engineer, or Supervisor: Quick Link to Staff Passwords */}
                  {['GM', 'Engineer', 'Supervisor'].includes(currentUser?.role) && (
                    <button
                      onClick={() => {
                        setRoleMenuOpen(false);
                        setActiveTab('users');
                      }}
                      className="w-full px-3 py-2 text-xs flex items-center justify-between rounded-xl hover:bg-navy-800 text-slate-300 hover:text-white transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-emerald-400" />
                        <span>Manage Staff Passwords</span>
                      </div>
                    </button>
                  )}

                  {/* Lock / Log Out Button */}
                  <button
                    onClick={() => {
                      setRoleMenuOpen(false);
                      logout();
                    }}
                    className="w-full px-3 py-2 text-xs flex items-center gap-2 rounded-xl text-red-300 hover:bg-red-950/40 hover:text-red-200 transition-colors font-bold"
                  >
                    <Lock className="w-4 h-4 text-red-400" />
                    <span>Lock App &amp; Log Out</span>
                  </button>
                </div>

                <div className="px-3.5 pt-2 border-t border-navy-800 text-[10px] text-slate-400">
                  Password protection is active for all accounts.
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
}
