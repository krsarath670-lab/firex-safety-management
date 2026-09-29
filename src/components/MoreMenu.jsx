import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldCheck, Building2, Wrench, Package, Sparkles, 
  Settings, Users, WifiOff, RefreshCw, ChevronRight, Bell, Shield, Receipt, Flame
} from 'lucide-react';

export default function MoreMenu({ onSelectView }) {
  const { currentUser, dashboardStats, offlineQueue, syncOfflineData, isOffline } = useApp();

  const isTechnician = currentUser?.role === 'Technician';
  const isSales = currentUser?.role === 'Sales';
  const isAccounts = currentUser?.role === 'Accounts';
  const isProjectsManager = currentUser?.role === 'Projects Manager';
  const isManagement = ['GM', 'Engineer', 'Supervisor'].includes(currentUser?.role);
  const isGM = currentUser?.role === 'GM';
  const canAccessFinance = isGM || isAccounts || currentUser?.role === 'Engineer';

  const menuSections = [
    {
      title: "Finance & Accounts",
      items: [
        {
          id: 'accounts',
          label: 'Accounts, Invoices & Holds',
          description: 'Master invoices, payments, client ledgers & financial holds',
          icon: Receipt,
          iconColor: 'text-teal-600 bg-teal-50',
          badge: dashboardStats?.overdueInvoicesCount > 0 ? `${dashboardStats.overdueInvoicesCount} Overdue` : null,
          badgeColor: 'bg-red-100 text-red-800',
          hide: !canAccessFinance
        }
      ]
    },
    {
      title: "Operations & Contracts",
      items: [
        {
          id: 'emergency',
          label: 'Emergency Call-Out & Rapid Response',
          description: 'Urgent site attendance, findings, photos, customer signature & approval',
          icon: Flame,
          iconColor: 'text-safety-red bg-red-50',
          badge: dashboardStats?.emergencyStats?.active > 0 ? `${dashboardStats.emergencyStats.active} Active` : null,
          badgeColor: 'bg-red-100 text-red-800 font-bold',
          hide: false
        },
        {
          id: 'amc',
          label: 'AMC Contracts & Reminders',
          description: 'Agreements, expiry countdowns & visit schedules',
          icon: ShieldCheck,
          iconColor: 'text-blue-600 bg-blue-50',
          badge: dashboardStats?.expiring60Days > 0 ? `${dashboardStats.expiring60Days} Expiring` : null,
          badgeColor: 'bg-amber-100 text-amber-800',
          hide: isTechnician
        },
        {
          id: 'customers',
          label: 'Customers & Sites',
          description: 'Facility profiles, installed fire systems & history',
          icon: Building2,
          iconColor: 'text-indigo-600 bg-indigo-50',
          badge: null,
          hide: isTechnician
        },
        {
          id: 'faults',
          label: 'Outstanding Faults',
          description: 'Defect tracking, before/after evidence & rectification',
          icon: Wrench,
          iconColor: 'text-safety-red bg-red-50',
          badge: dashboardStats?.openFaultsCount > 0 ? `${dashboardStats.openFaultsCount} Open` : null,
          badgeColor: 'bg-red-100 text-red-800',
          hide: false
        },
        {
          id: 'materials',
          label: 'Materials & Spare Parts',
          description: 'Detectors, valves, batteries & consumables catalog',
          icon: Package,
          iconColor: 'text-emerald-600 bg-emerald-50',
          badge: null,
          hide: isTechnician
        }
      ]
    },
    {
      title: "Field Engineering Tools",
      items: [
        {
          id: 'ai',
          label: 'AI Technical Report Assistant',
          description: 'Voice memos to formal NFPA engineering diction',
          icon: Sparkles,
          iconColor: 'text-amber-600 bg-amber-50',
          badge: 'Voice AI',
          badgeColor: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold',
          hide: false
        }
      ]
    },
    {
      title: "Administration & System",
      items: [
        {
          id: 'users',
          label: 'Staff Directory & App Access',
          description: 'Add & manage Technicians and Sales personnel for app access',
          icon: Users,
          iconColor: 'text-purple-600 bg-purple-50',
          badge: isManagement ? 'Manage' : null,
          badgeColor: 'bg-purple-100 text-purple-800',
          hide: !isManagement
        },
        {
          id: 'settings',
          label: 'Company Settings & Legal',
          description: 'FIREX credentials, CR, VAT & report settings',
          icon: Settings,
          iconColor: 'text-slate-700 bg-slate-100',
          badge: null,
          hide: false
        }
      ]
    }
  ];

  const totalOfflineItems = (offlineQueue?.reports?.length || 0) + (offlineQueue?.faults?.length || 0);

  return (
    <div className="space-y-4 pb-24">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
        <h1 className="text-base sm:text-lg font-black text-slate-900">
          Application Directory
        </h1>
        <p className="text-xs text-slate-500">
          Access all modules, compliance settings, and field offline tools.
        </p>
      </div>

      {/* Offline Sync Banner Card */}
      <div className="bg-gradient-to-r from-slate-900 to-navy-950 text-white rounded-2xl p-4 border border-navy-800 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-blue-600/30 text-blue-400 border border-blue-500/30">
              <WifiOff className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Offline Field Synchronization
              </h3>
              <p className="text-xs text-slate-200 mt-0.5">
                {totalOfflineItems > 0
                  ? `${totalOfflineItems} item(s) pending sync in local storage.`
                  : "All local data synchronized with cloud database."}
              </p>
            </div>
          </div>
          <button
            onClick={syncOfflineData}
            disabled={totalOfflineItems === 0}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync Now</span>
          </button>
        </div>
      </div>

      {/* Grouped Menu Sections */}
      {menuSections.map((sec, idx) => {
        const visibleItems = sec.items.filter(i => !i.hide);
        if (visibleItems.length === 0) return null;

        return (
          <div key={idx} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2">
            <h2 className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-1 mb-1">
              {sec.title}
            </h2>
            <div className="divide-y divide-slate-100">
              {visibleItems.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectView(item.id)}
                    className="w-full py-3 px-1 flex items-center justify-between text-left hover:bg-slate-50 transition-colors rounded-xl group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2.5 rounded-xl ${item.iconColor} group-hover:scale-105 transition-transform`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {item.label}
                          </span>
                          {item.badge && (
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${item.badgeColor || 'bg-slate-100 text-slate-700'}`}>
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

    </div>
  );
}
