import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Recycle, Lock, Mail, ArrowRight, UserCheck, Shield, Truck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = new URLSearchParams(location.search).get('redirect') || null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      error('Missing credentials', 'Please enter both email and password');
      return;
    }

    setIsLoading(true);
    try {
      const loggedUser = await login(email, password);
      success('Welcome back!', `Signed in as ${loggedUser.name}`);

      if (redirectPath) {
        navigate(redirectPath);
      } else if (loggedUser.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (loggedUser.role === 'STAFF') {
        navigate('/staff/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      const message =
        err.response?.data?.errors?.[0]?.message ||
        err.response?.data?.message ||
        'Invalid credentials provided';
      error('Login Failed', message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-teal-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-brand-500/25">
            <Recycle className="w-7 h-7 stroke-[2.2]" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 dark:text-white tracking-tight">
            Sign in to EcoCollect
          </h2>
          <p className="text-xs text-charcoal-500 dark:text-slate-400">
            Access your waste collection dashboard, tracking, and schedule
          </p>
        </div>

        {/* Demo Quick Fill Cards */}
        <div className="p-4 rounded-2xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-sm space-y-2.5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center">
            ⚡ Quick-Fill Demo Accounts
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('user@ecocollect.demo', 'User@123')}
              className="p-2 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-slate-50 dark:bg-charcoal-800/80 hover:border-emerald-500 dark:hover:border-emerald-500 text-center transition-all group"
            >
              <UserCheck className="w-4 h-4 mx-auto text-emerald-600 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-bold text-charcoal-800 dark:text-slate-200 block mt-1">
                Citizen
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('staff@ecocollect.demo', 'Staff@123')}
              className="p-2 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-slate-50 dark:bg-charcoal-800/80 hover:border-blue-500 dark:hover:border-blue-500 text-center transition-all group"
            >
              <Truck className="w-4 h-4 mx-auto text-blue-600 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-bold text-charcoal-800 dark:text-slate-200 block mt-1">
                Staff
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('admin@ecocollect.demo', 'Admin@123')}
              className="p-2 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-slate-50 dark:bg-charcoal-800/80 hover:border-purple-500 dark:hover:border-purple-500 text-center transition-all group"
            >
              <Shield className="w-4 h-4 mx-auto text-purple-600 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-bold text-charcoal-800 dark:text-slate-200 block mt-1">
                Admin
              </span>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="p-8 rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-md space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-charcoal-700 dark:text-slate-300">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@ecocollect.demo"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-slate-50 dark:bg-charcoal-800 text-sm text-charcoal-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-charcoal-700 dark:text-slate-300">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-[11px] text-brand-600 dark:text-brand-400 hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-slate-50 dark:bg-charcoal-800 text-sm text-charcoal-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-teal-600 hover:from-brand-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-brand-600/25 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-charcoal-500 dark:text-slate-400">
          Don&apos;t have an account yet?{' '}
          <Link to="/register" className="font-semibold text-brand-600 dark:text-brand-400 hover:underline">
            Register for free
          </Link>
        </p>
      </div>
    </div>
  );
};
