import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { User } from '../../types';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import {
  Truck,
  Plus,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  Edit2,
  Shield,
  UserCheck,
} from 'lucide-react';

export const AdminStaffPage: React.FC = () => {
  const [staffList, setStaffList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success, error } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    vehicleType: 'Electric Cargo Van',
    vehicleNumber: '',
    serviceArea: 'Central Metro District',
  });

  const fetchStaff = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/staff');
      if (res.data.success) {
        setStaffList(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load staff list:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleToggleStatus = async (staffId: string) => {
    try {
      const res = await api.patch(`/staff/${staffId}/status`);
      if (res.data.success) {
        success('Status Changed', res.data.message);
        fetchStaff();
      }
    } catch (err: any) {
      error('Failed', err.response?.data?.message || 'Error occurred');
    }
  };

  const handleAddStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await api.post('/staff', formData);
      if (res.data.success) {
        success('Staff Added', `Collection officer ${formData.name} registered.`);
        setShowAddModal(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          password: '',
          vehicleType: 'Electric Cargo Van',
          vehicleNumber: '',
          serviceArea: 'Central Metro District',
        });
        fetchStaff();
      }
    } catch (err: any) {
      error('Failed to create staff', err.response?.data?.message || 'Error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-charcoal-900 dark:text-white tracking-tight">
            Collection Staff Management
          </h1>
          <p className="text-xs text-charcoal-500 dark:text-slate-400">
            Monitor collection officers, manage fleet vehicles, and dispatch service routes
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Officer</span>
        </button>
      </div>

      {/* Staff Grid */}
      {isLoading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading collection staff...</div>
      ) : staffList.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800">
          <Truck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-charcoal-800 dark:text-slate-200">
            No collection staff registered
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staffList.map((staff) => (
            <div
              key={staff.id}
              className="p-6 rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        staff.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(staff.name)}&background=059669&color=fff`
                      }
                      alt={staff.name}
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                    <div>
                      <h3 className="font-bold text-base text-charcoal-900 dark:text-white">
                        {staff.name}
                      </h3>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                        Collection Officer
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      staff.isActive
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        : 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                    }`}
                  >
                    {staff.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-charcoal-600 dark:text-slate-400 border-t border-slate-100 dark:border-charcoal-800 pt-3">
                  <p className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{staff.email}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{staff.phone || 'No phone recorded'}</span>
                  </p>
                </div>

                {/* Vehicle & Area */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-charcoal-800/60 border border-slate-100 dark:border-charcoal-700 text-xs space-y-1">
                  <p className="font-semibold text-charcoal-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-blue-600" />
                    <span>{staff.staffProfile?.vehicleType || 'Fleet Vehicle'}</span>
                    {staff.staffProfile?.vehicleNumber && (
                      <span className="font-mono text-[11px] bg-white dark:bg-charcoal-700 px-1.5 py-0.5 rounded border border-slate-200 dark:border-charcoal-600">
                        {staff.staffProfile.vehicleNumber}
                      </span>
                    )}
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    Area: {staff.staffProfile?.serviceArea || 'General Municipal Zone'}
                  </p>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 text-center text-xs pt-1">
                  <div className="p-2 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
                    <span className="text-sm font-extrabold text-blue-600">
                      {staff.metrics?.activeAssigned ?? 0}
                    </span>
                    <p className="text-[10px] text-slate-400">On Route</p>
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
                    <span className="text-sm font-extrabold text-emerald-600">
                      {staff.metrics?.completedPickups ?? 0}
                    </span>
                    <p className="text-[10px] text-slate-400">Completed</p>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-2 border-t border-slate-100 dark:border-charcoal-800">
                <button
                  type="button"
                  onClick={() => handleToggleStatus(staff.id)}
                  className={`w-full py-2 rounded-xl text-xs font-semibold transition-colors ${
                    staff.isActive
                      ? 'border border-red-200 dark:border-red-900/60 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30'
                      : 'border border-emerald-200 dark:border-emerald-900/60 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                  }`}
                >
                  {staff.isActive ? 'Deactivate Account' : 'Activate Account'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Staff Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Register Collection Officer">
        <form onSubmit={handleAddStaffSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-charcoal-700 dark:text-slate-300">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Vikram Singh"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-slate-50 dark:bg-charcoal-800 text-xs text-charcoal-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-charcoal-700 dark:text-slate-300">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="staff.name@ecocollect.demo"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-slate-50 dark:bg-charcoal-800 text-xs text-charcoal-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-charcoal-700 dark:text-slate-300">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 555-010-0000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-slate-50 dark:bg-charcoal-800 text-xs text-charcoal-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-charcoal-700 dark:text-slate-300">
                Password *
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-slate-50 dark:bg-charcoal-800 text-xs text-charcoal-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-charcoal-700 dark:text-slate-300">
                Vehicle Type
              </label>
              <input
                type="text"
                value={formData.vehicleType}
                onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                placeholder="Eco Van 04"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-slate-50 dark:bg-charcoal-800 text-xs text-charcoal-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-charcoal-700 dark:text-slate-300">
                Vehicle Plate No.
              </label>
              <input
                type="text"
                value={formData.vehicleNumber}
                onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                placeholder="ECO-1234"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-slate-50 dark:bg-charcoal-800 text-xs text-charcoal-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-charcoal-700 dark:text-slate-300">
              Assigned Service District
            </label>
            <input
              type="text"
              value={formData.serviceArea}
              onChange={(e) => setFormData({ ...formData, serviceArea: e.target.value })}
              placeholder="e.g. Metro Core & North Hub"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-slate-50 dark:bg-charcoal-800 text-xs text-charcoal-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-charcoal-700 text-xs font-semibold text-charcoal-700 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Registering...' : 'Register Officer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
