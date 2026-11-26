import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ShieldCheck, CheckCircle2, XCircle, AlertTriangle,
  Briefcase, Wrench, Package, Clock, IndianRupee, FileText,
  AlertCircle, Sparkles, Send, CheckSquare, X
} from 'lucide-react';
import ProviderPortalNav from '../../components/provider/ProviderPortalNav';
import Footer from '../../components/common/Footer';
import { providerApi } from '../../api/providerApi';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

export default function ProviderServiceGuidancePage() {
  const { serviceUniqueId } = useParams();
  const { user } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [guidance, setGuidance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Application Modal state
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    experienceYears: 1,
    certifications: '',
    serviceArea: '',
    notes: '',
    agreedToSafety: false,
    agreedToTools: false
  });

  const loadData = () => {
    setLoading(true);
    providerApi.getServiceGuidance(serviceUniqueId, user?.providerUniqueId)
      .then((data) => {
        setGuidance(data);
        setError('');
        if (data.minExperienceYears) {
          setForm(prev => ({ ...prev, experienceYears: data.minExperienceYears }));
        }
      })
      .catch((err) => {
        console.error('Error fetching service guidance:', err);
        setError('Could not load guidance for this service. Please try again.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [serviceUniqueId, user?.providerUniqueId]);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!form.agreedToSafety || !form.agreedToTools) {
      showToast('Please confirm all safety and equipment readiness checkmarks.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await providerApi.submitServiceApplication(user.providerUniqueId, {
        serviceUniqueId,
        experienceYears: Number(form.experienceYears),
        certifications: form.certifications,
        serviceArea: form.serviceArea,
        notes: form.notes
      });
      showToast('Application submitted successfully! Our team will review your application.', 'success');
      setShowApplyModal(false);
      loadData();
    } catch (err) {
      console.error('Application submission error:', err);
      showToast(err.response?.data?.message || 'Failed to submit application. Please check your inputs.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f8fafc] font-sans">
        <ProviderPortalNav />
        <div className="container mx-auto px-4 py-24 text-center space-y-3 flex-1 flex flex-col justify-center items-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-semibold text-xs">Loading service guidance & onboarding details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !guidance) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f8fafc] font-sans">
        <ProviderPortalNav />
        <main className="container mx-auto px-4 py-16 flex-1 flex flex-col items-center justify-center text-center">
          <div className="max-w-md bg-white p-8 rounded-3xl border border-slate-200/80 shadow-md space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h1 className="text-lg font-black text-slate-900">Guidance Not Found</h1>
            <p className="text-xs text-slate-500">{error || 'Could not load service details.'}</p>
            <Link
              to="/provider/services/discover"
              className="inline-block px-5 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md hover:bg-blue-700 transition"
            >
              Back to Service Discovery
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const appStatus = (guidance.currentApplicationStatus || 'NOT_APPLIED').toUpperCase();

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] font-sans">
      <ProviderPortalNav />

      {/* Header Banner */}
      <div className="bg-[#14213d] text-white py-8 px-4 lg:px-8 border-b border-slate-800">
        <div className="container mx-auto max-w-5xl space-y-4">
          <Link
            to="/provider/services/discover"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Service Discovery
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-blue-500/20 text-blue-300 border border-blue-400/30 uppercase tracking-widest">
                Service Onboarding Guide
              </span>
              <h1 className="text-2xl sm:text-3xl font-black mt-2">{guidance.serviceName}</h1>
              <p className="text-slate-300 text-xs mt-1 max-w-2xl">{guidance.overview}</p>
            </div>

            {/* Top Application CTA or Status */}
            <div>
              {appStatus === 'APPROVED' ? (
                <div className="px-4 py-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-black flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Approved Provider
                </div>
              ) : appStatus === 'PENDING' ? (
                <div className="px-4 py-2.5 rounded-2xl bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-black flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Application Under Review
                </div>
              ) : appStatus === 'REJECTED' ? (
                <button
                  onClick={() => setShowApplyModal(true)}
                  className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black shadow-lg transition flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" /> Re-apply with Updates
                </button>
              ) : (
                <button
                  onClick={() => setShowApplyModal(true)}
                  className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-lg shadow-blue-600/30 transition flex items-center gap-2"
                >
                  <Send className="w-4 h-4" /> Apply to Offer Service
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto max-w-5xl px-4 lg:px-8 py-8 flex-1 space-y-6">

        {/* Status Callout if Applied */}
        {appStatus === 'PENDING' && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-extrabold text-sm">Application Under Review</h4>
              <p className="mt-0.5 leading-relaxed">
                You have applied to offer this service. Our admin verification team is validating your trade experience and documents. You will be notified once approved.
              </p>
            </div>
          </div>
        )}

        {appStatus === 'REJECTED' && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-extrabold text-sm">Application Not Approved</h4>
              <p className="mt-0.5 leading-relaxed font-bold">
                Reason: {guidance.currentRejectionReason || 'Trade criteria or document requirements not fully satisfied.'}
              </p>
              <p className="mt-1 text-[11px] text-rose-600">
                You can review the required qualifications below and re-submit your application.
              </p>
            </div>
            <button
              onClick={() => setShowApplyModal(true)}
              className="px-3.5 py-1.5 bg-rose-600 text-white font-bold rounded-xl text-xs shrink-0"
            >
              Re-apply
            </button>
          </div>
        )}

        {appStatus === 'APPROVED' && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-extrabold text-sm">Service Active in Your Catalog</h4>
              <p className="mt-0.5 leading-relaxed">
                You are fully approved to perform this service. You are eligible to receive customer booking requests in your coverage area.
              </p>
            </div>
          </div>
        )}

        {/* Earning & Duration Metrics Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <IndianRupee className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-extrabold text-[#14213d]">Provider Earning Structure</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
              <span className="text-[10px] font-bold text-emerald-600 block uppercase tracking-wider">Estimated Earning Range</span>
              <span className="text-xl font-black text-emerald-800 mt-1 block">
                ₹{guidance.estimatedEarningMin} - ₹{guidance.estimatedEarningMax}*
              </span>
              <span className="text-[10px] text-emerald-700 italic block mt-0.5">
                Payout per completed booking
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
              <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Estimated Job Duration</span>
              <span className="text-xl font-black text-slate-800 mt-1 block">
                {guidance.estimatedDuration || '45 - 90 mins'}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Average doorstep technician time</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
              <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Pricing Model</span>
              <span className="text-xl font-black text-slate-800 mt-1 block">
                {guidance.pricingModel || 'FIXED'}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Authoritative platform pricing basis</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed italic bg-amber-50/60 p-3 rounded-xl border border-amber-200/40">
            * <strong>Important Disclaimer:</strong> All earning estimates shown above represent approximate provider payouts and are non-guaranteed. Actual earnings depend on booking volume, options selected by the customer, travel distance, and technician performance. Customer prices are independent and subject to platform convenience fees.
          </p>
        </div>

        {/* Inclusions & Exclusions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-emerald-700 font-extrabold text-sm">
              <CheckCircle2 className="w-4 h-4" /> What The Service Includes
            </div>
            <div className="text-xs text-slate-600 space-y-2 whitespace-pre-line leading-relaxed font-medium">
              {guidance.inclusions || 'Standard certified service scope.'}
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-rose-600 font-extrabold text-sm">
              <XCircle className="w-4 h-4" /> What Is NOT Included
            </div>
            <div className="text-xs text-slate-600 space-y-2 whitespace-pre-line leading-relaxed font-medium">
              {guidance.exclusions || 'Major structural overhauls and unauthorized material procurement.'}
            </div>
          </div>
        </div>

        {/* Step-by-Step Responsibilities */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-extrabold text-[#14213d]">Execution Responsibilities & Standard Procedure</h2>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Every technician must adhere to these exact operational procedures upon accepting a booking:
          </p>
          <div className="text-xs text-slate-700 font-medium whitespace-pre-line leading-loose bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
            {guidance.responsibilities}
          </div>
        </div>

        {/* Required Skills, Tools & Materials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Skills */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center gap-2 font-extrabold text-xs uppercase tracking-wider text-blue-700">
              <Sparkles className="w-4 h-4" /> Required Skills ({guidance.skills?.length || 0})
            </div>
            <div className="space-y-2">
              {(guidance.skills || []).map((s, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{s.name}</span>
                    {s.mandatory && (
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-800">
                        Mandatory
                      </span>
                    )}
                  </div>
                  {s.notes && <p className="text-[10px] text-slate-500 mt-1">{s.notes}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Tools */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center gap-2 font-extrabold text-xs uppercase tracking-wider text-amber-700">
              <Wrench className="w-4 h-4" /> Tools & Equipment ({guidance.tools?.length || 0})
            </div>
            <div className="space-y-2">
              {(guidance.tools || []).map((t, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{t.name}</span>
                    {t.mandatory && (
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800">
                        Required
                      </span>
                    )}
                  </div>
                  {t.notes && <p className="text-[10px] text-slate-500 mt-1">{t.notes}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Materials */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center gap-2 font-extrabold text-xs uppercase tracking-wider text-purple-700">
              <Package className="w-4 h-4" /> Materials & Consumables ({guidance.materials?.length || 0})
            </div>
            <div className="space-y-2">
              {(guidance.materials || []).map((m, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{m.name}</span>
                    {m.mandatory ? (
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-800">
                        Must Bring
                      </span>
                    ) : (
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500">
                        Optional
                      </span>
                    )}
                  </div>
                  {m.notes && <p className="text-[10px] text-slate-500 mt-1">{m.notes}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Eligibility & Safety Instructions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Eligibility Criteria
            </div>
            <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
              <p>• Minimum Experience: <strong>{guidance.minExperienceYears || 1} Year(s)</strong></p>
              <p className="whitespace-pre-line">• {guidance.eligibilityCriteria}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-amber-700 font-extrabold text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-600" /> Safety Precautions & Guidelines
            </div>
            <div className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">
              {guidance.safetyInstructions}
            </div>
          </div>
        </div>

        {/* Bottom Application Action Banner */}
        {appStatus === 'NOT_APPLIED' && (
          <div className="bg-[#14213d] text-white p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-lg font-black">Ready to Offer {guidance.serviceName}?</h3>
              <p className="text-slate-300 text-xs max-w-xl">
                Submit your experience and equipment verification details. Our team approves applications within 24-48 business hours.
              </p>
            </div>
            <button
              onClick={() => setShowApplyModal(true)}
              className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-2xl shadow-lg shadow-blue-600/40 transition shrink-0 flex items-center gap-2"
            >
              <Send className="w-4 h-4" /> Submit Application
            </button>
          </div>
        )}

      </main>

      {/* Application Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-extrabold text-[#14213d]">Apply to Offer Service</h3>
                <p className="text-xs text-slate-500">{guidance.serviceName}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowApplyModal(false)}
                className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApply} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Years of Relevant Experience *
                </label>
                <input
                  type="number"
                  min="0"
                  max="40"
                  required
                  value={form.experienceYears}
                  onChange={(e) => setForm({ ...form, experienceYears: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Certifications / Trade Diplomas (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. ITI Electrical, HVAC Technician Level 2"
                  value={form.certifications}
                  onChange={(e) => setForm({ ...form, certifications: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Primary Service Coverage Area *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Coimbatore North, R.S. Puram, Gandhipuram"
                  value={form.serviceArea}
                  onChange={(e) => setForm({ ...form, serviceArea: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Additional Qualifications / Notes
                </label>
                <textarea
                  rows="2"
                  placeholder="Mention any specific tools, previous brand experience, or scheduling preferences..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              {/* Checkboxes */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={form.agreedToSafety}
                    onChange={(e) => setForm({ ...form, agreedToSafety: e.target.checked })}
                    className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-slate-600">
                    I have read and agree to strictly comply with all service safety instructions and customer interaction guidelines.
                  </span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={form.agreedToTools}
                    onChange={(e) => setForm({ ...form, agreedToTools: e.target.checked })}
                    className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-slate-600">
                    I confirm that I possess the mandatory tools, equipment, and transport required to execute this service professionally.
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !form.agreedToSafety || !form.agreedToTools}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold transition flex items-center gap-2"
                >
                  {submitting ? 'Submitting...' : 'Submit Application'}
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
