import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, ShieldCheck, ArrowLeft, ChevronRight, AlertCircle } from 'lucide-react';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import StarRating from '../../components/common/StarRating';
import { serviceApi } from '../../api/serviceApi';
import { useBooking } from '../../context/BookingContext';

export default function ServiceDetailsPage() {
  const { uniqueId } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { updateDraft } = useBooking();

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    serviceApi.getServiceById(uniqueId)
      .then(data => {
        if (isMounted) {
          setService(data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          console.error('Error fetching service:', err);
          setError('Unable to load service details.');
          setLoading(false);
        }
      });

    return () => { isMounted = false; };
  }, [uniqueId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center text-slate-500 font-medium">
          Loading service details...
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        <main className="container mx-auto px-4 lg:px-8 py-16 flex-1 flex flex-col items-center justify-center text-center">
          <div className="max-w-md bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-extrabold text-slate-900">Service Not Found</h1>
            <p className="text-sm text-slate-600">
              The requested service is either unavailable or could not be loaded. Please browse available services.
            </p>
            <Link
              to="/customer/find-service"
              className="inline-block px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition shadow-md shadow-indigo-600/20"
            >
              Browse All Services
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const startingPrice = Number(service.startingPrice) || 399;
  const baseDistanceCharge = Number(service.baseDistanceCharge) || 30;
  const includedList = Array.isArray(service.included) && service.included.length > 0
    ? service.included
    : [
        'Verified technician visit at your doorstep',
        'Initial diagnostic and inspection check',
        'Standard tools and labor for service completion'
      ];
  const excludedList = Array.isArray(service.excluded) && service.excluded.length > 0
    ? service.excluded
    : [
        'Cost of replacement parts or hardware materials',
        'Major structural modifications or extensive rewiring'
      ];

  const handleBookService = () => {
    updateDraft({
      service,
      serviceCharge: startingPrice,
      bookingUniqueId: undefined,
      provider: null,
      distanceKm: undefined,
      distanceCharge: undefined
    });
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
                    {service.categoryName || 'Service'}
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                    {service.name || 'Home Service'}
                  </h1>
                </div>
                <div className="text-right">
                  <StarRating rating={service.rating ?? 4.8} reviewCount={service.reviewCount ?? 24} size="md" />
                  <span className="text-xs text-slate-500 mt-1 block">Est. Duration: {service.estimatedDuration || '45 - 60 mins'}</span>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-slate-900 text-base">Service Description</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {service.longDescription || service.shortDescription || 'Professional home service provided by verified local experts.'}
                </p>
              </div>

              {/* What's Included */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" /> What is Included
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {includedList.map((inc, i) => (
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
                  {excludedList.map((exc, i) => (
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
                  <span className="text-3xl font-extrabold text-indigo-600">₹{startingPrice}</span>
                  <span className="text-xs text-slate-500 font-medium">+ transparent distance fare</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 text-xs text-slate-600">
                <div className="flex justify-between font-semibold">
                  <span>Base Inspection Rate</span>
                  <span className="text-slate-900">₹{startingPrice}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Base Distance Rate</span>
                  <span className="text-slate-900">₹{baseDistanceCharge}</span>
                </div>
                <p className="text-[11px] text-slate-400 pt-1">
                  Exact distance fare calculated dynamically based on chosen nearby technician's live location (within 30 km).
                </p>
              </div>

              <button
                type="button"
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
