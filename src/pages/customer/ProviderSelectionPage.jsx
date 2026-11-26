import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, MapPin, ChevronRight, User, Calendar, Tag, ArrowLeft } from 'lucide-react';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import BookingStepper from '../../components/booking/BookingStepper';
import PriceBreakdown from '../../components/booking/PriceBreakdown';
import StarRating from '../../components/common/StarRating';
import LeafletMapComponent from '../../components/map/LeafletMapComponent';
import { useBooking } from '../../context/BookingContext';
import { bookingApi } from '../../api/bookingApi';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

export default function ProviderSelectionPage() {
  const { bookingDraft, updateDraft, resetDraft } = useBooking();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [discoveryError, setDiscoveryError] = useState('');
  const [searchAttempt, setSearchAttempt] = useState(0);
  const [stepSubState, setStepSubState] = useState('CHOICE'); // 'CHOICE' | 'REVIEW'

  const { showToast } = useNotification();
  const { user } = useAuth();
  const navigate = useNavigate();
  const missingService = !bookingDraft.service?.uniqueId;
  const missingAddress = !bookingDraft.address?.uniqueId;
  const missingCoordinates = !Number.isFinite(Number(bookingDraft.address?.latitude))
    || !Number.isFinite(Number(bookingDraft.address?.longitude));

  useEffect(() => {
    let active = true;
    let timeoutId;
    const loadEligibleProviders = async () => {
      if (missingService || missingAddress || missingCoordinates || !user?.customerUniqueId) {
        setDiscoveryError(!user?.customerUniqueId
          ? 'Sign in to your customer account before choosing a provider.'
          : missingService
            ? 'Your selected service is missing. Choose a service to continue.'
            : missingAddress
              ? 'Your service address is missing. Choose an address and appointment time to continue.'
              : 'Your service address has no map coordinates. Update the address before choosing a provider.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setDiscoveryError('');
        timeoutId = window.setTimeout(() => {
          if (active) {
            setLoading(false);
            setDiscoveryError('Provider search is taking longer than expected. Please try again.');
          }
        }, 12000);
        const eligible = await bookingApi.findNearbyProviders({
          serviceUniqueId: bookingDraft.service.uniqueId,
          latitude: bookingDraft.address?.latitude,
          longitude: bookingDraft.address?.longitude,
          addressUniqueId: bookingDraft.address?.uniqueId,
          maxDistanceKm: 60
        });
        if (active) {
          const raw = Array.isArray(eligible) ? eligible : [];
          const withinRadius = raw.filter(
            (p) => Number(p.distance ?? 0) <= 60
          );
          setProviders(withinRadius.length > 0 ? withinRadius : raw);
          setDiscoveryError('');
        }
      } catch (error) {
        if (active) {
          const serverMessage = error.response?.data?.message || error.response?.data?.error;
          setDiscoveryError(serverMessage || 'Unable to find eligible providers for this service and location. Please try again.');
        }
      } finally {
        window.clearTimeout(timeoutId);
        if (active) setLoading(false);
      }
    };
    loadEligibleProviders();
    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [bookingDraft.service?.uniqueId, bookingDraft.address?.uniqueId, bookingDraft.address?.latitude, bookingDraft.address?.longitude, bookingDraft.bookingDate, bookingDraft.bookingTime, user?.customerUniqueId, user?.name, user?.phone, updateDraft, searchAttempt]);

  const retryProviderSearch = () => {
    setSearchAttempt((attempt) => attempt + 1);
  };

  const recoverFromDiscoveryError = () => {
    if (!user?.customerUniqueId) navigate('/customer/login');
    else if (missingService) navigate('/customer/find-service');
    else if (missingAddress || missingCoordinates) navigate('/customer/select-address');
    else retryProviderSearch();
  };

  useEffect(() => {
    if (!loading && (missingService || missingAddress)) {
      const redirectTimer = window.setTimeout(() => {
        navigate(missingService ? '/customer/find-service' : '/customer/select-address', { replace: true });
      }, 3000);
      return () => window.clearTimeout(redirectTimer);
    }
    return undefined;
  }, [loading, missingService, missingAddress, navigate]);

  const handleSelectProvider = (prov) => {
    const distance = Number(prov.distance ?? calculateDistance(bookingDraft.address, prov));
    if (!Number.isFinite(distance)) {
      showToast('Provider matching requires coordinates for both the saved address and provider.', 'error');
      return;
    }
    if (distance > 150) {
      showToast('This provider is more than 150 km away. Please choose a nearby provider.', 'error');
      return;
    }
    const serviceCharge = Number(
      (bookingDraft.serviceCharge && bookingDraft.serviceCharge > 0)
        ? bookingDraft.serviceCharge
        : (prov.servicePrice && prov.servicePrice > 0
            ? prov.servicePrice
            : (bookingDraft.service?.startingPrice && bookingDraft.service.startingPrice > 0
                ? bookingDraft.service.startingPrice
                : 300))
    );
    const distanceCharge = calculateDistanceCharge(distance);
    updateDraft({
      provider: prov,
      distanceKm: distance,
      serviceCharge,
      distanceCharge
    });
    setStepSubState('REVIEW');
  };

  const handleDiscardDraft = async () => {
    if (bookingDraft.bookingUniqueId) {
      try {
        await bookingApi.deleteBooking(bookingDraft.bookingUniqueId);
      } catch {
        // ignore
      }
    }
    resetDraft();
    showToast('Booking draft discarded.', 'info');
    navigate('/customer/dashboard');
  };

  const handleConfirmBooking = async () => {
    if (!bookingDraft.provider?.providerUniqueId) {
      showToast('Please select a provider to continue.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      let pricingSelection = bookingDraft.pricingSelection;
      if (!pricingSelection && bookingDraft.service?.uniqueId) {
        pricingSelection = {
          serviceUniqueId: bookingDraft.service.uniqueId,
          packageId: null,
          selectedOptions: [],
          quantities: []
        };
      }

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
        bookingTime: toBackendTime(bookingDraft.bookingTime),
        providerUniqueId: bookingDraft.provider.providerUniqueId,
        pricingSelection: pricingSelection
      };

      const result = await bookingApi.createBooking(user.customerUniqueId, payload);
      resetDraft();
      showToast('Booking Request Sent!', 'success');
      navigate('/customer/booking-confirmation', { state: { booking: result } });
    } catch {
      showToast('Booking failed to submit. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Header />

      <main className="container mx-auto px-4 lg:px-8 py-8 flex-1 space-y-6">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => stepSubState === 'REVIEW' ? setStepSubState('CHOICE') : navigate(missingService ? '/customer/find-service' : '/customer/select-address')}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-xs transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            {stepSubState === 'REVIEW' ? 'Back to providers' : missingService ? 'Back to services' : 'Back to address & time'}
          </button>
          <button
            type="button"
            onClick={handleDiscardDraft}
            className="text-xs font-bold text-slate-500 hover:text-rose-600 transition px-3 py-2"
          >
            Exit & Discard Draft
          </button>
        </div>
        <BookingStepper currentStep={stepSubState === 'CHOICE' ? 4 : 5} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-8 space-y-6">
            
            {stepSubState === 'CHOICE' ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-extrabold text-slate-900">Choose Nearby Provider</h2>
                  <span className="text-xs font-semibold text-slate-500">Showing verified providers within 30 km</span>
                </div>

                {discoveryError && <div className="flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 sm:flex-row sm:items-center sm:justify-between"><p>{discoveryError}</p><button type="button" onClick={recoverFromDiscoveryError} className="shrink-0 rounded-xl bg-white px-4 py-2 text-xs font-bold text-rose-700 shadow-sm hover:bg-rose-100">{!user?.customerUniqueId ? 'Customer sign in' : missingService ? 'Choose a service' : (missingAddress || missingCoordinates) ? 'Choose an address' : 'Try again'}</button></div>}
                {loading && !discoveryError && <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-6 text-sm font-semibold text-slate-600"><span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"/>Finding nearby providers for your address…</div>}
                {!loading && !discoveryError && providers.length === 0 && (
                  <p className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">No eligible providers found within 30 km of your selected address.</p>
                )}
                {!loading && !discoveryError && providers.length > 0 && (
                  <LeafletMapComponent
                    customerLocation={{
                      lat: Number(bookingDraft.address?.latitude),
                      lng: Number(bookingDraft.address?.longitude),
                      name: bookingDraft.address?.label || 'Service address'
                    }}
                    providers={providers}
                    height="320px"
                  />
                )}
                {providers.map((prov) => {
                  const providerDistance = Number(prov.distance ?? calculateDistance(bookingDraft.address, prov));
                  const serviceCharge = Number(bookingDraft.serviceCharge ?? prov.servicePrice ?? bookingDraft.service?.startingPrice ?? 0);
                  const distanceCharge = calculateDistanceCharge(providerDistance);
                  const providerTotal = serviceCharge + distanceCharge;

                  return (
                    <div
                      key={prov.providerUniqueId}
                      className={`bg-white rounded-3xl border transition-all p-6 space-y-4 ${
                        prov.recommended
                          ? 'border-emerald-300 ring-2 ring-emerald-500/10 shadow-md'
                          : 'border-slate-200/80 hover:border-blue-200 shadow-xs'
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
                            src={prov.profileImage || prov.avatar || `https://ui-avatars.com/api/?background=2563eb&color=ffffff&name=${encodeURIComponent(prov.providerName)}`}
                            alt={prov.providerName}
                            className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <h3 className="font-bold text-slate-900 text-base">{prov.providerName}</h3>
                            <div className="flex items-center gap-3 mt-1">
                              <StarRating rating={prov.rating || 4.8} reviewCount={prov.reviewCount || 12} />
                              <span className="text-xs font-bold text-blue-600">{providerDistance} km away</span>
                            </div>
                            <span className="inline-block text-[11px] font-semibold text-emerald-700 mt-1">
                              • {(prov.availabilityStatus || prov.availability) === 'AVAILABLE_NOW' ? 'Available Now' : 'Available soon'}
                            </span>
                          </div>
                        </div>

                        <div className="text-right sm:border-l sm:border-slate-100 sm:pl-6 space-y-2">
                          <div>
                            <span className="block text-[10px] font-bold text-slate-400 uppercase">Estimated Total</span>
                            <span className="text-xl font-extrabold text-blue-600">₹{providerTotal}</span>
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
                              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20 transition flex items-center gap-1"
                            >
                              Select & Continue <ChevronRight className="w-4 h-4" />
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
                    className="text-xs font-bold text-blue-600 hover:underline"
                  >
                    Change Provider
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                  
                  <div className="space-y-1 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                    <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5 text-blue-600" /> Selected Service
                    </span>
                    <h4 className="font-bold text-slate-900 text-base">{bookingDraft.service?.name}</h4>
                    <p className="text-xs text-slate-500">{bookingDraft.service?.categoryName}</p>
                  </div>

                  <div className="space-y-1 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                    <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-blue-600" /> Selected Provider
                    </span>
                    <h4 className="font-bold text-slate-900 text-base">{bookingDraft.provider?.providerName}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <StarRating rating={bookingDraft.provider?.rating || 4.8} />
                      <span className="text-xs text-slate-500 font-semibold">• {bookingDraft.provider?.distance} km</span>
                    </div>
                  </div>

                  <div className="space-y-1 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                    <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-blue-600" /> Service Location
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">{bookingDraft.address?.label}</h4>
                    <p className="text-xs text-slate-600">{bookingDraft.address?.addressLine1}, {bookingDraft.address?.city}</p>
                  </div>

                  <div className="space-y-1 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                    <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" /> Date & Time Slot
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">{bookingDraft.bookingDate}</h4>
                    <p className="text-xs text-blue-600 font-bold">{bookingDraft.bookingTime}</p>
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
  const addressLatitude = Number(address?.latitude);
  const addressLongitude = Number(address?.longitude);
  const providerLatitude = Number(provider?.latitude);
  const providerLongitude = Number(provider?.longitude);
  if (![addressLatitude, addressLongitude, providerLatitude, providerLongitude].every(Number.isFinite)) {
    return null;
  }
  const latDistance = (providerLatitude - addressLatitude) * Math.PI / 180;
  const lonDistance = (providerLongitude - addressLongitude) * Math.PI / 180;
  const a = Math.sin(latDistance / 2) ** 2 + Math.cos(addressLatitude * Math.PI / 180)
    * Math.cos(providerLatitude * Math.PI / 180) * Math.sin(lonDistance / 2) ** 2;
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
