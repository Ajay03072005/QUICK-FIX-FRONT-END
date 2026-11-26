import React from 'react';
import { Clock, CheckCircle2, AlertTriangle, XCircle, PlayCircle } from 'lucide-react';

export default function StatusBadge({ status }) {
  let bg = 'bg-slate-100 text-slate-700 border-slate-200';
  let icon = <Clock className="w-3.5 h-3.5" />;
  let label = status;

  switch (status) {
    case 'BOOKING_CREATED':
    case 'PENDING':
      bg = 'bg-slate-100 text-slate-800 border-slate-300 font-medium';
      label = status === 'PENDING' ? 'Pending' : 'Booking Created';
      break;
    case 'PROVIDER_SELECTED':
      bg = 'bg-slate-900 text-emerald-300 border-slate-800 font-semibold';
      label = 'Provider Selected';
      break;
    case 'WAITING_ACCEPTANCE':
    case 'WAITING_FOR_PROVIDER':
      bg = 'bg-amber-50 text-amber-700 border-amber-200';
      icon = <Clock className="w-3.5 h-3.5 animate-pulse" />;
      label = 'Waiting for Provider Response';
      break;
    case 'PROVIDER_ACCEPTED':
    case 'ACCEPTED':
    case 'CONFIRMED':
      bg = 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold';
      icon = <CheckCircle2 className="w-3.5 h-3.5" />;
      label = status === 'CONFIRMED' ? 'Confirmed' : 'Provider Accepted';
      break;
    case 'PROVIDER_EN_ROUTE':
      bg = 'bg-teal-50 text-teal-800 border-teal-200 font-semibold';
      icon = <PlayCircle className="w-3.5 h-3.5" />;
      label = 'Provider En Route';
      break;
    case 'IN_PROGRESS':
    case 'SERVICE_STARTED':
      bg = 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold';
      icon = <PlayCircle className="w-3.5 h-3.5 animate-spin" />;
      label = 'Service In Progress';
      break;
    case 'COMPLETED':
      bg = 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold';
      icon = <CheckCircle2 className="w-3.5 h-3.5" />;
      label = 'Service Completed';
      break;
    case 'CANCELLED':
    case 'REJECTED':
    case 'CUSTOMER_CANCELLED':
    case 'PROVIDER_CANCELLED':
    case 'PROVIDER_REJECTED':
      bg = 'bg-rose-50 text-rose-700 border-rose-200';
      icon = <XCircle className="w-3.5 h-3.5" />;
      label = status === 'CUSTOMER_CANCELLED' ? 'Cancelled by You' : status === 'PROVIDER_REJECTED' ? 'Request Declined' : 'Cancelled';
      break;
    default:
      break;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border ${bg}`}>
      {icon}
      {label}
    </span>
  );
}
