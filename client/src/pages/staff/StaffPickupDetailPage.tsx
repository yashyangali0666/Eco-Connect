import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { PickupRequest, RequestStatus } from '../../types';
import { StatusBadge } from '../../components/common/Badge';
import { StatusTracker } from '../../components/common/StatusTracker';
import { MapPicker } from '../../components/maps/MapPicker';
import { useToast } from '../../context/ToastContext';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Phone,
  User,
  Truck,
  CheckCircle2,
  Navigation,
  FileText,
  MessageSquare,
  Send,
} from 'lucide-react';

export const StaffPickupDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [request, setRequest] = useState<PickupRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [noteText, setNoteText] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const { success, error } = useToast();

  const fetchRequest = async () => {
    try {
      const res = await api.get(`/requests/${id}`);
      if (res.data.success) {
        setRequest(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load request:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequest();
  }, [id]);

  const handleUpdateStatus = async (targetStatus: RequestStatus) => {
    if (!request) return;
    setIsUpdating(true);

    try {
      const res = await api.patch(`/requests/${request.id}/status`, {
        status: targetStatus,
        note: noteText || undefined,
      });

      if (res.data.success) {
        success('Status Updated', `Request transitioned to ${targetStatus.replace(/_/g, ' ')}`);
        setNoteText('');
        fetchRequest();
      }
    } catch (err: any) {
      error('Update Failed', err.response?.data?.message || 'Could not update status');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400 mt-2">Loading pickup ticket...</p>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <h2 className="text-lg font-bold text-charcoal-900 dark:text-white">Ticket Not Found</h2>
        <Link
          to="/staff/requests"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Assigned Route</span>
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
            to="/staff/requests"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 mb-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Queue</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 dark:text-white tracking-tight">
              Ticket {request.requestNumber}
            </h1>
            <StatusBadge status={request.status} />
          </div>
        </div>

        {/* Citizen Quick Call */}
        {request.user.phone && (
          <a
            href={`tel:${request.user.phone}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors self-start sm:self-auto"
          >
            <Phone className="w-4 h-4" />
            <span>Call Citizen ({request.user.phone})</span>
          </a>
        )}
      </div>

      {/* Progress Tracker */}
      <div className="p-6 rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
          Milestones
        </h3>
        <StatusTracker currentStatus={request.status} activityLogs={request.activityLogs} />
      </div>

      {/* Grid: Left Column Details & Actions, Right Column Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (7 cols): Workflow Actions & Ticket Details */}
        <div className="lg:col-span-7 space-y-6">
          {/* Workflow Action Box */}
          <div className="p-6 rounded-3xl bg-white dark:bg-charcoal-900 border border-blue-200 dark:border-blue-900/60 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-charcoal-900 dark:text-white flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-600" />
              <span>Route Action & Status Update</span>
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-charcoal-700 dark:text-slate-300">
                Collection Officer Note (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Weigh-in confirmed: 14kg cardboard loaded safely..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-slate-50 dark:bg-charcoal-800 text-xs text-charcoal-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {request.status === 'ASSIGNED' && (
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => handleUpdateStatus('OUT_FOR_PICKUP')}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Start Pickup (Out for Pickup)</span>
                </button>
              )}

              {request.status === 'OUT_FOR_PICKUP' && (
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => handleUpdateStatus('COLLECTED')}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark Waste as Collected</span>
                </button>
              )}

              {request.status === 'COLLECTED' && (
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => handleUpdateStatus('COMPLETED')}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Complete Collection & Delivery</span>
                </button>
              )}

              {request.status === 'COMPLETED' && (
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5 py-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Collection completed and verified</span>
                </span>
              )}
            </div>
          </div>

          {/* Ticket Information */}
          <div className="p-6 rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-charcoal-900 dark:text-white border-b border-slate-100 dark:border-charcoal-800 pb-3">
              Materials & Customer Info
            </h3>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Stream</span>
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
                <span className="text-slate-400 block mb-0.5">Citizen Name</span>
                <span className="font-bold text-charcoal-800 dark:text-slate-200">
                  {request.user.name}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Citizen Email</span>
                <span className="text-charcoal-800 dark:text-slate-200">{request.user.email}</span>
              </div>
            </div>

            {request.description && (
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-charcoal-800/60 border border-slate-100 dark:border-charcoal-700 text-xs space-y-1">
                <span className="text-slate-400 font-semibold">Description:</span>
                <p className="text-charcoal-700 dark:text-slate-300">{request.description}</p>
              </div>
            )}

            {/* Photos if any */}
            {request.images && request.images.length > 0 && (
              <div className="space-y-1.5 pt-2">
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
        </div>

        {/* Right Column (5 cols): Map & Address */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-charcoal-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>Pickup Location</span>
            </h3>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-charcoal-800/60 border border-slate-100 dark:border-charcoal-700 text-xs space-y-1">
              <p className="font-bold text-charcoal-800 dark:text-slate-200">
                {request.pickupAddress}
              </p>
              <p className="text-slate-500">
                {request.city}, {request.state} {request.postalCode}
              </p>
              {request.landmark && (
                <p className="text-blue-600 dark:text-blue-400 font-medium">
                  Landmark: {request.landmark}
                </p>
              )}
            </div>

            <MapPicker
              latitude={request.latitude}
              longitude={request.longitude}
              readOnly={true}
              height="300px"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
