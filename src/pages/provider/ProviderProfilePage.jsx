import React, { useEffect, useState } from 'react';
import { ShieldCheck, MapPin, Wrench, Phone, Mail, Award, Clock } from 'lucide-react';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import StarRating from '../../components/common/StarRating';
import { useAuth } from '../../context/AuthContext';
import { providerApi } from '../../api/providerApi';

export default function ProviderProfilePage() {
  const { user } = useAuth();
  const [provider, setProvider] = useState(user);

  useEffect(() => {
    if (user?.providerUniqueId) providerApi.getProviderById(user.providerUniqueId).then(setProvider);
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Header />

      <main className="container mx-auto px-4 lg:px-8 py-8 flex-1 space-y-6 max-w-4xl">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150'}
              alt={provider?.providerName || 'Provider'}
              className="w-20 h-20 rounded-2xl object-cover border border-slate-200 shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-slate-900">{provider?.providerName}</h1>
                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
                  Verified
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{provider?.address}</p>
              <div className="pt-2">
                <StarRating rating={4.8} reviewCount={142} />
              </div>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Contact Information</h3>
            <p className="text-xs text-slate-600">Phone: {provider?.phone}</p>
            <p className="text-xs text-slate-600">Email: {provider?.email}</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Service Experience</h3>
            <p className="text-xs text-slate-600">6+ Years HVAC & Electrical Repair</p>
            <p className="text-xs text-slate-600">320+ Completed Services</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
