import React, { useState, useEffect } from 'react';
import { Home, Briefcase, Building, Plus, Trash2, Edit3, MapPin, X, Save } from 'lucide-react';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import { customerApi } from '../../api/customerApi';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

export default function SavedAddressesPage() {
  const [addresses, setAddresses] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [saving, setSaving] = useState(false);
  const [newAddr, setNewAddr] = useState({ label: 'HOME', addressLine1: '', addressLine2: '', city: 'Coimbatore', state: 'Tamil Nadu', postalCode: '641002' });
  const { showToast } = useNotification();
  const { user } = useAuth();

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = () => {
    if (user?.customerUniqueId) customerApi.getSavedAddresses(user.customerUniqueId).then(setAddresses);
  };

  const handleDelete = (id) => {
    customerApi.deleteSavedAddress(user.customerUniqueId, id).then(() => {
      showToast('Address deleted', 'info');
      fetchAddresses();
    });
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    customerApi.addSavedAddress(user.customerUniqueId, newAddr).then(() => {
      showToast('New address saved', 'success');
      setShowAddModal(false);
      fetchAddresses();
    });
  };

  const startEdit = (address) => {
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

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await customerApi.updateSavedAddress(user.customerUniqueId, editingAddress.uniqueId, newAddr);
      showToast('Address updated successfully', 'success');
      setEditingAddress(null);
      fetchAddresses();
    } catch {
      showToast('Could not update this address. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Header />

      <main className="container mx-auto px-4 lg:px-8 py-8 flex-1 space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Saved Addresses</h1>
            <p className="text-xs text-slate-500">Manage your saved home, work, and service locations</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add New Address
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 font-extrabold text-sm text-slate-900">
                    {addr.type === 'HOME' && <Home className="w-4 h-4 text-indigo-600" />}
                    {addr.type === 'WORK' && <Briefcase className="w-4 h-4 text-indigo-600" />}
                    {addr.type === 'OTHER' && <Building className="w-4 h-4 text-indigo-600" />}
                    {addr.label}
                  </span>
                  {addr.isDefault && (
                    <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-full border border-indigo-200">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {addr.addressLine1}, {addr.addressLine2}, {addr.city}, {addr.state} - {addr.postalCode}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 text-xs">
                <button onClick={() => startEdit(addr)} className="px-3 py-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg font-bold transition flex items-center gap-1">
                  <Edit3 className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(addr.id)}
                  className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg font-bold transition flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Modal */}
      {(showAddModal || editingAddress) && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl">
            <div className="flex items-center justify-between"><h3 className="text-lg font-bold text-slate-900">{editingAddress ? 'Edit Service Address' : 'Add New Service Address'}</h3><button type="button" onClick={() => { setShowAddModal(false); setEditingAddress(null); }} aria-label="Close address form" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5"/></button></div>
            <form onSubmit={editingAddress ? handleUpdate : handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Address type</label>
                <select required value={newAddr.label} onChange={(e) => setNewAddr({ ...newAddr, label: e.target.value })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"><option value="HOME">Home</option><option value="OFFICE">Office</option><option value="OTHER">Other</option></select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Address Line 1</label>
                <input
                  type="text"
                  required
                  placeholder="123 DB Road, R.S. Puram"
                  value={newAddr.addressLine1}
                  onChange={(e) => setNewAddr({ ...newAddr, addressLine1: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Address Line 2</label>
                <input
                  type="text"
                  placeholder="Near Post Office"
                  value={newAddr.addressLine2}
                  onChange={(e) => setNewAddr({ ...newAddr, addressLine2: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">City</label>
                  <input
                    type="text"
                    value={newAddr.city}
                    onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Postal Code</label>
                  <input
                    type="text"
                    value={newAddr.postalCode}
                    onChange={(e) => setNewAddr({ ...newAddr, postalCode: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
              <div><label className="block font-bold text-slate-700 uppercase mb-1">State</label><input type="text" value={newAddr.state || ''} onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"/></div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setEditingAddress(null); }}
                  className="flex-1 py-3 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md disabled:opacity-60">
                  {editingAddress ? <><Save className="mr-1 inline h-4 w-4"/>{saving ? 'Saving…' : 'Save Changes'}</> : 'Save Address'}
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
