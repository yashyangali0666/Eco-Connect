import React from 'react';
import { RequestStatus } from '../../types';
import { Clock, CheckCircle2, Truck, PackageCheck, XCircle, AlertCircle, UserCheck } from 'lucide-react';

interface BadgeProps {
  status: RequestStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<BadgeProps> = ({ status, size = 'md', showIcon = true }) => {
  const configs: Record<
    RequestStatus,
    { label: string; bg: string; text: string; border: string; icon: React.ReactNode }
  > = {
    PENDING: {
      label: 'Pending Review',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      text: 'text-amber-700 dark:text-amber-400',
      border: 'border-amber-200 dark:border-amber-800/60',
      icon: <Clock className="w-3.5 h-3.5" />,
    },
    CONFIRMED: {
      label: 'Confirmed',
      bg: 'bg-blue-50 dark:bg-blue-950/40',
      text: 'text-blue-700 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-800/60',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
    ASSIGNED: {
      label: 'Assigned',
      bg: 'bg-indigo-50 dark:bg-indigo-950/40',
      text: 'text-indigo-700 dark:text-indigo-400',
      border: 'border-indigo-200 dark:border-indigo-800/60',
      icon: <UserCheck className="w-3.5 h-3.5" />,
    },
    OUT_FOR_PICKUP: {
      label: 'Out for Pickup',
      bg: 'bg-cyan-50 dark:bg-cyan-950/40',
      text: 'text-cyan-700 dark:text-cyan-400',
      border: 'border-cyan-200 dark:border-cyan-800/60',
      icon: <Truck className="w-3.5 h-3.5" />,
    },
    COLLECTED: {
      label: 'Collected',
      bg: 'bg-teal-50 dark:bg-teal-950/40',
      text: 'text-teal-700 dark:text-teal-400',
      border: 'border-teal-200 dark:border-teal-800/60',
      icon: <PackageCheck className="w-3.5 h-3.5" />,
    },
    COMPLETED: {
      label: 'Completed',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      text: 'text-emerald-700 dark:text-emerald-400',
      border: 'border-emerald-200 dark:border-emerald-800/60',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
    CANCELLED: {
      label: 'Cancelled',
      bg: 'bg-slate-100 dark:bg-slate-800/60',
      text: 'text-slate-600 dark:text-slate-400',
      border: 'border-slate-200 dark:border-slate-700',
      icon: <XCircle className="w-3.5 h-3.5" />,
    },
    REJECTED: {
      label: 'Rejected',
      bg: 'bg-red-50 dark:bg-red-950/40',
      text: 'text-red-700 dark:text-red-400',
      border: 'border-red-200 dark:border-red-800/60',
      icon: <AlertCircle className="w-3.5 h-3.5" />,
    },
  };

  const config = configs[status] || configs.PENDING;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs font-medium px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-medium px-3.5 py-1.5 gap-2',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${config.bg} ${config.text} ${config.border} ${sizeClasses[size]}`}
    >
      {showIcon && config.icon}
      <span>{config.label}</span>
    </span>
  );
};
