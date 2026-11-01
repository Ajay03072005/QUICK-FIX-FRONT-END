import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, MapPin, Wrench, Phone, Mail, Award, Clock3, BriefcaseBusiness, CalendarDays, BadgeCheck, ArrowUpRight, UserRound, Star, Pencil, X, Save, LocateFixed } from 'lucide-react';
import ProviderPortalNav from '../../components/provider/ProviderPortalNav';
import Footer from '../../components/common/Footer';
import StarRating from '../../components/common/StarRating';
import { useAuth } from '../../context/AuthContext';
import { providerApi } from '../../api/providerApi';
import { bookingApi } from '../../api/bookingApi';
import { useNotification } from '../../context/NotificationContext';

const Detail = ({ icon: Icon, label, value }) => <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-indigo-600 shadow-sm"><Icon size={18}/></span><div><p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 text-sm font-semibold text-slate-800">{value || 'Not provided'}</p></div></div>;

export default function ProviderProfilePage() {
  const { user } = useAuth();
  const [provider, setProvider] = useState(user || {});
  const [bookings, setBookings] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [addressEditorOpen, setAddressEditorOpen] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({ addressType: 'SERVICE', addressLine1: '', addressLine2: '', city: '', state: '', country: 'India', postalCode: '', latitude: '', longitude: '' });
  const { showToast } = useNotification();

  useEffect(() => {
    if (!user?.providerUniqueId) return;
    providerApi.getProviderById(user.providerUniqueId).then((data) => setProvider({ ...user, ...data })).catch(() => {});
    bookingApi.getProviderBookings(user.providerUniqueId).then(setBookings).catch(() => setBookings([]));
    providerApi.getSchedule(user.providerUniqueId).then((data) => setSchedule(Array.isArray(data) ? data : [])).catch(() => setSchedule([]));
  }, [user]);

  const completed = bookings.filter((booking) => booking.status === 'COMPLETED').length;
  const categories = [...new Set((provider.services || []).map((service) => typeof service === 'string' ? service : service.name).filter(Boolean))];
  const recent = [...bookings].sort((a, b) => new Date(b.createdAt || b.bookingDate) - new Date(a.createdAt || a.bookingDate)).slice(0, 3);
  const isAvailable = ['AVAILABLE_NOW', 'AVAILABLE_TODAY'].includes(provider.availability);

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

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      showToast('Location is not available in this browser.', 'error');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => setAddressForm((current) => ({ ...current, latitude: coords.latitude.toFixed(6), longitude: coords.longitude.toFixed(6) })),
      () => showToast('Could not read your current location. Enter coordinates manually.', 'error'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const savePrimaryAddress = async (event) => {
    event.preventDefault();
    if (!user?.providerUniqueId) return;
    setSavingAddress(true);
    try {
      const saved = await providerApi.updatePrimaryAddress(user.providerUniqueId, addressForm);
      const primaryAddress = { ...addressForm, primary: true, latitude: Number(saved.latitude), longitude: Number(saved.longitude) };
      setProvider((current) => ({ ...current, primaryAddress, addresses: [primaryAddress], address: [addressForm.addressLine1, addressForm.addressLine2, addressForm.city, addressForm.state, addressForm.postalCode].filter(Boolean).join(', '), latitude: primaryAddress.latitude, longitude: primaryAddress.longitude }));
      setAddressEditorOpen(false);
      showToast('Service address saved. Nearby matching can now use this location.', 'success');
    } catch (error) {
      showToast(error.response?.data?.message || 'Could not save the service address. Please try again.', 'error');
    } finally {
      setSavingAddress(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <ProviderPortalNav />
      <main className="container mx-auto max-w-6xl flex-1 space-y-6 px-4 py-8 lg:px-8">
        <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
          <div className="h-28 bg-gradient-to-r from-indigo-950 via-indigo-800 to-cyan-700" />
          <div className="px-6 pb-6 sm:px-8">
            <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-end gap-4"><img src={provider.avatar || user?.avatar || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150'} alt={provider.providerName || 'Provider'} className="h-24 w-24 rounded-2xl border-4 border-white bg-white object-cover shadow-md"/><div className="pb-1"><div className="flex flex-wrap items-center gap-2"><h1 className="text-2xl font-extrabold text-slate-900">{provider.providerName || 'Your business profile'}</h1><span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700"><BadgeCheck size={14}/> Verified partner</span></div><p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500"><MapPin size={15}/>{provider.address || 'Add your service location'}</p></div></div>
              <span className={`inline-flex items-center gap-2 self-start rounded-full px-3 py-2 text-xs font-bold sm:self-auto ${isAvailable ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}><span className={`h-2 w-2 rounded-full ${isAvailable ? 'bg-emerald-500' : 'bg-slate-400'}`}/>{isAvailable ? 'Available for bookings' : 'Currently offline'}</span>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-100 pt-4"><StarRating rating={Number(provider.rating || 0)} reviewCount={Number(provider.reviewCount || provider.reviews?.length || 0)}/><span className="text-xs text-slate-500">{provider.experienceYears ? `${provider.experienceYears}+ years experience` : 'Trusted local professional'}</span><span className="text-xs text-slate-500">Provider ID: {provider.providerUniqueId || 'Pending'}</span></div>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[{ label: 'Completed jobs', value: completed, icon: BriefcaseBusiness, tone: 'text-emerald-600' }, { label: 'Services offered', value: categories.length, icon: Wrench, tone: 'text-indigo-600' }, { label: 'Availability days', value: schedule.length, icon: CalendarDays, tone: 'text-amber-600' }, { label: 'Customer rating', value: provider.rating ? `${provider.rating}/5` : '—', icon: Star, tone: 'text-orange-500' }].map(({ label, value, icon: Icon, tone }) => <div key={label} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"><Icon size={20} className={tone}/><p className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 text-2xl font-extrabold text-slate-900">{value}</p></div>)}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_.95fr]">
          <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-7">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-extrabold text-slate-900">Business information</h2><p className="mt-1 text-sm text-slate-500">How customers can find and contact you</p></div><button type="button" onClick={openAddressEditor} className="inline-flex items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50 px-3.5 py-2.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100"><Pencil size={14}/>{provider.primaryAddress ? 'Edit service address' : 'Add service address'}</button></div>
            <div className="grid gap-3 sm:grid-cols-2"><Detail icon={UserRound} label="Business / contact name" value={provider.contactPerson || provider.providerName}/><Detail icon={Phone} label="Phone number" value={provider.phone}/><Detail icon={Mail} label="Email address" value={provider.email}/><Detail icon={MapPin} label="Service area" value={provider.address}/></div>
          </section>
          <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-7">
            <div className="mb-5 flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600"><Wrench size={19}/></span><div><h2 className="text-lg font-extrabold text-slate-900">Services & expertise</h2><p className="text-sm text-slate-500">Work customers can book from you</p></div></div>
            {categories.length ? <div className="flex flex-wrap gap-2">{categories.map((service) => <span key={service} className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-800">{service}</span>)}</div> : <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">No services are linked to this profile yet.</p>}
            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50 p-4"><Award className="mt-0.5 shrink-0 text-amber-600" size={19}/><div><p className="text-sm font-bold text-slate-800">Professional status</p><p className="mt-1 text-xs leading-relaxed text-slate-600">Your identity is verified. Keep your service list and contact details current to help customers choose you.</p></div></div>
          </section>
        </div>

        <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-7">
          <div className="mb-5 flex items-center justify-between"><div><h2 className="text-lg font-extrabold text-slate-900">Recent jobs</h2><p className="mt-1 text-sm text-slate-500">Your latest customer requests</p></div><Link to="/provider/history" className="inline-flex items-center gap-1 text-sm font-bold text-indigo-600 hover:text-indigo-800">Service history <ArrowUpRight size={15}/></Link></div>
          {recent.length ? <div className="divide-y divide-slate-100">{recent.map((booking) => <div key={booking.bookingUniqueId} className="flex items-center gap-4 py-4"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600"><BriefcaseBusiness size={18}/></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-slate-800">{booking.serviceName || 'Home service'}</p><p className="mt-1 text-xs text-slate-500">{booking.bookingDate || 'Date not set'}{booking.customerName ? ` · ${booking.customerName}` : ''}</p></div><span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-600">{String(booking.status || 'REQUESTED').replaceAll('_', ' ')}</span></div>)}</div> : <div className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500"><Clock3 className="mb-2 text-slate-400" size={20}/>Jobs will show here as customers book your services.</div>}
        </section>
      </main>
      <Footer />
      {addressEditorOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"><form onSubmit={savePrimaryAddress} className="max-h-[90vh] w-full max-w-xl space-y-4 overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8"><div className="flex items-start justify-between"><div><h2 className="text-xl font-extrabold text-slate-900">Service address</h2><p className="mt-1 text-sm text-slate-500">Customers nearby use this location to find and book you.</p></div><button type="button" onClick={() => setAddressEditorOpen(false)} aria-label="Close address editor" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X size={20}/></button></div><label className="block text-sm font-semibold text-slate-700">Address line 1<input required value={addressForm.addressLine1} onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })} placeholder="Street, building or workshop" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-indigo-500"/></label><label className="block text-sm font-semibold text-slate-700">Address line 2<input value={addressForm.addressLine2} onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })} placeholder="Area or landmark" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-indigo-500"/></label><div className="grid gap-3 sm:grid-cols-2"><label className="text-sm font-semibold text-slate-700">City<input required value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-indigo-500"/></label><label className="text-sm font-semibold text-slate-700">State<input required value={addressForm.state} onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-indigo-500"/></label><label className="text-sm font-semibold text-slate-700">Postal code<input required value={addressForm.postalCode} onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-indigo-500"/></label><label className="text-sm font-semibold text-slate-700">Country<input required value={addressForm.country} onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-indigo-500"/></label></div><div className="rounded-2xl bg-slate-50 p-4"><div className="mb-3 flex flex-wrap items-center justify-between gap-2"><div><p className="text-sm font-bold text-slate-800">Map coordinates</p><p className="text-xs text-slate-500">Required to match customers nearby.</p></div><button type="button" onClick={useCurrentLocation} className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-bold text-indigo-700 shadow-sm hover:bg-indigo-50"><LocateFixed size={14}/>Use current location</button></div><div className="grid gap-3 sm:grid-cols-2"><label className="text-xs font-semibold text-slate-600">Latitude<input required type="number" step="any" min="-90" max="90" value={addressForm.latitude} onChange={(e) => setAddressForm({ ...addressForm, latitude: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500"/></label><label className="text-xs font-semibold text-slate-600">Longitude<input required type="number" step="any" min="-180" max="180" value={addressForm.longitude} onChange={(e) => setAddressForm({ ...addressForm, longitude: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500"/></label></div></div><div className="flex justify-end gap-3 pt-1"><button type="button" onClick={() => setAddressEditorOpen(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">Cancel</button><button disabled={savingAddress} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-60"><Save size={16}/>{savingAddress ? 'Saving…' : 'Save address'}</button></div></form></div>}
    </div>
  );
}
