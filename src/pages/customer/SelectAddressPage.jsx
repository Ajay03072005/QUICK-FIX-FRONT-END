import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Plus, Calendar, Clock, ChevronRight, CheckCircle2, Home, Briefcase, Building, Pencil, X, Save } from 'lucide-react';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import BookingStepper from '../../components/booking/BookingStepper';
import PriceBreakdown from '../../components/booking/PriceBreakdown';
import { useBooking } from '../../context/BookingContext';
import { customerApi } from '../../api/customerApi';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { geocodeAddress, getCurrentCoordinates, reverseGeocodeCoordinates } from '../../utils/addressGeocoding';

export default function SelectAddressPage() {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const { bookingDraft, updateDraft } = useBooking();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddrId, setSelectedAddrId] = useState(bookingDraft.address?.id || 'ADDR-01');
  const [date, setDate] = useState(bookingDraft.bookingDate || new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState(bookingDraft.bookingTime || '10:30 AM');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAddr, setNewAddr] = useState({ label: 'HOME', addressLine1: '', addressLine2: '', city: '', state: '', postalCode: '' });
  const [editingAddress, setEditingAddress] = useState(null);
  const [savingAddress, setSavingAddress] = useState(false);
  const [locatingAddress, setLocatingAddress] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.customerUniqueId) customerApi.getSavedAddresses(user.customerUniqueId).then(data => {
      setAddresses(data);
      if (data.length > 0 && !bookingDraft.address) {
        updateDraft({ address: data[0] });
      }
    });
  }, []);

  useEffect(() => {
    if (!showAddModal || editingAddress || newAddr.addressLine1 || locatingAddress) return;
    useCurrentLocation();
  }, [showAddModal]);

  const handleSelectAddress = (addr) => {
    setSelectedAddrId(addr.id);
    const changedAddress = bookingDraft.address?.id !== addr.id;
    updateDraft({ address: addr, ...(changedAddress ? { bookingUniqueId: undefined, provider: null } : {}) });
  };

  const handleAddNewAddress = async (e) => {
    e.preventDefault();
    setSavingAddress(true);
    try {
      const coordinates = await geocodeAddress(newAddr);
      const created = await customerApi.addSavedAddress(user.customerUniqueId, { ...newAddr, ...coordinates });
      setAddresses([created, ...addresses]);
      handleSelectAddress(created);
      setShowAddModal(false);
    } catch {
      showToast('Could not find that address. Check the city and PIN code.', 'error');
    } finally {
      setSavingAddress(false);
    }
  };

  const startEditingAddress = (event, address) => {
    event.stopPropagation();
    setEditingAddress(address);
    setNewAddr({
      label: address.type || address.label || 'HOME',
      addressLine1: address.addressLine1 || '',
      addressLine2: address.addressLine2 || '',
      city: address.city || '',
      state: address.state || '',
      postalCode: address.postalCode || '',
      country: address.country || 'India',
      latitude: address.latitude,
      longitude: address.longitude,
      isDefault: address.isDefault
    });
  };

  const handleUpdateAddress = async (event) => {
    event.preventDefault();
    if (!user?.customerUniqueId || !editingAddress?.uniqueId) return;
    setSavingAddress(true);
    try {
      const coordinates = await geocodeAddress(newAddr);
      const updated = await customerApi.updateSavedAddress(user.customerUniqueId, editingAddress.uniqueId, { ...newAddr, ...coordinates });
      setAddresses((current) => current.map((address) => address.id === editingAddress.id ? updated : address));
      if (bookingDraft.address?.id === editingAddress.id) {
        updateDraft({ address: updated, bookingUniqueId: undefined, provider: null });
      }
      setEditingAddress(null);
      showToast('Address updated successfully.', 'success');
    } catch {
      showToast('Could not update this address. Please try again.', 'error');
    } finally {
      setSavingAddress(false);
    }
  };

  const useCurrentLocation = async () => {
    setLocatingAddress(true);
    try {
      const coords = await getCurrentCoordinates();
      const detectedAddress = await reverseGeocodeCoordinates(coords.latitude, coords.longitude);
      setNewAddr((current) => ({ ...current, ...detectedAddress, latitude: coords.latitude, longitude: coords.longitude }));
      showToast('Current location loaded. Review the address before saving.', 'success');
    } catch {
      showToast('Could not read your current location. Enter the address manually.', 'error');
    } finally {
      setLocatingAddress(false);
    }
  };

  const timeSlots = [
    '09:00 AM - 10:00 AM',
    '10:30 AM - 11:30 AM',
    '01:00 PM - 02:00 PM',
    '03:30 PM - 04:30 PM',
    '05:00 PM - 06:00 PM'
  ];

  const handleContinue = () => {
    const chosenAddr = addresses.find(a => a.id === selectedAddrId) || addresses[0];
    const appointmentChanged = bookingDraft.address?.id !== chosenAddr?.id
      || bookingDraft.bookingDate !== date
      || bookingDraft.bookingTime !== timeSlot;
    updateDraft({
      address: chosenAddr,
      bookingDate: date,
      bookingTime: timeSlot,
      ...(appointmentChanged ? { bookingUniqueId: undefined, provider: null } : {})
    });
    navigate('/customer/provider-selection');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Header />

      <main className="container mx-auto px-4 lg:px-8 py-8 flex-1 space-y-6">
        <BookingStepper currentStep={2} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-8 space-y-6">
            
            {/* Address Selection Card */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">Select Service Address</h2>
                  <p className="text-xs text-slate-500">Where do you need the technician to arrive?</p>
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add New Address
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr) => {
                  const isSelected = selectedAddrId === addr.id;
                  return (
                    <div
                      key={addr.id}
                      onClick={() => handleSelectAddress(addr)}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                        isSelected
                          ? 'border-indigo-600 ring-2 ring-indigo-600/20 bg-indigo-50/20 shadow-xs'
                          : 'border-slate-200/80 hover:border-indigo-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 font-bold text-xs text-slate-900 uppercase">
                          {addr.type === 'HOME' && <Home className="w-4 h-4 text-indigo-600" />}
                          {addr.type === 'WORK' && <Briefcase className="w-4 h-4 text-indigo-600" />}
                          {addr.type === 'OTHER' && <Building className="w-4 h-4 text-indigo-600" />}
                          {addr.label}
                        </span>
                        <span className="flex items-center gap-2">
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                          <button type="button" onClick={(event) => startEditingAddress(event, addr)} aria-label={`Edit ${addr.label} address`} className="rounded-lg p-1.5 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600"><Pencil className="h-4 w-4"/></button>
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed font-medium">
                        {addr.addressLine1}, {addr.addressLine2}, {addr.city} - {addr.postalCode}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Date & Time Slot Picker */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-extrabold text-slate-900">Select Date & Time</h2>
                <p className="text-xs text-slate-500">Pick your preferred arrival schedule</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Service Date</label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Available Time Slot</label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <select
                      value={timeSlot}
                      onChange={(e) => setTimeSlot(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                    >
                      {timeSlots.map((slot, idx) => (
                        <option key={idx} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Sidebar Summary Card */}
          <div className="lg:col-span-4 sticky top-24 space-y-6">
            <PriceBreakdown
              serviceCharge={bookingDraft.serviceCharge}
              distanceKm={bookingDraft.distanceKm}
              distanceCharge={bookingDraft.distanceCharge}
              totalPrice={bookingDraft.totalPrice}
            />

            <button
              onClick={handleContinue}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2"
            >
              Continue to Choose Provider <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </main>

      {/* Add New Address Modal */}
      {(showAddModal || editingAddress) && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl">
            <div className="flex items-center justify-between"><h3 className="text-lg font-bold text-slate-900">{editingAddress ? 'Edit Service Address' : 'Add New Service Address'}</h3><button type="button" onClick={() => { setShowAddModal(false); setEditingAddress(null); }} aria-label="Close address editor" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5"/></button></div>
            <form onSubmit={editingAddress ? handleUpdateAddress : handleAddNewAddress} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Address type</label>
                <select required value={newAddr.label} onChange={(e) => setNewAddr({ ...newAddr, label: e.target.value })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"><option value="HOME">Home</option><option value="OFFICE">Office</option><option value="OTHER">Other</option></select>
              </div>
              <button type="button" onClick={useCurrentLocation} disabled={locatingAddress} className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2.5 font-bold text-indigo-700 disabled:opacity-60"><MapPin className="h-4 w-4"/>{locatingAddress ? 'Finding location…' : 'Use my current location'}</button>
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Address Line 1</label>
                <input
                  type="text"
                  required
                  placeholder="Flat No, Apartment Name"
                  value={newAddr.addressLine1}
                  onChange={(e) => setNewAddr({ ...newAddr, addressLine1: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Address Line 2 / Landmark</label>
                <input
                  type="text"
                  placeholder="Street name, Landmark"
                  value={newAddr.addressLine2}
                  onChange={(e) => setNewAddr({ ...newAddr, addressLine2: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">City</label>
                  <input
                    type="text"
                    value={newAddr.city}
                    onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Postal Code</label>
                  <input
                    type="text"
                    value={newAddr.postalCode}
                    onChange={(e) => setNewAddr({ ...newAddr, postalCode: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">State</label>
                <input type="text" value={newAddr.state || ''} onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setEditingAddress(null); }}
                  className="flex-1 py-3 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button type="submit" disabled={savingAddress} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md disabled:opacity-60">
                  {editingAddress ? <><Save className="mr-1 inline h-4 w-4"/>{savingAddress ? 'Saving…' : 'Save Changes'}</> : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
