import React, { useCallback, useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PlayCircle, CheckCircle2, Phone, ArrowLeft, Navigation } from 'lucide-react';
import ProviderPortalNav from '../../components/provider/ProviderPortalNav';
import Footer from '../../components/common/Footer';
import StatusBadge from '../../components/common/StatusBadge';
import StatusTimeline from '../../components/booking/StatusTimeline';
import { bookingApi } from '../../api/bookingApi';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { useTrackingSocket } from '../../hooks/useTrackingSocket';

export default function ActiveServicePage() {
  const { uniqueId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trackingError, setTrackingError] = useState('');
  const watchIdRef = useRef(null);

  const { showToast } = useNotification();
  const { token } = useAuth();
  const onLocation = useCallback(() => {}, []);
  const { connectionState, sendLocation } = useTrackingSocket({
    bookingUniqueId: booking?.bookingUniqueId || uniqueId,
    token,
    onLocation,
    enabled: booking?.status === 'PROVIDER_EN_ROUTE'
  });

  useEffect(() => () => {
    if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current);
  }, []);

  useEffect(() => {
    if (booking?.status !== 'PROVIDER_EN_ROUTE') return undefined;
    if (!navigator.geolocation) {
      setTrackingError('This browser does not support location sharing.');
      return undefined;
    }
    setTrackingError('');
    watchIdRef.current = navigator.geolocation.watchPosition(
      ({ coords, timestamp }) => {
        const sent = sendLocation({
          latitude: coords.latitude,
          longitude: coords.longitude,
          heading: coords.heading,
          speed: coords.speed,
          recordedAt: new Date(timestamp).toISOString()
        });
        if (!sent) setTrackingError('Waiting for the live connection before sending location.');
      },
      (error) => setTrackingError(error.code === error.PERMISSION_DENIED
        ? 'Location permission is required while travelling.'
        : 'Unable to read your current location.'),
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 }
    );
    return () => {
      if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    };
  }, [booking?.status, sendLocation]);

  const fetchActiveBooking = useCallback(() => {
    bookingApi.getBookingById(uniqueId).then(data => {
      setBooking(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [uniqueId]);

  useEffect(() => {
    if (uniqueId) fetchActiveBooking();
    else setLoading(false);
  }, [fetchActiveBooking, uniqueId]);

  const handleMarkEnRoute = async () => {
    try {
      const updated = await bookingApi.markEnRoute(booking.bookingUniqueId || uniqueId);
      setBooking({ ...updated });
      showToast('Status updated to Provider En-Route!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not update status', 'error');
    }
  };

  const handleStartService = async () => {
    try {
      const updated = await bookingApi.startBooking(booking.bookingUniqueId || uniqueId);
      setBooking({ ...updated });
      showToast('Service Started! Status updated to Service In Progress.', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not start service', 'error');
    }
  };

  const handleCompleteService = async () => {
    try {
      const updated = await bookingApi.completeBooking(booking.bookingUniqueId || uniqueId);
      setBooking({ ...updated });
      showToast('Service Marked Completed!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not complete service', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
        <ProviderPortalNav />
        <div className="container mx-auto px-4 py-20 text-center text-slate-500">Loading active service...</div>
        <Footer />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
        <ProviderPortalNav />
        <main className="container mx-auto px-4 py-20 flex-1 text-center space-y-4">
          <h1 className="text-2xl font-extrabold text-slate-900">Active booking not found</h1>
          <p className="text-sm text-slate-600">Select a booking from your dashboard to manage the service.</p>
          <Link to="/provider/dashboard" className="inline-flex px-5 py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm">Back to Dashboard</Link>
        </main>
        <Footer />
      </div>
    );
  }

  const isAccepted = booking.status === 'PROVIDER_ACCEPTED' || booking.status === 'CONFIRMED';
  const isEnRoute = booking.status === 'PROVIDER_EN_ROUTE';
  const isInProgress = booking.status === 'IN_PROGRESS';
  const isCompleted = booking.status === 'COMPLETED';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <ProviderPortalNav />

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
              <span className="block text-[10px] font-bold text-slate-400 uppercase">Total Job Amount</span>
              <span className="text-2xl font-extrabold text-cyan-300">₹{(booking.totalAmount || booking.totalPrice || 0).toFixed(2)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
              <span className="block font-bold text-slate-400 uppercase">Customer Details</span>
              <p className="font-bold text-white text-sm mt-1">{booking.recipientName || booking.customerName || 'Customer'}</p>
              {booking.recipientPhone || booking.customerPhone ? (
                <a href={`tel:${booking.recipientPhone || booking.customerPhone}`} className="text-cyan-400 font-bold hover:underline flex items-center gap-1 mt-1">
                  <Phone className="w-3.5 h-3.5" /> {booking.recipientPhone || booking.customerPhone}
                </a>
              ) : (
                <span className="text-slate-500 mt-1 block font-medium">Phone available upon request</span>
              )}
            </div>

            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
              <span className="block font-bold text-slate-400 uppercase">Destination Address</span>
              <p className="font-semibold text-slate-200 mt-1">{booking.addressLine1 || booking.customerAddress || 'Customer Address'}</p>
              {booking.distanceKm != null && (
                <span className="text-[11px] text-slate-400 mt-1 block font-medium">• {booking.distanceKm} km distance</span>
              )}
            </div>
          </div>

          {/* Action Button Workflow */}
          <div className="pt-2 space-y-3">
            {isAccepted && (
              <button
                onClick={handleMarkEnRoute}
                className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-base rounded-2xl shadow-xl transition flex items-center justify-center gap-2"
              >
                <Navigation className="w-5 h-5" /> Mark En Route (Travelling to Site)
              </button>
            )}

            {(isAccepted || isEnRoute) && (
              <button
                onClick={handleStartService}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-base rounded-2xl shadow-xl transition flex items-center justify-center gap-2"
              >
                <PlayCircle className="w-5 h-5" /> Start Service (Arrived On Site)
              </button>
            )}

            {isEnRoute && (
              <div className={`rounded-2xl border px-4 py-3 text-xs font-semibold ${
                connectionState === 'connected'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  : 'border-amber-200 bg-amber-50 text-amber-800'
              }`}>
                {connectionState === 'connected'
                  ? 'Live location sharing is active.'
                  : 'Connecting to live location sharing...'}
                {trackingError && <span className="block mt-1 font-normal">{trackingError}</span>}
              </div>
            )}

            {isInProgress && (
              <button
                onClick={handleCompleteService}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-base rounded-2xl shadow-xl transition flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" /> Complete Service & Collect ₹{(booking.totalAmount || booking.totalPrice || 0).toFixed(2)}
              </button>
            )}

            {isCompleted && (
              <div className="p-4 bg-emerald-950/60 rounded-2xl border border-emerald-500/30 text-center space-y-1">
                <span className="text-emerald-400 font-extrabold text-sm flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Service Completed
                </span>
                <p className="text-xs text-slate-400">Booking state finalized.</p>
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
