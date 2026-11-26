import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Users,
  Wrench,
  CalendarCheck,
  DollarSign,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Search,
  Activity,
  CreditCard,
  RefreshCw,
  Eye,
  Send,
  Layers
} from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { serviceApi } from '../../api/serviceApi';

export default function AdminPortalPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Data states
  const [providers, setProviders] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [services, setServices] = useState([]);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');

  // Payout Form Modal
  const [selectedProviderForPayout, setSelectedProviderForPayout] = useState('');
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutMessage, setPayoutMessage] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [provRes, bookRes, ledgerRes, auditRes, srvRes] = await Promise.allSettled([
        adminApi.getAllProviders(),
        adminApi.getAllBookings(),
        adminApi.getAllLedgerEntries(),
        adminApi.getAuditLogs(),
        serviceApi.getAllServices()
      ]);

      if (provRes.status === 'fulfilled') setProviders(provRes.value || []);
      if (bookRes.status === 'fulfilled') setBookings(bookRes.value || []);
      if (ledgerRes.status === 'fulfilled') setLedgerEntries(ledgerRes.value || []);
      if (auditRes.status === 'fulfilled') setAuditLogs(auditRes.value || []);
      if (srvRes.status === 'fulfilled') setServices(srvRes.value || []);
    } catch (err) {
      console.error("Failed to load admin portal data:", err);
      setError("Failed to synchronize admin console data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDocumentStatus = async (documentId, status) => {
    try {
      await adminApi.updateDocumentStatus(documentId, status);
      await adminApi.logAction({
        actor: 'ADMIN_CONSOLE',
        action: `DOCUMENT_${status}`,
        targetType: 'PROVIDER_DOCUMENT',
        targetId: String(documentId),
        reason: `Admin updated document status to ${status}`
      });
      fetchData();
    } catch (err) {
      alert('Failed to update document status');
    }
  };

  const handleCreatePayout = async (e) => {
    e.preventDefault();
    if (!selectedProviderForPayout || !payoutAmount) return;
    try {
      setPayoutMessage('Processing payout...');
      await adminApi.createPayout(selectedProviderForPayout, parseFloat(payoutAmount));
      await adminApi.logAction({
        actor: 'ADMIN_CONSOLE',
        action: 'CREATE_PAYOUT',
        targetType: 'PROVIDER',
        targetId: selectedProviderForPayout,
        reason: `Payout of $${payoutAmount} issued to ${selectedProviderForPayout}`
      });
      setPayoutMessage('Payout created successfully!');
      setPayoutAmount('');
      fetchData();
    } catch (err) {
      setPayoutMessage('Payout failed: ' + (err.response?.data?.message || err.message));
    }
  };

  // Metrics calculation
  const totalVolume = ledgerEntries.reduce((sum, e) => sum + (e.amount || 0), 0);
  const pendingVerifications = providers.filter(p => !p.verified || p.verificationStatus === 'PENDING').length;

  return (
    <main className="min-h-screen bg-slate-950 font-sans text-white">
      {/* Top Admin Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-cyan-500/10 p-2 text-cyan-400">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">Quick-Fix Admin Console</h1>
              <p className="text-xs text-slate-400">System Operations, Verification & Financial Ledger</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={fetchData}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-slate-700"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Console
            </button>
            <Link to="/" className="text-xs font-semibold text-cyan-400 hover:underline">
              Exit to App
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Navigation Tabs */}
        <nav className="mb-8 flex gap-2 border-b border-slate-800 pb-4">
          {[
            { id: 'overview', label: 'Overview & Metrics', icon: Activity },
            { id: 'providers', label: `Provider Queue (${pendingVerifications})`, icon: Wrench },
            { id: 'bookings', label: `Bookings (${bookings.length})`, icon: CalendarCheck },
            { id: 'services', label: `Services (${services.length})`, icon: Layers },
            { id: 'finance', label: 'Finance & Ledger', icon: DollarSign },
            { id: 'audit', label: 'Audit Logs', icon: FileText }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-semibold uppercase tracking-wider">Total Bookings</span>
                  <CalendarCheck className="h-5 w-5 text-cyan-400" />
                </div>
                <div className="mt-4 text-3xl font-extrabold">{bookings.length}</div>
                <p className="mt-1 text-xs text-slate-400">Platform-wide service orders</p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-semibold uppercase tracking-wider">Registered Providers</span>
                  <Wrench className="h-5 w-5 text-emerald-400" />
                </div>
                <div className="mt-4 text-3xl font-extrabold">{providers.length}</div>
                <p className="mt-1 text-xs font-medium text-amber-400">{pendingVerifications} Pending Verification</p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-semibold uppercase tracking-wider">Ledger Volume</span>
                  <DollarSign className="h-5 w-5 text-amber-400" />
                </div>
                <div className="mt-4 text-3xl font-extrabold">${totalVolume.toFixed(2)}</div>
                <p className="mt-1 text-xs text-slate-400">{ledgerEntries.length} Double-entry postings</p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-semibold uppercase tracking-wider">System Audit Events</span>
                  <FileText className="h-5 w-5 text-indigo-400" />
                </div>
                <div className="mt-4 text-3xl font-extrabold">{auditLogs.length}</div>
                <p className="mt-1 text-xs text-slate-400">Security & admin trace records</p>
              </div>
            </div>

            {/* Quick Summary Tables */}
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
                <h3 className="text-base font-bold">Recent System Audit Logs</h3>
                <div className="mt-4 divide-y divide-slate-800">
                  {auditLogs.slice(0, 5).map((log, i) => (
                    <div key={log.id || i} className="py-3 text-xs">
                      <div className="flex justify-between font-medium text-slate-300">
                        <span>{log.actor} - {log.action}</span>
                        <span className="text-slate-500">{log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : 'Just now'}</span>
                      </div>
                      <p className="mt-1 text-slate-400">{log.reason || `Target: ${log.targetType} (${log.targetId})`}</p>
                    </div>
                  ))}
                  {auditLogs.length === 0 && <p className="py-4 text-xs text-slate-500">No audit logs recorded yet.</p>}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
                <h3 className="text-base font-bold">Pending Provider Verifications</h3>
                <div className="mt-4 divide-y divide-slate-800">
                  {providers.filter(p => !p.verified).slice(0, 5).map((prov) => (
                    <div key={prov.uniqueId || prov.id} className="flex items-center justify-between py-3 text-xs">
                      <div>
                        <div className="font-semibold text-slate-200">{prov.name || prov.businessName}</div>
                        <div className="text-slate-400">{prov.email} • {prov.uniqueId}</div>
                      </div>
                      <button
                        onClick={() => setActiveTab('providers')}
                        className="rounded-lg bg-cyan-500/10 px-3 py-1 font-semibold text-cyan-400 hover:bg-cyan-500/20"
                      >
                        Review
                      </button>
                    </div>
                  ))}
                  {providers.filter(p => !p.verified).length === 0 && (
                    <p className="py-4 text-xs text-slate-500">All providers are fully verified.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Providers Verification */}
        {activeTab === 'providers' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Provider Operations & Verification Queue</h2>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search provider name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="rounded-xl border border-slate-800 bg-slate-900 py-2 pl-9 pr-4 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid gap-6">
              {providers
                .filter(p => (p.name || p.businessName || '').toLowerCase().includes(searchTerm.toLowerCase()) || (p.uniqueId || '').includes(searchTerm))
                .map((prov) => (
                  <div key={prov.uniqueId || prov.id} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-bold text-white">{prov.name || prov.businessName}</h3>
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            prov.verified ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {prov.verified ? 'VERIFIED' : 'PENDING APPROVAL'}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-400">
                          ID: {prov.uniqueId} • Email: {prov.email} • Phone: {prov.phoneNumber || 'N/A'} • Rating: {prov.rating || 'New'}
                        </p>
                      </div>
                    </div>

                    {/* Documents List */}
                    {prov.documents && prov.documents.length > 0 && (
                      <div className="mt-6 border-t border-slate-800/80 pt-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Submitted Compliance Documents</h4>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                          {prov.documents.map((doc) => (
                            <div key={doc.id} className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                              <div className="flex items-center justify-between text-xs font-semibold">
                                <span className="text-slate-200">{doc.documentType || 'Identity Doc'}</span>
                                <span className={`text-[10px] uppercase ${doc.status === 'APPROVED' ? 'text-emerald-400' : doc.status === 'REJECTED' ? 'text-red-400' : 'text-amber-400'}`}>
                                  {doc.status}
                                </span>
                              </div>
                              <p className="mt-1 truncate text-xs text-slate-500">{doc.documentUrl || 'Doc reference #'+doc.id}</p>

                              <div className="mt-3 flex gap-2">
                                <button
                                  onClick={() => handleDocumentStatus(doc.id, 'APPROVED')}
                                  className="flex-1 rounded-lg bg-emerald-500/10 py-1 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleDocumentStatus(doc.id, 'REJECTED')}
                                  className="flex-1 rounded-lg bg-red-500/10 py-1 text-xs font-semibold text-red-400 hover:bg-red-500/20"
                                >
                                  Reject
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Tab 3: Bookings Operations */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Booking Operations & Audit Monitoring</h2>
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 bg-slate-950 text-slate-400">
                  <tr>
                    <th className="p-4">Booking ID</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Provider</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Total Amount</th>
                    <th className="p-4">Scheduled Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {bookings.map((b) => (
                    <tr key={b.uniqueId} className="hover:bg-slate-800/40">
                      <td className="p-4 font-bold text-cyan-400">{b.uniqueId}</td>
                      <td className="p-4 text-slate-300">{b.customerUniqueId || b.customerId || 'Customer'}</td>
                      <td className="p-4 text-slate-300">{b.providerUniqueId || b.providerId || 'Provider'}</td>
                      <td className="p-4">
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                          b.bookingStatus === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' :
                          b.bookingStatus === 'CANCELLED' ? 'bg-red-500/10 text-red-400' :
                          b.bookingStatus === 'DISPUTED' ? 'bg-purple-500/10 text-purple-400' :
                          'bg-amber-500/10 text-amber-400'
                        }`}>
                          {b.bookingStatus}
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-slate-200">${b.totalAmount || 0}</td>
                      <td className="p-4 text-slate-400">{b.scheduledStartTime ? new Date(b.scheduledStartTime).toLocaleString() : 'N/A'}</td>
                    </tr>
                  ))}
                  {bookings.length === 0 && (
                    <tr>
                      <td colSpan="6" className="p-6 text-center text-slate-500">No bookings found in backend database.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab: Service Catalogue & Dynamic Pricing */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">Service Catalogue & Dynamic Pricing Models</h2>
                <p className="text-xs text-slate-400">Database-driven catalogue with dynamic pricing calculators</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Filter services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 bg-slate-950 text-slate-400">
                  <tr>
                    <th className="p-4">Service</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Pricing Model</th>
                    <th className="p-4">Starting Price</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {services
                    .filter(s => !searchTerm || s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || s.categoryName?.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((srv) => (
                      <tr key={srv.uniqueId} className="hover:bg-slate-800/40">
                        <td className="p-4">
                          <div className="font-bold text-white">{srv.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{srv.uniqueId}</div>
                        </td>
                        <td className="p-4 text-slate-300">{srv.categoryName || 'General'}</td>
                        <td className="p-4">
                          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            srv.pricingModel === 'FIXED' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                            srv.pricingModel === 'OPTIONS' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            srv.pricingModel === 'PER_UNIT' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            srv.pricingModel === 'HOURLY' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                            srv.pricingModel === 'PACKAGE' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                            'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                          }`}>
                            {srv.pricingModel || 'FIXED'}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-slate-200">
                          {srv.pricingModel === 'QUOTATION' ? 'Custom Quote' : `₹${srv.startingPrice}`}
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                            <CheckCircle className="h-3 w-3" /> Active
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <Link
                            to={`/services/${srv.uniqueId}`}
                            className="inline-flex items-center gap-1 rounded-lg bg-cyan-500/10 px-2.5 py-1 text-xs font-semibold text-cyan-400 hover:bg-cyan-500/20"
                          >
                            <Eye className="h-3 w-3" /> View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  {services.length === 0 && (
                    <tr>
                      <td colSpan="6" className="p-6 text-center text-slate-500">No services loaded from database.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Finance & Ledger */}
        {activeTab === 'finance' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Double-Entry Financial Ledger & Provider Payouts</h2>
            </div>

            {/* Payout Form Box */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <h3 className="text-base font-bold flex items-center gap-2 text-cyan-400">
                <CreditCard className="h-5 w-5" /> Issue Provider Bank Payout
              </h3>
              <p className="mt-1 text-xs text-slate-400">Initiate settlement payout for verified provider earnings.</p>
              
              <form onSubmit={handleCreatePayout} className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Provider ID / Unique ID</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PROV-101"
                    value={selectedProviderForPayout}
                    onChange={(e) => setSelectedProviderForPayout(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Payout Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-xl bg-cyan-500 px-6 py-2.5 text-sm font-bold text-slate-950 hover:bg-cyan-400 transition"
                >
                  Settle Payout
                </button>
              </form>
              {payoutMessage && <p className="mt-3 text-xs font-medium text-emerald-400">{payoutMessage}</p>}
            </div>

            {/* Ledger Entries */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <h3 className="text-base font-bold">Platform General Ledger Audit Trail</h3>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-800 text-slate-400">
                    <tr>
                      <th className="pb-3">Entry ID</th>
                      <th className="pb-3">Booking / Ref</th>
                      <th className="pb-3">Type</th>
                      <th className="pb-3">Account</th>
                      <th className="pb-3">Amount</th>
                      <th className="pb-3">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {ledgerEntries.map((e, idx) => (
                      <tr key={e.id || idx}>
                        <td className="py-3 text-slate-400">#{e.id || idx + 1}</td>
                        <td className="py-3 font-semibold text-slate-300">{e.bookingUniqueId || e.reference || 'SYSTEM'}</td>
                        <td className="py-3 font-semibold text-emerald-400">{e.entryType || 'CREDIT'}</td>
                        <td className="py-3 text-slate-400">{e.accountName || 'PLATFORM_REVENUE'}</td>
                        <td className="py-3 font-bold text-white">${e.amount || 0}</td>
                        <td className="py-3 text-slate-500">{e.createdAt ? new Date(e.createdAt).toLocaleString() : 'N/A'}</td>
                      </tr>
                    ))}
                    {ledgerEntries.length === 0 && (
                      <tr>
                        <td colSpan="6" className="py-6 text-center text-slate-500">No ledger entries posted. Completing bookings generates double-entry records.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Audit Logs */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Admin System Audit Trail</h2>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <div className="divide-y divide-slate-800">
                {auditLogs.map((log, idx) => (
                  <div key={log.id || idx} className="py-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-cyan-400">{log.actor}</span>
                      <span className="text-slate-500">{log.timestamp ? new Date(log.timestamp).toLocaleString() : 'Recent'}</span>
                    </div>
                    <div className="mt-1 text-sm font-semibold text-white">{log.action}</div>
                    <div className="mt-1 text-xs text-slate-400">Target: {log.targetType} ({log.targetId})</div>
                    {log.reason && <p className="mt-1 text-xs text-slate-300">Reason: {log.reason}</p>}
                  </div>
                ))}
                {auditLogs.length === 0 && (
                  <p className="py-6 text-center text-slate-500">No administrative audit events logged yet.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
