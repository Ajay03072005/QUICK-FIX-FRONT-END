import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle2, Wrench } from 'lucide-react';
import ProviderPortalNav from '../../components/provider/ProviderPortalNav';
import Footer from '../../components/common/Footer';
import { providerApi } from '../../api/providerApi';
import { serviceApi } from '../../api/serviceApi';
import { useAuth } from '../../context/AuthContext';

export default function ProviderServicesPage() {
  const [services, setServices] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.providerUniqueId) return;
    Promise.all([providerApi.getProviderById(user.providerUniqueId), serviceApi.getAllServices()]).then(([provider, allServices]) => {
      const offered = new Set((provider.providerServices || []).map(item => item.service));
      setServices(allServices.filter(service => offered.has(service.categoryId)).map(service => ({
        name: service.name,
        startingPrice: service.startingPrice,
        active: true
      })));
    });
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <ProviderPortalNav />

      <main className="container mx-auto px-4 lg:px-8 py-8 flex-1 space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Provider Catalog & Pricing</h1>
            <p className="text-xs text-slate-500">Configure your offered services and starting rates</p>
          </div>
          <button className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-xs">
            + Add New Service
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {services.map((srv, i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200/80 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{srv.name}</h4>
                <span className="text-xs font-bold text-indigo-600">Starts at ₹{srv.startingPrice}</span>
              </div>
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200">
                Active
              </span>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
