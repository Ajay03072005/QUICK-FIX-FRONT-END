import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, ShieldCheck, ArrowLeft, AlertCircle } from 'lucide-react';
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
              to="/services"
              className="inline-block px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition shadow-md shadow-emerald-600/20"
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

      <main className="container mx-auto px-4 lg:px-8 py-8 flex-1 space-y-6">
        <Link to="/services" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-700">
          <ArrowLeft className="w-4 h-4" /> Back to Services
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-100">
                  {service.categoryName || 'Home Service'}
                </span>
                <StarRating rating={service.rating} reviewCount={service.reviewCount} />
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{service.name}</h1>
              <p className="text-slate-600 text-sm leading-relaxed">{service.longDescription || service.shortDescription}</p>

              <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-emerald-950 block">Quick-Fix Guaranteed Quality</span>
                  <span className="text-emerald-800">Only verified local technicians, transparent pricing, and pay after completion.</span>
                </div>
              </div>
            </div>

            {/* Inclusions / Exclusions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> What's Included
                </h3>
                <ul className="space-y-2 text-xs text-slate-600">
                  {includedList.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-rose-500" /> What's Excluded
                </h3>
                <ul className="space-y-2 text-xs text-slate-600">
                  {excludedList.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Pricing & Booking Card */}
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-md space-y-5 sticky top-24">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Base Service Charge</span>
                <span className="text-3xl font-black text-emerald-700">₹{startingPrice}</span>
                <p className="text-[11px] text-slate-500 mt-1">Conveyance charge calculated based on exact technician distance.</p>
              </div>

              <button
                onClick={handleBookService}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-600/25 transition active:scale-[0.99]"
              >
                Book This Service Now
              </button>

              <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-500 space-y-1.5">
                <p>✔ Pay online via UPI/Card or Cash on Doorstep</p>
                <p>✔ Free cancellation before technician departure</p>
                <p>✔ Live GPS tracking once en route</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
