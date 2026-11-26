import React from 'react';
import { Tag, MapPin, Info, ShieldCheck } from 'lucide-react';

export default function PriceBreakdown({
  serviceCharge,
  distanceKm,
  distanceCharge,
  totalPrice
}) {
  const amount = value => Number.isFinite(Number(value)) ? value : '—';

  return (
    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3">
      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Payment & Fare Estimate</h4>

      <div className="space-y-2 text-sm text-slate-600">
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-1.5">
            <Tag className="w-4 h-4 text-slate-400" /> Service Charge
          </span>
          <span className="font-semibold text-slate-800">₹{amount(serviceCharge)}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-slate-400" /> Distance Charge ({distanceKm} km)
          </span>
          <span className="font-semibold text-slate-800">₹{amount(distanceCharge)}</span>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
        <div>
          <span className="block text-xs font-bold text-slate-400 uppercase">Estimated Total</span>
          <span className="text-xl font-extrabold text-emerald-700">₹{amount(totalPrice)}</span>
        </div>
        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg border border-emerald-200 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" /> Transparent Pricing
        </span>
      </div>
      <p className="text-[11px] text-slate-500 italic pt-1">
        * No upfront payment required. Pay directly after service completion via Cash or UPI.
      </p>
    </div>
  );
}
