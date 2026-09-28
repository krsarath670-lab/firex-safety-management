import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Always require user and password to be entered upon opening the link
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardStats, setDashboardStats] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [deviceView, setDeviceView] = useState('mobile'); // 'mobile' | 'tablet' | 'desktop'
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [offlineQueue, setOfflineQueue] = useState(() => {
    try {
      const saved = localStorage.getItem('fire_safety_offline_queue');
      return saved ? JSON.parse(saved) : { reports: [], faults: [] };
    } catch {
      return { reports: [], faults: [] };
    }
  });
  const [toast, setToast] = useState(null);
  const [activeModal, setActiveModal] = useState(null); // { type, data }

  // Show temporary toast message
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Synchronize offline queue to localStorage
  useEffect(() => {
    localStorage.setItem('fire_safety_offline_queue', JSON.stringify(offlineQueue));
  }, [offlineQueue]);

  // Online / Offline listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      showToast('Internet connection restored. Synchronizing data...', 'info');
      syncOfflineData();
    };
    const handleOffline = () => {
      setIsOffline(true);
      showToast('Working in OFFLINE mode. Data will be cached locally.', 'warning');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [offlineQueue]);

  // Fetch current user details & permissions from backend
  const fetchAuth = async (userRole = currentUser?.role) => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'x-user-role': userRole, 'x-user-id': currentUser.id }
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        setPermissions(data.permissions);
      }
    } catch (err) {
      console.warn('Backend unavailable, running in local fallback mode:', err);
    }
  };

  // Login handler
  const login = (user, userPermissions) => {
    setCurrentUser(user);
    setPermissions(userPermissions);
    setIsAuthenticated(true);
    setIsLoginModalOpen(false);
    try {
      localStorage.setItem('firex_auth_user', JSON.stringify({ user, permissions: userPermissions }));
    } catch (e) {
      console.warn('Failed saving to localStorage', e);
    }
    showToast(`Welcome back, ${user.name}!`, 'success');
  };

  // Logout handler
  const logout = () => {
    try {
      localStorage.removeItem('firex_auth_user');
    } catch {}
    setCurrentUser(null);
    setPermissions({});
    setIsAuthenticated(false);
    setIsLoginModalOpen(true);
    showToast('Logged out of session', 'info');
  };

  // Fetch dashboard stats
  const fetchStats = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/dashboard/stats', {
        headers: { 'x-user-id': currentUser.id, 'x-user-role': currentUser.role }
      });
      if (res.ok) {
        const data = await res.json();
        setDashboardStats(data);
      }
    } catch (err) {
      console.warn('Failed to load stats:', err);
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/notifications', {
        headers: { 'x-user-id': currentUser.id, 'x-user-role': currentUser.role }
      });
      if (res.ok) {
        const notifs = await res.json();
        setNotifications(notifs);
        setUnreadCount(notifs.filter(n => !n.read).length);
      }
    } catch (err) {
      console.warn('Failed to load notifications:', err);
    }
  };

  const [companySettings, setCompanySettings] = useState({
    company_name: 'FIREX',
    arabic_name: 'شركة فايركس لأدوات السلامه',
    logo_url: '/logo.png',
    letterhead_url: '/letterhead.png',
    use_custom_letterhead: true,
    cr_number: '96850 1',
    cr_no: '96850 1',
    vat_number: '220006271900002',
    vat_no: '220006271900002',
    cr_vat_number: 'CR No.: 96850 1 | VAT No.: 220006271900002',
    address_line_1: 'Villa 13, Building 2373',
    address_line_2: 'Road 2831, Al Seef',
    address_line_3: 'Block 428, Bahrain',
    address: 'Villa 13, Building 2373, Road 2831, Al Seef, Block 428, Bahrain',
    phone: '+973 1716 2240',
    email: 'service@firexbahrain.com',
    report_footer: 'FIREX • Villa 13, Building 2373, Road 2831, Al Seef, Block 428, Bahrain • CR No.: 96850 1 • VAT No.: 220006271900002',
    report_number_prefix: 'RPT'
  });
  const [allUsers, setAllUsers] = useState([]);

  // Fetch all users for role / assignment dropdowns
  const fetchAllUsers = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/users', {
        headers: { 'x-user-role': currentUser.role, 'x-user-id': currentUser.id }
      });
      if (res.ok) {
        const data = await res.json();
        setAllUsers(data);
      }
    } catch (err) {
      console.warn('Failed to load users:', err);
    }
  };

  // Fetch company settings
  const fetchCompanySettings = async () => {
    try {
      const headers = currentUser ? { 'x-user-role': currentUser.role, 'x-user-id': currentUser.id } : {};
      const res = await fetch('/api/settings', { headers });
      if (res.ok) {
        const data = await res.json();
        setCompanySettings(data);
      }
    } catch (err) {
      console.warn('Failed to load company settings:', err);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchAuth();
    }
    fetchCompanySettings();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchStats();
      fetchNotifications();
      fetchCompanySettings();
      fetchAllUsers();
    }
  }, [currentUser]);

  // Switch role dynamically
  const switchRole = async (targetRole, targetUserId = null, targetPassword = null) => {
    try {
      const res = await fetch('/api/auth/switch-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: targetRole, userId: targetUserId, password: targetPassword })
      });
      if (res.ok) {
        const data = await res.json();
        login(data.user, data.permissions);
        showToast(`Switched to ${data.user.role}: ${data.user.name}`, 'info');
      } else {
        const err = await res.json();
        showToast(err.message || 'Switching failed: Password required', 'error');
      }
    } catch (e) {
      showToast('Network error during role switch', 'error');
    }
  };

  // Helper: fetch monthly AMC schedule
  const fetchMonthlyAmcSchedule = async (year, month, filters = {}) => {
    try {
      const params = new URLSearchParams({
        year: String(year),
        month: String(month),
        ...filters
      });
      const res = await fetch(`/api/amc-visits/monthly?${params.toString()}`, {
        headers: { 'x-user-role': currentUser.role, 'x-user-id': currentUser.id }
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Failed to fetch monthly AMC visits:', e);
    }
    return { visits: [], summary: {} };
  };

  // Helper: fetch sales monthly report
  const fetchSalesMonthlyReport = async (year, month, salesPersonId = null) => {
    try {
      const params = new URLSearchParams({
        year: String(year),
        month: String(month),
        ...(salesPersonId ? { sales_person_id: salesPersonId } : {})
      });
      const res = await fetch(`/api/sales/monthly-report?${params.toString()}`, {
        headers: { 'x-user-role': currentUser.role, 'x-user-id': currentUser.id }
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Failed to fetch sales monthly report:', e);
    }
    return null;
  };

  // Synchronize offline queue with server
  const syncOfflineData = async () => {
    if (offlineQueue.reports.length === 0 && offlineQueue.faults.length === 0) {
      return;
    }
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
          'x-user-role': currentUser.role
        },
        body: JSON.stringify(offlineQueue)
      });
      if (res.ok) {
        const data = await res.json();
        setOfflineQueue({ reports: [], faults: [] });
        showToast(data.message || 'Offline data successfully synchronized!', 'success');
        fetchStats();
      }
    } catch (e) {
      showToast('Could not sync data yet. Will retry when connection stabilizes.', 'warning');
    }
  };

  // Queue item offline
  const queueOfflineItem = (type, item) => {
    setOfflineQueue(prev => ({
      ...prev,
      [type]: [...prev[type], item]
    }));
    showToast(`Saved to device offline storage (${type})`, 'info');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        permissions,
        switchRole,
        activeTab,
        setActiveTab,
        dashboardStats,
        fetchStats,
        notifications,
        unreadCount,
        deviceView,
        setDeviceView,
        isOffline,
        setIsOffline,
        offlineQueue,
        syncOfflineData,
        queueOfflineItem,
        toast,
        showToast,
        activeModal,
        setActiveModal,
        companySettings,
        fetchCompanySettings,
        allUsers,
        fetchAllUsers,
        fetchMonthlyAmcSchedule,
        fetchSalesMonthlyReport,
        isAuthenticated,
        setIsAuthenticated,
        login,
        logout,
        isLoginModalOpen,
        setIsLoginModalOpen
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
