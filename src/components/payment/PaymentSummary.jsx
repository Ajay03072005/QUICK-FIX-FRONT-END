import React from 'react';
import { ShieldCheck, MapPin, User, Tag, Receipt } from 'lucide-react';

export default function PaymentSummary({ booking }) {
  if (!booking) return null;

  const servicePrice = booking.servicePrice || booking.serviceCharge || 0;
  const distanceCharge = booking.distanceCharge || 0;
  const totalAmount = booking.totalAmount || booking.totalPrice || (servicePrice + distanceCharge);
  const distanceKm = booking.distanceKm || booking.distance || 0;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">Payment Summary</h3>
            <p className="text-xs text-slate-500">Trusted server-calculated bill</p>
          </div>
        </div>
        <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-xl">
          ID: {booking.bookingUniqueId || booking.uniqueId}
        </span>
      </div>

      {/* Service & Provider Info */}
      <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-500 font-medium flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-indigo-500" /> Service Requested
          </span>
          <span className="font-bold text-slate-900">{booking.serviceName || 'Home Service'}</span>
        </div>
        
        {booking.providerName && (
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-medium flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-500" /> Service Provider
            </span>
            <span className="font-bold text-slate-900">{booking.providerName}</span>
          </div>
        )}

        {booking.customerAddress && (
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-medium flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-indigo-500" /> Location ({distanceKm} km)
            </span>
            <span className="font-semibold text-slate-700 truncate max-w-[200px]">
              {booking.customerAddress}
            </span>
          </div>
        )}
      </div>

      {/* Price Breakdown Table */}
      <div className="space-y-2.5 text-sm">
        <div className="flex justify-between text-slate-600">
          <span>Service Base Charge</span>
          <span className="font-semibold text-slate-900">₹{servicePrice.toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-slate-600">
          <span className="flex items-center gap-1">
            Distance Travel Fee ({distanceKm} km)
          </span>
          <span className="font-semibold text-slate-900">₹{distanceCharge.toFixed(2)}</span>
        </div>

        <div className="pt-3 border-t border-dashed border-slate-200 flex justify-between items-baseline">
          <div>
            <span className="font-extrabold text-slate-900 text-lg">Total Amount</span>
            <p className="text-[11px] text-slate-400 font-medium">Inclusive of all taxes & doorstep delivery</p>
          </div>
          <span className="text-2xl font-black text-indigo-600">₹{totalAmount.toFixed(2)}</span>
        </div>
      </div>

      {/* Security badge */}
      <div className="flex items-center gap-2 p-3 bg-emerald-50/80 rounded-2xl border border-emerald-100 text-emerald-800 text-xs">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>Payments are 256-bit encrypted & verified server-side with Razorpay.</span>
      </div>
    </div>
  );
}
