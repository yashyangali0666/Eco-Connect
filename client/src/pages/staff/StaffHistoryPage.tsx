import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { PickupRequest } from '../../types';
import { StatusBadge } from '../../components/common/Badge';
import { Search, Calendar, Clock, MapPin, ArrowRight, CheckCircle2 } from 'lucide-react';

export const StaffHistoryPage: React.FC = () => {
  const [requests, setRequests] = useState<PickupRequest[]>([]);
  const [search, setSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/requests', {
          params: {
            status: 'COMPLETED',
            search: search || undefined,
            limit: 50,
          },
        });
        if (res.data.success) {
          setRequests(res.data.data.requests);
        }
      } catch (err) {
        console.error('Failed to load completed pickups:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, [search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-charcoal-900 dark:text-white tracking-tight">
          Collection History Archive
        </h1>
        <p className="text-xs text-charcoal-500 dark:text-slate-400">
          All successfully serviced and completed pickup tickets
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-sm max-w-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search completed tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-slate-50 dark:bg-charcoal-800 text-xs text-charcoal-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading history...</div>
      ) : requests.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 space-y-2">
          <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-charcoal-800 dark:text-slate-200">
            No completed collections yet
          </h3>
          <p className="text-xs text-slate-400">
            As you service pickup routes and mark tickets complete, they will be archived here.
          </p>
        </div>
      ) : (
        <div className="rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-charcoal-800/60 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Ticket ID</th>
                  <th className="px-5 py-3.5">Waste Stream</th>
                  <th className="px-5 py-3.5">Quantity</th>
                  <th className="px-5 py-3.5">Citizen</th>
                  <th className="px-5 py-3.5">Pickup Date</th>
                  <th className="px-5 py-3.5">Completed At</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
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
                    <td className="px-5 py-4 text-slate-500">
                      {req.quantity} {req.unit}
                    </td>
                    <td className="px-5 py-4 text-charcoal-800 dark:text-slate-200 font-semibold">
                      {req.user.name}
                    </td>
                    <td className="px-5 py-4 text-slate-500">
                      {new Date(req.pickupDate).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 text-slate-500">
                      {req.completedAt ? new Date(req.completedAt).toLocaleString() : '—'}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        to={`/staff/requests/${req.id}`}
                        className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:underline"
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
