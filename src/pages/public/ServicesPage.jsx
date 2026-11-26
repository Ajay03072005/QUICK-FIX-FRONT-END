import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, ChevronRight, CheckCircle2, Tag, ArrowUpDown, Filter, Sparkles, AlertCircle } from 'lucide-react';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import StarRating from '../../components/common/StarRating';
import { serviceApi } from '../../api/serviceApi';
import { useBooking } from '../../context/BookingContext';

export default function ServicesPage() {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCat, setSelectedCat] = useState('ALL');
  const [selectedModel, setSelectedModel] = useState('ALL');
  const [sortBy, setSortBy] = useState('DEFAULT');
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { updateDraft } = useBooking();

  useEffect(() => {
    setLoading(true);
    Promise.all([
      serviceApi.getCategories().catch(() => []),
      serviceApi.getAllServices().catch(() => [])
    ]).then(([cats, srvs]) => {
      setCategories(cats);
      setServices(srvs);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  const pricingModels = ['ALL', 'FIXED', 'OPTIONS', 'PER_UNIT', 'HOURLY', 'PACKAGE', 'QUOTATION'];

  const filteredServices = services
    .filter(srv => {
      const query = searchTerm.toLowerCase();
      const matchesSearch = (srv.name || '').toLowerCase().includes(query) ||
                            (srv.shortDescription || '').toLowerCase().includes(query) ||
                            (srv.categoryName || '').toLowerCase().includes(query);
      const matchesCat = selectedCat === 'ALL' || srv.categoryId === selectedCat;
      const matchesModel = selectedModel === 'ALL' || (srv.pricingModel || 'FIXED') === selectedModel;
      return matchesSearch && matchesCat && matchesModel;
    })
    .sort((a, b) => {
      if (sortBy === 'PRICE_LOW_HIGH') return (a.startingPrice || 0) - (b.startingPrice || 0);
      if (sortBy === 'PRICE_HIGH_LOW') return (b.startingPrice || 0) - (a.startingPrice || 0);
      if (sortBy === 'NAME_A_Z') return (a.name || '').localeCompare(b.name || '');
      return 0;
    });

  const getPriceBadge = (srv) => {
    const model = srv.pricingModel || 'FIXED';
    if (model === 'QUOTATION') {
      return (
        <div>
          <span className="text-[10px] font-bold text-slate-400 block uppercase">Pricing</span>
          <span className="text-xs font-extrabold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
            By Quotation
          </span>
        </div>
      );
    }
    if (model === 'HOURLY') {
      return (
        <div>
          <span className="text-[10px] font-bold text-slate-400 block uppercase">Hourly</span>
          <span className="text-lg font-black text-[#14213d]">₹{srv.startingPrice > 0 ? srv.startingPrice : 500}<span className="text-xs text-slate-500 font-semibold">/hr</span></span>
        </div>
      );
    }
    if (model === 'PER_UNIT') {
      return (
        <div>
          <span className="text-[10px] font-bold text-slate-400 block uppercase">Rate Based</span>
          <span className="text-lg font-black text-[#14213d]">Per Unit</span>
        </div>
      );
    }
    if (model === 'PACKAGE') {
      return (
        <div>
          <span className="text-[10px] font-bold text-slate-400 block uppercase">Options</span>
          <span className="text-xs font-extrabold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
            Tiered Packages
          </span>
        </div>
      );
    }
    return (
      <div>
        <span className="text-[10px] font-bold text-slate-400 block uppercase">Starts from</span>
        <span className="text-lg font-black text-[#14213d]">₹{srv.startingPrice > 0 ? srv.startingPrice : 250}</span>
      </div>
    );
  };

  const handleBookService = (srv) => {
    updateDraft({
      service: srv,
      serviceCharge: srv.startingPrice,
      bookingUniqueId: undefined,
      provider: null,
      distanceKm: undefined,
      distanceCharge: undefined
    });
    navigate(`/services/${srv.uniqueId}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] font-sans">
      <Header />

      {/* Top Header Banner */}
      <div className="bg-[#14213d] text-white py-12 border-b border-slate-800">
        <div className="container mx-auto px-4 lg:px-8 text-center space-y-4">
          <span className="text-xs font-extrabold text-amber-400 uppercase tracking-widest block">Complete Catalogue</span>
          <h1 className="text-3xl sm:text-4xl font-black">All Home & Professional Services</h1>
          <p className="text-slate-300 max-w-xl mx-auto text-xs sm:text-sm">
            50+ verified local services with transparent dynamic pricing, instant bookings, and doorstep service guarantee.
          </p>

          <div className="max-w-xl mx-auto relative pt-2">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-5" />
            <input
              type="text"
              placeholder="Search by service name, category, or requirement..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white text-slate-900 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-xl"
            />
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 lg:px-8 py-8 flex-1 space-y-6">
        
        {/* Filter & Sort Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-4">
          
          {/* Pricing Model Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto scrollbar-none pb-1 lg:pb-0">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mr-2 shrink-0">Model:</span>
            {pricingModels.map((model) => (
              <button
                key={model}
                onClick={() => setSelectedModel(model)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  selectedModel === model
                    ? 'bg-[#14213d] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {model}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap">
              Showing <strong className="text-slate-900">{filteredServices.length}</strong> services
            </span>

            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700">
              <ArrowUpDown className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent outline-none cursor-pointer font-bold text-xs"
              >
                <option value="DEFAULT">Sort: Recommended</option>
                <option value="PRICE_LOW_HIGH">Price: Low to High</option>
                <option value="PRICE_HIGH_LOW">Price: High to Low</option>
                <option value="NAME_A_Z">Name: A to Z</option>
              </select>
            </div>
          </div>

        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCat('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              selectedCat === 'ALL'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedCat === cat.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat.name} ({cat.count})
            </button>
          ))}
        </div>

        {/* Service Cards Grid */}
        {loading ? (
          <div className="py-24 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm font-semibold text-slate-500">Loading service catalogue...</p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 max-w-lg mx-auto space-y-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg">No matching services found</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              We couldn't find any services matching your filters. Try clearing your search keyword or selected pricing model.
            </p>
            <button
              onClick={() => { setSearchTerm(''); setSelectedCat('ALL'); setSelectedModel('ALL'); }}
              className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-blue-700 transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredServices.map((srv) => (
              <div
                key={srv.uniqueId}
                className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs hover:shadow-xl hover:border-blue-300 transition flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-extrabold text-[10px] rounded-lg border border-slate-200 uppercase tracking-wider">
                      {srv.pricingModel || 'FIXED'}
                    </span>
                    <StarRating rating={srv.rating || 4.8} reviewCount={srv.reviewCount || 24} />
                  </div>

                  <Link to={`/services/${srv.uniqueId}`} className="block">
                    <h3 className="font-extrabold text-slate-900 text-base group-hover:text-blue-600 transition leading-snug">
                      {srv.name}
                    </h3>
                  </Link>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {srv.shortDescription}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  {getPriceBadge(srv)}

                  <div className="flex gap-1.5">
                    <Link
                      to={`/services/${srv.uniqueId}`}
                      className="px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition"
                    >
                      Details
                    </Link>
                    <button
                      onClick={() => handleBookService(srv)}
                      className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition active:scale-95"
                    >
                      Book Now
                    </button>
                  </div>
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
