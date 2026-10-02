import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import api from '../../services/api';
import {
  BarChart3,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Package,
  Layers,
  Calendar,
} from 'lucide-react';

export const AdminAnalyticsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/admin/analytics');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
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

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400 mt-2">Computing database aggregations...</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 dark:text-white tracking-tight">
          Recycling & Logistics Analytics
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-500 dark:text-slate-400 mt-0.5">
          Real-time metrics, collection volume trends, diversion rates, and municipal stream insights
        </p>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Total Tickets Logged
          </span>
          <p className="text-3xl font-black text-charcoal-900 dark:text-white">
            {data.summary.totalRequests}
          </p>
          <span className="text-[10px] text-emerald-600 font-semibold">100% auditable records</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
            Completion Rate
          </span>
          <p className="text-3xl font-black text-emerald-600">
            {data.summary.completionRate}%
          </p>
          <span className="text-[10px] text-slate-400">
            {data.summary.completedRequests} fulfilled pickups
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Cancellation Rate
          </span>
          <p className="text-3xl font-black text-charcoal-700 dark:text-slate-300">
            {data.summary.cancellationRate}%
          </p>
          <span className="text-[10px] text-slate-400">
            {data.summary.cancelledRequests} cancelled tickets
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600">
            Active Waste Streams
          </span>
          <p className="text-3xl font-black text-brand-600">
            {data.requestsByCategory.length}
          </p>
          <span className="text-[10px] text-slate-400">Segregated recovery streams</span>
        </div>
      </div>

      {/* 14-Day Pickup Volume Trend (Area Chart) */}
      <div className="p-6 rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-charcoal-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>Daily Pickup Volume Trend (Last 14 Days)</span>
          </h3>
          <p className="text-xs text-slate-400">
            Daily intake volume vs. serviced and completed collections
          </p>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.dailyVolume}>
              <defs>
                <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} />
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
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Area
                type="monotone"
                dataKey="requests"
                name="New Requests"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorRequests)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="completed"
                name="Completed Pickups"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorCompleted)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Column Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Stream Breakdown */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-charcoal-900 dark:text-white">
              Collections by Waste Stream
            </h3>
            <p className="text-xs text-slate-400">Breakdown of municipal collection requests</p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.requestsByCategory}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis
                  dataKey="categoryName"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  angle={-15}
                  textAnchor="end"
                  height={45}
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
                <Bar dataKey="count" name="Tickets" fill="#059669" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-charcoal-900 dark:text-white">
              Status Distribution
            </h3>
            <p className="text-xs text-slate-400">Proportions of requests in pipeline</p>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.requestsByStatus}
                  dataKey="count"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {data.requestsByStatus.map((entry: any) => (
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

          <div className="flex flex-wrap gap-2 justify-center text-[10px] text-slate-500">
            {data.requestsByStatus.map((s: any) => (
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
      </div>
    </div>
  );
};
