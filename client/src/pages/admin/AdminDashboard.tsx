import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import api from '../../services/api';
import { PickupRequest } from '../../types';
import { StatusBadge } from '../../components/common/Badge';
import {
  ClipboardList,
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  Truck,
  ArrowRight,
  Plus,
  BarChart3,
  TrendingUp,
  Layers,
  MapPin,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    todaysPickups: 0,
    completedRequests: 0,
    cancelledRequests: 0,
    activeStaffCount: 0,
  });
  const [recentRequests, setRecentRequests] = useState<PickupRequest[]>([]);
  const [todaySchedule, setTodaySchedule] = useState<PickupRequest[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [dashRes, analRes] = await Promise.all([
          api.get('/dashboard/admin'),
          api.get('/admin/analytics'),
        ]);

        if (dashRes.data.success) {
          setMetrics(dashRes.data.data.metrics);
          setRecentRequests(dashRes.data.data.recentRequests);
          setTodaySchedule(dashRes.data.data.todaySchedule);
        }

        if (analRes.data.success) {
          setAnalytics(analRes.data.data);
        }
      } catch (err) {
        console.error('Failed to load admin dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const STATUS_COLORS: Record<string, string> = {
    PENDING: '#f59e0b',
    CONFIRMED: '#3b82f6',
    ASSIGNED: '#6366f1',
    OUT_FOR_PICKUP: '#06b6d4',
    COLLECTED: '#14b8a6',
    COMPLETED: '#10b981',
    CANCELLED: '#64748b',
    REJECTED: '#ef4444',
  };

  return (
    <div className="space-y-8">
      {/* Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 dark:text-white tracking-tight">
            Municipal Operations Center
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-500 dark:text-slate-400 mt-0.5">
            Real-time platform metrics, collection routes, and stream segregation performance
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/categories"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-charcoal-800 border border-slate-200 dark:border-charcoal-700 hover:bg-slate-50 dark:hover:bg-charcoal-700 text-xs font-semibold text-charcoal-800 dark:text-slate-200 rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4 text-emerald-600" />
            <span>+ Waste Stream</span>
          </Link>
          <Link
            to="/admin/analytics"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Full Analytics</span>
          </Link>
        </div>
      </div>

      {/* KPI Counters Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Requests */}
        <div className="p-4 rounded-2xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Tickets</span>
            <ClipboardList className="w-4 h-4 text-brand-600" />
          </div>
          <p className="text-2xl font-black text-charcoal-900 dark:text-white tracking-tight">
            {metrics.totalRequests}
          </p>
        </div>

        {/* Pending Review */}
        <div className="p-4 rounded-2xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Pending
            </span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-charcoal-900 dark:text-white tracking-tight">
            {metrics.pendingRequests}
          </p>
        </div>

        {/* Today's Pickups */}
        <div className="p-4 rounded-2xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Today&apos;s Route
            </span>
            <Calendar className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-charcoal-900 dark:text-white tracking-tight">
            {metrics.todaysPickups}
          </p>
        </div>

        {/* Completed */}
        <div className="p-4 rounded-2xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Completed
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-charcoal-900 dark:text-white tracking-tight">
            {metrics.completedRequests}
          </p>
        </div>

        {/* Active Staff */}
        <div className="p-4 rounded-2xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Fleet Staff</span>
            <Truck className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-black text-charcoal-900 dark:text-white tracking-tight">
            {metrics.activeStaffCount}
          </p>
        </div>

        {/* Cancelled */}
        <div className="p-4 rounded-2xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Cancelled</span>
            <XCircle className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-black text-charcoal-900 dark:text-white tracking-tight">
            {metrics.cancelledRequests}
          </p>
        </div>
      </div>

      {/* Visual Charts Row */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Status Breakdown (Donut Chart) */}
          <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold text-charcoal-900 dark:text-white">
                Requests by Lifecycle Status
              </h3>
              <p className="text-xs text-slate-400">Live distribution of collection stages</p>
            </div>

            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.requestsByStatus}
                    dataKey="count"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {analytics.requestsByStatus.map((entry: any) => (
                      <Cell
                        key={`cell-${entry.status}`}
                        fill={STATUS_COLORS[entry.status] || '#10b981'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '0.75rem',
                      border: 'none',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-wrap gap-2 justify-center text-[10px] text-slate-500 pt-1">
              {analytics.requestsByStatus.slice(0, 5).map((s: any) => (
                <div key={s.status} className="flex items-center gap-1">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: STATUS_COLORS[s.status] || '#10b981' }}
                  />
                  <span>
                    {s.label} ({s.count})
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Waste Categories Breakdown (Bar Chart) */}
          <div className="lg:col-span-7 p-6 rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold text-charcoal-900 dark:text-white">
                Collection Volume by Waste Stream
              </h3>
              <p className="text-xs text-slate-400">Total requests per segregated category</p>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.requestsByCategory}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis
                    dataKey="categoryName"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '0.75rem',
                      border: 'none',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                  />
                  <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Two Column Section: Recent Requests & Today's Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Requests Table */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-charcoal-900 dark:text-white">
                Recent Pickup Requests
              </h3>
              <p className="text-xs text-slate-400">Latest tickets received across all districts</p>
            </div>
            <Link
              to="/admin/requests"
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
            >
              <span>Manage All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-charcoal-800/60 text-slate-400 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="px-4 py-3 rounded-l-xl">Ticket ID</th>
                  <th className="px-4 py-3">Citizen</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Assigned Staff</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 rounded-r-xl text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-charcoal-800">
                {recentRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-charcoal-800/40">
                    <td className="px-4 py-3.5 font-mono font-bold text-charcoal-900 dark:text-slate-100">
                      {req.requestNumber}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-charcoal-800 dark:text-slate-200">
                      {req.user.name}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">
                      {req.wasteCategory.name}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">
                      {req.assignedStaff?.name || (
                        <span className="text-amber-500 font-medium">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={req.status} size="sm" />
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Link
                        to={`/admin/requests/${req.id}`}
                        className="inline-flex items-center gap-1 font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                      >
                        <span>Manage</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Today's Schedule Card */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-charcoal-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>Today&apos;s Pickups</span>
            </h3>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
              {todaySchedule.length} active
            </span>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {todaySchedule.length === 0 ? (
              <p className="text-center py-8 text-xs text-slate-400">
                No collections scheduled for today.
              </p>
            ) : (
              todaySchedule.map((req) => (
                <div
                  key={req.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-charcoal-800/60 border border-slate-100 dark:border-charcoal-700 space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-brand-600 dark:text-brand-400">
                      {req.requestNumber}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">{req.timeSlot}</span>
                  </div>
                  <p className="font-semibold text-charcoal-800 dark:text-slate-200">
                    {req.wasteCategory.name} • {req.user.name}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span>{req.pickupAddress}</span>
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
