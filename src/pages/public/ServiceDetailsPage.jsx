import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, ShieldCheck, ArrowLeft, AlertCircle, Sparkles, Layers, Sliders, Clock, Tag, Award, ThumbsUp } from 'lucide-react';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import StarRating from '../../components/common/StarRating';
import { serviceApi } from '../../api/serviceApi';
import { useBooking } from '../../context/BookingContext';

export default function ServiceDetailsPage() {
  const { uniqueId } = useParams();
  const [service, setService] = useState(null);
  const [pricingConfig, setPricingConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form selections
  const [selectedOptions, setSelectedOptions] = useState({}); // groupId -> array of optionIds
  const [quantities, setQuantities] = useState({}); // groupId -> number
  const [selectedPackageId, setSelectedPackageId] = useState(null);
  const [customerNotes, setCustomerNotes] = useState('');

  // Authoritative dynamic price preview
  const [pricePreview, setPricePreview] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [validationError, setValidationError] = useState('');

  const navigate = useNavigate();
  const { updateDraft } = useBooking();

  // Load Service and its dynamic pricing configuration
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    Promise.all([
      serviceApi.getServiceById(uniqueId),
      serviceApi.getPricingConfig(uniqueId).catch(() => null)
    ])
      .then(([srvData, configData]) => {
        if (!isMounted) return;
        setService(srvData);
        setPricingConfig(configData);

        // Pre-select defaults
        if (configData) {
          const initialOpts = {};
          const initialQty = {};

          if (Array.isArray(configData.optionGroups)) {
            configData.optionGroups.forEach(grp => {
              if (grp.inputType === 'AREA' || grp.inputType === 'NUMBER') {
                initialQty[grp.id] = Number(grp.minValue || 1);
              } else if (Array.isArray(grp.options) && grp.options.length > 0 && grp.isRequired && grp.selectionType === 'SINGLE') {
                initialOpts[grp.id] = [grp.options[0].id];
              }
            });
          }

          let defaultPkgId = null;
          if (Array.isArray(configData.packages) && configData.packages.length > 0) {
            defaultPkgId = configData.packages[0].id;
            setSelectedPackageId(defaultPkgId);
          }

          setSelectedOptions(initialOpts);
          setQuantities(initialQty);

          // Initial preview
          fetchPricePreview(srvData.uniqueId, initialOpts, initialQty, defaultPkgId, '');
        }
        setLoading(false);
      })
      .catch(err => {
        if (!isMounted) return;
        console.error('Error fetching service:', err);
        setError('Unable to load service details.');
        setLoading(false);
      });

    return () => { isMounted = false; };
  }, [uniqueId]);

  const fetchPricePreview = async (sId, opts, qtys, pkgId, notes) => {
    setCalculating(true);
    setValidationError('');

    const formattedOpts = Object.entries(opts).map(([gId, oIds]) => ({
      groupId: Number(gId),
      optionIds: oIds
    }));

    const formattedQtys = Object.entries(qtys).map(([gId, val]) => ({
      groupId: Number(gId),
      value: Number(val)
    }));

    const payload = {
      serviceUniqueId: sId,
      packageId: pkgId,
      selectedOptions: formattedOpts,
      quantities: formattedQtys,
      customerNotes: notes
    };

    try {
      const calc = await serviceApi.calculatePrice(payload);
      setPricePreview(calc);
    } catch (err) {
      console.warn('Backend price calculation error:', err);
      const msg = err.response?.data?.message || 'Please complete required options to calculate total.';
      setValidationError(msg);
    } finally {
      setCalculating(false);
    }
  };

  const handleOptionToggle = (groupId, optionId, isSingle) => {
    const next = { ...selectedOptions };
    if (isSingle) {
      next[groupId] = [optionId];
    } else {
      const current = next[groupId] || [];
      if (current.includes(optionId)) {
        next[groupId] = current.filter(id => id !== optionId);
      } else {
        next[groupId] = [...current, optionId];
      }
    }
    setSelectedOptions(next);
    fetchPricePreview(service.uniqueId, next, quantities, selectedPackageId, customerNotes);
  };

  const handleQuantityChange = (groupId, value) => {
    const next = { ...quantities, [groupId]: Number(value) };
    setQuantities(next);
    fetchPricePreview(service.uniqueId, selectedOptions, next, selectedPackageId, customerNotes);
  };

  const handlePackageSelect = (pkgId) => {
    setSelectedPackageId(pkgId);
    fetchPricePreview(service.uniqueId, selectedOptions, quantities, pkgId, customerNotes);
  };

  const handleNotesChange = (text) => {
    setCustomerNotes(text);
    fetchPricePreview(service.uniqueId, selectedOptions, quantities, selectedPackageId, text);
  };

  const handleBookService = () => {
    if (validationError) {
      return;
    }

    const calculatedCharge = pricePreview?.subtotal != null
      ? Number(pricePreview.subtotal)
      : Number(service.startingPrice || 0);

    const pricingSelectionPayload = {
      serviceUniqueId: service.uniqueId,
      packageId: selectedPackageId,
      selectedOptions: Object.entries(selectedOptions).map(([gId, oIds]) => ({
        groupId: Number(gId),
        optionIds: oIds
      })),
      quantities: Object.entries(quantities).map(([gId, val]) => ({
        groupId: Number(gId),
        value: Number(val)
      })),
      customerNotes
    };

    updateDraft({
      service,
      serviceCharge: calculatedCharge,
      pricingSelection: pricingSelectionPayload,
      pricingModel: service.pricingModel || 'FIXED',
      priceBreakdown: pricePreview?.breakdown || [],
      bookingUniqueId: undefined,
      provider: null,
      distanceKm: undefined,
      distanceCharge: undefined
    });

    navigate('/customer/select-address');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f8fafc] font-sans">
        <Header />
        <div className="container mx-auto px-4 py-24 text-center space-y-3 flex-1 flex flex-col justify-center items-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-semibold text-sm">Loading service pricing details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f8fafc] font-sans">
        <Header />
        <main className="container mx-auto px-4 lg:px-8 py-16 flex-1 flex flex-col items-center justify-center text-center">
          <div className="max-w-md bg-white p-8 rounded-3xl border border-slate-200/80 shadow-md space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-black text-slate-900">Service Not Found</h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              The requested service is either unavailable or could not be loaded. Please browse available services.
            </p>
            <Link
              to="/services"
              className="inline-block px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition shadow-md"
            >
              Browse All Services
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const pricingModel = service.pricingModel || 'FIXED';
  const isQuotation = pricingModel === 'QUOTATION' || pricePreview?.isQuotation;
  const groups = pricingConfig?.optionGroups || [];
  const packages = pricingConfig?.packages || [];

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] font-sans">
      <Header />

      <main className="container mx-auto px-4 lg:px-8 py-8 flex-1 space-y-6">
        <Link to="/services" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 transition">
          <ArrowLeft className="w-4 h-4" /> Back to Services
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Configuration Details Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Header Card */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-blue-50 text-blue-800 border border-blue-100 flex items-center gap-1.5 uppercase">
                  <Tag className="w-3.5 h-3.5 text-blue-600" />
                  Model: {pricingModel}
                </span>
                <StarRating rating={service.rating || 4.8} reviewCount={service.reviewCount || 24} />
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-[#14213d]">{service.name}</h1>
              <p className="text-slate-600 text-sm leading-relaxed">{service.longDescription || service.shortDescription}</p>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-slate-900 block">QUIX FIX Service Guarantee</span>
                  <span className="text-slate-500">Verified professionals, authoritative pricing engine, and pay after completion.</span>
                </div>
              </div>
            </div>

            {/* DYNAMIC PACKAGE CARDS (FOR PACKAGE PRICING MODEL) */}
            {pricingModel === 'PACKAGE' && packages.length > 0 && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-blue-600" /> Choose a Service Package
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {packages.map(pkg => {
                    const isSelected = selectedPackageId === pkg.id;
                    return (
                      <div
                        key={pkg.id}
                        onClick={() => handlePackageSelect(pkg.id)}
                        className={`p-5 rounded-2xl border cursor-pointer transition flex flex-col justify-between space-y-3 ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20'
                            : 'border-slate-200 bg-white hover:border-blue-300'
                        }`}
                      >
                        <div>
                          <span className={`text-[10px] font-bold uppercase tracking-wider block ${isSelected ? 'text-blue-700' : 'text-slate-400'}`}>
                            Tier
                          </span>
                          <h4 className="font-black text-slate-900 text-lg">{pkg.packageName}</h4>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">{pkg.description}</p>
                        </div>
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-lg font-black text-[#14213d]">₹{pkg.packagePrice}</span>
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                            {isSelected ? 'Selected' : 'Select'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* DYNAMIC OPTION GROUPS (FOR OPTIONS, PER_UNIT, HOURLY, QUOTATION) */}
            {groups.length > 0 && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-blue-600" /> Customize Your Requirements
                </h3>

                <div className="space-y-6">
                  {groups.map(group => {
                    const isSingle = group.selectionType === 'SINGLE';
                    const isAreaOrNumber = group.inputType === 'AREA' || group.inputType === 'NUMBER';
                    const isText = group.inputType === 'TEXT';

                    return (
                      <div key={group.id} className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                            {group.groupName}
                            {group.isRequired && <span className="text-rose-500 text-xs font-semibold">*Required</span>}
                          </label>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">
                            {group.selectionType} {group.inputType && `(${group.inputType})`}
                          </span>
                        </div>

                        {/* Numeric / Area Input */}
                        {isAreaOrNumber && (
                          <div className="flex items-center gap-3">
                            <input
                              type="number"
                              min={Number(group.minValue || 1)}
                              max={Number(group.maxValue || 10000)}
                              value={quantities[group.id] || group.minValue || 1}
                              onChange={(e) => handleQuantityChange(group.id, e.target.value)}
                              className="w-32 p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                            />
                            <span className="text-xs font-bold text-slate-600">
                              {group.unitLabel || 'units'}
                              {group.unitRate > 0 && ` (₹${group.unitRate} per ${group.unitLabel || 'unit'})`}
                            </span>
                          </div>
                        )}

                        {/* Text Input / Quotation Details */}
                        {isText && (
                          <div>
                            <textarea
                              rows="3"
                              placeholder="Describe your requirement, issue symptoms, or scope of work..."
                              value={customerNotes}
                              onChange={(e) => handleNotesChange(e.target.value)}
                              className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                            ></textarea>
                          </div>
                        )}

                        {/* Selectable Options (SELECT or MULTI_SELECT) */}
                        {!isAreaOrNumber && !isText && Array.isArray(group.options) && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {group.options.map(opt => {
                              const isChecked = (selectedOptions[group.id] || []).includes(opt.id);
                              return (
                                <button
                                  type="button"
                                  key={opt.id}
                                  onClick={() => handleOptionToggle(group.id, opt.id, isSingle)}
                                  className={`p-3.5 rounded-xl border text-left text-xs font-bold transition flex items-center justify-between ${
                                    isChecked
                                      ? 'border-blue-600 bg-white text-blue-900 shadow-xs ring-2 ring-blue-500/15'
                                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                                  }`}
                                >
                                  <span>{opt.optionName}</span>
                                  {Number(opt.additionalCharge) > 0 && (
                                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${isChecked ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'}`}>
                                      +₹{opt.additionalCharge}
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Standard Inclusions / Exclusions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> What's Included
                </h3>
                <ul className="space-y-2 text-xs text-slate-600">
                  {(service.included || []).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-rose-500" /> What's Excluded
                </h3>
                <ul className="space-y-2 text-xs text-slate-600">
                  {(service.excluded || []).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Sticky Authoritative Price Preview Card */}
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xl space-y-5 sticky top-24">
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
                  Authoritative Price Breakdown
                </span>

                {isQuotation ? (
                  <div className="mt-2 space-y-1">
                    <span className="text-xl font-black text-amber-600 block">Quotation Workflow</span>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Final price will be shared by your service provider after reviewing your requirements.
                    </p>
                  </div>
                ) : (
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-black text-[#14213d]">
                      ₹{pricePreview?.subtotal != null ? pricePreview.subtotal : service.startingPrice}
                    </span>
                    {calculating && (
                      <span className="text-xs text-blue-600 animate-pulse font-semibold">Updating...</span>
                    )}
                  </div>
                )}

                <p className="text-[11px] text-slate-500 mt-1">Doorstep technician conveyance calculated at address selection.</p>
              </div>

              {/* Validation alert */}
              {validationError && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* Breakdown List */}
              {pricePreview?.breakdown && pricePreview.breakdown.length > 0 && (
                <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
                  <span className="font-bold text-slate-800 block">Cost Details:</span>
                  <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100 max-h-48 overflow-y-auto">
                    {pricePreview.breakdown.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-slate-600">
                        <span className="truncate pr-2">{item.label}</span>
                        <span className="font-bold text-slate-900 shrink-0">
                          {Number(item.amount) > 0 ? `₹${item.amount}` : '—'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleBookService}
                disabled={Boolean(validationError) || calculating}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-blue-600/25 transition active:scale-[0.99] flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                {isQuotation ? 'Request Provider Quotation' : 'Confirm & Choose Address'}
              </button>

              <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-500 space-y-1.5">
                <p>✔ Authoritative backend rate guarantee</p>
                <p>✔ Snapshot saved with booking record</p>
                <p>✔ Pay after service completion</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
