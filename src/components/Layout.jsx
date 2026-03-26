import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { useOrders } from '../hooks/useOrders';
import { useShifts } from '../hooks/useShifts';
import { useState, useEffect, useMemo } from 'react';
import Toast from './Toast';

const NAV_ITEMS = [
  { label: 'Main', type: 'section' },
  { path: '/', label: 'Dashboard', icon: 'dashboard', role: 'cashier' },
  { path: '/pos', label: 'Sales / POS', icon: 'pos', role: 'cashier' },
  { path: '/orders', label: 'Orders', icon: 'orders', badgeKey: 'orders', role: 'cashier' },
  { label: 'Catalog', type: 'section' },
  { path: '/products', label: 'Products & Inventory', icon: 'products', role: 'manager' },
  { path: '/suppliers', label: 'Suppliers', icon: 'customers', role: 'manager' },
  { path: '/purchase-orders', label: 'Purchase Orders', icon: 'orders', role: 'manager' },
  { label: 'Business', type: 'section' },
  { path: '/customers', label: 'Customers', icon: 'customers', role: 'cashier' },
  { path: '/shift', label: 'Shift Mgmt', icon: 'shift', role: 'cashier' },
  { path: '/reports', label: 'Intelligence & Reports', icon: 'analytics', role: 'manager' },
  { label: 'Operations', type: 'section' },
  { path: '/staff', label: 'Staff Mgmt', icon: 'staff', role: 'admin' },
  { path: '/returns', label: 'Returns', icon: 'returns', feature: 'returns', role: 'cashier' },
  { path: '/payments', label: 'Payments', icon: 'payments', feature: 'advpayments', role: 'manager' },
  { path: '/expenses', label: 'Expenses', icon: 'expenses', feature: 'expenses', role: 'manager' },
  { path: '/alerts', label: 'Alerts', icon: 'alerts', role: 'cashier' },
  { label: 'System', type: 'section' },
  { path: '/audit-logs', label: 'Audit Logs', icon: 'audit', role: 'admin' },
  { path: '/settings', label: 'Settings', icon: 'settings', role: 'admin' },
];

function NavIcon({ icon }) {
  const icons = {
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
    pos: <><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></>,
    orders: <><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" /><rect x="9" y="3" width="6" height="4" rx="2" /><path d="M9 12h6M9 16h4" /></>,
    products: <><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></>,
    customers: <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></>,
    analytics: <><path d="M21.21 15.89A10 10 0 118 2.83" /><path d="M22 12A10 10 0 0012 2v10z" /></>,
    shift: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>,
    staff: <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></>,
    returns: <><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></>,
    expenses: <><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></>,
    payments: <><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2" /></>,
    alerts: <><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></>,
    audit: <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></>,
  };
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0 stroke-current fill-none" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      {icons[icon]}
    </svg>
  );
}

const THEMES = [
  { id: 'dark', bg: '#131920' },
  { id: 'light', bg: '#f0f4f8', border: true },
  { id: 'ocean', bg: '#041220' },
  { id: 'violet', bg: '#120f22' },
  { id: 'forest', bg: '#0e1810' },
];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, logout, isLoading: isAuthLoading } = useAuth();
  const { theme, setTheme } = useTheme();
  const { openModal, features, showToast } = useApp();
  const { orders = [] } = useOrders();
  const { currentShift } = useShifts();
  
  const shiftOpen = !!currentShift;
  const shiftStartTime = currentShift ? new Date(currentShift.start_time) : null;
  
  const [clock, setClock] = useState('--:--:--');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => localStorage.getItem('sidebar-collapsed') === 'true');

  const isPOS = location.pathname === '/pos';

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', isCollapsed);
  }, [isCollapsed]);

  // Close sidebar on route change (for mobile)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const iv = setInterval(() => {
      setClock(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  const stats = useMemo(() => {
    const shiftOrders = shiftStartTime ? orders.filter(o => new Date(o.created_at) >= shiftStartTime) : [];
    return {
      cnt: orders.length,
      rev: shiftOrders.reduce((sum, o) => sum + (o.total || 0), 0)
    };
  }, [orders, shiftStartTime]);

  const pageLabels = {
    '/': 'Dashboard', '/pos': 'Sales / POS', '/orders': 'Orders',
    '/products': 'Products & Inventory', '/customers': 'Customers',
    '/shift': 'Shift Management', '/staff': 'Staff Management', '/returns': 'Returns & Refunds',
    '/expenses': 'Expenses', '/payments': 'Advanced Payments',
    '/alerts': 'Notifications & Alerts', '/audit-logs': 'System Audit Logs', '/settings': 'Settings',
    '/suppliers': 'Supplier Management', '/purchase-orders': 'Purchase Orders',
  };

  const userRole = profile?.role || 'cashier';
  const hasAccess = (itemRole) => {
    if (!itemRole || itemRole === 'cashier') return true;
    if (itemRole === 'manager') return userRole === 'owner' || userRole === 'admin' || userRole === 'manager';
    if (itemRole === 'admin') return userRole === 'owner' || userRole === 'admin';
    return false;
  };

  const visibleItems = NAV_ITEMS.filter(item => {
    if (item.type === 'section') return true;
    if (item.feature && !features[item.feature]) return false;
    return hasAccess(item.role);
  }).filter((item, i, arr) => {
    if (item.type === 'section') {
      const nextItem = arr[i + 1];
      return nextItem && nextItem.type !== 'section';
    }
    return true;
  });

  return (
    <div className="flex h-screen relative">
      {/* MOBILE OVERLAY */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      {!isPOS && (
        <aside className={`fixed inset-y-0 left-0 ${isCollapsed ? 'w-[64px]' : 'w-[240px]'} bg-theme-surface border-r border-theme z-50 flex flex-col theme-transition transform transition-all duration-300 ease-in-out lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          {/* User Card */}
          <div className="p-2 border-b border-theme overflow-hidden">
            <div className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer hover:bg-theme-hover ${isCollapsed ? 'justify-center' : ''}`}>
              <div className="w-[30px] h-[30px] rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#3b82f6] flex items-center justify-center text-[10px] font-extrabold text-white flex-shrink-0">
                {profile?.name?.split(' ').map(x => x[0]).join('') || 'U'}
              </div>
              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <div className="text-[12.5px] font-semibold text-theme truncate">{profile?.name || 'User'}</div>
                  <div className="text-[10.5px] text-theme3 truncate flex items-center gap-1">
                    <span className="capitalize">{profile?.role || 'Staff'}</span>
                    {profile?.businesses?.name && <span className="text-[9px] opacity-50 truncate">@ {profile.businesses.name}</span>}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-2 overflow-y-auto">
            {visibleItems.map((item, i) => {
              if (item.type === 'section') {
                return !isCollapsed && <div key={i} className="text-[9.5px] text-theme3 font-bold tracking-[.8px] uppercase px-3 pt-2.5 pb-1">{item.label}</div>;
              }
              const active = location.pathname === item.path;
              return (
                <div key={item.path} onClick={() => navigate(item.path)} title={isCollapsed ? item.label : ''}
                  className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-2.5 px-3'} py-2 rounded-[9px] cursor-pointer text-[13px] mb-px transition-all select-none ${active ? 'bg-theme-active text-theme font-semibold' : 'text-theme2 hover:bg-theme-hover hover:text-theme'}`}>
                  <NavIcon icon={item.icon} />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.role === 'admin' && <span className="ml-1 text-[8px] font-bold px-1 py-0 rounded bg-[#3b82f6] text-white uppercase tracking-wider flex-shrink-0">Admin</span>}
                      {item.badgeKey === 'orders' && stats.cnt > 0 && <span className="text-[10px] font-bold px-1.5 py-px rounded-full bg-[#ef4444] text-white flex-shrink-0">{stats.cnt}</span>}
                    </>
                  )}
                </div>
              );
            })}
            <div className="mt-auto pt-4 border-t border-theme border-dashed opacity-50 mb-2" />
            <button onClick={() => { if (confirm('Are you sure you want to logout?')) { logout(); navigate('/login'); } }} title={isCollapsed ? 'Logout' : ''}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-1.5 px-3'} py-2 rounded-lg text-[12px] font-semibold cursor-pointer transition-all border border-[rgba(239,68,68,.2)] text-[#ef4444] bg-[rgba(239,68,68,.12)] hover:bg-[#ef4444] hover:text-white`}>
              <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current fill-none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {!isCollapsed && 'Logout'}
            </button>

            <button onClick={() => setIsCollapsed(!isCollapsed)} className="w-full mt-2 flex items-center justify-center p-2 rounded-lg text-theme3 hover:bg-theme-hover hover:text-theme transition-all bg-theme-elevated/30 border border-theme">
              <svg viewBox="0 0 24 24" className={`w-4 h-4 stroke-current fill-none transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          </nav>

          {/* Powered by */}
          {!isCollapsed && (
            <div className="px-2 py-1 text-[10px] text-gray-400/50 flex justify-center items-center">
              <span>Powered by VTS</span>
            </div>
          )}
        </aside>
      )}

      {/* MAIN */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-[52px] bg-theme-surface border-b border-theme flex items-center px-[18px] gap-2 flex-shrink-0 theme-transition">
          {!isPOS && (
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden h-8 w-8 flex items-center justify-center p-0 bg-transparent border-none text-theme2 cursor-pointer mr-1"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-current fill-none" strokeWidth="2.5">
                <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          )}

          {isPOS ? (
            <button onClick={() => navigate('/')} className="h-[30px] rounded-[7px] bg-theme-elevated border border-theme cursor-pointer flex items-center gap-[5px] px-2.5 text-theme2 text-[12px] font-bold transition-all hover:bg-theme-hover hover:text-theme mr-2">
              <svg viewBox="0 0 24 24" className="w-[14px] h-[14px] stroke-current fill-none" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
              Exit POS
            </button>
          ) : (
            <span className="text-[14px] font-bold tracking-[-0.2px] text-theme">{pageLabels[location.pathname] || 'Dashboard'}</span>
          )}

          <div className="flex-1" />
          <div className="text-[12px] font-bold text-theme2 tabular-nums min-w-[72px] text-right">{clock}</div>
          {!isPOS && (
            <button onClick={() => navigate('/pos')} className="h-[30px] rounded-[7px] bg-theme-elevated border border-theme cursor-pointer flex items-center gap-[5px] px-2.5 text-theme2 text-[12px] font-medium transition-all hover:bg-theme-hover hover:text-theme">
              <svg viewBox="0 0 24 24" className="w-[13px] h-[13px] stroke-current fill-none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
              </svg>
              New Sale
            </button>
          )}
          <button onClick={() => openModal('shift')} className="h-[30px] rounded-[7px] bg-theme-elevated border border-theme cursor-pointer flex items-center gap-[5px] px-2.5 text-theme2 text-[12px] font-medium transition-all hover:bg-theme-hover hover:text-theme">
            <svg viewBox="0 0 24 24" className="w-[13px] h-[13px] stroke-current fill-none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            {shiftOpen ? 'Close Shift' : 'Open Shift'}
          </button>
        </header>

        {/* Shift Status Bar */}
        <div className={`h-8 flex items-center justify-center gap-4 text-[12px] font-semibold flex-shrink-0 ${shiftOpen ? 'bg-[rgba(34,197,94,.12)] border-b border-[rgba(34,197,94,.2)] text-[#22c55e]' : 'bg-[rgba(239,68,68,.12)] border-b border-[rgba(239,68,68,.2)] text-[#ef4444]'}`}>
          <svg viewBox="0 0 24 24" className="w-[13px] h-[13px] stroke-current fill-none" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
          </svg>
          {shiftOpen ? (
            <span>Shift open · Started at {shiftStartTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} · Total sales: <strong>${stats.rev.toFixed(2)}</strong></span>
          ) : (
            <span>Shift closed · Open a new shift to start selling</span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <Outlet />
        </div>
      </div>

      {/* Toast */}
      <Toast />
    </div>
  );
}
