import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Wrench, CheckCircle2, Clock, DollarSign, ArrowRight, ShieldCheck, MapPin,
  User, AlertCircle, PlayCircle, ToggleLeft, ToggleRight, Sparkles, Phone,
  TrendingUp, Award, Calendar, Compass, Briefcase, Zap, Bell, ChevronRight,
  Sliders, Star, ArrowUpRight
} from 'lucide-react';
import ProviderPortalNav from '../../components/provider/ProviderPortalNav';
import Footer from '../../components/common/Footer';
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
  const [loading, setLoading] = useState(true);

  const { showToast } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.providerUniqueId) {
      setLoading(false);
      return;
    }
    setIsAvailable(user.availability === 'AVAILABLE_NOW');

    Promise.all([
      providerApi.getProviderDashboardStats(user.providerUniqueId).catch(() => ({
        todaysJobs: 0, pendingRequests: 0, completedJobs: 0, todaysEarnings: 0
      })),
      bookingApi.getProviderBookings(user.providerUniqueId).catch(() => [])
    ])
      .then(([statsData, bookings]) => {
        setStats(statsData);
        const safeBookings = Array.isArray(bookings) ? bookings : [];
        setRequests(safeBookings.filter(b => b.status === 'WAITING_ACCEPTANCE'));
        const active = safeBookings.find(b => b.status === 'PROVIDER_ACCEPTED' || b.status === 'IN_PROGRESS');
        setActiveJob(active || null);
      })
      .finally(() => setLoading(false));
  }, [user?.providerUniqueId]);

  const toggleAvailability = async () => {
    const nextState = !isAvailable;
    setIsAvailable(nextState);
    try {
      await providerApi.updateAvailability(user.providerUniqueId || user.id, nextState ? 'AVAILABLE_NOW' : 'OFFLINE');
      showToast(`Status: ${nextState ? 'ONLINE (Accepting Jobs)' : 'OFFLINE (Paused)'}`, nextState ? 'success' : 'info');
    } catch {
      showToast('Could not update availability. Please try again.', 'error');
    }
  };

  const handleAcceptRequest = async (reqId) => {
    try {
      await bookingApi.acceptBooking(reqId);
      showToast('Booking request accepted! Customer notified.', 'success');
      navigate(`/provider/active-service/${reqId}`);
    } catch {
      showToast('Failed to accept booking. Please try again.', 'error');
    }
  };

  const providerDisplayName = user?.providerName || user?.name || 'Service Partner';

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] font-sans antialiased text-slate-800">
      <ProviderPortalNav />

      {/* Clean, Compact Header */}
      <div className="bg-white border-b border-slate-200/80">
        <div className="container mx-auto max-w-6xl px-4 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            {/* Title & Pro Badges */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Welcome back, {providerDisplayName}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified Pro
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Real-time dispatch overview & daily booking management
              </p>
            </div>

            {/* Compact Availability Status Toggle */}
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/80 rounded-xl p-2 self-start sm:self-auto">
              <div className="flex items-center gap-2 px-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                <span className="text-xs font-semibold text-slate-700">
                  {isAvailable ? 'Online & Ready' : 'Currently Offline'}
                </span>
              </div>

              <button
                onClick={toggleAvailability}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition active:scale-95 ${
                  isAvailable
                    ? 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-xs'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                }`}
              >
                {isAvailable ? 'Pause Dispatch' : 'Go Online'}
              </button>
            </div>

          </div>
        </div>
      </div>

      <main className="container mx-auto max-w-6xl px-4 lg:px-8 py-8 flex-1 space-y-6">
        
        {/* Crisp KPI Metrics Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Revenue */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2 hover:border-slate-300 transition">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Revenue</span>
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                ₹
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              ₹{stats.todaysEarnings.toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Net payouts credited
            </div>
          </div>

          {/* Card 2: New Inquiries */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2 hover:border-slate-300 transition">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">New Inquiries</span>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${stats.pendingRequests > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                <Bell className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {stats.pendingRequests}
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              {stats.pendingRequests > 0 ? 'Awaiting your acceptance' : 'No pending inquiries'}
            </div>
          </div>

          {/* Card 3: Completed Jobs */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2 hover:border-slate-300 transition">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed Jobs</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {stats.completedJobs}
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              Total fulfilled bookings
            </div>
          </div>

          {/* Card 4: Scheduled Today */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2 hover:border-slate-300 transition">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Scheduled Today</span>
              <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs">
                <Calendar className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {stats.todaysJobs}
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              Confirmed arrival tasks
            </div>
          </div>

        </div>

        {/* Active Job Highlight (When an active job exists) */}
        {activeJob && (
          <div className="bg-gradient-to-r from-[#14213d] to-[#1e293b] text-white p-6 rounded-2xl shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-amber-400/20 text-amber-300 text-[11px] font-bold uppercase rounded-md border border-amber-400/30 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  Active Job in Progress
                </span>
                <span className="text-xs text-slate-400 font-mono">#{activeJob.bookingUniqueId || activeJob.uniqueId}</span>
              </div>
              <h2 className="text-lg font-bold text-white">{activeJob.serviceName}</h2>
              <p className="text-xs text-slate-300 flex items-center gap-2 flex-wrap">
                <span>Customer: <strong className="text-white">{activeJob.recipientName || activeJob.customerName}</strong></span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" /> {activeJob.customerAddress || 'Service Address'}
                </span>
                {activeJob.distanceKm && <span>• {activeJob.distanceKm} km</span>}
              </p>
            </div>

            <Link
              to={`/provider/active-service/${activeJob.bookingUniqueId || activeJob.uniqueId}`}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 shrink-0"
            >
              Open Job Actions <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Split Grid: Incoming Requests (Left 8) + Quick Actions (Right 4) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Requests Queue */}
          <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" /> Incoming Booking Requests
                </h2>
                <p className="text-xs text-slate-500">Customer requests dispatched in your service radius</p>
              </div>

              <Link
                to="/provider/booking-requests"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                View Full Queue ({requests.length}) <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {requests.length === 0 ? (
              <div className="py-10 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-slate-700">No New Requests Pending</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Keep your dispatch status <strong className="text-emerald-600">Online</strong> to receive nearby booking requests as soon as customers book.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map((req) => (
                  <div
                    key={req.bookingUniqueId || req.uniqueId}
                    className="p-4 rounded-xl border border-slate-200/80 hover:border-blue-300 hover:shadow-xs transition bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm">{req.serviceName}</h4>
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-md">
                          New Request
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">
                        Customer: <strong className="text-slate-800">{req.recipientName || req.customerName}</strong> • {req.customerAddress || 'Address on file'}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Scheduled for: <strong className="text-slate-700">{req.bookingDate} at {req.bookingTime}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="block text-[10px] font-semibold text-slate-400 uppercase">Estimated Fare</span>
                        <span className="text-base font-bold text-blue-600">₹{req.totalPrice || req.totalAmount || 350}</span>
                      </div>
                      <button
                        onClick={() => handleAcceptRequest(req.bookingUniqueId || req.uniqueId)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                      >
                        Accept Job
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Shortcuts & Operations */}
          <div className="lg:col-span-4 space-y-4">
            
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Partner Operations</h3>
              
              <div className="space-y-1.5">
                <Link
                  to="/provider/services"
                  className="p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition flex items-center justify-between text-xs font-semibold text-slate-700 group"
                >
                  <span className="flex items-center gap-2.5">
                    <Wrench className="w-4 h-4 text-blue-600" /> My Offered Services
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition" />
                </Link>

                <Link
                  to="/provider/services/discover"
                  className="p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition flex items-center justify-between text-xs font-semibold text-slate-700 group"
                >
                  <span className="flex items-center gap-2.5">
                    <Compass className="w-4 h-4 text-amber-600" /> Explore & Apply for Trades
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition" />
                </Link>

                <Link
                  to="/provider/availability"
                  className="p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition flex items-center justify-between text-xs font-semibold text-slate-700 group"
                >
                  <span className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-emerald-600" /> Working Hours & Schedule
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition" />
                </Link>

                <Link
                  to="/provider/history"
                  className="p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition flex items-center justify-between text-xs font-semibold text-slate-700 group"
                >
                  <span className="flex items-center gap-2.5">
                    <Briefcase className="w-4 h-4 text-purple-600" /> Service Job History
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition" />
                </Link>
              </div>
            </div>

            {/* Quality Standard Card */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" /> Pro Quality Standard
              </span>
              <p className="text-[11px] text-slate-500 leading-relaxed font-normal">
                Maintain 4.8★+ customer ratings and prompt response times to unlock higher visibility in customer searches.
              </p>
            </div>

          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
