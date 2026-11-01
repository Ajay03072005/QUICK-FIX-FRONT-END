import React, { useState, useEffect } from 'react';
import { X, Printer, Download, CheckCircle2, ShieldCheck, MapPin, Calendar, CreditCard, Wrench } from 'lucide-react';
import { paymentApi } from '../../api/paymentApi';

export default function ReceiptModal({ bookingUniqueId, paymentUniqueId, onClose }) {
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReceiptData();
  }, [bookingUniqueId, paymentUniqueId]);

  const fetchReceiptData = async () => {
    try {
      let data;
      if (paymentUniqueId) {
        data = await paymentApi.getPaymentDetails(paymentUniqueId);
      } else if (bookingUniqueId) {
        data = await paymentApi.getBookingPayment(bookingUniqueId);
      }
      setReceipt(data);
    } catch (err) {
      console.error('Failed to load receipt:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl text-center font-bold text-slate-600">
          Generating verified receipt...
        </div>
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-3xl max-w-sm w-full text-center space-y-4">
          <p className="text-sm font-bold text-slate-700">Receipt unavailable or payment pending.</p>
          <button onClick={onClose} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold">
            Close
          </button>
        </div>
      </div>
    );
  }

  const servicePrice = receipt.servicePrice || (receipt.amount ? receipt.amount * 0.8 : 0);
  const distanceCharge = receipt.distanceCharge || (receipt.amount ? receipt.amount * 0.2 : 0);
  const totalAmount = receipt.totalAmount || receipt.amount || 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative print:shadow-none print:border-none print:w-full">
        {/* Actions header - hidden when printing */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-100 print:hidden">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h2 className="font-extrabold text-slate-900 text-base">Verified Payment Receipt</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" /> Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Receipt Content */}
        <div className="pt-6 space-y-6">
          {/* Header Branding */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-xl font-black text-indigo-600 tracking-tight">QUICK-FIX</h1>
              <p className="text-[11px] font-bold text-slate-400">On-Demand Local Services Platform</p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" /> PAID & CONFIRMED
              </span>
              <p className="text-[10px] text-slate-400 mt-1 font-mono">Ref: {receipt.uniqueId || 'PAY-REF'}</p>
            </div>
          </div>

          {/* Details Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 font-bold block text-[10px] uppercase">Booking Reference</span>
              <span className="font-extrabold text-slate-900 font-mono">{receipt.bookingUniqueId}</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold block text-[10px] uppercase">Razorpay Payment ID</span>
              <span className="font-extrabold text-slate-900 font-mono">{receipt.razorpayPaymentId || 'pay_verified'}</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold block text-[10px] uppercase">Date & Time</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                <Calendar className="w-3 h-3 text-slate-400" />
                {receipt.paidAt ? new Date(receipt.paidAt).toLocaleString() : new Date().toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-bold block text-[10px] uppercase">Payment Method</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                <CreditCard className="w-3 h-3 text-slate-400" />
                {receipt.paymentMethod || 'Razorpay Online'}
              </span>
            </div>
          </div>

          {/* Customer & Service Info */}
          <div className="space-y-2 text-xs border-b border-slate-100 pb-4">
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Customer:</span>
              <span className="font-bold text-slate-900">{receipt.customerName || 'Quick-Fix Customer'}</span>
            </div>
            {receipt.providerName && (
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Assigned Provider:</span>
                <span className="font-bold text-slate-900 flex items-center gap-1">
                  <Wrench className="w-3 h-3 text-indigo-500" /> {receipt.providerName}
                </span>
              </div>
            )}
            {receipt.serviceAddress && (
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Service Address:</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-indigo-500" /> {receipt.serviceAddress}
                </span>
              </div>
            )}
          </div>

          {/* Line Items Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Itemized Breakdown</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-700 font-medium">{receipt.serviceName || 'Home Service'} - Base Fee</span>
                <span className="font-bold text-slate-900">₹{servicePrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-700 font-medium">Doorstep Conveyance & Distance Fee</span>
                <span className="font-bold text-slate-900">₹{distanceCharge.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 text-sm font-black text-slate-900">
                <span>Total Amount Paid</span>
                <span className="text-indigo-600 text-lg">₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="pt-4 border-t border-slate-100 text-[10px] text-slate-400 text-center space-y-1">
            <p>Thank you for choosing Quick-Fix! For support, contact support@quickfix.local</p>
            <p className="font-mono">Order ID: {receipt.razorpayOrderId || 'order_ref'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
