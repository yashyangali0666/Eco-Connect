import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { PickupRequest, WasteCategory, User, RequestStatus } from '../../types';
import { StatusBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import {
  Search,
  Filter,
  UserCheck,
  RefreshCw,
  ArrowRight,
  Truck,
  ChevronLeft,
  ChevronRight,
  Clock,
  XCircle,
} from 'lucide-react';

export const AdminRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<PickupRequest[]>([]);
  const [categories, setCategories] = useState<WasteCategory[]>([]);
  const [staffList, setStaffList] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [staffFilter, setStaffFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [assignModalReq, setAssignModalReq] = useState<PickupRequest | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [assignNote, setAssignNote] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  const [statusModalReq, setStatusModalReq] = useState<PickupRequest | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<RequestStatus>('CONFIRMED');
  const [statusNote, setStatusNote] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const { success, error } = useToast();

  const fetchFiltersData = async () => {
    try {
      const [catRes, staffRes] = await Promise.all([
        api.get('/waste-categories'),
        api.get('/staff'),
      ]);
      if (catRes.data.success) setCategories(catRes.data.data);
      if (staffRes.data.success) setStaffList(staffRes.data.data);
    } catch (err) {
      console.error('Failed to load filter metadata:', err);
    }
  };

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/requests', {
        params: {
          page,
          limit: 10,
          search: search || undefined,
          status: statusFilter || undefined,
          wasteCategoryId: categoryFilter || undefined,
          staffId: staffFilter || undefined,
        },
      });

      if (res.data.success) {
        setRequests(res.data.data.requests);
        setTotalPages(res.data.data.pagination.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to load requests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiltersData();
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [page, search, statusFilter, categoryFilter, staffFilter]);

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModalReq || !selectedStaffId) return;

    setIsAssigning(true);
    try {
      const res = await api.patch(`/requests/${assignModalReq.id}/assign`, {
        staffId: selectedStaffId,
        note: assignNote || undefined,
      });

      if (res.data.success) {
        success('Staff Assigned', `Request assigned to staff member.`);
        setAssignModalReq(null);
        setSelectedStaffId('');
        setAssignNote('');
        fetchRequests();
      }
    } catch (err: any) {
      error('Assignment Failed', err.response?.data?.message || 'Error occurred');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusModalReq) return;

    setIsUpdatingStatus(true);
    try {
      const res = await api.patch(`/requests/${statusModalReq.id}/status`, {
        status: selectedStatus,
        note: statusNote || undefined,
      });

      if (res.data.success) {
        success('Status Updated', `Request status changed to ${selectedStatus}`);
        setStatusModalReq(null);
        setStatusNote('');
        fetchRequests();
      }
    } catch (err: any) {
      error('Status Update Failed', err.response?.data?.message || 'Error occurred');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-charcoal-900 dark:text-white tracking-tight">
          Collection Request Management
        </h1>
        <p className="text-xs text-charcoal-500 dark:text-slate-400">
          Search, filter, assign collectors, and control status transitions across all municipal tickets
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search ID, citizen, address..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-slate-50 dark:bg-charcoal-800 text-xs text-charcoal-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-slate-50 dark:bg-charcoal-800 text-xs text-charcoal-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending Review</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="OUT_FOR_PICKUP">Out for Pickup</option>
            <option value="COLLECTED">Collected</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-slate-50 dark:bg-charcoal-800 text-xs text-charcoal-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Waste Streams</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Staff Filter */}
          <select
            value={staffFilter}
            onChange={(e) => {
              setStaffFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-slate-50 dark:bg-charcoal-800 text-xs text-charcoal-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Staff</option>
            {staffList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Requests Table */}
      {isLoading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading requests...</div>
      ) : requests.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800">
          <p className="text-sm font-bold text-charcoal-800 dark:text-slate-200">
            No collection requests match your filters
          </p>
          <p className="text-xs text-slate-400 mt-1">Try clearing some of your search parameters.</p>
        </div>
      ) : (
        <div className="rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-charcoal-800/60 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Ticket ID</th>
                  <th className="px-5 py-3.5">Citizen</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Quantity</th>
                  <th className="px-5 py-3.5">Pickup Date</th>
                  <th className="px-5 py-3.5">Assigned Staff</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-charcoal-800">
                {requests.map((req) => (
                  <tr
                    key={req.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-charcoal-800/40 transition-colors"
                  >
                    <td className="px-5 py-3.5 font-mono font-bold text-charcoal-900 dark:text-slate-100">
                      {req.requestNumber}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-charcoal-800 dark:text-slate-200">
                        {req.user.name}
                      </p>
                      <p className="text-[11px] text-slate-400">{req.user.phone || req.user.email}</p>
                    </td>
                    <td className="px-5 py-3.5 text-charcoal-700 dark:text-slate-300 font-medium">
                      {req.wasteCategory.name}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">
                      {req.quantity} {req.unit}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">
                      {new Date(req.pickupDate).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-5 py-3.5">
                      {req.assignedStaff ? (
                        <span className="font-medium text-charcoal-700 dark:text-slate-300">
                          {req.assignedStaff.name}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setAssignModalReq(req);
                            setSelectedStaffId(staffList[0]?.id || '');
                          }}
                          className="px-2 py-1 rounded bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[11px] font-semibold hover:bg-amber-100 transition-colors"
                        >
                          + Assign Staff
                        </button>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={req.status} size="sm" />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setAssignModalReq(req);
                            setSelectedStaffId(req.assignedStaffId || staffList[0]?.id || '');
                          }}
                          title="Assign Staff"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-charcoal-800"
                        >
                          <Truck className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setStatusModalReq(req);
                            setSelectedStatus(req.status);
                          }}
                          title="Change Status"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-charcoal-800"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>

                        <Link
                          to={`/admin/requests/${req.id}`}
                          title="View Full Ticket"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-charcoal-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-charcoal-800"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-5 py-3.5 border-t border-slate-100 dark:border-charcoal-800 flex items-center justify-between text-xs text-slate-400">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-charcoal-700 disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-charcoal-800"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-charcoal-700 disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-charcoal-800"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Staff Modal */}
      <Modal
        isOpen={!!assignModalReq}
        onClose={() => setAssignModalReq(null)}
        title={`Assign Officer to ${assignModalReq?.requestNumber}`}
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-charcoal-700 dark:text-slate-300">
              Select Collection Staff Member
            </label>
            <select
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-slate-50 dark:bg-charcoal-800 text-xs text-charcoal-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {staffList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.staffProfile?.vehicleType || 'Electric Van'} -{' '}
                  {s.staffProfile?.vehicleNumber || 'Unassigned'})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-charcoal-700 dark:text-slate-300">
              Dispatch Instructions (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Prioritize for 10am route..."
              value={assignNote}
              onChange={(e) => setAssignNote(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-slate-50 dark:bg-charcoal-800 text-xs text-charcoal-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setAssignModalReq(null)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-charcoal-700 text-xs font-semibold text-charcoal-700 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isAssigning}
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all disabled:opacity-50"
            >
              {isAssigning ? 'Assigning...' : 'Confirm Assignment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Update Status Modal */}
      <Modal
        isOpen={!!statusModalReq}
        onClose={() => setStatusModalReq(null)}
        title={`Update Status: ${statusModalReq?.requestNumber}`}
      >
        <form onSubmit={handleStatusSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-charcoal-700 dark:text-slate-300">
              New Lifecycle Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as RequestStatus)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-slate-50 dark:bg-charcoal-800 text-xs text-charcoal-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="PENDING">PENDING</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="ASSIGNED">ASSIGNED</option>
              <option value="OUT_FOR_PICKUP">OUT_FOR_PICKUP</option>
              <option value="COLLECTED">COLLECTED</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-charcoal-700 dark:text-slate-300">
              Admin Status Note
            </label>
            <input
              type="text"
              placeholder="e.g. Verified by operator..."
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-slate-50 dark:bg-charcoal-800 text-xs text-charcoal-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setStatusModalReq(null)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-charcoal-700 text-xs font-semibold text-charcoal-700 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdatingStatus}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all disabled:opacity-50"
            >
              {isUpdatingStatus ? 'Saving...' : 'Update Status'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
