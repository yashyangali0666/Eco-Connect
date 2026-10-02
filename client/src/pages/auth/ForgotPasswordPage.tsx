import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Recycle, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { success } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    success('Reset Link Sent', 'Password reset instructions have been sent to your email.');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-teal-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-brand-500/25">
            <Recycle className="w-7 h-7 stroke-[2.2]" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 dark:text-white tracking-tight">
            Reset Your Password
          </h2>
          <p className="text-xs text-charcoal-500 dark:text-slate-400">
            Enter your registered email to receive password recovery instructions
          </p>
        </div>

        {submitted ? (
          <div className="p-8 rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-md text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="text-base font-bold text-charcoal-900 dark:text-white">
              Instructions Dispatched
            </h3>
            <p className="text-xs text-charcoal-600 dark:text-slate-400 leading-relaxed">
              If an account with <span className="font-semibold text-brand-600 dark:text-brand-400">{email}</span> exists, you will receive a secure reset link shortly.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline pt-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Login</span>
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="p-8 rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-md space-y-5"
          >
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

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-teal-600 hover:from-brand-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-brand-600/25 transition-all"
            >
              Send Reset Link
            </button>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Login</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
