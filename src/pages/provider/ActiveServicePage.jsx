import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PlayCircle, CheckCircle2, Phone, MapPin, ArrowLeft } from 'lucide-react';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import StatusBadge from '../../components/common/StatusBadge';
import StatusTimeline from '../../components/booking/StatusTimeline';
import { bookingApi } from '../../api/bookingApi';
import { useNotification } from '../../context/NotificationContext';

export default function ActiveServicePage() {
  const { uniqueId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  const { showToast } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    fetchActiveBooking();
  }, [uniqueId]);

  const fetchActiveBooking = () => {
    const id = uniqueId || '1';
    bookingApi.getBookingById(id).then(data => {
      setBooking(data);
      setLoading(false);
    });
  };

  const handleStartService = async () => {
    const updated = await bookingApi.startBooking(booking.bookingUniqueId || uniqueId);
    setBooking({ ...updated });
    showToast('Service Started! Status updated to Service In Progress.', 'success');
  };

  const handleCompleteService = async () => {
    const updated = await bookingApi.completeBooking(booking.bookingUniqueId || uniqueId);
    setBooking({ ...updated });
    showToast('Service Marked Completed! Invoice generated.', 'success');
  };

  if (loading || !booking) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">Loading active service...</div>
        <Footer />
      </div>
    );
  }

  const isAccepted = booking.status === 'PROVIDER_ACCEPTED' || booking.status === 'CONFIRMED';
  const isInProgress = booking.status === 'IN_PROGRESS';
  const isCompleted = booking.status === 'COMPLETED';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Header />

      <main className="container mx-auto px-4 lg:px-8 py-8 flex-1 space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <Link to="/provider/dashboard" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <StatusBadge status={booking.status} />
        </div>

        {/* Hero Active Card */}
        <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Active Customer Service</span>
              <h1 className="text-2xl font-extrabold text-white mt-0.5">{booking.serviceName || 'Home Service'}</h1>
              <p className="text-xs text-slate-400">Booking ID: {booking.bookingUniqueId || uniqueId}</p>
            </div>

            <div className="text-right">
              <span className="block text-[10px] font-bold text-slate-400 uppercase">Estimated Job Amount</span>
              <span className="text-2xl font-extrabold text-cyan-300">₹{booking.totalAmount || booking.totalPrice || 400}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
              <span className="block font-bold text-slate-400 uppercase">Customer Details</span>
              <p className="font-bold text-white text-sm mt-1">{booking.recipientName || booking.customerName || 'Customer'}</p>
              <a href={`tel:${booking.recipientPhone || booking.customerPhone}`} className="text-cyan-400 font-bold hover:underline flex items-center gap-1 mt-1">
                <Phone className="w-3.5 h-3.5" /> {booking.recipientPhone || booking.customerPhone || '+91 98401 23456'}
              </a>
            </div>

            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
              <span className="block font-bold text-slate-400 uppercase">Destination Address</span>
              <p className="font-semibold text-slate-200 mt-1">{booking.addressLine1 || booking.customerAddress || 'Coimbatore'}</p>
              <span className="text-[11px] text-slate-400 mt-1 block font-medium">• {booking.distance || 1.2} km distance</span>
            </div>
          </div>

          {/* Action Button Workflow */}
          <div className="pt-2">
            {isAccepted && (
              <button
                onClick={handleStartService}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-base rounded-2xl shadow-xl transition flex items-center justify-center gap-2"
              >
                <PlayCircle className="w-5 h-5" /> Start Service (Arrived On Site)
              </button>
            )}

            {isInProgress && (
              <button
                onClick={handleCompleteService}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-base rounded-2xl shadow-xl transition flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" /> Complete Service & Collect ₹{booking.totalAmount || booking.totalPrice}
              </button>
            )}

            {isCompleted && (
              <div className="p-4 bg-emerald-950/60 rounded-2xl border border-emerald-500/30 text-center space-y-1">
                <span className="text-emerald-400 font-extrabold text-sm flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Service Finished & Invoice Completed
                </span>
                <p className="text-xs text-slate-400">Payment received via cash/UPI.</p>
              </div>
            )}
          </div>
        </div>

        {/* Live Timeline */}
        <div className="space-y-6">
          <StatusTimeline currentStatus={booking.status} history={booking.statusHistory || []} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
