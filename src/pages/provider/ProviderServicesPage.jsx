import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Wrench, Plus, CheckCircle2, Clock, AlertCircle, Sparkles,
  BookOpen, ArrowRight, ShieldCheck, Compass, Layers
} from 'lucide-react';
import ProviderPortalNav from '../../components/provider/ProviderPortalNav';
import Footer from '../../components/common/Footer';
import { providerApi } from '../../api/providerApi';
import { serviceApi } from '../../api/serviceApi';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

export default function ProviderServicesPage() {
  const { user } = useAuth();
  const { showToast } = useNotification();

  const [activeServices, setActiveServices] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [activeTab, setActiveTab] = useState('ACTIVE'); // 'ACTIVE' | 'PENDING' | 'REJECTED'

  const loadProviderData = () => {
    if (!user?.providerUniqueId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError('');

    Promise.all([
      providerApi.getProviderById(user.providerUniqueId),
      serviceApi.getAllServices(),
      providerApi.getMyApplications(user.providerUniqueId).catch(() => [])
    ])
      .then(([provider, allServices, myApps]) => {
        const activeHistories = (provider.providerServices || [])
          .filter((item) => String(item.status || '').toUpperCase() === 'ACTIVE');

        const activeServiceNames = new Set(activeHistories.map((item) => item.service));

        const activeMatched = allServices.filter(s =>
          activeServiceNames.has(s.categoryId) || activeServiceNames.has(s.name) || activeServiceNames.has(s.uniqueId)
        );

        setActiveServices(activeMatched);
        setApplications(Array.isArray(myApps) ? myApps : []);
      })
      .catch((err) => {
        console.error('Failed to load provider services:', err);
        setLoadError('Could not load your services. Please refresh the page.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProviderData();
  }, [user?.providerUniqueId]);

  const pendingApps = useMemo(() => {
    return applications.filter(a => String(a.status).toUpperCase() === 'PENDING');
  }, [applications]);

  const rejectedApps = useMemo(() => {
    return applications.filter(a => String(a.status).toUpperCase() === 'REJECTED');
  }, [applications]);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] font-sans">
      <ProviderPortalNav />

      {/* Top Header Banner */}
      <div className="bg-[#14213d] text-white py-10 px-4 lg:px-8 border-b border-slate-800">
        <div className="container mx-auto max-w-5xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-black text-blue-400 uppercase tracking-widest block">
              Provider Operations
            </span>
            <h1 className="text-2xl sm:text-3xl font-black">My Offered Services</h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl leading-relaxed">
              Manage your approved trade services, monitor pending onboarding applications, and review standard service guidance.
            </p>
          </div>

          <Link
            to="/provider/services/discover"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-lg shadow-blue-600/30 transition shrink-0"
          >
            <Compass className="w-4 h-4" /> Explore & Apply for Services
          </Link>
        </div>
      </div>

      <main className="container mx-auto max-w-5xl px-4 lg:px-8 py-8 flex-1 space-y-6">

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('ACTIVE')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'ACTIVE'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            Approved Services ({activeServices.length})
          </button>

          <button
            onClick={() => setActiveTab('PENDING')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'PENDING'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-4 h-4" />
            Under Review ({pendingApps.length})
          </button>

          <button
            onClick={() => setActiveTab('REJECTED')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'REJECTED'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            Needs Attention ({rejectedApps.length})
          </button>
        </div>

        {loadError && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {loadError}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-500 font-bold text-xs">Loading services...</p>
          </div>
        ) : activeTab === 'ACTIVE' ? (
          /* Active Services List */
          activeServices.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4">
              <Wrench className="w-12 h-12 text-slate-300 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-slate-800">No Approved Services Yet</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  You haven't been approved for any services yet. Discover trade categories and apply with your experience details.
                </p>
              </div>
              <Link
                to="/provider/services/discover"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md hover:bg-blue-700 transition"
              >
                <Compass className="w-4 h-4" /> Discover Available Services
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeServices.map((srv) => (
                <div
                  key={srv.uniqueId || srv.id}
                  className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Active & Receiving Bookings
                      </span>
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase">
                        {srv.pricingModel || 'FIXED'}
                      </span>
                    </div>

                    <h3 className="text-base font-black text-[#14213d]">{srv.name}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {srv.shortDescription || 'Professional trade service.'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">
                      Standard Rate: <span className="text-emerald-700">from ₹{srv.startingPrice}</span>
                    </span>
                    <Link
                      to={`/provider/services/${srv.uniqueId}/guidance`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition"
                    >
                      <BookOpen className="w-3.5 h-3.5" /> View Guidance
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : activeTab === 'PENDING' ? (
          /* Pending Applications */
          pendingApps.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-2">
              <Clock className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-700">No Pending Applications</h3>
              <p className="text-xs text-slate-400">All submitted applications have been processed.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingApps.map((app) => (
                <div
                  key={app.uniqueId}
                  className="bg-white p-5 rounded-2xl border border-amber-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm text-[#14213d]">{app.serviceName}</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Under Review
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Experience: {app.experienceYears} Years • Area: {app.serviceArea}
                    </p>
                    {app.certifications && (
                      <p className="text-[11px] text-slate-400">
                        Certifications: {app.certifications}
                      </p>
                    )}
                  </div>

                  <Link
                    to={`/provider/services/${app.serviceUniqueId}/guidance`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 shrink-0"
                  >
                    View Service Guidance <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          )
        ) : (
          /* Rejected Applications */
          rejectedApps.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="text-sm font-bold text-slate-700">No Issues Found</h3>
              <p className="text-xs text-slate-400">None of your applications require corrective action.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {rejectedApps.map((app) => (
                <div
                  key={app.uniqueId}
                  className="bg-white p-5 rounded-2xl border border-rose-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm text-[#14213d]">{app.serviceName}</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Needs Attention
                      </span>
                    </div>
                    <p className="text-xs text-rose-700 font-bold">
                      Reason: {app.rejectionReason || 'Requirements not fulfilled.'}
                    </p>
                    {app.adminNotes && (
                      <p className="text-xs text-slate-500">
                        Admin Note: {app.adminNotes}
                      </p>
                    )}
                  </div>

                  <Link
                    to={`/provider/services/${app.serviceUniqueId}/guidance`}
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition shrink-0"
                  >
                    Review & Re-apply
                  </Link>
                </div>
              ))}
            </div>
          )
        )}

      </main>

      <Footer />
    </div>
  );
}
