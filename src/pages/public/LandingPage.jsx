import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sparkles, Wrench, Zap, Droplet, Wind, Home, Paintbrush,
  Scissors, HeartPulse, Bug, Car, Truck, Shirt,
  MapPin, Search, ArrowRight, ShieldCheck, Clock, CheckCircle2, ChevronRight, Star, Award, ThumbsUp, Lock
} from 'lucide-react';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import StarRating from '../../components/common/StarRating';
import { serviceApi } from '../../api/serviceApi';

export default function LandingPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    serviceApi.getAllServices()
      .then(data => setServices(data))
      .catch(() => setServices([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(`/services?search=${encodeURIComponent(searchTerm)}`);
  };

  // 12 Visual Marketplace Categories matching Urban Company structure
  const marketplaceCategories = [
    { id: 'CLEANING', name: 'Home Cleaning', icon: Home, count: '12 Services', query: 'cleaning' },
    { id: 'ELECTRICAL', name: 'Electrical Services', icon: Zap, count: '8 Services', query: 'electrical' },
    { id: 'PLUMBING', name: 'Plumbing', icon: Droplet, count: '6 Services', query: 'plumbing' },
    { id: 'AC_REPAIR', name: 'AC & Appliance Repair', icon: Wind, count: '10 Services', query: 'ac' },
    { id: 'CARPENTRY', name: 'Carpentry', icon: Wrench, count: '5 Services', query: 'furniture' },
    { id: 'PAINTING', name: 'Painting & Renovation', icon: Paintbrush, count: '4 Services', query: 'painting' },
    { id: 'BEAUTY', name: 'Beauty & Personal Care', icon: Scissors, count: '8 Services', query: 'haircut' },
    { id: 'WELLNESS', name: 'Wellness & Fitness', icon: HeartPulse, count: '3 Services', query: 'yoga' },
    { id: 'PEST_CONTROL', name: 'Pest Control', icon: Bug, count: '4 Services', query: 'pest' },
    { id: 'VEHICLE', name: 'Vehicle Services', icon: Car, count: '5 Services', query: 'car' },
    { id: 'PACKERS', name: 'Packers & Movers', icon: Truck, count: '3 Services', query: 'shifting' },
    { id: 'LAUNDRY', name: 'Laundry Services', icon: Shirt, count: '4 Services', query: 'washing' }
  ];

  // Pick top popular services from database
  const popularServices = services.slice(0, 8);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] font-sans">
      <Header />

      {/* Hero Section - Urban Company Luxe FinTech Style */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#14213d] via-[#1a2c50] to-[#14213d] text-white pt-16 pb-24 lg:pt-20 lg:pb-28">
        {/* Subtle Background Glows */}
        <div className="absolute top-10 left-1/3 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="container mx-auto px-4 lg:px-8 relative z-10 text-center space-y-6 max-w-4xl">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-bold text-amber-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Verified Local Experts • Guaranteed Satisfaction • Transparent Pricing
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            Expert Home Services, <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-amber-300 to-white">
              Just One Click Away.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-2xl mx-auto">
            Book trusted professionals for your home, vehicle, and personal care needs with authoritative dynamic pricing and doorstep service.
          </p>

          {/* Large Search Bar */}
          <div className="max-w-2xl mx-auto pt-4">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center bg-white p-2 rounded-2xl shadow-2xl border border-slate-200">
              <div className="pl-3 pr-2 text-slate-400">
                <Search className="w-5 h-5 text-blue-600" />
              </div>
              <input
                type="text"
                placeholder="Search AC repair, house cleaning, electrician, haircut..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-3 px-2 text-slate-900 text-sm font-semibold placeholder:text-slate-400 outline-none"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition shadow-md shrink-0 flex items-center gap-1.5"
              >
                Search <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Popular Shortcut Chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs font-semibold text-slate-300">
              <span className="text-slate-400">Popular:</span>
              <Link to="/services?search=cleaning" className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 transition">House Cleaning</Link>
              <Link to="/services?search=electrical" className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 transition">Electrical</Link>
              <Link to="/services?search=ac" className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 transition">AC Servicing</Link>
              <Link to="/services?search=plumbing" className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 transition">Plumbing</Link>
            </div>
          </div>

        </div>
      </section>

      {/* 12 Popular Service Categories Grid (Urban Company Style) */}
      <section className="container mx-auto px-4 lg:px-8 -mt-10 relative z-20">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest block">Categories</span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">Explore Service Categories</h2>
            </div>
            <Link to="/services" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View All Catalogue <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {marketplaceCategories.map((cat) => {
              const IconComponent = cat.icon;
              return (
                <Link
                  key={cat.id}
                  to={`/services?search=${encodeURIComponent(cat.query)}`}
                  className="p-4 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-blue-300 hover:shadow-md transition text-center flex flex-col items-center justify-center space-y-2 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-xs group-hover:scale-110 group-hover:bg-blue-50 transition flex items-center justify-center border border-slate-200/80">
                    <IconComponent className="w-6 h-6 text-blue-600 group-hover:text-blue-700 transition" />
                  </div>
                  <h3 className="text-xs font-extrabold text-slate-800 group-hover:text-blue-600 transition leading-tight line-clamp-1">
                    {cat.name}
                  </h3>
                  <span className="text-[10px] font-semibold text-slate-400">
                    {cat.count}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Popular Database Services Section */}
      <section className="container mx-auto px-4 lg:px-8 py-16 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest block">Trending Now</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Popular Doorstep Services</h2>
          </div>
          <Link to="/services" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
            Browse All ({services.length}) <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-500 font-semibold text-sm">
            Loading trending services...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularServices.map((srv) => {
              const isQuotation = srv.pricingModel === 'QUOTATION';
              return (
                <div
                  key={srv.uniqueId}
                  className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs hover:shadow-xl hover:border-blue-300 transition flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-extrabold text-[10px] rounded-lg border border-blue-100 uppercase tracking-wider">
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
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">
                        {isQuotation ? 'Price' : 'Starting From'}
                      </span>
                      {isQuotation ? (
                        <span className="text-xs font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                          Quotation
                        </span>
                      ) : (
                        <span className="text-lg font-black text-[#14213d]">
                          ₹{srv.startingPrice > 0 ? srv.startingPrice : 299}
                        </span>
                      )}
                    </div>

                    <Link
                      to={`/services/${srv.uniqueId}`}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition active:scale-95"
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-white py-16 border-y border-slate-200">
        <div className="container mx-auto px-4 lg:px-8 space-y-12">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest block">Seamless Experience</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">How QUIX FIX Works</h2>
            <p className="text-xs text-slate-500">Book trusted local professionals in 3 effortless steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black text-lg flex items-center justify-center mx-auto shadow-md shadow-blue-600/30">
                1
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Choose a Service</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Browse our curated catalogue of home, electrical, AC, cleaning, and personal services.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black text-lg flex items-center justify-center mx-auto shadow-md shadow-blue-600/30">
                2
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Customize Requirements</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Select your room size, quantity, or package tier with dynamic real-time price calculation.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black text-lg flex items-center justify-center mx-auto shadow-md shadow-blue-600/30">
                3
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Book Your Professional</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Pick your preferred arrival date & time slot. Pay securely online or cash after job completion.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose QUIX FIX Section */}
      <section id="why-choose-us" className="container mx-auto px-4 lg:px-8 py-16 space-y-12">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest block">Trust & Quality</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Why Choose QUIX FIX?</h2>
          <p className="text-xs text-slate-500">Built to ensure peace of mind with every technician visit</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-slate-900 text-sm">100% Verified Professionals</h4>
            <p className="text-xs text-slate-500 leading-relaxed">Every technician passes rigorous background verification and identity checks before taking orders.</p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-slate-900 text-sm">Transparent Dynamic Pricing</h4>
            <p className="text-xs text-slate-500 leading-relaxed">Authoritative rate calculation based on your exact options, area, and packages. No hidden fees.</p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-slate-900 text-sm">On-Time Arrival Guarantee</h4>
            <p className="text-xs text-slate-500 leading-relaxed">Track your provider in real-time on GPS map with prompt arrival at your scheduled hour.</p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-slate-900 text-sm">Secure Booking Records</h4>
            <p className="text-xs text-slate-500 leading-relaxed">Agreed pricing snapshots, digital receipts, and booking status histories are saved permanently.</p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <ThumbsUp className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-slate-900 text-sm">Pay After Service</h4>
            <p className="text-xs text-slate-500 leading-relaxed">No advance charges required. Inspect completed work before releasing payment via UPI, Card, or Cash.</p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-slate-900 text-sm">Dedicated Customer Support</h4>
            <p className="text-xs text-slate-500 leading-relaxed">Direct support desk assistance for any questions, scheduling changes, or technical assistance.</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
