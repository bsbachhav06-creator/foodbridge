import React from 'react';
import { DonationStatus, PickupStatus, ClaimStatus, VerificationStatus } from '../types';

interface StatusBadgeProps {
  status: DonationStatus | PickupStatus | ClaimStatus | VerificationStatus | string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  let color = 'bg-slate-100 text-slate-700 border-slate-200';
  let label = status.replace(/_/g, ' ');

  switch (status) {
    case 'AVAILABLE':
      color = 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold';
      break;
    case 'CLAIMED':
      color = 'bg-sky-50 text-sky-700 border-sky-200 font-semibold';
      break;
    case 'VOLUNTEER_ASSIGNED':
      color = 'bg-indigo-50 text-indigo-700 border-indigo-200 font-semibold';
      break;
    case 'ACCEPTED':
      color = 'bg-indigo-50 text-indigo-700 border-indigo-200 font-semibold';
      break;
    case 'PICKED_UP':
      color = 'bg-amber-50 text-amber-700 border-amber-200 font-semibold';
      break;
    case 'DELIVERED':
    case 'COMPLETED':
    case 'VERIFIED':
      color = 'bg-green-100 text-green-800 border-green-300 font-bold';
      break;
    case 'EXPIRED':
      color = 'bg-slate-100 text-slate-600 border-slate-300';
      break;
    case 'CANCELLED':
    case 'REJECTED':
      color = 'bg-rose-50 text-rose-700 border-rose-200 font-semibold';
      break;
    case 'PENDING':
      color = 'bg-amber-50 text-amber-700 border-amber-200';
      break;
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border tracking-wide uppercase ${color} ${className}`}
    >
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current opacity-70"></span>
      {label}
    </span>
  );
};
