import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import StatusBadge from '../../components/common/StatusBadge';

export default function BookingConfirmationPage() {
  const location = useLocation();
  const booking = location.state?.booking || {
    uniqueId: 'BKG001',
    serviceName: 'AC Servicing & Jet Wash',
    providerName: 'Kumar AC & Electrical Services',
    bookingDate: '2026-09-20',
    bookingTime: '10:30 AM',
    customerAddress: 'Coimbatore',
    totalPrice: 400,
    totalAmount: 400,
    status: 'PENDING'
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Header />

      <main className="container mx-auto px-4 lg:px-8 py-12 flex-1 max-w-2xl text-center space-y-6">
        
        {/* Success Icon */}
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xl ring-8 ring-emerald-50">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Request Submitted</span>
          <h1 className="text-3xl font-extrabold text-slate-900">✓ Booking Request Sent</h1>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Your request has been successfully saved to the backend database.
          </p>
        </div>

        {/* Booking Card summary */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-md text-left space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase">Booking Reference</span>
              <span className="text-lg font-extrabold text-indigo-600">{booking.uniqueId || booking.bookingUniqueId}</span>
            </div>
            <StatusBadge status={booking.status || 'PENDING'} />
          </div>

          <div className="space-y-3 text-xs text-slate-700">
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500">Scheduled Date & Time:</span>
              <span className="font-bold text-slate-900">{booking.bookingDate} at {booking.bookingTime}</span>
            </div>

            <div className="flex justify-between items-center py-1 pt-2 border-t border-slate-100">
              <span className="text-slate-500 font-bold uppercase">Estimated Amount:</span>
              <span className="text-base font-extrabold text-indigo-600">₹{booking.totalAmount || booking.totalPrice || 400}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            to={`/customer/bookings/${booking.uniqueId || booking.bookingUniqueId}/track`}
            className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center gap-2"
          >
            Track Booking Status <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/customer/bookings"
            className="px-6 py-3.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-sm rounded-xl transition"
          >
            View My Bookings
          </Link>
        </div>

      </main>

      <Footer />
    </div>
  );
}
