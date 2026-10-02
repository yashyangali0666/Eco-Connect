import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  Recycle,
  Sun,
  Moon,
  Bell,
  Menu,
  X,
  User as UserIcon,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  CalendarPlus,
  HelpCircle,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'ADMIN') return '/admin/dashboard';
    if (user.role === 'STAFF') return '/staff/dashboard';
    return '/dashboard';
  };

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 w-full bg-white/90 dark:bg-charcoal-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-charcoal-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <Recycle className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-charcoal-900 dark:text-white flex items-center">
                Eco<span className="text-brand-600 dark:text-brand-400">Collect</span>
              </span>
              <span className="hidden sm:block text-[10px] text-charcoal-500 dark:text-slate-400 -mt-1 tracking-wider uppercase font-semibold">
                Smart Waste Platform
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link
              to="/"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isActive('/')
                  ? 'text-brand-600 dark:text-brand-400 bg-brand-50/50 dark:bg-brand-950/30'
                  : 'text-charcoal-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400'
              }`}
            >
              Home
            </Link>
            <Link
              to="/waste-categories"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isActive('/waste-categories')
                  ? 'text-brand-600 dark:text-brand-400 bg-brand-50/50 dark:bg-brand-950/30'
                  : 'text-charcoal-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400'
              }`}
            >
              Waste Categories
            </Link>
            <Link
              to="/smart-guide"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isActive('/smart-guide')
                  ? 'text-brand-600 dark:text-brand-400 bg-brand-50/50 dark:bg-brand-950/30'
                  : 'text-charcoal-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-emerald-500" />
              <span>Smart Guide</span>
            </Link>
          </div>

          {/* Right Side: Theme, Notifications, Auth */}
          <div className="flex items-center gap-2.5">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-charcoal-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-charcoal-800 transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-charcoal-600" />
              )}
            </button>

            {/* Notification Bell (If Authenticated) */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => {
                    setNotifDropdownOpen(!notifDropdownOpen);
                    setUserDropdownOpen(false);
                  }}
                  className="p-2 relative rounded-xl text-charcoal-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-charcoal-800 transition-colors"
                  aria-label="View notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {notifDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-charcoal-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-charcoal-700 py-3 z-50">
                    <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100 dark:border-charcoal-800">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-charcoal-900 dark:text-slate-100">
                          Notifications
                        </span>
                        {unreadCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 text-xs font-semibold">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-medium"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-charcoal-800/60">
                      {notifications.length === 0 ? (
                        <p className="text-center py-6 text-xs text-slate-400">
                          No notifications yet.
                        </p>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => markAsRead(n.id)}
                            className={`p-3.5 hover:bg-slate-50 dark:hover:bg-charcoal-800/50 cursor-pointer transition-colors ${
                              !n.isRead ? 'bg-emerald-50/30 dark:bg-brand-950/20' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-xs font-semibold text-charcoal-800 dark:text-slate-200">
                                {n.title}
                              </p>
                              {!n.isRead && (
                                <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0 mt-1" />
                              )}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                              {n.message}
                            </p>
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              {new Date(n.createdAt).toLocaleDateString([], {
                                month: 'short',
                                day: 'numeric',
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
            )}

            {/* Authenticated User Menu or Guest Action Buttons */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => {
                    setUserDropdownOpen(!userDropdownOpen);
                    setNotifDropdownOpen(false);
                  }}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-charcoal-800 transition-colors"
                >
                  <img
                    src={
                      user.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=059669&color=fff`
                    }
                    alt={user.name}
                    className="w-8 h-8 rounded-lg object-cover border border-slate-200 dark:border-charcoal-700"
                  />
                  <div className="hidden lg:block text-left">
                    <p className="text-xs font-semibold text-charcoal-900 dark:text-slate-100 leading-tight">
                      {user.name}
                    </p>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                      {user.role}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* User Dropdown */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-charcoal-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-charcoal-700 py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-charcoal-800">
                      <p className="text-xs font-semibold text-charcoal-900 dark:text-slate-100 truncate">
                        {user.name}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    </div>

                    <Link
                      to={getDashboardPath()}
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-charcoal-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-charcoal-800 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                      Dashboard
                    </Link>

                    {user.role === 'USER' && (
                      <Link
                        to="/request-pickup"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-charcoal-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-charcoal-800 transition-colors"
                      >
                        <CalendarPlus className="w-4 h-4 text-emerald-600" />
                        Request Pickup
                      </Link>
                    )}

                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-charcoal-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-charcoal-800 transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-emerald-600" />
                      Profile & Settings
                    </Link>

                    <div className="border-t border-slate-100 dark:border-charcoal-800 my-1" />

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-semibold text-charcoal-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 rounded-xl hover:bg-slate-100 dark:hover:bg-charcoal-800 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/request-pickup"
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-brand-600 to-teal-600 hover:from-brand-500 hover:to-teal-500 rounded-xl shadow-md shadow-brand-600/20 hover:shadow-lg hover:shadow-brand-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <CalendarPlus className="w-4 h-4" />
                  <span>Request Pickup</span>
                </Link>
              </div>
            )}

            {/* Mobile Menu Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-charcoal-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-charcoal-800"
              aria-label="Open Mobile Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-6 space-y-2 border-t border-slate-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 shadow-xl">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-charcoal-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-charcoal-800"
          >
            Home
          </Link>
          <Link
            to="/waste-categories"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-charcoal-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-charcoal-800"
          >
            Waste Categories
          </Link>
          <Link
            to="/smart-guide"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-charcoal-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-charcoal-800"
          >
            Smart Waste Guide
          </Link>

          {!isAuthenticated && (
            <div className="pt-4 flex flex-col gap-2 border-t border-slate-100 dark:border-charcoal-800">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl border border-slate-200 dark:border-charcoal-700 text-sm font-semibold text-charcoal-800 dark:text-slate-200"
              >
                Log In
              </Link>
              <Link
                to="/request-pickup"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold shadow-md shadow-brand-600/20"
              >
                Request a Pickup
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
