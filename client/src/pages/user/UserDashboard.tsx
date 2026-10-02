import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { PickupRequest } from '../../types';
import { StatusBadge } from '../../components/common/Badge';
import {
  CalendarPlus,
  History,
  Grid,
  Clock,
  CheckCircle2,
  Calendar,
  XCircle,
  Truck,
  ArrowRight,
  MapPin,
  Package,
} from 'lucide-react';

export const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState({
    activeRequests: 0,
    scheduledPickups: 0,
    completedPickups: 0,
    cancelledRequests: 0,
  });
  const [recentRequests, setRecentRequests] = useState<PickupRequest[]>([]);
  const [nextUpcoming, setNextUpcoming] = useState<PickupRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard/user');
        if (res.data.success) {
          setMetrics(res.data.data.metrics);
          setRecentRequests(res.data.data.recentRequests);
          setNextUpcoming(res.data.data.nextUpcoming);
        }
      } catch (err) {
        console.error('Failed to load user dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-8">
      {/* Header with Greeting & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 dark:text-white tracking-tight">
            {getGreeting()}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-500 dark:text-slate-400 mt-0.5">
            Welcome to your EcoCollect hub. Manage your waste collections and track pickups.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/request-pickup"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-brand-600 to-teal-600 hover:from-brand-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <CalendarPlus className="w-4 h-4" />
            <span>+ Request Pickup</span>
          </Link>
          <Link
            to="/history"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white dark:bg-charcoal-800 border border-slate-200 dark:border-charcoal-700 hover:bg-slate-50 dark:hover:bg-charcoal-700 text-charcoal-800 dark:text-slate-200 font-semibold text-xs rounded-xl transition-colors"
          >
            <History className="w-4 h-4 text-emerald-600" />
            <span>View History</span>
          </Link>
          <Link
            to="/waste-categories"
            className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white dark:bg-charcoal-800 border border-slate-200 dark:border-charcoal-700 hover:bg-slate-50 dark:hover:bg-charcoal-700 text-charcoal-800 dark:text-slate-200 font-semibold text-xs rounded-xl transition-colors"
          >
            <Grid className="w-4 h-4 text-emerald-600" />
            <span>Guidelines</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Requests */}
        <div className="p-5 rounded-2xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 dark:text-white">
              {metrics.activeRequests}
            </span>
            <p className="text-xs font-semibold text-charcoal-500 dark:text-slate-400">
              Active Requests
            </p>
          </div>
        </div>

        {/* Scheduled Pickups */}
        <div className="p-5 rounded-2xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 dark:text-white">
              {metrics.scheduledPickups}
            </span>
            <p className="text-xs font-semibold text-charcoal-500 dark:text-slate-400">
              Scheduled
            </p>
          </div>
        </div>

        {/* Completed Pickups */}
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

        {/* Cancelled Requests */}
        <div className="p-5 rounded-2xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-charcoal-800 flex items-center justify-center text-slate-500 shrink-0">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 dark:text-white">
              {metrics.cancelledRequests}
            </span>
            <p className="text-xs font-semibold text-charcoal-500 dark:text-slate-400">
              Cancelled
            </p>
          </div>
        </div>
      </div>

      {/* Next Upcoming Pickup Spotlight */}
      {nextUpcoming && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-white dark:from-emerald-950/30 dark:via-charcoal-900 dark:to-charcoal-900 border border-emerald-200/80 dark:border-emerald-800/40 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider">
                  Next Scheduled Pickup
                </span>
                <span className="text-xs font-mono font-semibold text-charcoal-700 dark:text-slate-300">
                  {nextUpcoming.requestNumber}
                </span>
              </div>
              <h3 className="text-lg font-bold text-charcoal-900 dark:text-white">
                {nextUpcoming.wasteCategory.name} Collection ({nextUpcoming.quantity} {nextUpcoming.unit})
              </h3>
              <div className="flex flex-wrap items-center gap-4 text-xs text-charcoal-600 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  {new Date(nextUpcoming.pickupDate).toLocaleDateString([], {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  {nextUpcoming.timeSlot}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  {nextUpcoming.pickupAddress}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <StatusBadge status={nextUpcoming.status} />
              <Link
                to={`/requests/${nextUpcoming.id}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
              >
                <span>Track Live</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Recent Requests Section */}
      <div className="p-6 rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-charcoal-900 dark:text-white">
              Recent Pickup Requests
            </h3>
            <p className="text-xs text-slate-400">
              Track the live progression of your latest collections
            </p>
          </div>
          <Link
            to="/requests"
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading requests...</div>
        ) : recentRequests.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <Package className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-charcoal-700 dark:text-slate-300">
              No pickup requests yet.
            </p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Schedule your first waste collection request to start recycling with EcoCollect.
            </p>
            <Link
              to="/request-pickup"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 text-white text-xs font-bold rounded-xl"
            >
              + Create Pickup Request
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-charcoal-800/60 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3 rounded-l-xl">Request ID</th>
                  <th className="px-4 py-3">Waste Stream</th>
                  <th className="px-4 py-3">Quantity</th>
                  <th className="px-4 py-3">Pickup Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 rounded-r-xl text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-charcoal-800">
                {recentRequests.map((req) => (
                  <tr
                    key={req.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-charcoal-800/40 transition-colors"
                  >
                    <td className="px-4 py-3.5 font-mono font-semibold text-charcoal-900 dark:text-slate-100">
                      {req.requestNumber}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-charcoal-800 dark:text-slate-200">
                      {req.wasteCategory.name}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400">
                      {req.quantity} {req.unit}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400">
                      {new Date(req.pickupDate).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={req.status} size="sm" />
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Link
                        to={`/requests/${req.id}`}
                        className="inline-flex items-center gap-1 font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                      >
                        <span>Track</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
