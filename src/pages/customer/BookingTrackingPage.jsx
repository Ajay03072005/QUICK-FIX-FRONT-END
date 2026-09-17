import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Phone, MapPin, ArrowLeft, RefreshCw } from 'lucide-react';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import StatusTimeline from '../../components/booking/StatusTimeline';
import StatusBadge from '../../components/common/StatusBadge';
import LeafletMapComponent from '../../components/map/LeafletMapComponent';
import { bookingApi } from '../../api/bookingApi';
import { useNotification } from '../../context/NotificationContext';

export default function BookingTrackingPage() {
  const { uniqueId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [changingProvider, setChangingProvider] = useState(false);
  const [providers, setProviders] = useState([]);
  const [updating, setUpdating] = useState(false);
  const { showToast } = useNotification();

  useEffect(() => {
    fetchBookingDetails();
  }, [uniqueId]);

  const fetchBookingDetails = () => {
    bookingApi.getBookingById(uniqueId).then(data => {
      setBooking(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  const canModifyProvider = ['PENDING', 'PROVIDER_SELECTED', 'WAITING_FOR_PROVIDER'].includes(booking?.status);

  const handleCancelBooking = async () => {
    if (!window.confirm('Cancel this booking request?')) return;
    setUpdating(true);
    try {
      const updated = await bookingApi.cancelBooking(booking.bookingUniqueId);
      setBooking(updated);
      showToast('Booking request cancelled.', 'success');
    } catch {
      showToast('This booking can no longer be cancelled.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleOpenProviderChange = async () => {
    setUpdating(true);
    try {
      setProviders(await bookingApi.findNearbyProvidersForBooking(booking.bookingUniqueId));
      setChangingProvider(true);
    } catch {
      showToast('Unable to load nearby providers.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleChangeProvider = async (providerUniqueId) => {
    setUpdating(true);
    try {
      const updated = await bookingApi.selectProviderForBooking(booking.bookingUniqueId, providerUniqueId);
      setBooking(updated);
      setChangingProvider(false);
      showToast('Provider changed. Your new provider will review the request.', 'success');
    } catch {
      showToast('Provider could not be changed after acceptance.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  if (loading || !booking) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">Loading booking details...</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Header />

      <main className="container mx-auto px-4 lg:px-8 py-8 flex-1 space-y-6">
        <div className="flex items-center justify-between">
          <Link to="/customer/bookings" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition">
            <ArrowLeft className="w-4 h-4" /> Back to My Bookings
          </Link>
          <button
            onClick={fetchBookingDetails}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Status
          </button>
        </div>

        {/* Top Header Card */}
        <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Live Tracker</span>
              <StatusBadge status={booking.status} />
            </div>
            <h1 className="text-2xl font-extrabold text-white mt-1">{booking.serviceName || 'Home Service'}</h1>
            <p className="text-xs text-slate-400 mt-0.5">Booking ID: {booking.bookingUniqueId || uniqueId}</p>
          </div>

          <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 flex items-center gap-4">
            <img
              src={booking.providerAvatar || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150'}
              alt={booking.providerName || 'Provider'}
              className="w-12 h-12 rounded-xl object-cover border border-slate-600"
            />
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase">Assigned Provider</span>
              <h4 className="font-bold text-white text-sm">{booking.providerName || 'Quick-Fix Partner'}</h4>
              <a
                href={`tel:${booking.providerPhone || '+919876543210'}`}
                className="text-xs text-cyan-400 font-bold hover:underline flex items-center gap-1 mt-0.5"
              >
                <Phone className="w-3 h-3" /> {booking.providerPhone || '+91 98765 43210'}
              </a>
            </div>
          </div>
        </div>

        {canModifyProvider && (
          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:flex sm:items-center sm:justify-between sm:gap-6">
            <div>
              <h2 className="text-sm font-extrabold text-amber-950">Waiting for provider acceptance</h2>
              <p className="mt-1 text-xs text-amber-800">You may change the selected provider or cancel this request until a provider accepts it.</p>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 sm:mt-0">
              <button onClick={handleOpenProviderChange} disabled={updating} className="rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-indigo-700 shadow-sm ring-1 ring-inset ring-indigo-200 hover:bg-indigo-50">
                Change Provider
              </button>
              <button onClick={handleCancelBooking} disabled={updating} className="rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-rose-700">
                Cancel Booking
              </button>
            </div>
          </section>
        )}

        {changingProvider && (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div><h2 className="font-extrabold text-slate-900">Choose a new provider</h2><p className="text-xs text-slate-500">Only available before acceptance.</p></div>
              <button onClick={() => setChangingProvider(false)} className="text-xs font-bold text-slate-500 hover:text-slate-900">Close</button>
            </div>
            {providers.length === 0 ? <p className="text-sm text-slate-500">No alternative providers are available nearby.</p> : (
              <div className="grid gap-3 sm:grid-cols-2">
                {providers.map((provider) => (
                  <button key={provider.providerUniqueId} disabled={updating} onClick={() => handleChangeProvider(provider.providerUniqueId)} className="rounded-2xl border border-slate-200 p-4 text-left hover:border-indigo-300 hover:bg-indigo-50">
                    <span className="block font-bold text-slate-900">{provider.providerName}</span>
                    <span className="mt-1 block text-xs text-slate-500">{provider.distance} km away · ₹{provider.totalAmount}</span>
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Split Grid: Status Timeline + Live Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-6">
            <StatusTimeline currentStatus={booking.status} history={booking.statusHistory || []} />
          </div>

          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between px-2">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-indigo-600" /> Service Location Map
                </h3>
                <span className="text-xs text-indigo-600 font-bold">{booking.distanceKm || 1.2} km distance</span>
              </div>

              <LeafletMapComponent
                customerLocation={{
                  lat: booking.latitude || 11.0125,
                  lng: booking.longitude || 76.9515,
                  name: booking.customerAddress || 'Coimbatore'
                }}
                providers={[]}
                height="400px"
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
