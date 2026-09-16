import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck, MapPin, Star, Award, CheckCircle2, Clock, Phone, Mail, ArrowLeft, MessageSquare
} from 'lucide-react';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import StarRating from '../../components/common/StarRating';
import { providerApi } from '../../api/providerApi';
import { useBooking } from '../../context/BookingContext';

export default function ProviderDetailsPage() {
  const { uniqueId } = useParams();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { updateDraft } = useBooking();

  useEffect(() => {
    providerApi.getProviderById(uniqueId).then(data => {
      setProvider(data);
      setLoading(false);
    });
  }, [uniqueId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">Loading provider profile...</div>
        <Footer />
      </div>
    );
  }

  const handleSelectProvider = () => {
    updateDraft({
      provider,
      distanceKm: provider.distance,
      serviceCharge: provider.startingPrice,
      distanceCharge: Math.round(provider.distance * 50)
    });
    navigate('/customer/select-address');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Header />

      <main className="container mx-auto px-4 lg:px-8 py-8 flex-1 space-y-8">
        <Link to="/find-nearby" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition">
          <ArrowLeft className="w-4 h-4" /> Back to Nearby Providers Map
        </Link>

        {/* Hero Header Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="h-44 bg-gradient-to-r from-indigo-900 to-slate-900 relative">
            <img
              src={provider.coverImage}
              alt={provider.providerName}
              className="w-full h-full object-cover opacity-30"
            />
            {provider.recommended && (
              <span className="absolute top-4 right-4 px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full shadow-md">
                ⭐ Recommended Provider
              </span>
            )}
          </div>

          <div className="p-6 sm:p-8 relative -mt-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex items-end gap-5">
              <img
                src={provider.avatar}
                alt={provider.providerName}
                className="w-28 h-28 rounded-2xl object-cover border-4 border-white shadow-lg bg-white shrink-0"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-extrabold text-slate-900">{provider.providerName}</h1>
                  {provider.verified && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified
                    </span>
                  )}
                </div>
                <p className="text-xs font-semibold text-slate-500">{provider.contactPerson} • {provider.address}</p>
                <div className="flex items-center gap-3 pt-1">
                  <StarRating rating={provider.rating} reviewCount={provider.reviewCount} size="md" />
                  <span className="text-xs font-bold text-indigo-600 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {provider.distance} km away
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSelectProvider}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition"
              >
                Select Provider
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 text-center space-y-1">
            <span className="block text-[10px] font-bold text-slate-400 uppercase">Experience</span>
            <span className="text-xl font-extrabold text-slate-900">{provider.experienceYears}+ Years</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 text-center space-y-1">
            <span className="block text-[10px] font-bold text-slate-400 uppercase">Completed Jobs</span>
            <span className="text-xl font-extrabold text-slate-900">{provider.completedJobs}+</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 text-center space-y-1">
            <span className="block text-[10px] font-bold text-slate-400 uppercase">Availability</span>
            <span className="text-sm font-extrabold text-emerald-600 uppercase tracking-wider">
              {provider.availability === 'AVAILABLE_NOW' ? 'Available Now' : 'Available Today'}
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 text-center space-y-1">
            <span className="block text-[10px] font-bold text-slate-400 uppercase">Starting Price</span>
            <span className="text-xl font-extrabold text-indigo-600">₹{provider.startingPrice}</span>
          </div>
        </div>

        {/* Details & Reviews Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-8 space-y-6">
            
            {/* Bio */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 space-y-3">
              <h3 className="font-bold text-slate-900 text-base">About Provider</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{provider.bio}</p>
            </div>

            {/* Offered Services */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 space-y-4">
              <h3 className="font-bold text-slate-900 text-base">Services Offered</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {provider.services.map((srv, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-800">
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-indigo-600" /> {srv}
                    </span>
                    <span className="text-slate-500">From ₹{provider.startingPrice}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Reviews */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-indigo-600" /> Customer Reviews ({provider.reviews.length})
                </h3>
                <StarRating rating={provider.rating} />
              </div>

              <div className="space-y-4 pt-2">
                {provider.reviews.map((rev) => (
                  <div key={rev.id} className="p-4 bg-slate-50 rounded-xl space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900 text-xs">{rev.customerName}</span>
                      <span className="text-[11px] text-slate-400">{rev.date}</span>
                    </div>
                    <StarRating rating={rev.rating} size="sm" />
                    <p className="text-xs text-slate-600 italic">"{rev.comment}"</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Cancellation Info & Policy */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 space-y-4">
              <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Service Guarantee</h4>
              <ul className="space-y-3 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Free cancellation up to 1 hour before scheduled time slot.</span>
                </li>
                <li className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Transparent distance charge estimate upfront. No hidden fees.</span>
                </li>
                <li className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Quick-Fix 30-day service warranty on spare part replacements.</span>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
