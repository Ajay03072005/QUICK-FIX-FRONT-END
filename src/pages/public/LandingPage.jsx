import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Zap, Wrench, Snowflake, Hammer, Sparkles, Paintbrush, Tv, Home,
  MapPin, Search, ArrowRight, ShieldCheck, Clock, ThumbsUp, ChevronRight
} from 'lucide-react';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import StarRating from '../../components/common/StarRating';
import { serviceApi } from '../../api/serviceApi';
import { providerApi } from '../../api/providerApi';

export default function LandingPage() {
  const [selectedCategory, setSelectedCategory] = useState('AC Repair');
  const [locationInput, setLocationInput] = useState('Coimbatore, Tamil Nadu');
  const [categories, setCategories] = useState([]);
  const [providers, setProviders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    serviceApi.getCategories().then(setCategories);
    providerApi.getAllProviders().then(setProviders);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/find-nearby?service=${encodeURIComponent(selectedCategory)}&location=${encodeURIComponent(locationInput)}`);
  };

  const getCategoryIcon = (iconName) => {
    switch (iconName) {
      case 'Zap': return <Zap className="w-6 h-6 text-amber-500" />;
      case 'Wrench': return <Wrench className="w-6 h-6 text-blue-500" />;
      case 'Snowflake': return <Snowflake className="w-6 h-6 text-cyan-500" />;
      case 'Sparkles': return <Sparkles className="w-6 h-6 text-emerald-500" />;
      default: return <Wrench className="w-6 h-6 text-indigo-500" />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-900 via-indigo-950 to-slate-950 text-white pt-16 pb-24 lg:pt-24 lg:pb-32">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-10 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-cyan-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Location-First On-Demand Service Platform
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Find the Right Service Provider, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-300">Near You.</span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-300 font-normal leading-relaxed max-w-2xl mx-auto">
              Book trusted local professionals for your everyday service needs — quickly, easily, and at your preferred location.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                to="/customer/find-service"
                className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-xl transition hover:scale-105 flex items-center gap-2 text-base"
              >
                Find a Service <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/register?role=provider"
                className="px-8 py-3.5 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-2xl backdrop-blur-md border border-white/20 transition text-base"
              >
                Become a Provider
              </Link>
            </div>

            {/* Hero Search Box */}
            <div className="mt-10 p-4 sm:p-6 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 text-slate-900 max-w-3xl mx-auto">
              <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end text-left">
                <div className="sm:col-span-5 space-y-1.5">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">What service do you need?</label>
                  <div className="relative">
                    <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-600 focus:outline-none transition cursor-pointer"
                    >
                      <option value="AC Repair">❄ AC Repair & Servicing</option>
                      <option value="Electrical">⚡ Electrical & Wiring</option>
                      <option value="Plumbing">🔧 Plumbing & Leaks</option>
                      <option value="Cleaning">🧹 Deep Cleaning</option>
                    </select>
                  </div>
                </div>

                <div className="sm:col-span-4 space-y-1.5">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Where do you need it?</label>
                  <div className="relative">
                    <MapPin className="w-5 h-5 text-indigo-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={locationInput}
                      onChange={(e) => setLocationInput(e.target.value)}
                      placeholder="Enter neighborhood or pin code"
                      className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-600 focus:outline-none transition"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-1.5"
                  >
                    Find Providers
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      </section>

      {/* Service Categories Section */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Explore Service Categories</h2>
            <p className="text-slate-600 text-base">Select a category to view top verified nearby technicians and book instantly.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/find-nearby?category=${cat.id}`}
                className="group bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-indigo-300 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 group-hover:bg-indigo-50 flex items-center justify-center transition-colors">
                    {getCategoryIcon(cat.icon)}
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full group-hover:bg-indigo-100 group-hover:text-indigo-700 transition">
                    Active DB
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition mb-1">{cat.name}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">Direct DB mapped service type category</p>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* Providers Teaser */}
      <section className="py-20 bg-white border-t border-slate-200/80">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Verified Professionals</span>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">Top Rated Nearby Providers</h2>
            </div>
            <Link to="/find-nearby" className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              View Map & All Providers <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {providers.map((prov) => (
              <div key={prov.providerUniqueId} className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 space-y-4">
                <div className="flex items-start gap-4">
                  <img src={prov.avatar || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150'} alt={prov.providerName} className="w-14 h-14 rounded-xl object-cover border border-slate-200" />
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{prov.providerName}</h3>
                    <StarRating rating={prov.rating} />
                    <span className="text-xs text-indigo-600 font-bold block mt-1">{prov.distance} km away</span>
                  </div>
                </div>
                <Link to={`/providers/${prov.providerUniqueId}`} className="block w-full py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl text-center">
                  View Profile
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
