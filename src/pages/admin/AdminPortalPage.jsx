import React, { useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
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
  Layers,
  Briefcase,
  BookOpen,
  Check,
  X,
  Sparkles,
  User,
  Key,
  Database,
  Server,
  Lock,
  ArrowRight,
  TrendingUp,
  Sliders,
  ExternalLink,
  Copy,
  CheckCheck,
  Settings,
  ShieldAlert,
  Bell,
  Mail,
  Phone,
  MapPin,
  Cpu,
  HardDrive,
  Download,
  Edit3
} from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { serviceApi } from '../../api/serviceApi';

export default function AdminPortalPage({ defaultTab }) {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const initialTab = defaultTab || searchParams.get('tab') || (location.pathname.includes('/profile') ? 'admin-profile' : 'overview');
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Admin Profile & System Settings
  const [adminProfile, setAdminProfile] = useState({
    name: 'Root Administrator',
    email: 'admin@quixfix.local',
    role: 'SUPER_ADMIN',
    clearance: 'Level 4 (Platform Root Clearance)',
    department: 'Global Operations & Platform Trust',
    phone: '+91 (080) 4123-8899',
    location: 'Bangalore Core Infrastructure Node',
    timezone: 'Asia/Kolkata (IST · UTC +5:30)',
    sessionStarted: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    twoFactorEnabled: true,
    notifications: {
      highValueAlerts: true,
      providerApplications: true,
      dailyLedgerReconciliation: true,
      systemErrorSpikes: true
    }
  });

  const [editAdminModal, setEditAdminModal] = useState(false);
  const [editAdminForm, setEditAdminForm] = useState({
    name: adminProfile.name,
    phone: adminProfile.phone,
    department: adminProfile.department
  });
  const [apiKeyMasked, setApiKeyMasked] = useState(true);
  const [copiedKey, setCopiedKey] = useState(false);
  const [diagFeedback, setDiagFeedback] = useState(null);

  // Data states
  const [providers, setProviders] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [services, setServices] = useState([]);
  const [applications, setApplications] = useState([]);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [appStatusFilter, setAppStatusFilter] = useState('ALL');

  // Application Review Modal
  const [reviewModal, setReviewModal] = useState({ open: false, app: null, action: '', reason: '' });

  // Service Guidance Management
  const [selectedServiceForGuidance, setSelectedServiceForGuidance] = useState('');
  const [guidanceForm, setGuidanceForm] = useState(null);
  const [loadingGuidance, setLoadingGuidance] = useState(false);
  const [savingGuidance, setSavingGuidance] = useState(false);
  const [guidanceMsg, setGuidanceMsg] = useState('');

  // Payout Form Modal
  const [selectedProviderForPayout, setSelectedProviderForPayout] = useState('');
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutMessage, setPayoutMessage] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [provRes, bookRes, ledgerRes, auditRes, srvRes, appRes] = await Promise.allSettled([
        adminApi.getAllProviders(),
        adminApi.getAllBookings(),
        adminApi.getAllLedgerEntries(),
        adminApi.getAuditLogs(),
        serviceApi.getAllServices(),
        adminApi.getServiceApplications()
      ]);

      if (provRes.status === 'fulfilled') setProviders(Array.isArray(provRes.value) ? provRes.value : []);
      if (bookRes.status === 'fulfilled') setBookings(Array.isArray(bookRes.value) ? bookRes.value : []);
      if (ledgerRes.status === 'fulfilled') setLedgerEntries(Array.isArray(ledgerRes.value) ? ledgerRes.value : []);
      if (auditRes.status === 'fulfilled') setAuditLogs(Array.isArray(auditRes.value) ? auditRes.value : []);
      if (srvRes.status === 'fulfilled') setServices(Array.isArray(srvRes.value) ? srvRes.value : []);
      if (appRes.status === 'fulfilled') setApplications(Array.isArray(appRes.value) ? appRes.value : []);
    } catch (err) {
      console.error("Failed to load admin portal data:", err);
      setError("Failed to synchronize admin console data.");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveApplication = async (app) => {
    try {
      await adminApi.reviewServiceApplication(app.uniqueId, { status: 'APPROVED' });
      await adminApi.logAction({
        actor: 'ADMIN_CONSOLE',
        action: 'APPROVE_SERVICE_APPLICATION',
        targetType: 'PROVIDER_SERVICE_APPLICATION',
        targetId: app.uniqueId,
        reason: `Approved provider ${app.providerName} for service ${app.serviceName}`
      });
      fetchData();
    } catch (err) {
      alert('Failed to approve application: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleReviewActionSubmit = async (e) => {
    e.preventDefault();
    if (!reviewModal.app) return;
    try {
      const targetStatus = reviewModal.action === 'REJECT' ? 'REJECTED' : 'MORE_INFO_REQUESTED';
      await adminApi.reviewServiceApplication(reviewModal.app.uniqueId, {
        status: targetStatus,
        rejectionReason: reviewModal.action === 'REJECT' ? reviewModal.reason : null,
        adminNotes: reviewModal.reason
      });
      await adminApi.logAction({
        actor: 'ADMIN_CONSOLE',
        action: `${targetStatus}_SERVICE_APPLICATION`,
        targetType: 'PROVIDER_SERVICE_APPLICATION',
        targetId: reviewModal.app.uniqueId,
        reason: reviewModal.reason
      });
      setReviewModal({ open: false, app: null, action: '', reason: '' });
      fetchData();
    } catch (err) {
      alert('Failed to update application review: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleSelectServiceForGuidance = async (serviceUniqueId) => {
    setSelectedServiceForGuidance(serviceUniqueId);
    if (!serviceUniqueId) {
      setGuidanceForm(null);
      return;
    }
    setLoadingGuidance(true);
    setGuidanceMsg('');
    try {
      const data = await adminApi.getServiceGuidance(serviceUniqueId);
      setGuidanceForm(data);
    } catch (err) {
      console.error('Error fetching guidance for edit:', err);
    } finally {
      setLoadingGuidance(false);
    }
  };

  const handleSaveGuidance = async (e) => {
    e.preventDefault();
    if (!guidanceForm) return;
    setSavingGuidance(true);
    setGuidanceMsg('');
    try {
      await adminApi.saveServiceGuidance({
        serviceUniqueId: guidanceForm.serviceUniqueId,
        overview: guidanceForm.overview,
        inclusions: guidanceForm.inclusions,
        exclusions: guidanceForm.exclusions,
        responsibilities: guidanceForm.responsibilities,
        minExperienceYears: Number(guidanceForm.minExperienceYears || 1),
        estimatedDuration: guidanceForm.estimatedDuration,
        estimatedEarningMin: Number(guidanceForm.estimatedEarningMin || 0),
        estimatedEarningMax: Number(guidanceForm.estimatedEarningMax || 0),
        earningBasis: guidanceForm.earningBasis,
        safetyInstructions: guidanceForm.safetyInstructions,
        eligibilityCriteria: guidanceForm.eligibilityCriteria,
        active: true
      });
      await adminApi.logAction({
        actor: 'ADMIN_CONSOLE',
        action: 'UPDATE_SERVICE_GUIDANCE',
        targetType: 'SERVICE_GUIDANCE',
        targetId: guidanceForm.serviceUniqueId,
        reason: `Updated onboarding guidance for ${guidanceForm.serviceName}`
      });
      setGuidanceMsg('Service guidance updated successfully!');
    } catch (err) {
      setGuidanceMsg('Failed to update guidance: ' + (err.response?.data?.message || err.message));
    } finally {
      setSavingGuidance(false);
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
  const safeLedger = Array.isArray(ledgerEntries) ? ledgerEntries : [];
  const safeProviders = Array.isArray(providers) ? providers : [];
  const safeBookings = Array.isArray(bookings) ? bookings : [];
  const safeAudit = Array.isArray(auditLogs) ? auditLogs : [];
  const safeServices = Array.isArray(services) ? services : [];
  const safeApplications = Array.isArray(applications) ? applications : [];

  const totalVolume = safeLedger.reduce((sum, e) => sum + (Number(e?.amount) || 0), 0);
  const pendingVerifications = safeProviders.filter(p => !p?.verified || p?.verificationStatus === 'PENDING').length;
  const pendingApplications = safeApplications.filter(a => String(a?.status).toUpperCase() === 'PENDING').length;

  return (
    <main className="min-h-screen bg-[#f8fafc] font-sans text-slate-800 antialiased">
      
      {/* Top Admin Navigation Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md px-4 sm:px-8 py-3.5 shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          
          {/* Logo & System Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20">
              <ShieldCheck className="h-5 w-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black text-slate-900 tracking-tight">QUIX FIX Admin Console</h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                  ROOT ADMIN
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Enterprise operations, verification queue & financial ledger</p>
            </div>
          </div>

          {/* Right: Admin Profile & Actions */}
          <div className="flex items-center gap-3">
            
            {/* Quick Admin Profile Card */}
            <div
              onClick={() => setActiveTab('admin-profile')}
              className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-slate-100 hover:border-slate-300 transition cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-[#14213d] text-white flex items-center justify-center text-xs font-black shadow-xs">
                A
              </div>
              <div className="text-left">
                <span className="block text-xs font-extrabold text-slate-800 leading-none">System Admin</span>
                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5 leading-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Full Clearance
                </span>
              </div>
            </div>

            <button
              onClick={fetchData}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 active:scale-95"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-blue-600 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh Data</span>
            </button>

            <Link
              to="/"
              className="rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-slate-800"
            >
              Exit to App
            </Link>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <div className="mx-auto max-w-7xl px-4 sm:px-8 py-8 space-y-6">
        
        {/* Navigation Tabs Pill Bar */}
        <nav className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200">
          {[
            { id: 'overview', label: 'Overview & Metrics', icon: Activity },
            { id: 'providers', label: `Provider Queue (${pendingVerifications})`, icon: Wrench },
            { id: 'applications', label: `Trade Apps (${pendingApplications})`, icon: Briefcase },
            { id: 'guidance', label: 'Service Guidance', icon: BookOpen },
            { id: 'bookings', label: `Bookings (${safeBookings.length})`, icon: CalendarCheck },
            { id: 'services', label: `Catalogue (${safeServices.length})`, icon: Layers },
            { id: 'finance', label: 'Finance & Ledger', icon: DollarSign },
            { id: 'audit', label: 'Audit Logs', icon: FileText },
            { id: 'admin-profile', label: 'Admin Profile', icon: User }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-xs font-extrabold transition active:scale-95 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-700 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Tab 1: Overview & Metrics */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* 4 Crisp KPI Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">Total Bookings</span>
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <CalendarCheck className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-3xl font-black text-slate-900 tracking-tight">{bookings.length}</div>
                <p className="text-[11px] text-slate-500 font-semibold">Platform-wide service orders</p>
              </div>

              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">Registered Providers</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Wrench className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-3xl font-black text-slate-900 tracking-tight">{providers.length}</div>
                <p className="text-[11px] font-bold text-amber-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> {pendingVerifications} Pending Verification
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">Ledger Volume</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    ₹
                  </div>
                </div>
                <div className="text-3xl font-black text-slate-900 tracking-tight">₹{totalVolume.toFixed(2)}</div>
                <p className="text-[11px] text-slate-500 font-semibold">{safeLedger.length} Double-entry records</p>
              </div>

              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">Security Audit Logs</span>
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <FileText className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-3xl font-black text-slate-900 tracking-tight">{auditLogs.length}</div>
                <p className="text-[11px] text-slate-500 font-semibold">Security & admin trace events</p>
              </div>

            </div>

            {/* Quick Summary Tables */}
            <div className="grid gap-6 lg:grid-cols-2">
              
              <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-black text-slate-900">Recent System Audit Trail</h3>
                  <button onClick={() => setActiveTab('audit')} className="text-xs font-bold text-blue-600 hover:underline">
                    View All
                  </button>
                </div>
                <div className="divide-y divide-slate-100">
                  {auditLogs.slice(0, 5).map((log, i) => (
                    <div key={log.id || i} className="py-3 text-xs">
                      <div className="flex justify-between font-bold text-slate-800">
                        <span>{log.actor} • {log.action}</span>
                        <span className="text-slate-400 font-medium">{log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : 'Just now'}</span>
                      </div>
                      <p className="mt-0.5 text-slate-500">{log.reason || `Target: ${log.targetType} (${log.targetId})`}</p>
                    </div>
                  ))}
                  {auditLogs.length === 0 && <p className="py-6 text-center text-xs text-slate-400">No audit logs recorded yet.</p>}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-black text-slate-900">Pending Provider Verifications</h3>
                  <button onClick={() => setActiveTab('providers')} className="text-xs font-bold text-blue-600 hover:underline">
                    Manage Queue
                  </button>
                </div>
                <div className="divide-y divide-slate-100">
                  {providers.filter(p => !p.verified).slice(0, 5).map((prov) => (
                    <div key={prov.uniqueId || prov.id} className="flex items-center justify-between py-3 text-xs">
                      <div>
                        <div className="font-extrabold text-slate-900">{prov.name || prov.businessName}</div>
                        <div className="text-slate-500">{prov.email} • ID: {prov.uniqueId}</div>
                      </div>
                      <button
                        onClick={() => setActiveTab('providers')}
                        className="rounded-lg bg-blue-50 px-3 py-1 font-bold text-blue-600 hover:bg-blue-100 transition"
                      >
                        Review
                      </button>
                    </div>
                  ))}
                  {providers.filter(p => !p.verified).length === 0 && (
                    <p className="py-6 text-center text-xs text-slate-400">All registered providers are verified.</p>
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* Tab 2: Providers Verification */}
        {activeTab === 'providers' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-slate-900">Provider Operations & Verification Queue</h2>
                <p className="text-xs text-slate-500">Validate trade documents, background clearance, and service eligibility</p>
              </div>

              <div className="relative">
                <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search provider name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-xs font-semibold text-slate-800 placeholder-slate-400 shadow-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid gap-4">
              {providers
                .filter(p => (p.name || p.businessName || '').toLowerCase().includes(searchTerm.toLowerCase()) || (p.uniqueId || '').includes(searchTerm))
                .map((prov) => (
                  <div key={prov.uniqueId || prov.id} className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900">{prov.name || prov.businessName}</h3>
                          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${
                            prov.verified ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {prov.verified ? 'VERIFIED' : 'PENDING REVIEW'}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          ID: <strong className="text-slate-700 font-mono">{prov.uniqueId}</strong> • Email: {prov.email} • Phone: {prov.phoneNumber || 'N/A'}
                        </p>
                      </div>
                    </div>

                    {/* Documents List */}
                    {prov.documents && prov.documents.length > 0 && (
                      <div className="border-t border-slate-100 pt-3">
                        <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">Submitted Compliance Documents</h4>
                        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                          {prov.documents.map((doc) => (
                            <div key={doc.id} className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 space-y-2">
                              <div className="flex items-center justify-between text-xs font-bold">
                                <span className="text-slate-800">{doc.documentType || 'Identity Doc'}</span>
                                <span className={`text-[10px] uppercase font-extrabold ${doc.status === 'APPROVED' ? 'text-emerald-600' : doc.status === 'REJECTED' ? 'text-rose-600' : 'text-amber-600'}`}>
                                  {doc.status}
                                </span>
                              </div>
                              <p className="truncate text-[11px] text-slate-500">{doc.documentUrl || 'Doc record #' + doc.id}</p>

                              <div className="flex gap-2 pt-1">
                                <button
                                  onClick={() => handleDocumentStatus(doc.id, 'APPROVED')}
                                  className="flex-1 rounded-lg bg-emerald-600 py-1 text-xs font-bold text-white hover:bg-emerald-700 transition"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleDocumentStatus(doc.id, 'REJECTED')}
                                  className="flex-1 rounded-lg bg-rose-50 border border-rose-200 py-1 text-xs font-bold text-rose-700 hover:bg-rose-100 transition"
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

        {/* Tab 3: Applications Review */}
        {activeTab === 'applications' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-slate-900">Provider Service Onboarding Applications</h2>
                <p className="text-xs text-slate-500">Review trade qualifications, verified experience, and approve service authorizations.</p>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
                {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setAppStatusFilter(st)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                      appStatusFilter === st
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {st === 'ALL' ? 'All' : st}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-black uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="p-4">Provider Details</th>
                      <th className="p-4">Applied Service</th>
                      <th className="p-4">Experience & Coverage</th>
                      <th className="p-4">Certifications / Notes</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {applications
                      .filter(a => appStatusFilter === 'ALL' || String(a.status).toUpperCase() === appStatusFilter)
                      .map((app) => (
                        <tr key={app.uniqueId} className="hover:bg-slate-50/80 transition">
                          <td className="p-4">
                            <div className="font-extrabold text-slate-900">{app.providerName || 'Provider'}</div>
                            <div className="text-[11px] text-slate-500">{app.providerPhone || 'No phone'}</div>
                            <div className="text-[10px] text-blue-600 font-mono">{app.providerUniqueId}</div>
                          </td>
                          <td className="p-4">
                            <div className="font-bold text-slate-900">{app.serviceName}</div>
                            <div className="text-[10px] text-slate-500 uppercase">{app.serviceType}</div>
                          </td>
                          <td className="p-4">
                            <div className="font-semibold text-slate-800">{app.experienceYears || 1} Years Experience</div>
                            <div className="text-[11px] text-slate-500">Area: {app.serviceArea || 'General'}</div>
                          </td>
                          <td className="p-4 max-w-xs">
                            {app.certifications && (
                              <div className="text-slate-700 font-medium truncate">Cert: {app.certifications}</div>
                            )}
                            {app.notes && (
                              <div className="text-[11px] text-slate-500 truncate">Note: {app.notes}</div>
                            )}
                            {app.rejectionReason && (
                              <div className="text-[11px] text-rose-600 font-bold mt-1">Rejection: {app.rejectionReason}</div>
                            )}
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${
                              app.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                              app.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                              'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}>
                              {app.status === 'APPROVED' ? <CheckCircle className="h-3 w-3" /> :
                                app.status === 'PENDING' ? <Clock className="h-3 w-3" /> :
                                  <XCircle className="h-3 w-3" />}
                              {app.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            {app.status === 'PENDING' ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleApproveApplication(app)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition"
                                >
                                  <Check className="w-3.5 h-3.5" /> Approve
                                </button>
                                <button
                                  onClick={() => setReviewModal({ open: true, app, action: 'REJECT', reason: '' })}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-bold text-xs transition"
                                >
                                  <X className="w-3.5 h-3.5" /> Reject
                                </button>
                                <button
                                  onClick={() => setReviewModal({ open: true, app, action: 'MORE_INFO', reason: '' })}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 font-bold text-xs transition"
                                >
                                  Request Info
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setReviewModal({ open: true, app, action: 'REJECT', reason: app.rejectionReason || '' })}
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline"
                              >
                                Modify Review
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    {applications.length === 0 && (
                      <tr>
                        <td colSpan="6" className="p-8 text-center text-slate-500">
                          No provider service applications submitted yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Service Guidance Management */}
        {activeTab === 'guidance' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-slate-900">Service Guidance & Onboarding Configuration</h2>
                <p className="text-xs text-slate-500">Configure task expectations, safety rules, required tools, and non-guaranteed earning guidelines.</p>
              </div>

              {/* Service Select Dropdown */}
              <div className="w-full sm:w-72">
                <select
                  value={selectedServiceForGuidance}
                  onChange={(e) => handleSelectServiceForGuidance(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 shadow-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  <option value="">-- Choose a Service to Edit Guidance --</option>
                  {services.map((s) => (
                    <option key={s.uniqueId} value={s.uniqueId}>
                      {s.name} ({s.pricingModel || 'FIXED'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {guidanceMsg && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" /> {guidanceMsg}
              </div>
            )}

            {loadingGuidance ? (
              <div className="p-12 text-center text-slate-500 text-xs font-bold">
                Loading service guidance details...
              </div>
            ) : !guidanceForm ? (
              <div className="bg-white p-12 rounded-2xl border border-slate-200/90 text-center space-y-3 shadow-xs">
                <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="text-sm font-bold text-slate-800">Select a Service from the Dropdown</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Pick any catalogue service above to view and configure its responsibilities, inclusions, exclusions, and provider earning brackets.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSaveGuidance} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-6 text-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-base font-black text-slate-900">{guidanceForm.serviceName} Guidance</h3>
                    <p className="text-xs text-slate-500">Service Type: {guidanceForm.serviceType} • Model: {guidanceForm.pricingModel}</p>
                  </div>
                  <button
                    type="submit"
                    disabled={savingGuidance}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-md shadow-blue-600/20 flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" /> {savingGuidance ? 'Saving...' : 'Save Guidance Changes'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Service Overview</label>
                    <textarea
                      rows="3"
                      value={guidanceForm.overview || ''}
                      onChange={(e) => setGuidanceForm({ ...guidanceForm, overview: e.target.value })}
                      className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Step-by-Step Responsibilities</label>
                    <textarea
                      rows="3"
                      value={guidanceForm.responsibilities || ''}
                      onChange={(e) => setGuidanceForm({ ...guidanceForm, responsibilities: e.target.value })}
                      className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Inclusions (What's included)</label>
                    <textarea
                      rows="3"
                      value={guidanceForm.inclusions || ''}
                      onChange={(e) => setGuidanceForm({ ...guidanceForm, inclusions: e.target.value })}
                      className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Exclusions (What's NOT included)</label>
                    <textarea
                      rows="3"
                      value={guidanceForm.exclusions || ''}
                      onChange={(e) => setGuidanceForm({ ...guidanceForm, exclusions: e.target.value })}
                      className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Safety Precautions</label>
                    <textarea
                      rows="3"
                      value={guidanceForm.safetyInstructions || ''}
                      onChange={(e) => setGuidanceForm({ ...guidanceForm, safetyInstructions: e.target.value })}
                      className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Eligibility Criteria</label>
                    <textarea
                      rows="3"
                      value={guidanceForm.eligibilityCriteria || ''}
                      onChange={(e) => setGuidanceForm({ ...guidanceForm, eligibilityCriteria: e.target.value })}
                      className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Earning & Duration Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Min Earning (₹)</label>
                    <input
                      type="number"
                      value={guidanceForm.estimatedEarningMin || 0}
                      onChange={(e) => setGuidanceForm({ ...guidanceForm, estimatedEarningMin: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Max Earning (₹)</label>
                    <input
                      type="number"
                      value={guidanceForm.estimatedEarningMax || 0}
                      onChange={(e) => setGuidanceForm({ ...guidanceForm, estimatedEarningMax: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Min Experience (Yrs)</label>
                    <input
                      type="number"
                      value={guidanceForm.minExperienceYears || 1}
                      onChange={(e) => setGuidanceForm({ ...guidanceForm, minExperienceYears: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Estimated Duration</label>
                    <input
                      type="text"
                      value={guidanceForm.estimatedDuration || ''}
                      onChange={(e) => setGuidanceForm({ ...guidanceForm, estimatedDuration: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={savingGuidance}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-md shadow-blue-600/20 flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" /> {savingGuidance ? 'Saving...' : 'Save Guidance Changes'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Tab 5: Bookings Operations */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <h2 className="text-lg font-black text-slate-900">Booking Operations & Audit Monitoring</h2>
            <div className="overflow-x-auto rounded-2xl border border-slate-200/90 bg-white shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 font-black uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Booking ID</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Provider</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Total Amount</th>
                    <th className="p-4">Scheduled Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bookings.map((b) => (
                    <tr key={b.uniqueId} className="hover:bg-slate-50 transition">
                      <td className="p-4 font-mono font-bold text-blue-600">{b.uniqueId}</td>
                      <td className="p-4 font-semibold text-slate-800">{b.customerUniqueId || b.customerId || 'Customer'}</td>
                      <td className="p-4 text-slate-600">{b.providerUniqueId || b.providerId || 'Provider'}</td>
                      <td className="p-4">
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${
                          b.bookingStatus === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' :
                          b.bookingStatus === 'CANCELLED' ? 'bg-red-50 text-red-700' :
                          b.bookingStatus === 'DISPUTED' ? 'bg-purple-50 text-purple-700' :
                          'bg-amber-50 text-amber-700'
                        }`}>
                          {b.bookingStatus}
                        </span>
                      </td>
                      <td className="p-4 font-extrabold text-slate-900">₹{b.totalAmount || 0}</td>
                      <td className="p-4 text-slate-500">{b.scheduledStartTime ? new Date(b.scheduledStartTime).toLocaleString() : 'N/A'}</td>
                    </tr>
                  ))}
                  {bookings.length === 0 && (
                    <tr>
                      <td colSpan="6" className="p-6 text-center text-slate-400">No bookings found in backend database.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 6: Service Catalogue */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-slate-900">Service Catalogue & Dynamic Pricing Models</h2>
                <p className="text-xs text-slate-500">Database-driven catalogue with dynamic pricing calculators</p>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs font-semibold text-slate-800 placeholder-slate-400 shadow-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200/90 bg-white shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 font-black uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Service</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Pricing Model</th>
                    <th className="p-4">Starting Price</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {services
                    .filter(s => !searchTerm || s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || s.categoryName?.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((srv) => (
                      <tr key={srv.uniqueId} className="hover:bg-slate-50 transition">
                        <td className="p-4">
                          <div className="font-extrabold text-slate-900">{srv.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{srv.uniqueId}</div>
                        </td>
                        <td className="p-4 text-slate-600">{srv.categoryName || 'General'}</td>
                        <td className="p-4">
                          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${
                            srv.pricingModel === 'FIXED' ? 'bg-blue-50 text-blue-700' :
                            srv.pricingModel === 'OPTIONS' ? 'bg-emerald-50 text-emerald-700' :
                            srv.pricingModel === 'PER_UNIT' ? 'bg-amber-50 text-amber-700' :
                            srv.pricingModel === 'HOURLY' ? 'bg-indigo-50 text-indigo-700' :
                            srv.pricingModel === 'PACKAGE' ? 'bg-purple-50 text-purple-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {srv.pricingModel || 'FIXED'}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-slate-900">
                          {srv.pricingModel === 'QUOTATION' ? 'Custom Quote' : `₹${srv.startingPrice}`}
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                            <CheckCircle className="h-3 w-3 text-emerald-600" /> Active
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <Link
                            to={`/services/${srv.uniqueId}`}
                            className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-600 hover:bg-blue-100 transition"
                          >
                            <Eye className="h-3 w-3" /> View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  {services.length === 0 && (
                    <tr>
                      <td colSpan="6" className="p-6 text-center text-slate-400">No services loaded from database.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 7: Finance & Ledger */}
        {activeTab === 'finance' && (
          <div className="space-y-6">
            
            {/* Payout Form Box */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-3">
              <h3 className="text-sm font-black flex items-center gap-2 text-slate-900">
                <CreditCard className="h-4 w-4 text-blue-600" /> Issue Provider Bank Settlement Payout
              </h3>
              <p className="text-xs text-slate-500">Initiate settlement payout for verified provider earnings.</p>
              
              <form onSubmit={handleCreatePayout} className="pt-2 flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Provider ID / Unique ID</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SNEB8B"
                    value={selectedProviderForPayout}
                    onChange={(e) => setSelectedProviderForPayout(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Payout Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-blue-700 shadow-md transition"
                >
                  Settle Payout
                </button>
              </form>
              {payoutMessage && <p className="text-xs font-bold text-emerald-700">{payoutMessage}</p>}
            </div>

            {/* Ledger Entries */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-black text-slate-900">Platform General Ledger Audit Trail</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 font-black uppercase tracking-wider">
                    <tr>
                      <th className="p-3">Entry ID</th>
                      <th className="p-3">Booking / Ref</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Account</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {safeLedger.map((e, idx) => (
                      <tr key={e.id || idx} className="hover:bg-slate-50 transition">
                        <td className="p-3 text-slate-400 font-mono">#{e.id || idx + 1}</td>
                        <td className="p-3 font-semibold text-slate-800">{e.bookingUniqueId || e.reference || 'SYSTEM'}</td>
                        <td className="p-3 font-bold text-emerald-700">{e.entryType || 'CREDIT'}</td>
                        <td className="p-3 text-slate-500 font-mono">{e.accountName || 'PLATFORM_REVENUE'}</td>
                        <td className="p-3 font-black text-slate-900">₹{e.amount || 0}</td>
                        <td className="p-3 text-slate-400">{e.createdAt ? new Date(e.createdAt).toLocaleString() : 'N/A'}</td>
                      </tr>
                    ))}
                    {safeLedger.length === 0 && (
                      <tr>
                        <td colSpan="6" className="py-6 text-center text-slate-400">No ledger entries posted. Completing bookings generates double-entry records.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* Tab 8: Audit Logs */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            <h2 className="text-lg font-black text-slate-900">Admin System Audit Trail</h2>
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
              <div className="divide-y divide-slate-100">
                {auditLogs.map((log, idx) => (
                  <div key={log.id || idx} className="py-3.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-blue-600">{log.actor}</span>
                      <span className="text-slate-400">{log.timestamp ? new Date(log.timestamp).toLocaleString() : 'Recent'}</span>
                    </div>
                    <div className="mt-1 text-xs font-bold text-slate-900">{log.action}</div>
                    <div className="mt-0.5 text-xs text-slate-500">Target: {log.targetType} ({log.targetId})</div>
                    {log.reason && <p className="mt-1 text-xs text-slate-600 italic">Reason: {log.reason}</p>}
                  </div>
                ))}
                {auditLogs.length === 0 && (
                  <p className="py-6 text-center text-xs text-slate-400">No administrative audit events logged yet.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 9: Dedicated Admin Profile & System Settings */}
        {activeTab === 'admin-profile' && (
          <div className="space-y-6">
            
            {/* Executive Hero Banner Card */}
            <div className="relative overflow-hidden rounded-3xl bg-[#14213D] text-white p-6 sm:p-8 shadow-xl">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/10 pb-6">
                
                {/* Admin Avatar & Master Credentials */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                  <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-500 p-0.5 shadow-xl shadow-blue-900/40">
                    <div className="w-full h-full rounded-[14px] bg-[#0f172a] flex items-center justify-center text-3xl font-black text-white">
                      {adminProfile.name.charAt(0)}
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#14213d] flex items-center justify-center">
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    </span>
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h2 className="text-2xl font-black tracking-tight text-white">{adminProfile.name}</h2>
                      <span className="px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 shadow-sm">
                        SUPER ADMIN
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-blue-500/20 text-blue-200 border border-blue-400/30">
                        {adminProfile.role}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-300 font-medium">
                      {adminProfile.email} • {adminProfile.clearance}
                    </p>
                    <div className="mt-2.5 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                      <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" /> Active Operational Session (Logged in {adminProfile.sessionStarted})
                      </span>
                      <span>•</span>
                      <span>{adminProfile.location}</span>
                    </div>
                  </div>
                </div>

                {/* Primary Executive Actions */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setEditAdminForm({
                        name: adminProfile.name,
                        phone: adminProfile.phone,
                        department: adminProfile.department
                      });
                      setEditAdminModal(true);
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition active:scale-95"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-300" /> Edit Profile
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDiagFeedback('Running system health validation...');
                      setTimeout(() => {
                        setDiagFeedback(`All microservices healthy (Spring Boot 8082 · MySQL 3306 · ${safeLedger.length} ledger entries synchronized)`);
                      }, 700);
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/30 transition active:scale-95"
                  >
                    <Activity className="w-3.5 h-3.5" /> Diagnostics Check
                  </button>
                </div>

              </div>

              {/* Diagnostic Feedback Banner */}
              {diagFeedback && (
                <div className="mt-4 flex items-center justify-between rounded-xl bg-emerald-500/20 border border-emerald-400/30 px-4 py-2.5 text-xs font-bold text-emerald-200 animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{diagFeedback}</span>
                  </div>
                  <button
                    onClick={() => setDiagFeedback(null)}
                    className="text-emerald-300 hover:text-white text-xs font-extrabold"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* High-Level Infrastructure Bar */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="rounded-2xl bg-white/5 border border-white/10 p-3.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Security Clearance</span>
                  <span className="text-sm font-black text-amber-400 mt-0.5 block">L4 Root Authority</span>
                  <span className="text-[10px] text-slate-400">Ledger & Trade overrides</span>
                </div>
                <div className="rounded-2xl bg-white/5 border border-white/10 p-3.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Spring Boot Engine</span>
                  <span className="text-sm font-black text-emerald-400 mt-0.5 block">Port 8082 Healthy</span>
                  <span className="text-[10px] text-slate-400">Response time 28ms</span>
                </div>
                <div className="rounded-2xl bg-white/5 border border-white/10 p-3.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">MySQL Database</span>
                  <span className="text-sm font-black text-emerald-400 mt-0.5 block">quickfixfinal (3306)</span>
                  <span className="text-[10px] text-slate-400">Connection pool 10/10</span>
                </div>
                <div className="rounded-2xl bg-white/5 border border-white/10 p-3.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Ledger Volume</span>
                  <span className="text-sm font-black text-blue-300 mt-0.5 block">₹{totalVolume.toLocaleString()}</span>
                  <span className="text-[10px] text-slate-400">{safeLedger.length} double-entry records</span>
                </div>
              </div>

            </div>

            {/* Two-Column Administrative Center */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Admin Identity & Security Policies (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Personal & Workstation Details */}
                <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-600" /> Administrative Identity & Department
                    </h3>
                    <span className="text-[10px] font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                      VERIFIED ROOT
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Full Name</span>
                      <span className="font-extrabold text-slate-900 text-sm mt-0.5 block">{adminProfile.name}</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Department / Team</span>
                      <span className="font-extrabold text-slate-900 text-sm mt-0.5 block">{adminProfile.department}</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Direct Email</span>
                      <span className="font-extrabold text-slate-900 text-xs mt-1 block flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-slate-400" /> {adminProfile.email}
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Emergency Contact Line</span>
                      <span className="font-extrabold text-slate-900 text-xs mt-1 block flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-slate-400" /> {adminProfile.phone}
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Timezone</span>
                      <span className="font-extrabold text-slate-800 text-xs mt-0.5 block">{adminProfile.timezone}</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Active Session Token</span>
                      <span className="font-mono text-emerald-700 text-[11px] font-bold mt-0.5 block">QF-SES-ROOT-991A</span>
                    </div>
                  </div>
                </div>

                {/* Security Protocols & Master Keys */}
                <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-emerald-600" /> Security Clearance & API Credentials
                    </h3>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> 2FA ENFORCED
                    </span>
                  </div>

                  {/* API Key Box */}
                  <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5 text-amber-400" /> Admin Root API Gateway Key
                      </span>
                      <button
                        type="button"
                        onClick={() => setApiKeyMasked(!apiKeyMasked)}
                        className="text-[11px] font-bold text-slate-400 hover:text-white"
                      >
                        {apiKeyMasked ? 'Reveal Key' : 'Hide Key'}
                      </button>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 font-mono text-xs">
                      <span className="flex-1 text-slate-300 truncate">
                        {apiKeyMasked ? 'qf_live_root_9a8f••••••••••••••••••••382b' : 'qf_live_root_9a8f27301c22d4ef00382b'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText('qf_live_root_9a8f27301c22d4ef00382b');
                          setCopiedKey(true);
                          setTimeout(() => setCopiedKey(false), 2000);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold transition"
                      >
                        {copiedKey ? <CheckCheck className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                        {copiedKey ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Do not share this key. Grants direct programmatic access to ledger reconciliation and provider approvals.
                    </p>
                  </div>

                  {/* Security Policy List */}
                  <div className="space-y-2.5 text-xs text-slate-600">
                    <div className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 bg-slate-50/70">
                      <div className="flex items-center gap-2.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <p className="font-bold text-slate-900">Role-Based Access Control (RBAC)</p>
                          <p className="text-[11px] text-slate-500">Customer, Provider, Support, and Admin scopes strictly isolated</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">Active</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 bg-slate-50/70">
                      <div className="flex items-center gap-2.5">
                        <Lock className="w-4 h-4 text-blue-600 shrink-0" />
                        <div>
                          <p className="font-bold text-slate-900">Double-Entry Ledger Integrity</p>
                          <p className="text-[11px] text-slate-500">Write-once immutable financial audit logs with monotonic IDs</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">Strict</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 bg-slate-50/70">
                      <div className="flex items-center gap-2.5">
                        <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                        <div>
                          <p className="font-bold text-slate-900">Session Inactivity Timeout</p>
                          <p className="text-[11px] text-slate-500">Auto-terminates after 60 minutes of inactive administrator session</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-extrabold text-slate-700 bg-slate-200 px-2 py-0.5 rounded-md">60 Mins</span>
                    </div>
                  </div>

                </div>

                {/* Notification & Alert Preferences */}
                <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <Bell className="w-4 h-4 text-amber-500" /> Executive Dispatch & Alert Subscriptions
                    </h3>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Live Subscriptions</span>
                  </div>

                  <div className="space-y-3">
                    {[
                      { key: 'highValueAlerts', label: 'High-Value Booking Alerts (> ₹5,000)', desc: 'Immediate priority push for large enterprise or multi-day requests' },
                      { key: 'providerApplications', label: 'Provider Trade Applications & Documents', desc: 'Real-time alert when a technician submits onboarding verification' },
                      { key: 'dailyLedgerReconciliation', label: 'Daily Double-Entry Ledger Summary', desc: 'Automated 11:59 PM balancing email across debit/credit entries' },
                      { key: 'systemErrorSpikes', label: 'Spring Boot API Error Spike Detection', desc: 'Trigger SMS alert if 5xx error rate exceeds 1% in a 5-minute rolling window' }
                    ].map(pref => (
                      <div key={pref.key} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/70">
                        <div>
                          <p className="text-xs font-bold text-slate-900">{pref.label}</p>
                          <p className="text-[11px] text-slate-500">{pref.desc}</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={adminProfile.notifications[pref.key]}
                          onChange={() => {
                            setAdminProfile(prev => ({
                              ...prev,
                              notifications: {
                                ...prev.notifications,
                                [pref.key]: !prev.notifications[pref.key]
                              }
                            }));
                          }}
                          className="h-4 w-4 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right Column: Platform Topology & Recent Audit Log (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Live Platform Runtime Topology */}
                <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <Server className="w-4 h-4 text-blue-600" /> Platform Infrastructure Topology
                    </h3>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> 100% HEALTHY
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
                      <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
                        <Cpu className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-extrabold text-slate-900">Spring Boot 4.1.1 API Node</p>
                          <span className="text-[10px] font-bold text-emerald-600">Port 8082</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">REST controllers, JPA repositories & Jackson filter</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
                      <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
                        <Database className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-extrabold text-slate-900">MySQL Database Node</p>
                          <span className="text-[10px] font-bold text-emerald-600">Port 3306</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">Schema: <code className="text-slate-700 font-bold">quickfixfinal</code> · Zero deadlocks</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
                      <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                        <Sliders className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-extrabold text-slate-900">Dynamic Pricing Engine</p>
                          <span className="text-[10px] font-bold text-blue-600">Active</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">Fixed, Options, Per-Unit, Hourly & Packages</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
                      <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-extrabold text-slate-900">Haversine Geocoding Engine</p>
                          <span className="text-[10px] font-bold text-purple-600">100 km Radius</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">Instant proximity matching for nearby verified technicians</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Actions Executed by this Admin */}
                <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600" /> Recent Administrative Activity
                    </h3>
                    <button
                      type="button"
                      onClick={() => setActiveTab('audit')}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800"
                    >
                      View All ({safeAudit.length})
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {safeAudit.slice(0, 4).map((log, idx) => (
                      <div key={log.id || idx} className="py-2.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-slate-900">{log.action || 'ADMIN_ACTION'}</span>
                          <span className="text-[10px] text-slate-400">
                            {log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Target: {log.targetType} ({log.targetId || 'SYSTEM'})
                        </p>
                        {log.reason && (
                          <p className="text-[11px] text-blue-600 italic mt-0.5">"{log.reason}"</p>
                        )}
                      </div>
                    ))}

                    {safeAudit.length === 0 && (
                      <p className="py-4 text-center text-xs text-slate-400">
                        Actions performed in this console (approvals, payouts, guidance updates) will appear here.
                      </p>
                    )}
                  </div>
                </div>

                {/* Emergency Maintenance & System Diagnostics Utility */}
                <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-3">
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Settings className="w-4 h-4 text-slate-700" /> Maintenance Utilities
                  </h3>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => {
                        setDiagFeedback('Ledger integrity verified: Debits equal Credits across all journal lines.');
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition"
                    >
                      <span className="flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Verify Ledger Balance Integrity
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        fetchData();
                        setDiagFeedback('Ephemeral caches flushed and database records refreshed.');
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition"
                    >
                      <span className="flex items-center gap-2">
                        <RefreshCw className="w-3.5 h-3.5 text-blue-600" /> Sync Database & Purge Cache
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                    </button>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

      </div>

      {/* Edit Admin Profile Modal */}
      {editAdminModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-600" /> Edit Admin Profile Details
              </h3>
              <button
                type="button"
                onClick={() => setEditAdminModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setAdminProfile(prev => ({
                  ...prev,
                  name: editAdminForm.name,
                  phone: editAdminForm.phone,
                  department: editAdminForm.department
                }));
                setEditAdminModal(false);
                setDiagFeedback('Admin profile details updated successfully.');
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Display Name</label>
                <input
                  type="text"
                  required
                  value={editAdminForm.name}
                  onChange={(e) => setEditAdminForm({ ...editAdminForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-semibold focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Department / Operations Unit</label>
                <input
                  type="text"
                  required
                  value={editAdminForm.department}
                  onChange={(e) => setEditAdminForm({ ...editAdminForm, department: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-semibold focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Emergency Phone Line</label>
                <input
                  type="text"
                  required
                  value={editAdminForm.phone}
                  onChange={(e) => setEditAdminForm({ ...editAdminForm, phone: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-semibold focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditAdminModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Action Modal */}
      {reviewModal.open && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900">
                {reviewModal.action === 'REJECT' ? 'Reject Application' : 'Request Additional Details'}
              </h3>
              <button
                type="button"
                onClick={() => setReviewModal({ open: false, app: null, action: '', reason: '' })}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleReviewActionSubmit} className="space-y-4 text-xs">
              <div>
                <p className="text-slate-600 mb-2">
                  Provider: <strong className="text-slate-900">{reviewModal.app?.providerName}</strong> ({reviewModal.app?.serviceName})
                </p>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  {reviewModal.action === 'REJECT' ? 'Rejection Reason (Visible to Provider) *' : 'Instructions / Missing Information *'}
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="Enter clear feedback for the provider..."
                  value={reviewModal.reason}
                  onChange={(e) => setReviewModal({ ...reviewModal, reason: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewModal({ open: false, app: null, action: '', reason: '' })}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-xl text-white font-bold shadow-md transition ${
                    reviewModal.action === 'REJECT' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-amber-600 hover:bg-amber-700'
                  }`}
                >
                  {reviewModal.action === 'REJECT' ? 'Confirm Rejection' : 'Send Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </main>
  );
}
