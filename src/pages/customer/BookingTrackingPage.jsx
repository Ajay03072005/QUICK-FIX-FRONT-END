import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Phone, MapPin, ArrowLeft, RefreshCw } from 'lucide-react';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import StatusTimeline from '../../components/booking/StatusTimeline';
import StatusBadge from '../../components/common/StatusBadge';
import LeafletMapComponent from '../../components/map/LeafletMapComponent';
import { bookingApi } from '../../api/bookingApi';

export default function BookingTrackingPage() {
  const { uniqueId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookingDetails();
  }, [uniqueId]);

  const fetchBookingDetails = () => {
    bookingApi.getBookingById(uniqueId).then(data => {
      setBooking(data);
      setLoading(false);
    });
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
