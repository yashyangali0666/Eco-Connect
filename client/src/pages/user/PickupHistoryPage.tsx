import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { PickupRequest } from '../../types';
import { StatusBadge } from '../../components/common/Badge';
import { Search, Calendar, History, ArrowRight, PackageCheck, Filter } from 'lucide-react';

export const PickupHistoryPage: React.FC = () => {
  const [requests, setRequests] = useState<PickupRequest[]>([]);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('COMPLETED');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/requests', {
          params: {
            status: statusFilter !== 'ALL' ? statusFilter : undefined,
            search: search || undefined,
            limit: 50,
          },
        });
        if (res.data.success) {
          setRequests(res.data.data.requests);
        }
      } catch (err) {
        console.error('Failed to load history:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, [statusFilter, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-charcoal-900 dark:text-white tracking-tight">
          Collection History
        </h1>
        <p className="text-xs text-charcoal-500 dark:text-slate-400">
          Archive of your past waste pickups, recycled materials, and diversion records
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-sm">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search request ID, address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-slate-50 dark:bg-charcoal-800 text-xs text-charcoal-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-slate-50 dark:bg-charcoal-800 text-xs text-charcoal-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="COMPLETED">Completed Only</option>
            <option value="CANCELLED">Cancelled Only</option>
            <option value="ALL">All Past Requests</option>
          </select>
        </div>
      </div>

      {/* Table / List */}
      {isLoading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 mt-2">Loading pickup history...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 space-y-3">
          <PackageCheck className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-charcoal-800 dark:text-slate-200">
            No history records found
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Once your collection requests are marked as completed or cancelled, they will appear here.
          </p>
        </div>
      ) : (
        <div className="rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-charcoal-800/60 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Request ID</th>
                  <th className="px-5 py-3.5">Waste Stream</th>
                  <th className="px-5 py-3.5">Quantity</th>
                  <th className="px-5 py-3.5">Pickup Date</th>
                  <th className="px-5 py-3.5">Assigned Officer</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-charcoal-800">
                {requests.map((req) => (
                  <tr
                    key={req.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-charcoal-800/40 transition-colors"
                  >
                    <td className="px-5 py-4 font-mono font-bold text-charcoal-900 dark:text-slate-100">
                      {req.requestNumber}
                    </td>
                    <td className="px-5 py-4 font-medium text-charcoal-800 dark:text-slate-200">
                      {req.wasteCategory.name}
                    </td>
                    <td className="px-5 py-4 text-slate-500 dark:text-slate-400">
                      {req.quantity} {req.unit}
                    </td>
                    <td className="px-5 py-4 text-slate-500 dark:text-slate-400">
                      {new Date(req.pickupDate).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-5 py-4 text-charcoal-700 dark:text-slate-300">
                      {req.assignedStaff?.name || '—'}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={req.status} size="sm" />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        to={`/requests/${req.id}`}
                        className="inline-flex items-center gap-1 font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                      >
                        <span>View</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
