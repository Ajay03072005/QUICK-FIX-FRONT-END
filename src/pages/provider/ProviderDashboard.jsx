import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Wrench, CheckCircle2, Clock, DollarSign, ArrowRight, ShieldCheck, MapPin, User, AlertCircle, PlayCircle, ToggleLeft, ToggleRight
} from 'lucide-react';
import ProviderPortalNav from '../../components/provider/ProviderPortalNav';
import Footer from '../../components/common/Footer';
import StatusBadge from '../../components/common/StatusBadge';
import { providerApi } from '../../api/providerApi';
import { bookingApi } from '../../api/bookingApi';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

export default function ProviderDashboard() {
  const { user } = useAuth();
  const [isAvailable, setIsAvailable] = useState(user?.availability === 'AVAILABLE_NOW');
  const [stats, setStats] = useState({ todaysJobs: 0, pendingRequests: 0, completedJobs: 0, todaysEarnings: 0 });
  const [requests, setRequests] = useState([]);
  const [activeJob, setActiveJob] = useState(null);

  const { showToast } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.providerUniqueId) return;
    setIsAvailable(user.availability === 'AVAILABLE_NOW');
    providerApi.getProviderDashboardStats(user.providerUniqueId).then(setStats);
    bookingApi.getProviderBookings(user.providerUniqueId).then(bookings => {
      setRequests(bookings.filter(b => b.status === 'WAITING_ACCEPTANCE'));
      const active = bookings.find(b => b.status === 'PROVIDER_ACCEPTED' || b.status === 'IN_PROGRESS');
      setActiveJob(active || bookings[0]);
    });
  }, []);

  const toggleAvailability = () => {
    const nextState = !isAvailable;
    setIsAvailable(nextState);
    providerApi.updateAvailability(user.providerUniqueId || user.id, nextState ? 'AVAILABLE_NOW' : 'OFFLINE');
    showToast(`Your status is now ${nextState ? 'ONLINE & Available' : 'OFFLINE'}`, nextState ? 'success' : 'info');
  };

  const handleAcceptRequest = async (reqId) => {
    await bookingApi.acceptBooking(reqId);
    showToast('Booking request accepted! Customer has been notified.', 'success');
    navigate(`/provider/active-service/${reqId}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <ProviderPortalNav />

      <main className="container mx-auto px-4 lg:px-8 py-8 flex-1 space-y-8">
        
        {/* Top Header & Toggle Availability */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900">
                {user?.providerName || 'Kumar AC & Electrical Services'}
              </h1>
              <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
                ✓ Verified Partner
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Manage incoming service bookings and active customer jobs</p>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <span className="text-xs font-bold text-slate-700">
              Live Status: <strong className={isAvailable ? 'text-emerald-600' : 'text-slate-500'}>{isAvailable ? 'AVAILABLE NOW' : 'OFFLINE'}</strong>
            </span>
            <button
              onClick={toggleAvailability}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                isAvailable ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-300 text-slate-700'
              }`}
            >
              {isAvailable ? 'Online' : 'Go Online'}
            </button>
          </div>
        </div>

        {/* Provider KPI Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Today's Jobs</span>
            <span className="text-3xl font-extrabold text-slate-900">{stats.todaysJobs}</span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Requests</span>
            <span className="text-3xl font-extrabold text-amber-600">{stats.pendingRequests}</span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Completed Jobs</span>
            <span className="text-3xl font-extrabold text-emerald-600">{stats.completedJobs}</span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Today's Earnings</span>
            <span className="text-3xl font-extrabold text-indigo-600">₹{stats.todaysEarnings.toLocaleString()}</span>
          </div>
        </div>

        {/* Active Service Banner */}
        {activeJob && (
          <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-xs font-bold border border-cyan-400/30">
                ⚡ Active Job In Progress
              </span>
              <h2 className="text-2xl font-extrabold text-white">{activeJob.serviceName}</h2>
              <p className="text-xs text-slate-300">
                Customer: <strong className="text-white">{activeJob.customerName}</strong> • {activeJob.customerAddress} ({activeJob.distanceKm} km away)
              </p>
            </div>

            <Link
              to={`/provider/active-service/${activeJob.bookingUniqueId}`}
              className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2 shrink-0"
            >
              Open Active Job Screen <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* New Booking Requests Stack */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">New Booking Requests</h2>
              <p className="text-xs text-slate-500">Respond to incoming customer job requests near you</p>
            </div>
            <Link to="/provider/booking-requests" className="text-xs font-bold text-indigo-600 hover:underline">View All</Link>
          </div>

          <div className="space-y-4">
            {requests.map((req) => (
              <div
                key={req.bookingUniqueId}
                className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-slate-900 text-base">{req.serviceName}</h3>
                    <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
                      New Request
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Customer: <strong className="text-slate-800">{req.customerName}</strong> • {req.distanceKm} km away
                  </p>
                  <p className="text-xs text-slate-500">
                    Schedule: {req.bookingDate} at {req.bookingTime}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Estimated Fare</span>
                    <span className="text-xl font-extrabold text-indigo-600">₹{req.totalPrice}</span>
                  </div>
                  <button
                    onClick={() => handleAcceptRequest(req.bookingUniqueId)}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition"
                  >
                    Accept Job
                  </button>
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
