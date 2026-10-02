import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { PickupRequest, RequestStatus } from '../../types';
import { StatusBadge } from '../../components/common/Badge';
import { useToast } from '../../context/ToastContext';
import {
  Truck,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  ArrowRight,
  Phone,
  Package,
  Navigation,
} from 'lucide-react';

export const StaffDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState({
    todaysPickups: 0,
    upcomingPickups: 0,
    completedPickups: 0,
    activeAssigned: 0,
  });
  const [todayPickups, setTodayPickups] = useState<PickupRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { success, error } = useToast();

  const fetchStaffDashboard = async () => {
    try {
      const res = await api.get('/dashboard/staff');
      if (res.data.success) {
        setMetrics(res.data.data.metrics);
        setTodayPickups(res.data.data.todayPickups);
      }
    } catch (err) {
      console.error('Failed to load staff dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffDashboard();
  }, []);

  const handleQuickStatus = async (
    requestId: string,
    targetStatus: RequestStatus,
    noteMsg: string
  ) => {
    setUpdatingId(requestId);
    try {
      const res = await api.patch(`/requests/${requestId}/status`, {
        status: targetStatus,
        note: noteMsg,
      });

      if (res.data.success) {
        success('Status Updated', `Pickup is now ${targetStatus.replace(/_/g, ' ')}`);
        fetchStaffDashboard();
      }
    } catch (err: any) {
      error('Update Failed', err.response?.data?.message || 'Could not update status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 dark:text-white tracking-tight">
          Collection Staff Dispatch
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-500 dark:text-slate-400 mt-0.5">
          View assigned pickup locations, execute collection routes, and verify segregated materials
        </p>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Pickups */}
        <div className="p-5 rounded-2xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 dark:text-white">
              {metrics.todaysPickups}
            </span>
            <p className="text-xs font-semibold text-charcoal-500 dark:text-slate-400">
              Today&apos;s Route
            </p>
          </div>
        </div>

        {/* Active on Route */}
        <div className="p-5 rounded-2xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <Navigation className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 dark:text-white">
              {metrics.activeAssigned}
            </span>
            <p className="text-xs font-semibold text-charcoal-500 dark:text-slate-400">
              In Progress
            </p>
          </div>
        </div>

        {/* Upcoming Collections */}
        <div className="p-5 rounded-2xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 dark:text-white">
              {metrics.upcomingPickups}
            </span>
            <p className="text-xs font-semibold text-charcoal-500 dark:text-slate-400">
              Upcoming
            </p>
          </div>
        </div>

        {/* Completed */}
        <div className="p-5 rounded-2xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 dark:text-white">
              {metrics.completedPickups}
            </span>
            <p className="text-xs font-semibold text-charcoal-500 dark:text-slate-400">
              Completed
            </p>
          </div>
        </div>
      </div>

      {/* Active Route Collection Cards */}
      <div className="p-6 rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-charcoal-900 dark:text-white">
              Today&apos;s Active Collections
            </h3>
            <p className="text-xs text-slate-400">
              Click action buttons to progress collection tickets along the route
            </p>
          </div>
          <Link
            to="/staff/requests"
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
          >
            <span>View All Assigned</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading pickups...</div>
        ) : todayPickups.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <Package className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-charcoal-800 dark:text-slate-200">
              No active pickups pending for today
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              All assigned collections for today have been completed or there are no pending assignments.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {todayPickups.map((req) => (
              <div
                key={req.id}
                className="p-5 rounded-2xl border border-slate-200 dark:border-charcoal-700 bg-slate-50/50 dark:bg-charcoal-800/40 flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-charcoal-600 transition-all shadow-xs"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400">
                      {req.requestNumber}
                    </span>
                    <StatusBadge status={req.status} size="sm" />
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-charcoal-900 dark:text-white">
                      {req.wasteCategory.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Volume: {req.quantity} {req.unit}
                    </p>
                  </div>

                  <div className="space-y-1 text-xs text-charcoal-600 dark:text-slate-400 border-t border-slate-200 dark:border-charcoal-700 pt-3">
                    <div className="flex items-center gap-1.5 truncate">
                      <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{req.timeSlot}</span>
                    </div>

                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="truncate">{req.pickupAddress}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] font-semibold text-charcoal-700 dark:text-slate-300">
                        Citizen: {req.user.name}
                      </span>
                      {req.user.phone && (
                        <a
                          href={`tel:${req.user.phone}`}
                          className="text-[11px] text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" />
                          <span>Call</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Workflow Buttons */}
                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-charcoal-700">
                  {req.status === 'ASSIGNED' && (
                    <button
                      type="button"
                      disabled={updatingId === req.id}
                      onClick={() =>
                        handleQuickStatus(
                          req.id,
                          'OUT_FOR_PICKUP',
                          'Collector started route towards citizen address'
                        )
                      }
                      className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Start Route (Out for Pickup)</span>
                    </button>
                  )}

                  {req.status === 'OUT_FOR_PICKUP' && (
                    <button
                      type="button"
                      disabled={updatingId === req.id}
                      onClick={() =>
                        handleQuickStatus(
                          req.id,
                          'COLLECTED',
                          'Waste inspected, weighed, and securely loaded onto truck'
                        )
                      }
                      className="w-full py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark as Collected</span>
                    </button>
                  )}

                  {req.status === 'COLLECTED' && (
                    <button
                      type="button"
                      disabled={updatingId === req.id}
                      onClick={() =>
                        handleQuickStatus(
                          req.id,
                          'COMPLETED',
                          'Waste successfully delivered to sorting facility'
                        )
                      }
                      className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark as Completed</span>
                    </button>
                  )}

                  <Link
                    to={`/staff/requests/${req.id}`}
                    className="w-full py-1.5 rounded-xl border border-slate-200 dark:border-charcoal-700 hover:bg-white dark:hover:bg-charcoal-700 text-center text-xs font-semibold text-charcoal-700 dark:text-slate-300 block transition-colors"
                  >
                    View Map & Full Ticket
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
