import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import { User, Lock, Phone, Mail, Shield, Truck, Check } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { success, error } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);

    try {
      const res = await api.put('/auth/me', {
        name,
        phone: phone || null,
        avatar: avatar || null,
      });

      if (res.data.success) {
        updateUser(res.data.data);
        success('Profile Updated', 'Your personal details were saved successfully.');
      }
    } catch (err: any) {
      error('Update Failed', err.response?.data?.message || 'Could not update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      error('Password mismatch', 'New password and confirmation do not match.');
      return;
    }
    if (newPassword.length < 8) {
      error('Password too short', 'Password must be at least 8 characters long.');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });

      if (res.data.success) {
        success('Password Changed', 'Your password has been updated securely.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      error('Password Change Failed', err.response?.data?.message || 'Error updating password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-charcoal-900 dark:text-white tracking-tight">
          Profile & Security Settings
        </h1>
        <p className="text-xs text-charcoal-500 dark:text-slate-400">
          Manage your account credentials, contact information, and role preferences
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Column: Profile Card & Role info */}
        <div className="md:col-span-4 space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-sm text-center space-y-4">
            <img
              src={
                user.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=059669&color=fff`
              }
              alt={user.name}
              className="w-24 h-24 rounded-2xl object-cover mx-auto border-2 border-brand-500 shadow-md"
            />
            <div>
              <h3 className="font-extrabold text-lg text-charcoal-900 dark:text-white">
                {user.name}
              </h3>
              <p className="text-xs text-slate-400">{user.email}</p>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-charcoal-800 flex items-center justify-center gap-2">
              <span className="px-3 py-1 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-bold text-xs uppercase tracking-wider">
                {user.role}
              </span>
            </div>
          </div>

          {/* Staff specific vehicle info */}
          {user.role === 'STAFF' && user.staffProfile && (
            <div className="p-5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 space-y-3">
              <div className="flex items-center gap-2 text-blue-900 dark:text-blue-300 font-bold text-xs uppercase tracking-wider">
                <Truck className="w-4 h-4 text-blue-600" />
                <span>Assigned Fleet Vehicle</span>
              </div>
              <div className="text-xs space-y-1 text-charcoal-700 dark:text-slate-300">
                <p>
                  <span className="font-semibold">Type:</span> {user.staffProfile.vehicleType}
                </p>
                <p>
                  <span className="font-semibold">Vehicle No:</span>{' '}
                  <span className="font-mono">{user.staffProfile.vehicleNumber}</span>
                </p>
                <p>
                  <span className="font-semibold">Assigned Route:</span>{' '}
                  {user.staffProfile.serviceArea}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Update Forms */}
        <div className="md:col-span-8 space-y-6">
          {/* General Profile Form */}
          <form
            onSubmit={handleUpdateProfile}
            className="p-6 rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-sm space-y-4"
          >
            <h3 className="text-sm font-bold text-charcoal-900 dark:text-white border-b border-slate-100 dark:border-charcoal-800 pb-3">
              Personal Information
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-charcoal-700 dark:text-slate-300">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-slate-50 dark:bg-charcoal-800 text-xs text-charcoal-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-charcoal-700 dark:text-slate-300">
                Email Address (Read-only)
              </label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-slate-100 dark:bg-charcoal-800/40 text-xs text-slate-500 cursor-not-allowed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-charcoal-700 dark:text-slate-300">
                Contact Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555-019-2834"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-slate-50 dark:bg-charcoal-800 text-xs text-charcoal-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-charcoal-700 dark:text-slate-300">
                Avatar Image URL (Optional)
              </label>
              <input
                type="url"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-slate-50 dark:bg-charcoal-800 text-xs text-charcoal-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="pt-2 text-right">
              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-50"
              >
                {isUpdatingProfile ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>

          {/* Change Password Form */}
          <form
            onSubmit={handleChangePassword}
            className="p-6 rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-sm space-y-4"
          >
            <h3 className="text-sm font-bold text-charcoal-900 dark:text-white border-b border-slate-100 dark:border-charcoal-800 pb-3 flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>Change Security Password</span>
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-charcoal-700 dark:text-slate-300">
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-slate-50 dark:bg-charcoal-800 text-xs text-charcoal-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-charcoal-700 dark:text-slate-300">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-slate-50 dark:bg-charcoal-800 text-xs text-charcoal-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-charcoal-700 dark:text-slate-300">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-slate-50 dark:bg-charcoal-800 text-xs text-charcoal-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                type="submit"
                disabled={isUpdatingPassword}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 dark:bg-charcoal-800 dark:hover:bg-charcoal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-50"
              >
                {isUpdatingPassword ? 'Updating Password...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
