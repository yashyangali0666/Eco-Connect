import React from 'react';
import { RequestStatus, ActivityLog } from '../../types';
import { Check, Clock, AlertCircle, XCircle } from 'lucide-react';

interface StatusTrackerProps {
  currentStatus: RequestStatus;
  activityLogs?: ActivityLog[];
}

interface Step {
  id: RequestStatus;
  label: string;
  desc: string;
}

const STEPS: Step[] = [
  { id: 'PENDING', label: 'Submitted', desc: 'Request logged' },
  { id: 'CONFIRMED', label: 'Confirmed', desc: 'Details verified' },
  { id: 'ASSIGNED', label: 'Assigned', desc: 'Collector assigned' },
  { id: 'OUT_FOR_PICKUP', label: 'Out for Pickup', desc: 'Collector en route' },
  { id: 'COLLECTED', label: 'Collected', desc: 'Waste weighed & loaded' },
  { id: 'COMPLETED', label: 'Completed', desc: 'Delivered to recycling' },
];

export const StatusTracker: React.FC<StatusTrackerProps> = ({ currentStatus, activityLogs = [] }) => {
  if (currentStatus === 'CANCELLED' || currentStatus === 'REJECTED') {
    const isCancelled = currentStatus === 'CANCELLED';
    return (
      <div className="p-4 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/20 flex items-center gap-3">
        {isCancelled ? (
          <XCircle className="w-6 h-6 text-red-500 shrink-0" />
        ) : (
          <AlertCircle className="w-6 h-6 text-red-500 shrink-0" />
        )}
        <div>
          <h4 className="text-sm font-semibold text-red-800 dark:text-red-300">
            {isCancelled ? 'Pickup Request Cancelled' : 'Pickup Request Rejected'}
          </h4>
          <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
            {isCancelled
              ? 'This collection request was cancelled and will not be serviced.'
              : 'This request could not be accepted. Please review waste guidelines.'}
          </p>
        </div>
      </div>
    );
  }

  const statusOrder: RequestStatus[] = [
    'PENDING',
    'CONFIRMED',
    'ASSIGNED',
    'OUT_FOR_PICKUP',
    'COLLECTED',
    'COMPLETED',
  ];

  const currentIndex = statusOrder.indexOf(currentStatus);

  // Find timestamp for each step if available in activity logs
  const getLogForStep = (stepId: RequestStatus) => {
    return activityLogs.find((log) => log.action === stepId);
  };

  return (
    <div className="w-full py-4">
      {/* Desktop / Tablet Horizontal Timeline */}
      <div className="hidden md:flex items-center justify-between relative">
        {/* Continuous background line */}
        <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 dark:bg-charcoal-700 -z-0" />

        {/* Completed Progress fill */}
        <div
          className="absolute top-4 left-6 h-0.5 bg-emerald-500 transition-all duration-500 -z-0"
          style={{
            width: `${Math.max(0, (currentIndex / (STEPS.length - 1)) * 100)}%`,
          }}
        />

        {STEPS.map((step, index) => {
          const isDone = index < currentIndex;
          const isCurrent = index === currentIndex;
          const log = getLogForStep(step.id);

          return (
            <div key={step.id} className="flex flex-col items-center relative z-10 text-center w-28">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-xs transition-all duration-300 ${
                  isDone
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                    : isCurrent
                    ? 'bg-white dark:bg-charcoal-900 border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 ring-4 ring-emerald-500/20'
                    : 'bg-white dark:bg-charcoal-800 border-2 border-slate-200 dark:border-charcoal-700 text-slate-400'
                }`}
              >
                {isDone ? (
                  <Check className="w-4 h-4 stroke-[3]" />
                ) : isCurrent ? (
                  <Clock className="w-4 h-4 animate-pulse text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>

              <div className="mt-2.5">
                <p
                  className={`text-xs font-semibold ${
                    isDone || isCurrent
                      ? 'text-charcoal-900 dark:text-slate-100'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {step.label}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight mt-0.5">
                  {log ? new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile Vertical Timeline */}
      <div className="md:hidden space-y-4 relative pl-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-charcoal-700">
        {STEPS.map((step, index) => {
          const isDone = index < currentIndex;
          const isCurrent = index === currentIndex;
          const log = getLogForStep(step.id);

          return (
            <div key={step.id} className="relative flex items-start gap-3">
              <div
                className={`absolute -left-6 top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isDone
                    ? 'bg-emerald-500 text-white'
                    : isCurrent
                    ? 'bg-white dark:bg-charcoal-900 border-2 border-emerald-500 text-emerald-600 ring-2 ring-emerald-500/20'
                    : 'bg-white dark:bg-charcoal-800 border-2 border-slate-200 dark:border-charcoal-700 text-slate-400'
                }`}
              >
                {isDone ? <Check className="w-3 h-3 stroke-[3]" /> : index + 1}
              </div>
              <div className="pl-2">
                <p
                  className={`text-sm font-semibold ${
                    isDone || isCurrent
                      ? 'text-charcoal-900 dark:text-slate-100'
                      : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  {log ? new Date(log.createdAt).toLocaleString() : step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
