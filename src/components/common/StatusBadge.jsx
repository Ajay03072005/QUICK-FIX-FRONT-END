import React from 'react';
import { Clock, CheckCircle2, AlertTriangle, XCircle, PlayCircle } from 'lucide-react';

export default function StatusBadge({ status }) {
  let bg = 'bg-slate-100 text-slate-700 border-slate-200';
  let icon = <Clock className="w-3.5 h-3.5" />;
  let label = status;

  switch (status) {
    case 'BOOKING_CREATED':
    case 'PENDING':
      bg = 'bg-blue-50 text-blue-700 border-blue-200';
      label = status === 'PENDING' ? 'Pending' : 'Booking Created';
      break;
    case 'PROVIDER_SELECTED':
      bg = 'bg-indigo-50 text-indigo-700 border-indigo-200';
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
      bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      icon = <CheckCircle2 className="w-3.5 h-3.5" />;
      label = status === 'CONFIRMED' ? 'Confirmed' : 'Provider Accepted';
      break;
    case 'PROVIDER_EN_ROUTE':
      bg = 'bg-cyan-50 text-cyan-700 border-cyan-200';
      icon = <PlayCircle className="w-3.5 h-3.5" />;
      label = 'Provider En Route';
      break;
    case 'IN_PROGRESS':
    case 'SERVICE_STARTED':
      bg = 'bg-cyan-50 text-cyan-700 border-cyan-200';
      icon = <PlayCircle className="w-3.5 h-3.5 animate-spin" />;
      label = 'Service In Progress';
      break;
    case 'COMPLETED':
      bg = 'bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold';
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
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${bg}`}>
      {icon}
      {label}
    </span>
  );
}
