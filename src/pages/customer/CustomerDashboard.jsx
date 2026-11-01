import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, Clock, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import StatusBadge from '../../components/common/StatusBadge';
import StarRating from '../../components/common/StarRating';
import { useAuth } from '../../context/AuthContext';
import { serviceApi } from '../../api/serviceApi';
import { bookingApi } from '../../api/bookingApi';
import { customerApi } from '../../api/customerApi';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [recentBookings, setRecentBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [addressCount, setAddressCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    serviceApi.getAllServices().then(setServices);
    if (!user?.customerUniqueId) return;
    bookingApi.getCustomerBookings(user.customerUniqueId).then(bookings => {
      setRecentBookings(bookings);
    }).catch(() => setRecentBookings([]));
    customerApi.getSavedAddresses(user.customerUniqueId).then(addresses => setAddressCount(addresses.length));
  }, [user?.customerUniqueId]);

  const activeStatuses = ['PENDING', 'PROVIDER_SELECTED', 'WAITING_FOR_PROVIDER', 'WAITING_ACCEPTANCE', 'PROVIDER_ACCEPTED', 'CONFIRMED', 'ACCEPTED', 'PROVIDER_EN_ROUTE', 'IN_PROGRESS', 'SERVICE_STARTED'];
  const activeBookings = recentBookings.filter((booking) => activeStatuses.includes(String(booking.status || '').toUpperCase()));
  const activeBooking = [...activeBookings].sort((a, b) => {
    const first = new Date(`${a.bookingDate || ''}T${a.bookingTime || '23:59:59'}`).getTime();
    const second = new Date(`${b.bookingDate || ''}T${b.bookingTime || '23:59:59'}`).getTime();
    return first - second;
  })[0] || null;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm) {
      navigate(`/find-nearby?query=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Header />

      <main className="container mx-auto px-4 lg:px-8 py-8 flex-1 space-y-8">
        
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-950 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
          <div className="max-w-2xl space-y-4 relative z-10">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Good morning, {user?.name?.split(' ')[0] || 'Customer'} 👋
            </h1>
            <p className="text-slate-300 text-sm">What service do you need today?</p>

            <form onSubmit={handleSearchSubmit} className="relative pt-2">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search AC Repair, Switchboard wiring, Plumber..."
                className="w-full pl-12 pr-28 py-3.5 bg-white text-slate-900 rounded-2xl text-sm font-semibold focus:outline-none shadow-lg"
              />
              <button
                type="submit"
                className="absolute right-2 top-3 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition"
              >
                Search
              </button>
            </form>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Active Bookings</span>
              <span className="text-3xl font-extrabold text-indigo-600">{activeBookings.length}</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Completed Jobs</span>
              <span className="text-3xl font-extrabold text-emerald-600">
                {recentBookings.filter(b => b.status === 'COMPLETED').length}
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Saved Addresses</span>
                <span className="text-3xl font-extrabold text-slate-800">{addressCount}</span>
            </div>
          </div>
        </div>

        <Link to="/customer/profile" className="flex flex-col gap-3 rounded-2xl border border-indigo-100 bg-white p-5 shadow-xs transition hover:border-indigo-200 hover:shadow-md sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-extrabold text-slate-900">Your profile & account</h2>
            <p className="mt-1 text-sm text-slate-500">View your details, service activity, saved locations and preferences.</p>
          </div>
          <span className="shrink-0 rounded-xl bg-indigo-50 px-4 py-2.5 text-sm font-bold text-indigo-700">Open profile <ArrowRight className="ml-1 inline h-4 w-4" /></span>
        </Link>

        {/* Active Booking Widget */}
        {activeBooking && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-indigo-100 ring-1 ring-indigo-500/10 shadow-md space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Upcoming Booking</span>
                <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">{activeBooking.serviceName || 'Home Service'}</h2>
              </div>
              <StatusBadge status={activeBooking.status} />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <h3 className="font-bold text-slate-900 text-base">{activeBooking.providerName || 'Quick-Fix Provider'}</h3>
                <p className="text-xs text-slate-600 mt-1 font-medium">{activeBooking.bookingDate} at {activeBooking.bookingTime}</p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  to={`/customer/bookings/${activeBooking.bookingUniqueId}/track`}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center gap-2"
                >
                  Track Booking <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}
        {!activeBooking && (
          <div className="flex flex-col gap-4 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">No active bookings</p>
              <h2 className="mt-1 text-lg font-extrabold text-slate-900">Ready to book a home service?</h2>
              <p className="mt-1 text-sm text-slate-500">Your active and upcoming appointments will appear here.</p>
            </div>
            <Link to="/services" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-700">Browse services <ArrowRight className="h-4 w-4" /></Link>
          </div>
        )}

        {/* Recommended Services Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-slate-900">Services from DB</h2>
            <Link to="/services" className="text-xs font-bold text-indigo-600 hover:underline">View All</Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((srv) => (
              <div key={srv.uniqueId} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3">
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 uppercase">{srv.categoryName}</span>
                  <h3 className="font-bold text-slate-900 text-sm mt-1">{srv.name}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">{srv.shortDescription}</p>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 text-base">₹{srv.startingPrice}</span>
                  <Link to={`/services/${srv.uniqueId}`} className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-lg transition">
                    Book
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
