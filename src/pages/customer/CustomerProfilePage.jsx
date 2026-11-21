import React, { useEffect, useState } from 'react';
import { User, Mail, Phone, MapPin, ShieldCheck, Bell, LogOut, CalendarDays, ClipboardCheck, ArrowUpRight, Settings2, Pencil, X, Save } from 'lucide-react';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { bookingApi } from '../../api/bookingApi';
import { customerApi } from '../../api/customerApi';
import { useNotification } from '../../context/NotificationContext';

const Info = ({ icon: Icon, label, value }) => (
  <div className="flex gap-3 rounded-2xl bg-slate-50 p-4">
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-indigo-600 shadow-sm"><Icon size={18} /></span>
    <div className="min-w-0"><p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 truncate text-sm font-semibold text-slate-800">{value || 'Not added yet'}</p></div>
  </div>
);

export default function CustomerProfilePage() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useNotification();
  const [bookings, setBookings] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [profile, setProfile] = useState(user || {});
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', phoneNumber: '' });

  useEffect(() => {
    if (!user?.customerUniqueId) return;
    customerApi.getCustomerProfile(user.customerUniqueId).then((data) => setProfile({ ...user, ...data })).catch(() => setProfile(user || {}));
    bookingApi.getCustomerBookings(user.customerUniqueId).then(setBookings).catch(() => setBookings([]));
    customerApi.getSavedAddresses(user.customerUniqueId).then(setAddresses).catch(() => setAddresses([]));
  }, [user]);

  const openEditor = () => {
    const parts = (profile.name || user?.name || '').trim().split(/\s+/);
    setEditForm({ firstName: profile.firstName || parts[0] || '', lastName: profile.lastName || parts.slice(1).join(' '), phoneNumber: profile.phone || profile.phoneNumber || user?.phone || '' });
    setEditing(true);
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    if (!user?.customerUniqueId) return;
    setSaving(true);
    try {
      const updated = await customerApi.updateCustomerProfile(user.customerUniqueId, { ...profile, ...editForm, profileImage: profile.profileImage || user?.avatar });
      setProfile({ ...profile, ...updated });
      updateUser(updated);
      setEditing(false);
      showToast('Profile updated successfully.', 'success');
    } catch {
      showToast('Could not update your profile. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const isValidBooking = (b) => {
    if (!b) return false;
    const status = String(b.status || '').toUpperCase();
    if (status === 'DRAFT') return false;
    const hasProvider = Boolean(b.providerId || b.providerName || b.providerUniqueId);
    if (status === 'PENDING' && !hasProvider) return false;
    return true;
  };
  const validBookings = bookings.filter(isValidBooking);
  const completed = validBookings.filter((booking) => booking.status === 'COMPLETED').length;
  const active = validBookings.filter((booking) => !['COMPLETED', 'CUSTOMER_CANCELLED', 'CANCELLED', 'PROVIDER_CANCELLED', 'PROVIDER_REJECTED', 'REJECTED'].includes(booking.status)).length;
  const recent = [...validBookings].sort((a, b) => new Date(b.createdAt || b.bookingDate) - new Date(a.createdAt || a.bookingDate)).slice(0, 3);
  const memberSince = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'Quick-Fix member';

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Header />
      <main className="container mx-auto max-w-6xl flex-1 space-y-6 px-4 py-8 lg:px-8">
        <div className="flex flex-col gap-5 rounded-3xl bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 p-6 text-white shadow-xl sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="flex items-center gap-5">
            <img src={profile.avatar || profile.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} alt={profile.name || 'Customer'} className="h-20 w-20 rounded-2xl border-2 border-white/20 object-cover" />
            <div><p className="text-xs font-bold uppercase tracking-[.18em] text-indigo-200">Customer profile</p><h1 className="mt-1 text-2xl font-extrabold">{profile.name || 'Your account'}</h1><p className="mt-1 text-sm text-indigo-100">Member since {memberSince}</p><span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-200"><ShieldCheck size={14}/> Verified account</span></div>
          </div>
          <div className="flex flex-wrap gap-2"><button type="button" onClick={openEditor} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/20"><Pencil size={16}/> Edit profile</button><Link to="/customer/bookings" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-indigo-900 transition hover:bg-indigo-50">View my bookings <ArrowUpRight size={16}/></Link></div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[{ label: 'Total bookings', value: validBookings.length, icon: CalendarDays, color: 'text-indigo-600', to: '/customer/bookings' }, { label: 'Completed services', value: completed, icon: ClipboardCheck, color: 'text-emerald-600', to: '/customer/bookings' }, { label: 'Saved addresses', value: addresses.length, icon: MapPin, color: 'text-amber-600', to: '/customer/addresses' }].map(({ label, value, icon: Icon, color, to }) => <Link key={label} to={to} className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-2 text-3xl font-extrabold text-slate-900">{value}</p></div><Icon className={color} size={24}/></Link>)}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
          <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-7">
            <div className="mb-5 flex items-center justify-between"><div><h2 className="text-lg font-extrabold text-slate-900">Personal information</h2><p className="mt-1 text-sm text-slate-500">Your contact details for service updates</p></div><span className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600"><User size={18}/></span></div>
            <div className="grid gap-3 sm:grid-cols-2"><Info icon={User} label="Full name" value={profile.name}/><Info icon={Mail} label="Email address" value={profile.email}/><Info icon={Phone} label="Phone number" value={profile.phone || profile.phoneNumber}/><Info icon={MapPin} label="Service locations" value={`${addresses.length} saved address${addresses.length === 1 ? '' : 'es'}`}/></div>
            <div className="mt-5 flex flex-wrap gap-3"><Link to="/customer/addresses" className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">Manage addresses</Link><Link to="/customer/notifications" className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">Notification settings</Link></div>
          </section>

          <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-7">
            <div className="mb-5 flex items-center justify-between"><div><h2 className="text-lg font-extrabold text-slate-900">Account & preferences</h2><p className="mt-1 text-sm text-slate-500">Keep your account up to date</p></div><Settings2 size={20} className="text-slate-400"/></div>
            <div className="divide-y divide-slate-100">
              <Link to="/customer/notifications" className="flex items-center gap-3 py-4"><Bell className="text-indigo-600" size={19}/><div className="flex-1"><p className="text-sm font-bold text-slate-800">Notifications</p><p className="text-xs text-slate-500">Booking updates and reminders</p></div><ArrowUpRight size={16} className="text-slate-400"/></Link>
              <div className="flex items-center gap-3 py-4"><ShieldCheck className="text-emerald-600" size={19}/><div className="flex-1"><p className="text-sm font-bold text-slate-800">Account security</p><p className="text-xs text-slate-500">Your account is protected</p></div><span className="text-xs font-bold text-emerald-600">Active</span></div>
              <button onClick={handleLogout} className="flex w-full items-center gap-3 py-4 text-left text-rose-600"><LogOut size={19}/><div className="flex-1"><p className="text-sm font-bold">Sign out</p><p className="text-xs text-rose-400">Sign out of this device</p></div><ArrowUpRight size={16}/></button>
            </div>
          </section>
        </div>

        <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-7">
          <div className="mb-5 flex items-center justify-between"><div><h2 className="text-lg font-extrabold text-slate-900">Recent activity</h2><p className="mt-1 text-sm text-slate-500">A quick look at your latest service requests</p></div><Link to="/customer/bookings" className="text-sm font-bold text-indigo-600 hover:text-indigo-800">All bookings</Link></div>
          {recent.length ? <div className="divide-y divide-slate-100">{recent.map((booking) => <Link key={booking.bookingUniqueId} to={`/customer/bookings/${booking.bookingUniqueId}`} className="flex items-center gap-4 py-4"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600"><ClipboardCheck size={19}/></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-slate-800">{booking.serviceName || 'Home service'}</p><p className="mt-1 text-xs text-slate-500">{booking.bookingDate || 'Date not set'}{booking.providerName ? ` · ${booking.providerName}` : ''}</p></div><span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-600">{String(booking.status || 'REQUESTED').replaceAll('_', ' ')}</span></Link>)}</div> : <div className="rounded-2xl bg-slate-50 p-6 text-center"><p className="font-bold text-slate-700">Your service history will appear here</p><p className="mt-1 text-sm text-slate-500">{active ? `${active} service in progress` : 'Book a trusted local professional whenever you need one.'}</p><Link to="/services" className="mt-4 inline-flex rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white">Explore services</Link></div>}
        </section>
      </main>
      <Footer />
      {editing && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditing(false); }}><form onSubmit={saveProfile} className="w-full max-w-lg space-y-5 rounded-3xl bg-white p-6 shadow-2xl sm:p-8" aria-labelledby="edit-profile-title"><div className="flex items-start justify-between"><div><h2 id="edit-profile-title" className="text-xl font-extrabold text-slate-900">Edit your profile</h2><p className="mt-1 text-sm text-slate-500">Update the details used for your service bookings.</p></div><button type="button" onClick={() => setEditing(false)} aria-label="Close edit profile" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X size={20}/></button></div><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold text-slate-700">First name<input required value={editForm.firstName} onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-indigo-500" /></label><label className="text-sm font-semibold text-slate-700">Last name<input value={editForm.lastName} onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-indigo-500" /></label></div><label className="block text-sm font-semibold text-slate-700">Phone number<input required value={editForm.phoneNumber} onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-indigo-500" /></label><label className="block text-sm font-semibold text-slate-700">Email address<input readOnly value={profile.email || ''} className="mt-1.5 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-normal text-slate-500"/><span className="mt-1 block text-xs font-normal text-slate-400">Email changes aren’t available here.</span></label><div className="flex justify-end gap-3 pt-1"><button type="button" onClick={() => setEditing(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">Cancel</button><button disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700"><Save size={16}/>{saving ? 'Saving…' : 'Save changes'}</button></div></form></div>}
    </div>
  );
}
