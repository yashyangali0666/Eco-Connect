import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { PickupRequest } from '../../types';
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
  User,
  Phone,
  MessageSquare,
  Send,
  XCircle,
  Activity,
  Package,
} from 'lucide-react';

export const TrackRequestPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [request, setRequest] = useState<PickupRequest | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [newComment, setNewComment] = useState<string>('');
  const [isPostingComment, setIsPostingComment] = useState<boolean>(false);
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [cancelReason, setCancelReason] = useState<string>('');
  const [isCancelling, setIsCancelling] = useState<boolean>(false);
  const { success, error } = useToast();

  const fetchRequestDetails = async () => {
    try {
      const res = await api.get(`/requests/${id}`);
      if (res.data.success) {
        setRequest(res.data.data);
      }
    } catch (err: any) {
      console.error('Failed to load request:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequestDetails();
  }, [id]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !request) return;

    setIsPostingComment(true);
    try {
      const res = await api.post(`/requests/${request.id}/comments`, {
        comment: newComment.trim(),
      });
      if (res.data.success) {
        setNewComment('');
        success('Note Added', 'Your note has been posted to the request thread.');
        fetchRequestDetails();
      }
    } catch (err: any) {
      error('Failed to post note', err.response?.data?.message || 'Error occurred');
    } finally {
      setIsPostingComment(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!request) return;
    setIsCancelling(true);

    try {
      const res = await api.patch(`/requests/${request.id}/cancel`, {
        reason: cancelReason,
      });
      if (res.data.success) {
        success('Request Cancelled', 'Your pickup request has been cancelled.');
        setShowCancelModal(false);
        fetchRequestDetails();
      }
    } catch (err: any) {
      error('Error', err.response?.data?.message || 'Failed to cancel');
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400 mt-2">Loading tracking data...</p>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <Package className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-lg font-bold text-charcoal-900 dark:text-white">
          Request Not Found
        </h2>
        <p className="text-xs text-slate-400">
          The requested pickup ticket could not be found or you don&apos;t have authorization to view it.
        </p>
        <Link
          to="/requests"
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-xs font-semibold rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Requests</span>
        </Link>
      </div>
    );
  }

  const isCancellable = request.status === 'PENDING' || request.status === 'CONFIRMED';

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Breadcrumb & Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            to="/requests"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors mb-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Requests</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 dark:text-white tracking-tight">
              Request {request.requestNumber}
            </h1>
            <StatusBadge status={request.status} />
          </div>
          <p className="text-xs text-charcoal-500 dark:text-slate-400">
            Created on {new Date(request.createdAt).toLocaleString()}
          </p>
        </div>

        {isCancellable && (
          <button
            type="button"
            onClick={() => setShowCancelModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors self-start sm:self-auto"
          >
            <XCircle className="w-4 h-4" />
            <span>Cancel Pickup</span>
          </button>
        )}
      </div>

      {/* Visual Status Progression Tracker */}
      <div className="p-6 rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
          Milestone Progression
        </h3>
        <StatusTracker currentStatus={request.status} activityLogs={request.activityLogs} />
      </div>

      {/* Two Column Layout: Details & Map on Left, Timeline & Notes on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (7 cols): Request Details, Map, Assigned Staff */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Info Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-sm space-y-5">
            <h3 className="text-sm font-bold text-charcoal-900 dark:text-white border-b border-slate-100 dark:border-charcoal-800 pb-3">
              Collection Details
            </h3>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Waste Stream</span>
                <span className="font-bold text-sm text-charcoal-800 dark:text-slate-200">
                  {request.wasteCategory.name}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">Quantity</span>
                <span className="font-bold text-sm text-charcoal-800 dark:text-slate-200">
                  {request.quantity} {request.unit}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">Pickup Date</span>
                <span className="font-semibold text-charcoal-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  {new Date(request.pickupDate).toLocaleDateString([], {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">Time Slot</span>
                <span className="font-semibold text-charcoal-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  {request.timeSlot}
                </span>
              </div>
            </div>

            {request.description && (
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-charcoal-800/60 border border-slate-100 dark:border-charcoal-700 text-xs">
                <span className="text-slate-400 font-semibold block mb-0.5">Citizen Notes:</span>
                <p className="text-charcoal-700 dark:text-slate-300">{request.description}</p>
              </div>
            )}

            {/* Attached Photo */}
            {request.images && request.images.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-charcoal-800">
                <span className="text-xs font-semibold text-slate-400 block">Attached Photos</span>
                <div className="flex gap-3 overflow-x-auto">
                  {request.images.map((img) => (
                    <img
                      key={img.id}
                      src={img.url}
                      alt="Uploaded waste"
                      className="w-24 h-24 object-cover rounded-xl border border-slate-200 dark:border-charcoal-700"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Assigned Collector Card */}
          {request.assignedStaff && (
            <div className="p-6 rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-charcoal-900 dark:text-white flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-600" />
                <span>Assigned Collection Officer</span>
              </h3>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-charcoal-800/60 border border-slate-100 dark:border-charcoal-700">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      request.assignedStaff.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(request.assignedStaff.name)}&background=059669&color=fff`
                    }
                    alt={request.assignedStaff.name}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-charcoal-900 dark:text-white">
                      {request.assignedStaff.name}
                    </h4>
                    {request.assignedStaff.staffProfile?.vehicleType && (
                      <p className="text-xs text-slate-400">
                        Vehicle: {request.assignedStaff.staffProfile.vehicleType} (
                        {request.assignedStaff.staffProfile.vehicleNumber})
                      </p>
                    )}
                  </div>
                </div>

                {request.assignedStaff.phone && (
                  <a
                    href={`tel:${request.assignedStaff.phone}`}
                    className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 transition-colors"
                    title="Call Collector"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Interactive Leaflet Map for Pickup Spot */}
          <div className="p-6 rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-charcoal-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Doorstep Pickup Spot</span>
            </h3>
            <p className="text-xs text-charcoal-600 dark:text-slate-400">
              {request.pickupAddress}, {request.city}, {request.state} {request.postalCode}
              {request.landmark && ` • Landmark: ${request.landmark}`}
            </p>
            <MapPicker
              latitude={request.latitude}
              longitude={request.longitude}
              readOnly={true}
              height="240px"
            />
          </div>
        </div>

        {/* Right Column (5 cols): Activity Timeline & Discussion Thread */}
        <div className="lg:col-span-5 space-y-6">
          {/* Activity History Logs */}
          <div className="p-6 rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-charcoal-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>Activity History & Audit</span>
            </h3>

            <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
              {request.activityLogs && request.activityLogs.length > 0 ? (
                request.activityLogs.map((log) => (
                  <div key={log.id} className="relative pl-5 before:absolute before:left-1 before:top-2 before:bottom-0 before:w-0.5 before:bg-slate-200 dark:before:bg-charcoal-700 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute -left-[3px] top-1.5 ring-4 ring-white dark:ring-charcoal-900" />
                    <p className="font-semibold text-charcoal-800 dark:text-slate-200 leading-tight">
                      {log.description}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400">No activity recorded yet.</p>
              )}
            </div>
          </div>

          {/* Comments / Notes Thread */}
          <div className="p-6 rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-charcoal-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>Coordination Notes</span>
            </h3>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {request.comments && request.comments.length > 0 ? (
                request.comments.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-charcoal-800/60 border border-slate-100 dark:border-charcoal-700 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-charcoal-800 dark:text-slate-200">
                        {c.user.name} ({c.user.role})
                      </span>
                      <span className="text-slate-400">
                        {new Date(c.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-charcoal-700 dark:text-slate-300">{c.comment}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400">No notes posted yet.</p>
              )}
            </div>

            {/* Post note form */}
            <form onSubmit={handleAddComment} className="pt-2 flex gap-2">
              <input
                type="text"
                placeholder="Post instructions for collector..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-slate-50 dark:bg-charcoal-800 text-xs text-charcoal-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button
                type="submit"
                disabled={isPostingComment || !newComment.trim()}
                className="p-2 rounded-xl bg-brand-600 text-white hover:bg-brand-500 transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Pickup Request"
      >
        <div className="space-y-4">
          <p className="text-xs text-charcoal-600 dark:text-slate-300 leading-relaxed">
            Are you sure you want to cancel request{' '}
            <span className="font-bold text-charcoal-900 dark:text-white">
              {request.requestNumber}
            </span>
            ? This will remove it from the collection queue.
          </p>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-charcoal-700 dark:text-slate-300">
              Reason (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Schedule conflict, items already recycled"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-slate-50 dark:bg-charcoal-800 text-xs text-charcoal-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowCancelModal(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-charcoal-700 text-xs font-semibold text-charcoal-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-charcoal-800"
            >
              Keep Request
            </button>
            <button
              type="button"
              disabled={isCancelling}
              onClick={handleCancelRequest}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all disabled:opacity-50"
            >
              {isCancelling ? 'Cancelling...' : 'Cancel Request'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
