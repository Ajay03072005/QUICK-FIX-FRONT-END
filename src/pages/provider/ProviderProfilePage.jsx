import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  MapPin,
  Wrench,
  Phone,
  Mail,
  Award,
  Clock3,
  BriefcaseBusiness,
  CalendarDays,
  BadgeCheck,
  ArrowUpRight,
  UserRound,
  Star,
  Pencil,
  X,
  Save,
  LocateFixed,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import ProviderPortalNav from '../../components/provider/ProviderPortalNav';
import Footer from '../../components/common/Footer';
import StarRating from '../../components/common/StarRating';
import { useAuth } from '../../context/AuthContext';
import { providerApi } from '../../api/providerApi';
import { bookingApi } from '../../api/bookingApi';
import { useNotification } from '../../context/NotificationContext';
import { geocodeAddress, getCurrentCoordinates, reverseGeocodeCoordinates } from '../../utils/addressGeocoding';

const formatServiceName = (name) => {
  if (!name) return '';
  return name
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
};

const Detail = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 p-4 transition hover:bg-white hover:shadow-xs">
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
      <Icon size={18} />
    </span>
    <div className="min-w-0 flex-1">
      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-1 text-xs sm:text-sm font-bold text-slate-800 break-words">{value || 'Not provided'}</p>
    </div>
  </div>
);

export default function ProviderProfilePage() {
  const { user } = useAuth();
  const [provider, setProvider] = useState(user || {});
  const [bookings, setBookings] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [addressEditorOpen, setAddressEditorOpen] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [locatingAddress, setLocatingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({
    addressType: 'SERVICE',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    country: 'India',
    postalCode: '',
    latitude: '',
    longitude: ''
  });
  const { showToast } = useNotification();

  useEffect(() => {
    if (!user?.providerUniqueId) return;
    providerApi
      .getProviderById(user.providerUniqueId)
      .then((data) => setProvider({ ...user, ...data }))
      .catch(() => {});
    bookingApi
      .getProviderBookings(user.providerUniqueId)
      .then(setBookings)
      .catch(() => setBookings([]));
    providerApi
      .getSchedule(user.providerUniqueId)
      .then((data) => setSchedule(Array.isArray(data) ? data : []))
      .catch(() => setSchedule([]));
  }, [user]);

  useEffect(() => {
    if (!addressEditorOpen || addressForm.addressLine1 || locatingAddress) return;
    useCurrentLocation();
  }, [addressEditorOpen]);

  const isAvailable = ['AVAILABLE_NOW', 'AVAILABLE_TODAY'].includes(provider.availability);
  const completed = bookings.filter((booking) => booking.status === 'COMPLETED').length;
  const categories = [
    ...new Set(
      (provider.services || [])
        .map((service) => (typeof service === 'string' ? service : service.name))
        .filter(Boolean)
    )
  ];
  const recent = [...bookings]
    .sort((a, b) => new Date(b.createdAt || b.bookingDate) - new Date(a.createdAt || a.bookingDate))
    .slice(0, 4);
  const availabilityDays = schedule.filter((item) => item.isWorkingDay ?? item.workingDay).length;

  const toggleAvailability = async () => {
    const nextState = !isAvailable;
    try {
      await providerApi.updateAvailability(
        user?.providerUniqueId || user?.id,
        nextState ? 'AVAILABLE_NOW' : 'OFFLINE'
      );
      setProvider((prev) => ({
        ...prev,
        availability: nextState ? 'AVAILABLE_NOW' : 'OFFLINE'
      }));
      showToast(`Status updated: ${nextState ? 'ONLINE (Ready for bookings)' : 'OFFLINE (Paused)'}`, 'success');
    } catch {
      showToast('Could not update dispatch status. Please try again.', 'error');
    }
  };

  const openAddressEditor = () => {
    const address = provider.primaryAddress || {};
    setAddressForm({
      addressType: address.addressType || 'SERVICE',
      addressLine1: address.addressLine1 || '',
      addressLine2: address.addressLine2 || '',
      city: address.city || '',
      state: address.state || '',
      country: address.country || 'India',
      postalCode: address.postalCode || '',
      latitude: address.latitude ?? '',
      longitude: address.longitude ?? ''
    });
    setAddressEditorOpen(true);
  };

  const useCurrentLocation = async () => {
    setLocatingAddress(true);
    try {
      const coords = await getCurrentCoordinates();
      const detectedAddress = await reverseGeocodeCoordinates(coords.latitude, coords.longitude);
      setAddressForm((current) => ({
        ...current,
        ...detectedAddress,
        latitude: coords.latitude.toFixed(6),
        longitude: coords.longitude.toFixed(6)
      }));
      showToast('Current GPS location detected. Review before saving.', 'success');
    } catch {
      showToast('Could not read GPS location. Enter address manually.', 'error');
    } finally {
      setLocatingAddress(false);
    }
  };

  const savePrimaryAddress = async (event) => {
    event.preventDefault();
    if (!user?.providerUniqueId) return;
    setSavingAddress(true);
    try {
      const coordinates = await geocodeAddress(addressForm);
      const saved = await providerApi.updatePrimaryAddress(user.providerUniqueId, {
        ...addressForm,
        ...coordinates
      });
      const primaryAddress = {
        ...addressForm,
        primary: true,
        latitude: Number(saved.latitude),
        longitude: Number(saved.longitude)
      };
      setProvider((current) => ({
        ...current,
        primaryAddress,
        addresses: [primaryAddress],
        address: [
          addressForm.addressLine1,
          addressForm.addressLine2,
          addressForm.city,
          addressForm.state,
          addressForm.postalCode
        ]
          .filter(Boolean)
          .join(', '),
        latitude: primaryAddress.latitude,
        longitude: primaryAddress.longitude
      }));
      setAddressEditorOpen(false);
      showToast('Service address updated. Nearby customer matching radius updated.', 'success');
    } catch (error) {
      showToast(error.response?.data?.message || 'Could not save the service address.', 'error');
    } finally {
      setSavingAddress(false);
    }
  };

  const providerDisplayName = provider.providerName || user?.providerName || user?.name || 'Verified Partner';

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] font-sans text-slate-800 antialiased">
      <ProviderPortalNav />

      <main className="container mx-auto max-w-6xl flex-1 space-y-6 px-4 py-8 lg:px-8">
        
        {/* Profile Master Hero Card - Clean White SaaS Architecture */}
        <section className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            
            {/* Left: Avatar & Identity Details */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-2 border-slate-100 bg-slate-100 shadow-xs shrink-0 overflow-hidden">
                <img
                  src={
                    provider.avatar ||
                    user?.avatar ||
                    'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150'
                  }
                  alt={providerDisplayName}
                  className="w-full h-full object-cover"
                />
                <span
                  className={`absolute bottom-1.5 right-1.5 w-4 h-4 rounded-full border-2 border-white ${
                    isAvailable ? 'bg-emerald-500' : 'bg-slate-400'
                  }`}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {providerDisplayName}
                  </h1>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <BadgeCheck size={14} className="text-emerald-600" /> Verified Partner
                  </span>
                </div>

                <p className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <MapPin size={14} className="text-slate-400 shrink-0" />
                  <span>{provider.address || 'Service Location Pending · Set primary service radius'}</span>
                </p>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 pt-1">
                  <div className="flex items-center gap-1">
                    <StarRating
                      rating={Number(provider.rating || 5.0)}
                      reviewCount={Number(provider.reviewCount || provider.reviews?.length || 1)}
                    />
                  </div>
                  <span>•</span>
                  <span className="font-semibold text-slate-700">
                    {provider.experienceYears ? `${provider.experienceYears}+ years experience` : '5+ years experience'}
                  </span>
                  <span>•</span>
                  <span className="font-mono text-slate-500">
                    Partner ID: <strong className="text-slate-800">{provider.providerUniqueId || 'SNEB8B'}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Dispatch Status & Quick Action */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                type="button"
                onClick={toggleAvailability}
                className={`inline-flex items-center justify-between sm:justify-center gap-2.5 px-4 py-2.5 rounded-2xl border text-xs font-bold transition active:scale-95 ${
                  isAvailable
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                  {isAvailable ? 'Dispatch Status: Online' : 'Dispatch Status: Offline'}
                </span>
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                  {isAvailable ? 'Go Offline' : 'Go Online'}
                </span>
              </button>

              <button
                type="button"
                onClick={openAddressEditor}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 text-xs font-bold shadow-md shadow-blue-600/20 transition active:scale-95"
              >
                <Pencil size={13} /> Edit Service Area
              </button>
            </div>

          </div>

          {/* Sub-bar with trust highlight */}
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 pt-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Doorstep Verification Certified · Priority dispatch enabled within 100km radius</span>
            </div>
            <Link
              to="/provider/history"
              className="font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              View Service History <ArrowUpRight size={13} />
            </Link>
          </div>
        </section>

        {/* 4 Crisp KPI Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                <BriefcaseBusiness size={18} />
              </span>
              <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                Fulfilled
              </span>
            </div>
            <p className="mt-3 text-2xl font-black text-slate-900">{completed || 1}</p>
            <p className="mt-0.5 text-xs font-bold text-slate-700">Completed Orders</p>
            <p className="text-[11px] text-slate-400 mt-1">100% verified doorstep jobs</p>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                <Wrench size={18} />
              </span>
              <span className="text-[10px] font-black uppercase text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                Active
              </span>
            </div>
            <p className="mt-3 text-2xl font-black text-slate-900">{categories.length || 3}</p>
            <p className="mt-0.5 text-xs font-bold text-slate-700">Services Offered</p>
            <p className="text-[11px] text-slate-400 mt-1">Approved for dispatch</p>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                <CalendarDays size={18} />
              </span>
              <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                Schedule
              </span>
            </div>
            <p className="mt-3 text-2xl font-black text-slate-900">{availabilityDays || 7} Days</p>
            <p className="mt-0.5 text-xs font-bold text-slate-700">Weekly Coverage</p>
            <p className="text-[11px] text-slate-400 mt-1">Standard shift: 9 AM - 7 PM</p>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="p-2.5 rounded-xl bg-amber-50 text-amber-500">
                <Star size={18} />
              </span>
              <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                Top Rated
              </span>
            </div>
            <p className="mt-3 text-2xl font-black text-slate-900">
              {provider.rating ? `${provider.rating} / 5` : '5.0 / 5'}
            </p>
            <p className="mt-0.5 text-xs font-bold text-slate-700">Customer Rating</p>
            <p className="text-[11px] text-slate-400 mt-1">High customer satisfaction</p>
          </div>
        </div>

        {/* Two-Column Section: Business Information & Services */}
        <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
          
          {/* Business & Contact Information */}
          <section className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs sm:p-7 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-black text-slate-900">Business & Contact Details</h2>
                <p className="text-xs text-slate-500">Contact information used for verified customer bookings</p>
              </div>
              <button
                type="button"
                onClick={openAddressEditor}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 transition"
              >
                <Pencil size={13} /> {provider.primaryAddress ? 'Edit Address' : 'Add Address'}
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Detail icon={UserRound} label="Business / Contact Name" value={provider.contactPerson || providerDisplayName} />
              <Detail icon={Phone} label="Direct Contact Line" value={provider.phone || '+91 98765 43210'} />
              <Detail icon={Mail} label="Official Email" value={provider.email} />
              <Detail icon={MapPin} label="Service Area Coverage" value={provider.address || 'Bengaluru Urban & Suburbs'} />
            </div>
          </section>

          {/* Services & Expertise */}
          <section className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs sm:p-7 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
                  <Wrench size={18} />
                </span>
                <div>
                  <h2 className="text-base font-black text-slate-900">Services & Expertise</h2>
                  <p className="text-xs text-slate-500">Approved skills available for booking</p>
                </div>
              </div>

              <Link
                to="/provider/explore-services"
                className="text-xs font-bold text-blue-600 hover:text-blue-800"
              >
                + Add Services
              </Link>
            </div>

            {categories.length ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {categories.map((service) => (
                  <span
                    key={service}
                    className="rounded-xl border border-blue-200 bg-blue-50/70 px-3.5 py-1.5 text-xs font-bold text-blue-900 shadow-xs"
                  >
                    {formatServiceName(service)}
                  </span>
                ))}
              </div>
            ) : (
              <p className="rounded-2xl bg-slate-50 p-4 text-xs font-medium text-slate-500">
                No services are linked to this profile yet. Explore the catalogue to apply.
              </p>
            )}

            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
              <Award className="mt-0.5 shrink-0 text-amber-600" size={18} />
              <div>
                <p className="text-xs font-bold text-amber-900">Partner Quality Standard</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-amber-800">
                  Your identity and trade credentials are fully verified. Maintaining an on-time arrival rate above 95% unlocks priority customer routing.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Recent Jobs */}
        <section className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs sm:p-7">
          <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-black text-slate-900">Recent Customer Bookings</h2>
              <p className="text-xs text-slate-500">Your latest service engagements and dispatches</p>
            </div>
            <Link
              to="/provider/history"
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800"
            >
              Full History <ArrowUpRight size={14} />
            </Link>
          </div>

          {recent.length ? (
            <div className="divide-y divide-slate-100">
              {recent.map((booking) => (
                <div key={booking.bookingUniqueId} className="flex items-center gap-4 py-3.5">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600">
                    <BriefcaseBusiness size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-extrabold text-slate-900">
                      {booking.serviceName || 'Home Service'}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {booking.bookingDate || 'Scheduled date'} {booking.customerName ? ` · ${booking.customerName}` : ''}
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase text-slate-700">
                    {String(booking.status || 'REQUESTED').replaceAll('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-slate-50 p-6 text-center text-xs text-slate-500">
              <Clock3 className="mx-auto mb-2 text-slate-400" size={22} />
              Bookings will automatically appear here as customers select your services.
            </div>
          )}
        </section>

      </main>

      <Footer />

      {/* Service Address Editor Modal */}
      {addressEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4">
          <form
            onSubmit={savePrimaryAddress}
            className="max-h-[90vh] w-full max-w-xl space-y-4 overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
          >
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-lg font-black text-slate-900">Service Coverage Location</h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Customers nearby use this address to find and match with you.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAddressEditorOpen(false)}
                aria-label="Close address editor"
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <label className="block text-xs font-bold text-slate-700 uppercase">
              Address Line 1 *
              <input
                required
                value={addressForm.addressLine1}
                onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                placeholder="Street, building or workshop"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-blue-600"
              />
            </label>

            <label className="block text-xs font-bold text-slate-700 uppercase">
              Address Line 2
              <input
                value={addressForm.addressLine2}
                onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
                placeholder="Area or landmark"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-blue-600"
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-bold text-slate-700 uppercase">
                City *
                <input
                  required
                  value={addressForm.city}
                  onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-blue-600"
                />
              </label>
              <label className="text-xs font-bold text-slate-700 uppercase">
                State *
                <input
                  required
                  value={addressForm.state}
                  onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-blue-600"
                />
              </label>
              <label className="text-xs font-bold text-slate-700 uppercase">
                Postal Code *
                <input
                  required
                  value={addressForm.postalCode}
                  onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-blue-600"
                />
              </label>
              <label className="text-xs font-bold text-slate-700 uppercase">
                Country
                <input
                  required
                  value={addressForm.country}
                  onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-blue-600"
                />
              </label>
            </div>

            <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-bold text-slate-800">Geographic GPS Coordinates</p>
                  <p className="text-[11px] text-slate-500">Auto-detected for radial distance search (within 100km).</p>
                </div>
                <button
                  type="button"
                  onClick={useCurrentLocation}
                  disabled={locatingAddress}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-blue-700 border border-slate-200 shadow-xs hover:bg-blue-50 disabled:opacity-60"
                >
                  <LocateFixed size={13} /> {locatingAddress ? 'Locating...' : 'Use Current GPS'}
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-[11px] font-semibold text-slate-600">
                  Latitude
                  <input
                    required
                    type="number"
                    step="any"
                    min="-90"
                    max="90"
                    value={addressForm.latitude}
                    onChange={(e) => setAddressForm({ ...addressForm, latitude: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </label>
                <label className="text-[11px] font-semibold text-slate-600">
                  Longitude
                  <input
                    required
                    type="number"
                    step="any"
                    min="-180"
                    max="180"
                    value={addressForm.longitude}
                    onChange={(e) => setAddressForm({ ...addressForm, longitude: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAddressEditorOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                disabled={savingAddress}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-60 shadow-md transition"
              >
                <Save size={14} /> {savingAddress ? 'Saving Location...' : 'Save Location'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
