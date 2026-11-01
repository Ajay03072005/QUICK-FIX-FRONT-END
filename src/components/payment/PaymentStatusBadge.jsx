import React from 'react';
import { CheckCircle2, Clock, XCircle, RefreshCw, AlertCircle } from 'lucide-react';

export default function PaymentStatusBadge({ status }) {
  const normalizedStatus = (status || 'PENDING').toUpperCase();

  const statusConfig = {
    SUCCESS: {
      label: 'Paid',
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: CheckCircle2,
      dot: 'bg-emerald-500'
    },
    PAID: {
      label: 'Paid',
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: CheckCircle2,
      dot: 'bg-emerald-500'
    },
    PENDING: {
      label: 'Payment Pending',
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: Clock,
      dot: 'bg-amber-500'
    },
    CREATED: {
      label: 'Order Created',
      bg: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: Clock,
      dot: 'bg-blue-500'
    },
    FAILED: {
      label: 'Payment Failed',
      bg: 'bg-rose-50 text-rose-700 border-rose-200',
      icon: XCircle,
      dot: 'bg-rose-500'
    },
    REFUNDED: {
      label: 'Refunded',
      bg: 'bg-purple-50 text-purple-700 border-purple-200',
      icon: RefreshCw,
      dot: 'bg-purple-500'
    },
    REFUND_PENDING: {
      label: 'Refund Processing',
      bg: 'bg-purple-50 text-purple-700 border-purple-200',
      icon: AlertCircle,
      dot: 'bg-purple-400'
    }
  };

  const config = statusConfig[normalizedStatus] || statusConfig.PENDING;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-2xs ${config.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse`} />
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
}
