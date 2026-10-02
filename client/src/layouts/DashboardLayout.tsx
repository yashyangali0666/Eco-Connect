import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';
import {
  Recycle,
  LayoutDashboard,
  CalendarPlus,
  ClipboardList,
  History,
  Grid,
  HelpCircle,
  Users,
  Truck,
  BarChart3,
  Settings,
  User as UserIcon,
  LogOut,
  Sun,
  Moon,
  Bell,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Define Nav links per role
  const getUserLinks = () => [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Request Pickup', path: '/request-pickup', icon: CalendarPlus },
    { name: 'My Requests', path: '/requests', icon: ClipboardList },
    { name: 'Pickup History', path: '/history', icon: History },
    { name: 'Waste Categories', path: '/waste-categories', icon: Grid },
    { name: 'Smart Guide', path: '/smart-guide', icon: HelpCircle },
    { name: 'Profile & Settings', path: '/profile', icon: UserIcon },
  ];

  const getStaffLinks = () => [
    { name: 'Staff Dashboard', path: '/staff/dashboard', icon: LayoutDashboard },
    { name: 'Assigned Pickups', path: '/staff/requests', icon: Truck },
    { name: 'Collection History', path: '/staff/history', icon: History },
    { name: 'Waste Categories', path: '/waste-categories', icon: Grid },
    { name: 'Profile & Vehicle', path: '/profile', icon: UserIcon },
  ];

  const getAdminLinks = () => [
    { name: 'Admin Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Pickup Requests', path: '/admin/requests', icon: ClipboardList },
    { name: 'Collection Staff', path: '/admin/staff', icon: Truck },
    { name: 'Citizens / Users', path: '/admin/users', icon: Users },
    { name: 'Waste Categories', path: '/admin/categories', icon: Grid },
    { name: 'Analytics & KPIs', path: '/admin/analytics', icon: BarChart3 },
    { name: 'Pickup History', path: '/admin/history', icon: History },
    { name: 'System Settings', path: '/admin/settings', icon: Settings },
    { name: 'Profile', path: '/profile', icon: UserIcon },
  ];

  const links =
    user.role === 'ADMIN'
      ? getAdminLinks()
      : user.role === 'STAFF'
      ? getStaffLinks()
      : getUserLinks();

  const isActive = (path: string) => {
    if (path === '/dashboard' || path === '/admin/dashboard' || path === '/staff/dashboard') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-charcoal-950 text-charcoal-900 dark:text-slate-100 transition-colors">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-charcoal-950/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar (Desktop Fixed & Mobile Drawer) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-charcoal-900 border-r border-slate-200 dark:border-charcoal-800 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 dark:border-charcoal-800">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <Recycle className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-charcoal-900 dark:text-white">
                Eco<span className="text-brand-600 dark:text-brand-400">Collect</span>
              </span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Badge */}
        <div className="px-6 py-3 bg-slate-50/60 dark:bg-charcoal-950/40 border-b border-slate-100 dark:border-charcoal-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                user.role === 'ADMIN'
                  ? 'bg-purple-500'
                  : user.role === 'STAFF'
                  ? 'bg-blue-500'
                  : 'bg-emerald-500'
              }`}
            />
            <span className="text-xs font-semibold text-charcoal-600 dark:text-slate-300 uppercase tracking-wider">
              {user.role} PORTAL
            </span>
          </div>
          {user.role === 'STAFF' && user.staffProfile?.vehicleNumber && (
            <span className="text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded font-mono">
              {user.staffProfile.vehicleNumber}
            </span>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const active = isActive(link.path);
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20 font-semibold'
                    : 'text-charcoal-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-charcoal-800/60 hover:text-charcoal-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                  <span>{link.name}</span>
                </div>
                {active && <ChevronRight className="w-3.5 h-3.5 text-white/70" />}
              </Link>
            );
          })}
        </nav>

        {/* User Card & Logout Footer */}
        <div className="p-3 border-t border-slate-100 dark:border-charcoal-800">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-charcoal-800/50 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={
                  user.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=059669&color=fff`
                }
                alt={user.name}
                className="w-8 h-8 rounded-lg object-cover shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-charcoal-900 dark:text-slate-100 truncate">
                  {user.name}
                </p>
                <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-slate-200/60 dark:hover:bg-charcoal-700 transition-colors"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-charcoal-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-charcoal-800 px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-colors">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-charcoal-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-charcoal-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-base sm:text-lg font-bold text-charcoal-900 dark:text-slate-100">
              {links.find((l) => isActive(l.path))?.name || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Quick action button for citizen */}
            {user.role === 'USER' && (
              <Link
                to="/request-pickup"
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-sm transition-all hover:scale-[1.02]"
              >
                <CalendarPlus className="w-3.5 h-3.5" />
                <span>+ Request Pickup</span>
              </Link>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-charcoal-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-charcoal-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-charcoal-600" />
              )}
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="p-2 relative rounded-xl text-charcoal-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-charcoal-800 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-charcoal-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-charcoal-700 py-3 z-50">
                  <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100 dark:border-charcoal-800">
                    <span className="font-semibold text-xs text-charcoal-900 dark:text-slate-100">
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-[11px] text-brand-600 dark:text-brand-400 hover:underline"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-charcoal-800">
                    {notifications.length === 0 ? (
                      <p className="text-center py-6 text-xs text-slate-400">
                        No notifications yet.
                      </p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markAsRead(n.id)}
                          className={`p-3 hover:bg-slate-50 dark:hover:bg-charcoal-800/50 cursor-pointer ${
                            !n.isRead ? 'bg-emerald-50/30 dark:bg-brand-950/20' : ''
                          }`}
                        >
                          <p className="text-xs font-semibold text-charcoal-800 dark:text-slate-200">
                            {n.title}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                            {n.message}
                          </p>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            {new Date(n.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
