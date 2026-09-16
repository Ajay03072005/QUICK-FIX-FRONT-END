import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Clock, ShieldCheck, MapPin, ArrowLeft, Star, ChevronRight } from 'lucide-react';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import StarRating from '../../components/common/StarRating';
import { serviceApi } from '../../api/serviceApi';
import { useBooking } from '../../context/BookingContext';

export default function ServiceDetailsPage() {
  const { uniqueId } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { updateDraft } = useBooking();

  useEffect(() => {
    serviceApi.getServiceById(uniqueId).then(data => {
      setService(data);
      setLoading(false);
    });
  }, [uniqueId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">Loading service details...</div>
        <Footer />
      </div>
    );
  }

  const handleBookService = () => {
    updateDraft({ service, serviceCharge: service.startingPrice });
    navigate('/customer/select-address');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Header />

      <main className="container mx-auto px-4 lg:px-8 py-8 flex-1 space-y-8">
        <Link to="/services" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition">
          <ArrowLeft className="w-4 h-4" /> Back to Services
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Service Details */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6">
                <div>
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg">
                    {service.categoryName}
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">{service.name}</h1>
                </div>
                <div className="text-right">
                  <StarRating rating={service.rating} reviewCount={service.reviewCount} size="md" />
                  <span className="text-xs text-slate-500 mt-1 block">Est. Duration: {service.estimatedDuration}</span>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-slate-900 text-base">Service Description</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{service.longDescription}</p>
              </div>

              {/* What's Included */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" /> What is Included
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {service.included.map((inc, i) => (
                    <div key={i} className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-start gap-2 text-xs font-semibold text-emerald-900">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{inc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* What's Excluded */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-rose-500" /> What is Excluded
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {service.excluded.map((exc, i) => (
                    <div key={i} className="p-3 bg-rose-50/60 rounded-xl border border-rose-100 flex items-start gap-2 text-xs font-semibold text-rose-900">
                      <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <span>{exc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Pricing & Booking Card (Col 4) */}
          <div className="lg:col-span-4 sticky top-24">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-lg space-y-6">
              <div>
                <span className="block text-xs font-bold text-slate-400 uppercase">Starting Service Price</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-extrabold text-indigo-600">₹{service.startingPrice}</span>
                  <span className="text-xs text-slate-500 font-medium">+ transparent distance fare</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 text-xs text-slate-600">
                <div className="flex justify-between font-semibold">
                  <span>Base Inspection Rate</span>
                  <span className="text-slate-900">₹{service.startingPrice}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Base Distance Rate</span>
                  <span className="text-slate-900">₹{service.baseDistanceCharge}</span>
                </div>
                <p className="text-[11px] text-slate-400 pt-1">
                  Exact distance fare calculated dynamically based on chosen nearby technician's live location.
                </p>
              </div>

              <button
                onClick={handleBookService}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2"
              >
                Proceed to Book Service <ChevronRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-xs font-medium text-slate-500 pt-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Verified Technicians & Transparent Billing
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
