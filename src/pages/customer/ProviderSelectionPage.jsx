import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, MapPin, Star, CheckCircle2, ChevronRight, User, Calendar, Clock, Tag } from 'lucide-react';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import BookingStepper from '../../components/booking/BookingStepper';
import PriceBreakdown from '../../components/booking/PriceBreakdown';
import StarRating from '../../components/common/StarRating';
import { useBooking } from '../../context/BookingContext';
import { providerApi } from '../../api/providerApi';
import { bookingApi } from '../../api/bookingApi';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

export default function ProviderSelectionPage() {
  const { bookingDraft, updateDraft } = useBooking();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [stepSubState, setStepSubState] = useState('CHOICE'); // 'CHOICE' | 'REVIEW'

  const { showToast } = useNotification();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    providerApi.getNearbyProviders().then(data => {
      setProviders(data);
      setLoading(false);
    });
  }, []);

  const handleSelectProvider = (prov) => {
    const distance = calculateDistance(bookingDraft.address, prov);
    const serviceCharge = bookingDraft.service?.startingPrice;
    const distanceCharge = calculateDistanceCharge(distance);
    updateDraft({
      provider: prov,
      distanceKm: distance,
      serviceCharge,
      distanceCharge
    });
    setStepSubState('REVIEW');
  };

  const handleConfirmBooking = async () => {
    setSubmitting(true);
    try {
      const payload = {
        serviceUniqueId: bookingDraft.service?.uniqueId,
        addressUniqueId: bookingDraft.address?.uniqueId,
        addressLine1: bookingDraft.address?.addressLine1,
        addressLine2: bookingDraft.address?.addressLine2,
        city: bookingDraft.address?.city,
        state: bookingDraft.address?.state,
        country: bookingDraft.address?.country,
        postalCode: bookingDraft.address?.postalCode,
        latitude: bookingDraft.address?.latitude,
        longitude: bookingDraft.address?.longitude,
        recipientName: user?.name,
        recipientPhone: user?.phone,
        bookingDate: bookingDraft.bookingDate,
        bookingTime: toBackendTime(bookingDraft.bookingTime)
      };

      const createdBooking = await bookingApi.createBooking(user.customerUniqueId, payload);
      const result = await bookingApi.selectProviderForBooking(
        createdBooking.bookingUniqueId,
        bookingDraft.provider.providerUniqueId
      );
      showToast('Booking Request Sent!', 'success');
      navigate('/customer/booking-confirmation', { state: { booking: result } });
    } catch (err) {
      showToast('Booking failed to submit. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Header />

      <main className="container mx-auto px-4 lg:px-8 py-8 flex-1 space-y-6">
        <BookingStepper currentStep={stepSubState === 'CHOICE' ? 4 : 5} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-8 space-y-6">
            
            {stepSubState === 'CHOICE' ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-extrabold text-slate-900">Choose Nearby Provider</h2>
                  <span className="text-xs font-semibold text-slate-500">Based on your selected location</span>
                </div>

                {providers.map((prov) => {
                  const isSelected = bookingDraft.provider?.providerUniqueId === prov.providerUniqueId;
                  const providerDistance = calculateDistance(bookingDraft.address, prov);
                  const providerTotal = (bookingDraft.service?.startingPrice || 0) + calculateDistanceCharge(providerDistance);

                  return (
                    <div
                      key={prov.providerUniqueId}
                      className={`bg-white rounded-3xl border transition-all p-6 space-y-4 ${
                        prov.recommended
                          ? 'border-emerald-300 ring-2 ring-emerald-500/10 shadow-md'
                          : 'border-slate-200/80 hover:border-indigo-200 shadow-xs'
                      }`}
                    >
                      {/* Recommendation Header */}
                      {prov.recommended && (
                        <div className="flex items-center justify-between bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200 text-xs font-bold text-emerald-800">
                          <span>⭐ Recommended for You</span>
                          <span>Fastest arrival & high customer score</span>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <img
                            src={prov.avatar}
                            alt={prov.providerName}
                            className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <h3 className="font-bold text-slate-900 text-base">{prov.providerName}</h3>
                            <div className="flex items-center gap-3 mt-1">
                              <StarRating rating={prov.rating} reviewCount={prov.reviewCount} />
                              <span className="text-xs font-bold text-indigo-600">{providerDistance} km away</span>
                            </div>
                            <span className="inline-block text-[11px] font-semibold text-emerald-700 mt-1">
                              • {prov.availability === 'AVAILABLE_NOW' ? 'Available Now' : 'Available in 30 mins'}
                            </span>
                          </div>
                        </div>

                        <div className="text-right sm:border-l sm:border-slate-100 sm:pl-6 space-y-2">
                          <div>
                            <span className="block text-[10px] font-bold text-slate-400 uppercase">Estimated Total</span>
                            <span className="text-xl font-extrabold text-indigo-600">₹{providerTotal}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => navigate(`/providers/${prov.providerUniqueId}`)}
                              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                            >
                              View Profile
                            </button>
                            <button
                              onClick={() => handleSelectProvider(prov)}
                              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 transition flex items-center gap-1"
                            >
                              Select Provider <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Review & Confirm Summary Step */
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
                <div className="border-b border-slate-100 pb-4 flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900">Review Booking Summary</h2>
                    <p className="text-xs text-slate-500">Please review all details before sending booking request</p>
                  </div>
                  <button
                    onClick={() => setStepSubState('CHOICE')}
                    className="text-xs font-bold text-indigo-600 hover:underline"
                  >
                    Change Provider
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                  
                  <div className="space-y-1 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                    <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5 text-indigo-600" /> Selected Service
                    </span>
                    <h4 className="font-bold text-slate-900 text-base">{bookingDraft.service?.name}</h4>
                    <p className="text-xs text-slate-500">{bookingDraft.service?.categoryName}</p>
                  </div>

                  <div className="space-y-1 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                    <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-indigo-600" /> Selected Provider
                    </span>
                    <h4 className="font-bold text-slate-900 text-base">{bookingDraft.provider?.providerName}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <StarRating rating={bookingDraft.provider?.rating} />
                      <span className="text-xs text-slate-500 font-semibold">• {bookingDraft.provider?.distance} km</span>
                    </div>
                  </div>

                  <div className="space-y-1 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                    <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-indigo-600" /> Service Location
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">{bookingDraft.address?.label}</h4>
                    <p className="text-xs text-slate-600">{bookingDraft.address?.addressLine1}, {bookingDraft.address?.city}</p>
                  </div>

                  <div className="space-y-1 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                    <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-indigo-600" /> Date & Time Slot
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">{bookingDraft.bookingDate}</h4>
                    <p className="text-xs text-indigo-600 font-bold">{bookingDraft.bookingTime}</p>
                  </div>

                </div>

                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center gap-3 text-xs text-emerald-900">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>
                    No advance payment required today. You pay directly to provider upon job completion.
                  </span>
                </div>
              </div>
            )}

          </div>

          {/* Sidebar Price Card & Confirm CTA */}
          <div className="lg:col-span-4 sticky top-24 space-y-6">
            <PriceBreakdown
              serviceCharge={bookingDraft.serviceCharge}
              distanceKm={bookingDraft.distanceKm}
              distanceCharge={bookingDraft.distanceCharge}
              totalPrice={bookingDraft.totalPrice}
            />

            {stepSubState === 'REVIEW' && (
              <button
                onClick={handleConfirmBooking}
                disabled={submitting}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base rounded-2xl shadow-xl shadow-emerald-600/30 transition flex items-center justify-center gap-2"
              >
                {submitting ? 'Submitting Request...' : 'Confirm Booking Request'}
              </button>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

function calculateDistance(address, provider) {
  if (![address?.latitude, address?.longitude, provider?.latitude, provider?.longitude].every(Number.isFinite)) {
    return 0;
  }
  const latDistance = (provider.latitude - address.latitude) * Math.PI / 180;
  const lonDistance = (provider.longitude - address.longitude) * Math.PI / 180;
  const a = Math.sin(latDistance / 2) ** 2 + Math.cos(address.latitude * Math.PI / 180)
    * Math.cos(provider.latitude * Math.PI / 180) * Math.sin(lonDistance / 2) ** 2;
  return Math.round(6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 100) / 100;
}

function calculateDistanceCharge(distance) {
  if (distance <= 2) return 30;
  if (distance <= 5) return 50;
  if (distance <= 10) return 100;
  return 150;
}

function toBackendTime(timeSlot) {
  const match = timeSlot?.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return undefined;
  let hour = Number(match[1]);
  if (match[3].toUpperCase() === 'PM' && hour !== 12) hour += 12;
  if (match[3].toUpperCase() === 'AM' && hour === 12) hour = 0;
  return `${String(hour).padStart(2, '0')}:${match[2]}:00`;
}
