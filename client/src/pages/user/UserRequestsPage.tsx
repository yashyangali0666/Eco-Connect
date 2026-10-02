import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { PickupRequest, RequestStatus } from '../../types';
import { StatusBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import {
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  XCircle,
  Package,
  Search,
  Filter,
  Plus,
} from 'lucide-react';

export const UserRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<PickupRequest[]>([]);
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [cancelModalReq, setCancelModalReq] = useState<PickupRequest | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('');
  const [isCancelling, setIsCancelling] = useState<boolean>(false);
  const { success, error } = useToast();

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/requests', {
        params: {
          limit: 50,
          search: search || undefined,
        },
      });
      if (res.data.success) {
        setRequests(res.data.data.requests);
      }
    } catch (err) {
      console.error('Failed to load user requests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [search]);

  // Tab filtering
  const filteredRequests = requests.filter((r) => {
    if (activeTab === 'PENDING') return r.status === 'PENDING';
    if (activeTab === 'SCHEDULED') return r.status === 'CONFIRMED' || r.status === 'ASSIGNED';
    if (activeTab === 'IN_PROGRESS') return r.status === 'OUT_FOR_PICKUP' || r.status === 'COLLECTED';
    if (activeTab === 'COMPLETED') return r.status === 'COMPLETED';
    if (activeTab === 'CANCELLED') return r.status === 'CANCELLED';
    return true;
  });

  const handleConfirmCancel = async () => {
    if (!cancelModalReq) return;
    setIsCancelling(true);

    try {
      const res = await api.patch(`/requests/${cancelModalReq.id}/cancel`, {
        reason: cancelReason,
      });

      if (res.data.success) {
        success('Request Cancelled', `Pickup request ${cancelModalReq.requestNumber} was cancelled.`);
        setCancelModalReq(null);
        setCancelReason('');
        fetchRequests();
      }
    } catch (err: any) {
      error('Cancellation Failed', err.response?.data?.message || 'Could not cancel request');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-charcoal-900 dark:text-white tracking-tight">
            My Pickup Requests
          </h1>
          <p className="text-xs text-charcoal-500 dark:text-slate-400">
            View live status updates, track ongoing collections, or reschedule
          </p>
        </div>

        <Link
          to="/request-pickup"
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Pickup</span>
        </Link>
      </div>

      {/* Tabs & Search Filter */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 overflow-x-auto">
          {[
            { id: 'ALL', label: 'All' },
            { id: 'PENDING', label: 'Pending' },
            { id: 'SCHEDULED', label: 'Scheduled' },
            { id: 'IN_PROGRESS', label: 'In Transit' },
            { id: 'COMPLETED', label: 'Completed' },
            { id: 'CANCELLED', label: 'Cancelled' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'text-charcoal-600 dark:text-slate-300 hover:text-charcoal-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search request ID, address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-xs text-charcoal-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Requests Content */}
      {isLoading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 mt-2">Loading pickup requests...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 space-y-3">
          <Package className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-charcoal-800 dark:text-slate-200">
            No requests found in this view
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {activeTab === 'ALL'
              ? 'You have not submitted any pickup requests yet.'
              : `You have no pickup requests currently marked as ${activeTab.toLowerCase()}.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRequests.map((req) => {
            const isCancellable = req.status === 'PENDING' || req.status === 'CONFIRMED';
            return (
              <div
                key={req.id}
                className="p-5 rounded-2xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-charcoal-700 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400">
                      {req.requestNumber}
                    </span>
                    <StatusBadge status={req.status} size="sm" />
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-charcoal-900 dark:text-white">
                      {req.wasteCategory.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Quantity: {req.quantity} {req.unit}
                    </p>
                  </div>

                  <div className="space-y-1.5 text-xs text-charcoal-600 dark:text-slate-400 border-t border-slate-100 dark:border-charcoal-800 pt-3">
                    <div className="flex items-center gap-2 truncate">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>
                        {new Date(req.pickupDate).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 truncate">
                      <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{req.timeSlot}</span>
                    </div>

                    <div className="flex items-center gap-2 truncate">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{req.pickupAddress}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-charcoal-800 flex items-center justify-between gap-2">
                  <Link
                    to={`/requests/${req.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 font-semibold text-xs rounded-xl hover:bg-brand-100 dark:hover:bg-brand-900/60 transition-colors"
                  >
                    <span>Track Live</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  {isCancellable && (
                    <button
                      type="button"
                      onClick={() => setCancelModalReq(req)}
                      className="text-xs text-slate-400 hover:text-red-600 dark:hover:text-red-400 font-medium transition-colors"
                    >
                      Cancel Request
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={!!cancelModalReq}
        onClose={() => setCancelModalReq(null)}
        title="Confirm Cancellation"
      >
        <div className="space-y-4">
          <p className="text-xs text-charcoal-600 dark:text-slate-300 leading-relaxed">
            Are you sure you want to cancel pickup request{' '}
            <span className="font-mono font-bold text-charcoal-900 dark:text-white">
              {cancelModalReq?.requestNumber}
            </span>
            ? This action cannot be undone.
          </p>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-charcoal-700 dark:text-slate-300">
              Reason for Cancellation (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Disposed elsewhere, need to reschedule..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-slate-50 dark:bg-charcoal-800 text-xs text-charcoal-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setCancelModalReq(null)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-charcoal-700 text-xs font-semibold text-charcoal-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-charcoal-800"
            >
              Keep Request
            </button>
            <button
              type="button"
              disabled={isCancelling}
              onClick={handleConfirmCancel}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all disabled:opacity-50"
            >
              {isCancelling ? 'Cancelling...' : 'Yes, Cancel Request'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
