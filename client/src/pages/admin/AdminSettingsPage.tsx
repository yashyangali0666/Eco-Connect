import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { Settings, Server, Database, Shield, Save } from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const { success } = useToast();
  const [platformName, setPlatformName] = useState('EcoCollect');
  const [tagline, setTagline] = useState('Smart Waste. Cleaner Communities.');
  const [storageProvider, setStorageProvider] = useState('local');
  const [defaultRadius, setDefaultRadius] = useState('15');
  const [autoAssignment, setAutoAssignment] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    success('Settings Saved', 'System configurations updated.');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-charcoal-900 dark:text-white tracking-tight">
          System & Operations Settings
        </h1>
        <p className="text-xs text-charcoal-500 dark:text-slate-400">
          Configure platform parameters, storage providers, and collection policies
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Branding & Platform info */}
        <div className="p-6 rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-charcoal-900 dark:text-white border-b border-slate-100 dark:border-charcoal-800 pb-3 flex items-center gap-2">
            <Settings className="w-4 h-4 text-emerald-600" />
            <span>Platform Branding</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-charcoal-700 dark:text-slate-300">
                Application Name
              </label>
              <input
                type="text"
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-slate-50 dark:bg-charcoal-800 text-xs text-charcoal-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-charcoal-700 dark:text-slate-300">
                Tagline
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-slate-50 dark:bg-charcoal-800 text-xs text-charcoal-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Storage Configuration */}
        <div className="p-6 rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-charcoal-900 dark:text-white border-b border-slate-100 dark:border-charcoal-800 pb-3 flex items-center gap-2">
            <Server className="w-4 h-4 text-emerald-600" />
            <span>Storage & Cloud Infrastructure</span>
          </h3>

          <div className="space-y-2 text-xs">
            <label className="font-semibold text-charcoal-700 dark:text-slate-300">
              Active File Storage Adapter
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'local', title: 'Local Disk (MVP Default)', desc: 'Serves from /uploads' },
                { id: 'gcs', title: 'Google Cloud Storage', desc: 'Enterprise Cloud Run' },
                { id: 'cloudinary', title: 'Cloudinary CDN', desc: 'Managed Media CDN' },
              ].map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => setStorageProvider(opt.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    storageProvider === opt.id
                      ? 'border-brand-500 ring-2 ring-brand-500/20 bg-brand-50/50 dark:bg-brand-950/30'
                      : 'border-slate-200 dark:border-charcoal-700 bg-slate-50/50 dark:bg-charcoal-800/40'
                  }`}
                >
                  <p className="font-bold text-charcoal-900 dark:text-slate-100">{opt.title}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{opt.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Collection Policies */}
        <div className="p-6 rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-charcoal-900 dark:text-white border-b border-slate-100 dark:border-charcoal-800 pb-3 flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-600" />
            <span>Operational Dispatch Policies</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-charcoal-800 dark:text-slate-200">
                  Automated Route Assignment
                </p>
                <p className="text-slate-400 text-[11px]">
                  Automatically assign nearby available staff based on district service area
                </p>
              </div>
              <input
                type="checkbox"
                checked={autoAssignment}
                onChange={(e) => setAutoAssignment(e.target.checked)}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
              />
            </div>

            <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-charcoal-800">
              <label className="font-semibold text-charcoal-700 dark:text-slate-300">
                Default Service Perimeter Radius (km)
              </label>
              <input
                type="number"
                value={defaultRadius}
                onChange={(e) => setDefaultRadius(e.target.value)}
                className="w-full sm:w-48 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-slate-50 dark:bg-charcoal-800 text-xs text-charcoal-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
        </div>

        <div className="text-right">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save System Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
