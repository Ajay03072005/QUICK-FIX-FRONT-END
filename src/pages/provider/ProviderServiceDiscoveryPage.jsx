import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass, Search, Filter, ArrowRight, ShieldCheck, Clock,
  Briefcase, IndianRupee, AlertCircle, CheckCircle2, ChevronRight,
  Sparkles, Wrench, Info, Layers
} from 'lucide-react';
import ProviderPortalNav from '../../components/provider/ProviderPortalNav';
import Footer from '../../components/common/Footer';
import { providerApi } from '../../api/providerApi';
import { useAuth } from '../../context/AuthContext';

export default function ProviderServiceDiscoveryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [catalogue, setCatalogue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    providerApi.getCatalogueGuidance(user?.providerUniqueId)
      .then((data) => {
        if (!mounted) return;
        setCatalogue(Array.isArray(data) ? data : []);
        setError('');
      })
      .catch((err) => {
        if (!mounted) return;
        console.error('Error loading catalogue guidance:', err);
        setError('Unable to load service discovery catalogue. Please check connection and try again.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, [user?.providerUniqueId]);

  const categories = useMemo(() => {
    const set = new Set();
    catalogue.forEach(item => {
      if (item.categoryName) set.add(item.categoryName);
      else if (item.serviceType) set.add(item.serviceType.replaceAll('_', ' '));
    });
    return ['ALL', ...Array.from(set)];
  }, [catalogue]);

  const filteredCatalogue = useMemo(() => {
    return catalogue.filter(item => {
      const matchSearch = (item.serviceName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.serviceType || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategory = selectedCategory === 'ALL' ||
        item.categoryName === selectedCategory ||
        item.serviceType?.replaceAll('_', ' ') === selectedCategory;

      return matchSearch && matchCategory;
    });
  }, [catalogue, searchQuery, selectedCategory]);

  const getStatusBadge = (status) => {
    switch (String(status).toUpperCase()) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Approved & Active
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" /> Under Review
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5" /> Needs Attention
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
            Not Applied
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] font-sans">
      <ProviderPortalNav />

      {/* Header Banner */}
      <div className="bg-[#14213d] text-white py-10 px-4 lg:px-8 border-b border-slate-800">
        <div className="container mx-auto max-w-6xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-extrabold uppercase tracking-wider border border-blue-400/30">
            <Compass className="w-3.5 h-3.5" /> Service Discovery & Onboarding
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Explore Services to Offer</h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Review detailed job expectations, required tools, safety precautions, and estimated provider earnings before applying to expand your service offerings.
          </p>
        </div>
      </div>

      <main className="container mx-auto max-w-6xl px-4 lg:px-8 py-8 flex-1 space-y-6">

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search services (e.g. Bathroom Cleaning, AC Repair)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat === 'ALL' ? 'All Categories' : cat}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-500 font-bold text-xs">Loading catalogue guidance...</p>
          </div>
        ) : filteredCatalogue.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
            <Layers className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No Services Found</h3>
            <p className="text-xs text-slate-500">Try adjusting your search query or category filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCatalogue.map((srv) => (
              <div
                key={srv.serviceUniqueId}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
              >
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-slate-100 text-slate-600 tracking-wider uppercase">
                      {srv.pricingModel || 'FIXED'}
                    </span>
                    {getStatusBadge(srv.applicationStatus)}
                  </div>

                  <div>
                    <h3 className="text-lg font-extrabold text-[#14213d]">{srv.serviceName}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {srv.description || 'Doorstep professional trade service verified by QUIX FIX.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-xl">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Est. Earning</span>
                      <span className="font-extrabold text-emerald-700">
                        ₹{srv.estimatedEarningMin} - ₹{srv.estimatedEarningMax}*
                      </span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Experience</span>
                      <span className="font-extrabold text-slate-700">
                        {srv.minExperienceYears || 1}+ Year(s)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 italic">
                    *Non-guaranteed estimate
                  </span>
                  <Link
                    to={`/provider/services/${srv.serviceUniqueId}/guidance`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition"
                  >
                    View Details & Guidance <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
