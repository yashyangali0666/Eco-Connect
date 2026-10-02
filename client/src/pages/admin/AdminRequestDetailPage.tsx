import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { PickupRequest, User, RequestStatus } from '../../types';
import { StatusBadge } from '../../components/common/Badge';
import { StatusTracker } from '../../components/common/StatusTracker';
import { MapPicker } from '../../components/maps/MapPicker';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Truck,
  User as UserIcon,
  Phone,
  Mail,
  RefreshCw,
  Send,
  MessageSquare,
  Activity,
  CheckCircle2,
} from 'lucide-react';

export const AdminRequestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [request, setRequest] = useState<PickupRequest | null>(null);
  const [staffList, setStaffList] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals & form state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [assignNote, setAssignNote] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<RequestStatus>('CONFIRMED');
  const [statusNote, setStatusNote] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const [newComment, setNewComment] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);

  const { success, error } = useToast();

  const fetchRequestData = async () => {
    try {
      const [reqRes, staffRes] = await Promise.all([
        api.get(`/requests/${id}`),
        api.get('/staff'),
      ]);

      if (reqRes.data.success) {
        setRequest(reqRes.data.data);
        setSelectedStatus(reqRes.data.data.status);
      }
      if (staffRes.data.success) {
        setStaffList(staffRes.data.data);
        if (reqRes.data.data.assignedStaffId) {
          setSelectedStaffId(reqRes.data.data.assignedStaffId);
        } else if (staffRes.data.data.length > 0) {
          setSelectedStaffId(staffRes.data.data[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load request:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequestData();
  }, [id]);

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!request || !selectedStaffId) return;

    setIsAssigning(true);
    try {
      const res = await api.patch(`/requests/${request.id}/assign`, {
        staffId: selectedStaffId,
        note: assignNote || undefined,
      });

      if (res.data.success) {
        success('Officer Assigned', 'Staff assignment updated successfully');
        setShowAssignModal(false);
        setAssignNote('');
        fetchRequestData();
      }
    } catch (err: any) {
      error('Assignment Error', err.response?.data?.message || 'Could not assign officer');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!request) return;

    setIsUpdatingStatus(true);
    try {
      const res = await api.patch(`/requests/${request.id}/status`, {
        status: selectedStatus,
        note: statusNote || undefined,
      });

      if (res.data.success) {
        success('Status Changed', `Status updated to ${selectedStatus}`);
        setShowStatusModal(false);
        setStatusNote('');
        fetchRequestData();
      }
    } catch (err: any) {
      error('Update Error', err.response?.data?.message || 'Could not change status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!request || !newComment.trim()) return;

    setIsPostingComment(true);
    try {
      const res = await api.post(`/requests/${request.id}/comments`, {
        comment: newComment.trim(),
      });

      if (res.data.success) {
        success('Note Recorded', 'Audit comment logged successfully');
        setNewComment('');
        fetchRequestData();
      }
    } catch (err: any) {
      error('Error', err.response?.data?.message || 'Failed to post note');
    } finally {
      setIsPostingComment(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400 mt-2">Loading ticket dossier...</p>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <h2 className="text-lg font-bold text-charcoal-900 dark:text-white">Ticket Not Found</h2>
        <Link
          to="/admin/requests"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 text-white text-xs font-semibold rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Requests</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            to="/admin/requests"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-600 mb-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Requests</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 dark:text-white tracking-tight">
              Ticket {request.requestNumber}
            </h1>
            <StatusBadge status={request.status} />
          </div>
          <p className="text-xs text-charcoal-500 dark:text-slate-400">
            Submitted by {request.user.name} on {new Date(request.createdAt).toLocaleString()}
          </p>
        </div>

        {/* Admin Command Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setShowAssignModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-xs transition-colors"
          >
            <Truck className="w-4 h-4" />
            <span>{request.assignedStaff ? 'Reassign Staff' : 'Assign Staff'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowStatusModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-xs transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Override Status</span>
          </button>
        </div>
      </div>

      {/* Progress Timeline */}
      <div className="p-6 rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
          Milestone Progression
        </h3>
        <StatusTracker currentStatus={request.status} activityLogs={request.activityLogs} />
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (7 cols): Customer & Waste Info */}
        <div className="lg:col-span-7 space-y-6">
          {/* Customer & Waste Details Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-sm space-y-5">
            <h3 className="text-sm font-bold text-charcoal-900 dark:text-white border-b border-slate-100 dark:border-charcoal-800 pb-3">
              Citizen & Waste Stream Specifications
            </h3>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Citizen Name</span>
                <span className="font-bold text-charcoal-800 dark:text-slate-200">
                  {request.user.name}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Citizen Contact</span>
                <span className="text-charcoal-800 dark:text-slate-200">
                  {request.user.phone || 'N/A'} • {request.user.email}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Waste Stream</span>
                <span className="font-bold text-charcoal-800 dark:text-slate-200">
                  {request.wasteCategory.name}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Volume</span>
                <span className="font-bold text-charcoal-800 dark:text-slate-200">
                  {request.quantity} {request.unit}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Scheduled Date</span>
                <span className="font-semibold text-charcoal-800 dark:text-slate-200">
                  {new Date(request.pickupDate).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Time Slot</span>
                <span className="font-semibold text-charcoal-800 dark:text-slate-200">
                  {request.timeSlot}
                </span>
              </div>
            </div>

            {request.description && (
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-charcoal-800/60 border border-slate-100 dark:border-charcoal-700 text-xs space-y-1">
                <span className="text-slate-400 font-semibold">Citizen Instructions:</span>
                <p className="text-charcoal-700 dark:text-slate-300">{request.description}</p>
              </div>
            )}

            {request.adminNotes && (
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-xs space-y-1">
                <span className="text-amber-700 dark:text-amber-400 font-semibold">
                  Internal Operations Note:
                </span>
                <p className="text-amber-900 dark:text-amber-200">{request.adminNotes}</p>
              </div>
            )}

            {request.images && request.images.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-charcoal-800">
                <span className="text-xs font-semibold text-slate-400 block">Uploaded Photos</span>
                <div className="flex gap-2">
                  {request.images.map((img) => (
                    <img
                      key={img.id}
                      src={img.url}
                      alt="Waste item"
                      className="w-24 h-24 object-cover rounded-xl border border-slate-200 dark:border-charcoal-700"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Assigned Collector Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-charcoal-900 dark:text-white flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-600" />
                <span>Assigned Fleet Officer</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAssignModal(true)}
                className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
              >
                Change Assignment
              </button>
            </div>

            {request.assignedStaff ? (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-charcoal-800/60 border border-slate-100 dark:border-charcoal-700 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-charcoal-900 dark:text-white">
                    {request.assignedStaff.name}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {request.assignedStaff.email} • {request.assignedStaff.phone || 'No phone'}
                  </p>
                  {request.assignedStaff.staffProfile?.vehicleType && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      Vehicle: {request.assignedStaff.staffProfile.vehicleType} (
                      {request.assignedStaff.staffProfile.vehicleNumber})
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">No officer assigned yet.</p>
            )}
          </div>
        </div>

        {/* Right Column (5 cols): Map & Activity Audit */}
        <div className="lg:col-span-5 space-y-6">
          {/* Map Location */}
          <div className="p-6 rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-charcoal-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Doorstep Pickup Coordinates</span>
            </h3>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-charcoal-800/60 border border-slate-100 dark:border-charcoal-700 text-xs">
              <p className="font-bold text-charcoal-800 dark:text-slate-200">
                {request.pickupAddress}
              </p>
              <p className="text-slate-500">
                {request.city}, {request.state} {request.postalCode}
              </p>
              {request.landmark && (
                <p className="text-emerald-600 font-medium">Landmark: {request.landmark}</p>
              )}
            </div>

            <MapPicker
              latitude={request.latitude}
              longitude={request.longitude}
              readOnly={true}
              height="240px"
            />
          </div>

          {/* Activity Audit Timeline */}
          <div className="p-6 rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-charcoal-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>Activity Audit Trail</span>
            </h3>

            <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
              {request.activityLogs && request.activityLogs.length > 0 ? (
                request.activityLogs.map((log) => (
                  <div
                    key={log.id}
                    className="relative pl-5 before:absolute before:left-1 before:top-2 before:bottom-0 before:w-0.5 before:bg-slate-200 dark:before:bg-charcoal-700 text-xs"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute -left-[3px] top-1.5 ring-4 ring-white dark:ring-charcoal-900" />
                    <p className="font-semibold text-charcoal-800 dark:text-slate-200">
                      {log.description}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400">No logs yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Assign Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="Assign Collection Officer"
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-charcoal-700 dark:text-slate-300">
              Select Officer
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
              placeholder="e.g. Call before arrival..."
              value={assignNote}
              onChange={(e) => setAssignNote(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-slate-50 dark:bg-charcoal-800 text-xs text-charcoal-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAssignModal(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-charcoal-700 text-xs font-semibold text-charcoal-700 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isAssigning}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all disabled:opacity-50"
            >
              {isAssigning ? 'Assigning...' : 'Confirm Assignment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Override Status Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Admin Status Override"
      >
        <form onSubmit={handleStatusSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-charcoal-700 dark:text-slate-300">
              Target Status
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
              Override Reason / Internal Note
            </label>
            <input
              type="text"
              placeholder="e.g. Manual override following inspection..."
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-slate-50 dark:bg-charcoal-800 text-xs text-charcoal-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowStatusModal(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-charcoal-700 text-xs font-semibold text-charcoal-700 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdatingStatus}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all disabled:opacity-50"
            >
              {isUpdatingStatus ? 'Saving...' : 'Apply Status'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
