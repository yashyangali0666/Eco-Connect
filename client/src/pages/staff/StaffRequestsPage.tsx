import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { PickupRequest } from '../../types';
import { StatusBadge } from '../../components/common/Badge';
import { Search, Calendar, Clock, MapPin, ArrowRight, Truck } from 'lucide-react';

export const StaffRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<PickupRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ACTIVE');
  const [search, setSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchStaffRequests = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/requests', {
        params: {
          search: search || undefined,
          limit: 50,
        },
      });
      if (res.data.success) {
        setRequests(res.data.data.requests);
      }
    } catch (err) {
      console.error('Failed to load staff requests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffRequests();
  }, [search]);

  const filtered = requests.filter((r) => {
    if (statusFilter === 'ACTIVE') {
      return (
        r.status === 'ASSIGNED' ||
        r.status === 'OUT_FOR_PICKUP' ||
        r.status === 'COLLECTED'
      );
    }
    if (statusFilter === 'COMPLETED') return r.status === 'COMPLETED';
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-charcoal-900 dark:text-white tracking-tight">
          Assigned Collection Route
        </h1>
        <p className="text-xs text-charcoal-500 dark:text-slate-400">
          Manage all pickup requests assigned to your vehicle and district
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-sm">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search address, ID, citizen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-slate-50 dark:bg-charcoal-800 text-xs text-charcoal-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {['ACTIVE', 'COMPLETED', 'ALL'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                statusFilter === tab
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-charcoal-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-charcoal-800'
              }`}
            >
              {tab === 'ACTIVE' ? 'Active Route' : tab === 'COMPLETED' ? 'Completed' : 'All'}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading assignments...</div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 space-y-2">
          <Truck className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-charcoal-800 dark:text-slate-200">
            No assigned collections found
          </h3>
          <p className="text-xs text-slate-400">
            Your queue is clear. New pickups will appear when assigned by an administrator.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((req) => (
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
                  <p className="text-xs text-slate-500">
                    {req.quantity} {req.unit} • Citizen: {req.user.name}
                  </p>
                </div>

                <div className="space-y-1.5 text-xs text-charcoal-600 dark:text-slate-400 border-t border-slate-100 dark:border-charcoal-800 pt-3">
                  <div className="flex items-center gap-2 truncate">
                    <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{new Date(req.pickupDate).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-2 truncate">
                    <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{req.timeSlot}</span>
                  </div>

                  <div className="flex items-center gap-2 truncate">
                    <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="truncate">{req.pickupAddress}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-charcoal-800">
                <Link
                  to={`/staff/requests/${req.id}`}
                  className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Open Ticket & Map</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
