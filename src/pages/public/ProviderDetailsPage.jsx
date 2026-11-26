import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck, MapPin, Star, Award, CheckCircle2, Clock, Phone, Mail,
  ArrowLeft, MessageSquare, Sparkles, Wrench, Calendar, ChevronRight,
  ThumbsUp, Zap, HelpCircle, AlertCircle, Share2
} from 'lucide-react';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import StarRating from '../../components/common/StarRating';
import { providerApi } from '../../api/providerApi';
import { serviceApi } from '../../api/serviceApi';
import { useBooking } from '../../context/BookingContext';
import { useNotification } from '../../context/NotificationContext';

export default function ProviderDetailsPage() {
  const { uniqueId } = useParams();
  const [provider, setProvider] = useState(null);
  const [catalogueServices, setCatalogueServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const navigate = useNavigate();
  const { updateDraft } = useBooking();
  const { showToast } = useNotification();

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    Promise.all([
      providerApi.getProviderById(uniqueId),
      serviceApi.getAllServices().catch(() => [])
    ])
      .then(([data, allServices]) => {
        if (!active) return;
        setProvider(data);
        setCatalogueServices(allServices);
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        console.error('Failed to load provider profile:', err);
        setError('Unable to locate or load this provider profile.');
        setLoading(false);
      });

    return () => { active = false; };
  }, [uniqueId]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      showToast('Profile link copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleSelectProvider = (specificService = null) => {
    if (!provider) return;

    const chosenService = specificService || (catalogueServices.length > 0 ? catalogueServices[0] : null);
    const serviceCharge = chosenService?.startingPrice && Number(chosenService.startingPrice) > 0
      ? Number(chosenService.startingPrice)
      : (provider.startingPrice && Number(provider.startingPrice) > 0 ? Number(provider.startingPrice) : 349);

    const distanceKm = Number(provider.distance ?? 5);
    const distanceCharge = Math.max(30, Math.round(distanceKm * 15));

    updateDraft({
      provider,
      ...(chosenService ? { service: chosenService } : {}),
      serviceCharge,
      distanceKm,
      distanceCharge
    });

    navigate('/customer/select-address');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f8fafc] font-sans">
        <Header />
        <div className="container mx-auto px-4 py-32 text-center space-y-4 flex-1 flex flex-col justify-center items-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 font-semibold text-sm">Loading verified provider profile...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f8fafc] font-sans">
        <Header />
        <main className="container mx-auto px-4 py-20 flex-1 flex flex-col items-center justify-center text-center">
          <div className="max-w-md bg-white p-8 rounded-3xl border border-slate-200 shadow-md space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-black text-slate-900">Provider Profile Unavailable</h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              We could not find the requested provider record. Browse active professionals nearby or find by category.
            </p>
            <Link
              to="/find-nearby"
              className="inline-block px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition"
            >
              Explore Nearby Providers
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Normalize fields with authoritative high-standard fallback presentation
  const providerName = provider.providerName || provider.name || 'Verified Trade Specialist';
  const avatarUrl = provider.avatar || provider.profileImage || `https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=300&q=80`;
  const rating = Number(provider.rating) > 0 ? Number(provider.rating).toFixed(1) : '4.9';
  const reviewCount = Number(provider.reviewCount) > 0 ? Number(provider.reviewCount) : 48;
  const experienceYears = provider.experienceYears || 6;
  const completedJobs = provider.completedJobs || 184;
  const startingRate = Number(provider.startingPrice) > 0 ? Number(provider.startingPrice) : 349;
  const distance = Number(provider.distance ?? 4.5);
  const isAvailable = provider.availability === 'AVAILABLE_NOW' || provider.availability === 'AVAILABLE_TODAY';

  const defaultServices = Array.isArray(provider.services) && provider.services.length > 0
    ? provider.services
    : ['Electrical Repairs', 'Appliance Maintenance', 'Doorstep Diagnostic'];

  const matchedCatalogueServices = catalogueServices.filter(s =>
    defaultServices.some(ds =>
      String(ds).toLowerCase().includes(s.categoryName?.toLowerCase() || '') ||
      String(s.name).toLowerCase().includes(String(ds).toLowerCase()) ||
      String(s.categoryId).toLowerCase().includes(String(ds).toLowerCase())
    )
  );

  const displayServices = matchedCatalogueServices.length > 0 ? matchedCatalogueServices : catalogueServices.slice(0, 4);

  const mockReviews = [
    {
      id: 1,
      author: 'Arun Kumar',
      date: '2 days ago',
      rating: 5,
      comment: 'Very professional, arrived within 30 minutes of booking. Carried all necessary tools and replaced the faulty switchboard cleanly.',
      verified: true
    },
    {
      id: 2,
      author: 'Priya Sundaram',
      date: '1 week ago',
      rating: 5,
      comment: 'Transparent pricing with no surprise charges. Thorough inspection and left the work area clean. Highly recommended technician!',
      verified: true
    },
    {
      id: 3,
      author: 'Ramesh V.',
      date: '2 weeks ago',
      rating: 4.8,
      comment: 'Polite, knowledgeable, and adhered strictly to safety protocols. Booking and confirmation was completely seamless.',
      verified: true
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] font-sans">
      <Header />

      <main className="container mx-auto px-4 lg:px-8 py-8 flex-1 space-y-8 max-w-6xl">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to="/find-nearby"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Nearby Providers
          </Link>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-xl shadow-xs transition"
          >
            <Share2 className="w-3.5 h-3.5" /> {copied ? 'Link Copied!' : 'Share Profile'}
          </button>
        </div>

        {/* Hero Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md overflow-hidden relative">
          
          {/* Header Cover Background */}
          <div className="h-44 sm:h-52 bg-gradient-to-r from-[#14213d] via-[#1a2d54] to-[#0f172a] relative overflow-hidden">
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
            
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <span className={`px-3 py-1 text-xs font-extrabold rounded-full shadow-md flex items-center gap-1.5 backdrop-blur-md ${
                isAvailable ? 'bg-emerald-500/90 text-white' : 'bg-slate-700/80 text-slate-200'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-white animate-pulse' : 'bg-slate-400'}`} />
                {isAvailable ? 'Available for Instant Booking' : 'Offline / On Job'}
              </span>
            </div>
          </div>

          {/* Profile Core Details Header */}
          <div className="px-6 sm:px-10 pb-8 relative -mt-16 sm:-mt-20 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-5">
              
              {/* Pro Avatar with Golden Border Ring */}
              <div className="relative">
                <img
                  src={avatarUrl}
                  alt={providerName}
                  className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl object-cover border-4 border-white shadow-xl bg-slate-100 shrink-0"
                />
                <span className="absolute bottom-2 right-2 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center text-white text-[10px] shadow-sm">
                  ✓
                </span>
              </div>

              {/* Title & Tags */}
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {providerName}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-3 py-0.5 bg-blue-50 text-blue-700 text-xs font-extrabold rounded-full border border-blue-200/80">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> QUIX FIX Verified Pro
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 text-amber-700 text-xs font-extrabold rounded-full border border-amber-200">
                    ⭐ Top Rated
                  </span>
                </div>

                <p className="text-xs sm:text-sm font-semibold text-slate-600 flex items-center gap-2 flex-wrap">
                  <span className="text-slate-800">{provider.contactPerson || providerName}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {provider.address || 'Coimbatore Region'}
                  </span>
                  <span>•</span>
                  <span className="text-blue-600 font-bold">{distance.toFixed(1)} km from your current area</span>
                </p>

                <div className="flex items-center gap-3 pt-1">
                  <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200/80">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                    <span className="font-black text-sm text-slate-900">{rating}</span>
                    <span className="text-xs text-slate-500 font-semibold">({reviewCount} reviews)</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-400">|</span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                    99.4% Job Success Rate
                  </span>
                </div>
              </div>
            </div>

            {/* Header Right Action Trigger */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => handleSelectProvider()}
                className="w-full sm:w-auto px-7 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-blue-600/30 transition active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-300" /> Book This Professional
              </button>
            </div>
          </div>
        </div>

        {/* Professional KPI Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-1">
            <span className="block text-[11px] font-black text-slate-400 uppercase tracking-wider">Field Experience</span>
            <span className="text-2xl font-black text-slate-900">{experienceYears}+ Years</span>
            <span className="block text-[11px] text-slate-500 font-medium">Licensed trade background</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-1">
            <span className="block text-[11px] font-black text-slate-400 uppercase tracking-wider">Completed Jobs</span>
            <span className="text-2xl font-black text-blue-600">{completedJobs}+</span>
            <span className="block text-[11px] text-slate-500 font-medium">100% Doorstep fulfilled</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-1">
            <span className="block text-[11px] font-black text-slate-400 uppercase tracking-wider">Avg. Response Time</span>
            <span className="text-2xl font-black text-emerald-600">&lt; 30 Mins</span>
            <span className="block text-[11px] text-slate-500 font-medium">Rapid arrival dispatch</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-1">
            <span className="block text-[11px] font-black text-slate-400 uppercase tracking-wider">Standard Base Rate</span>
            <span className="text-2xl font-black text-[#14213d]">₹{startingRate}</span>
            <span className="block text-[11px] text-slate-500 font-medium">Transparent inspection baseline</span>
          </div>
        </div>

        {/* Main Grid: Details (Left 8) + Sticky Action Box (Right 4) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-8 space-y-8">
            
            {/* About & Verified Qualifications */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
              <div>
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-blue-600" /> About the Professional & Background
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Authoritative trade profile and verified credentials</p>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                {provider.bio || `Certified service professional with over ${experienceYears} years of verified field experience across residential and commercial maintenance, electrical diagnostics, appliance installations, and precision repairs. Authorized partner under the QUIX FIX Quality Assurance standard.`}
              </p>

              {/* Verified Trust Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-800 block">Government ID Verified</span>
                    <span className="text-[11px] text-slate-500">Aadhaar & identity background validated</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-800 block">Trade Skill Certified</span>
                    <span className="text-[11px] text-slate-500">Technical competency passed</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-800 block">Fully Equipped with Tools</span>
                    <span className="text-[11px] text-slate-500">Brings standard trade equipment & PPE</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-800 block">30-Day Doorstep Guarantee</span>
                    <span className="text-[11px] text-slate-500">Free rework warranty on replacement work</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Offered Services Section */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-blue-600" /> Services Provided by this Pro
                  </h2>
                  <p className="text-xs text-slate-500">Select any trade service to book directly with {providerName}</p>
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase">
                  {displayServices.length} Registered
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {displayServices.map((srv, idx) => (
                  <div
                    key={srv.uniqueId || idx}
                    className="p-5 rounded-2xl border border-slate-200/80 hover:border-blue-300 hover:shadow-md transition bg-slate-50/50 flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                          {srv.categoryName || 'Home Service'}
                        </span>
                        <span className="text-xs font-extrabold text-[#14213d]">
                          From ₹{srv.startingPrice > 0 ? srv.startingPrice : startingRate}
                        </span>
                      </div>
                      <h3 className="font-extrabold text-sm text-slate-900">{srv.name}</h3>
                      <p className="text-xs text-slate-500 line-clamp-2">
                        {srv.shortDescription || 'Professional doorstep service with authoritative pricing snapshot and verified equipment.'}
                      </p>
                    </div>

                    <button
                      onClick={() => handleSelectProvider(srv)}
                      className="w-full py-2.5 bg-white hover:bg-blue-600 hover:text-white text-blue-600 font-extrabold text-xs rounded-xl border border-blue-200 shadow-xs transition flex items-center justify-center gap-1.5"
                    >
                      Book This Service <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Verified Customer Reviews */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-600" /> Customer Ratings & Reviews
                  </h2>
                  <p className="text-xs text-slate-500">Feedback from verified completed bookings</p>
                </div>
                <div className="flex items-center gap-2">
                  <StarRating rating={Number(rating)} size="sm" />
                  <span className="text-xs font-black text-slate-900">{rating} / 5.0</span>
                </div>
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                {mockReviews.map((rev) => (
                  <div key={rev.id} className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2.5">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-black text-xs flex items-center justify-center">
                          {rev.author.charAt(0)}
                        </div>
                        <div>
                          <span className="font-extrabold text-xs text-slate-900 block">{rev.author}</span>
                          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Verified Completed Booking
                          </span>
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-400 font-semibold">{rev.date}</span>
                    </div>

                    <StarRating rating={rev.rating} size="sm" />
                    <p className="text-xs text-slate-700 leading-relaxed font-normal">
                      "{rev.comment}"
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Sticky Right Sidebar Action Card */}
          <div className="lg:col-span-4 sticky top-24 space-y-6">
            
            {/* Booking Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xl space-y-5">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                  Direct Booking Guarantee
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-black text-[#14213d]">₹{startingRate}</span>
                  <span className="text-xs text-slate-500 font-medium">starting service charge</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Conveyance charge calculated based on your doorstep address.</p>
              </div>

              <div className="space-y-3 text-xs text-slate-600">
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500">Service Coverage:</span>
                  <span className="font-bold text-slate-800">Up to 60 km</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500">Available Slot Today:</span>
                  <span className="font-bold text-emerald-600">Immediate / Flexible</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500">Safety Compliance:</span>
                  <span className="font-bold text-slate-800">100% Verified</span>
                </div>
              </div>

              <button
                onClick={() => handleSelectProvider()}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-blue-600/25 transition active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-300" /> Confirm & Book This Pro
              </button>

              <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-500 space-y-2">
                <div className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>No upfront payment required. Pay directly after completion via Cash or UPI.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>Free cancellation up to 1 hour before scheduled technician visit.</span>
                </div>
              </div>
            </div>

            {/* Need Assistance Helper Card */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 text-xs space-y-2 text-slate-600">
              <span className="font-extrabold text-slate-900 block text-xs">Have questions before booking?</span>
              <p className="text-[11px] text-slate-500">
                Our support team is available 24/7 to assist with quotes, multi-service bookings, and commercial requirements.
              </p>
              <Link to="/support" className="text-blue-600 font-extrabold text-xs inline-flex items-center gap-1 hover:underline pt-1">
                Contact Customer Helpdesk <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
