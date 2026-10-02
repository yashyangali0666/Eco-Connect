import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { User } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Users, Search, Phone, Mail, ChevronLeft, ChevronRight, UserX, UserCheck } from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const { success, error } = useToast();

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/users', {
        params: {
          page,
          limit: 10,
          search: search || undefined,
        },
      });

      if (res.data.success) {
        setUsers(res.data.data.users);
        setTotalPages(res.data.data.pagination.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const handleToggleStatus = async (userId: string) => {
    try {
      const res = await api.patch(`/admin/users/${userId}/status`);
      if (res.data.success) {
        success('User Updated', res.data.message);
        fetchUsers();
      }
    } catch (err: any) {
      error('Failed', err.response?.data?.message || 'Error occurred');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-charcoal-900 dark:text-white tracking-tight">
          Citizen Directory
        </h1>
        <p className="text-xs text-charcoal-500 dark:text-slate-400">
          View registered citizens, pickup request activity, and account status
        </p>
      </div>

      <div className="p-4 rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-sm max-w-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search citizens by name, email, phone..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-slate-50 dark:bg-charcoal-800 text-xs text-charcoal-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading citizen records...</div>
      ) : users.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 space-y-2">
          <Users className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-charcoal-800 dark:text-slate-200">
            No citizens found
          </h3>
        </div>
      ) : (
        <div className="rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-charcoal-800/60 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Citizen Name</th>
                  <th className="px-5 py-3.5">Contact Email</th>
                  <th className="px-5 py-3.5">Phone Number</th>
                  <th className="px-5 py-3.5">Registered On</th>
                  <th className="px-5 py-3.5">Pickups Created</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-charcoal-800">
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-charcoal-800/40 transition-colors"
                  >
                    <td className="px-5 py-4 font-bold text-charcoal-900 dark:text-slate-100 flex items-center gap-3">
                      <img
                        src={
                          u.avatar ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=059669&color=fff`
                        }
                        alt={u.name}
                        className="w-8 h-8 rounded-lg object-cover"
                      />
                      <span>{u.name}</span>
                    </td>
                    <td className="px-5 py-4 text-slate-500">{u.email}</td>
                    <td className="px-5 py-4 text-slate-500">{u.phone || '—'}</td>
                    <td className="px-5 py-4 text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-5 py-4 font-semibold text-charcoal-800 dark:text-slate-200">
                      {u._count?.pickupRequests ?? 0}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          u.isActive
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                        }`}
                      >
                        {u.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(u.id)}
                        className={`text-xs font-semibold px-3 py-1 rounded-lg border transition-colors ${
                          u.isActive
                            ? 'border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20'
                            : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20'
                        }`}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3.5 border-t border-slate-100 dark:border-charcoal-800 flex items-center justify-between text-xs text-slate-400">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-charcoal-700 disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-charcoal-700 disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
