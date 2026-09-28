import React from 'react';
import { useApp } from '../context/AppContext';
import { Home, Briefcase, FileText, Grid, ShieldCheck, Building2, Users } from 'lucide-react';

export default function BottomNav() {
  const { activeTab, setActiveTab, dashboardStats, currentUser } = useApp();

  const isSales = currentUser?.role === 'Sales';
  const isTechnician = currentUser?.role === 'Technician';

  let navItems = [];

  if (isSales) {
    navItems = [
      { id: 'dashboard', label: 'Home', icon: Home, badge: null },
      { id: 'jobs', label: 'My Jobs', icon: Briefcase, badge: dashboardStats?.myJobsCount > 0 ? dashboardStats.myJobsCount : null },
      { id: 'customers', label: 'Customers', icon: Building2, badge: null },
      { id: 'amc', label: 'AMC', icon: ShieldCheck, badge: dashboardStats?.myAmcCount > 0 ? dashboardStats.myAmcCount : null },
      { id: 'more', label: 'More', icon: Grid, badge: null }
    ];
  } else if (isTechnician) {
    navItems = [
      { id: 'dashboard', label: 'Home', icon: Home, badge: null },
      { id: 'jobs', label: 'Jobs', icon: Briefcase, badge: dashboardStats?.pendingJobsCount > 0 ? dashboardStats.pendingJobsCount : null },
      { id: 'reports', label: 'Reports', icon: FileText, badge: dashboardStats?.pendingReportsCount > 0 ? dashboardStats.pendingReportsCount : null },
      { id: 'more', label: 'More', icon: Grid, badge: null }
    ];
  } else {
    // GM, Engineer, Supervisor
    navItems = [
      { id: 'dashboard', label: 'Home', icon: Home, badge: null },
      { id: 'jobs', label: 'Jobs', icon: Briefcase, badge: dashboardStats?.pendingJobsCount > 0 ? dashboardStats.pendingJobsCount : null },
      { id: 'customers', label: 'Customers', icon: Building2, badge: null },
      { id: 'amc', label: 'AMC', icon: ShieldCheck, badge: dashboardStats?.expiring30Days > 0 ? dashboardStats.expiring30Days : null },
      { id: 'users', label: 'Staff Access', icon: Users, badge: null },
      { id: 'more', label: 'More', icon: Grid, badge: dashboardStats?.openFaultsCount > 0 ? dashboardStats.openFaultsCount : null }
    ];
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-navy-950/95 backdrop-blur-md border-t border-navy-800 text-slate-300 pb-[env(safe-area-inset-bottom)] shadow-lg shadow-black/40">
      <div className="max-w-lg mx-auto flex items-center justify-around h-16 px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id || (item.id === 'more' && ['reports', 'faults', 'materials', 'settings', 'ai', 'quotations'].includes(activeTab));
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex-1 flex flex-col items-center justify-center h-full py-1 transition-all relative ${
                isActive
                  ? 'text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {/* Active indicator bar */}
              {isActive && (
                <div className="absolute top-0 w-10 h-1 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-b-full shadow-sm shadow-blue-500/50" />
              )}
              
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-blue-400' : ''}`} />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-2.5 px-1.5 py-0.2 bg-safety-red text-white text-[9px] font-extrabold rounded-full border border-navy-900 shadow-sm animate-pulse">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[11px] mt-1 tracking-tight leading-none ${isActive ? 'text-white font-semibold' : 'text-slate-400 font-normal'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
