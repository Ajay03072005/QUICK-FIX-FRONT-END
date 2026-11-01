import React, { useEffect, useMemo, useState } from 'react';
import { Plus, CheckCircle2, Wrench, X, Save } from 'lucide-react';
import ProviderPortalNav from '../../components/provider/ProviderPortalNav';
import Footer from '../../components/common/Footer';
import { providerApi } from '../../api/providerApi';
import { serviceApi } from '../../api/serviceApi';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

export default function ProviderServicesPage() {
  const [services, setServices] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const { showToast } = useNotification();

  useEffect(() => {
    if (!user?.providerUniqueId) {
      setLoading(false);
      return;
    }
    let mounted = true;
    setLoading(true);
    Promise.all([providerApi.getProviderById(user.providerUniqueId), serviceApi.getAllServices()])
      .then(([provider, allServices]) => {
        if (!mounted) return;
        const activeCategories = new Set((provider.providerServices || [])
          .filter((item) => String(item.status || '').toUpperCase() === 'ACTIVE')
          .map((item) => item.service));
        const offered = allServices.filter((service) => activeCategories.has(service.categoryId));
        setCatalog(allServices);
        setServices([...new Map(offered.map((service) => [service.categoryId, {
          categoryId: service.categoryId,
          name: service.categoryName,
          startingPrice: service.startingPrice
        }])).values()]);
        setLoadError('');
      })
      .catch(() => { if (mounted) setLoadError('Could not load your service catalog. Please refresh and try again.'); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [user?.providerUniqueId]);

  const availableServices = useMemo(() => {
    const offeredCategories = new Set(services.map((service) => service.categoryId));
    return [...new Map(catalog.filter((service) => !offeredCategories.has(service.categoryId))
      .map((service) => [service.categoryId, service])).values()];
  }, [catalog, services]);

  const handleAddService = async (event) => {
    event.preventDefault();
    const selected = availableServices.find((service) => service.categoryId === selectedServiceId);
    if (!selected || !user?.providerUniqueId) return;
    setSaving(true);
    try {
      await providerApi.addProviderService(user.providerUniqueId, selected.categoryId);
      setServices((current) => [...current, {
        categoryId: selected.categoryId,
        name: selected.categoryName,
        startingPrice: selected.startingPrice
      }]);
      setEditorOpen(false);
      setSelectedServiceId('');
      showToast('Service added to your provider catalog.', 'success');
    } catch (error) {
      showToast(error.response?.data?.message || 'Could not add this service. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <ProviderPortalNav />
      <main className="container mx-auto max-w-4xl flex-1 space-y-6 px-4 py-8 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div><h1 className="text-2xl font-extrabold text-slate-900">Provider Catalog & Pricing</h1><p className="mt-1 text-sm text-slate-500">Configure the services customers can book from you.</p></div>
          <button type="button" onClick={() => { setSelectedServiceId(availableServices[0]?.categoryId || ''); setEditorOpen(true); }} disabled={loading || availableServices.length === 0} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"><Plus className="h-4 w-4"/>Add New Service</button>
        </div>

        {loadError && <p className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{loadError}</p>}
        {loading ? <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Loading your services…</div>
          : services.length === 0 ? <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center"><Wrench className="mx-auto h-8 w-8 text-indigo-400"/><h2 className="mt-3 font-bold text-slate-800">No services in your catalog yet</h2><p className="mt-1 text-sm text-slate-500">Add a catalog service so customers can find and book you.</p></div>
            : <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{services.map((service) => <div key={service.categoryId} className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-5"><div><h2 className="text-sm font-bold text-slate-900">{service.name}</h2><span className="mt-1 block text-xs font-bold text-indigo-600">Catalog rate from ₹{service.startingPrice}</span></div><span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5"/>Active</span></div>)}</div>}
      </main>
      <Footer />

      {editorOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"><form onSubmit={handleAddService} className="w-full max-w-md space-y-5 rounded-3xl bg-white p-6 shadow-2xl sm:p-8"><div className="flex items-start justify-between"><div><h2 className="text-xl font-extrabold text-slate-900">Add a service</h2><p className="mt-1 text-sm text-slate-500">Choose a service category for your catalog.</p></div><button type="button" onClick={() => setEditorOpen(false)} aria-label="Close service form" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5"/></button></div>{availableServices.length ? <label className="block text-sm font-semibold text-slate-700">Service category<select required value={selectedServiceId} onChange={(event) => setSelectedServiceId(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-indigo-500">{availableServices.map((service) => <option key={service.categoryId} value={service.categoryId}>{service.categoryName} · from ₹{service.startingPrice}</option>)}</select><span className="mt-2 block text-xs font-normal text-slate-500">The catalog rate is set by Quick-Fix.</span></label> : <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">You already offer every service in the catalog.</p>}<div className="flex justify-end gap-3"><button type="button" onClick={() => setEditorOpen(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">Cancel</button><button type="submit" disabled={saving || !availableServices.length} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-60"><Save className="h-4 w-4"/>{saving ? 'Saving…' : 'Add service'}</button></div></form></div>}
    </div>
  );
}
