import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, ChevronRight, CreditCard, FileText } from 'lucide-react';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import StatusBadge from '../../components/common/StatusBadge';
import PaymentStatusBadge from '../../components/payment/PaymentStatusBadge';
import EmptyState from '../../components/common/EmptyState';
import { bookingApi } from '../../api/bookingApi';
import { useAuth } from '../../context/AuthContext';

export default function MyBookingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, PENDING, ACTIVE, COMPLETED, CANCELLED
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!user?.customerUniqueId) {
      setBookings([]);
      setLoading(false);
      return;
    }
    let mounted = true;
    setLoading(true);
    setLoadError(false);
    bookingApi.getCustomerBookings(user.customerUniqueId)
      .then((data) => { if (mounted) setBookings(data); })
      .catch(() => { if (mounted) setLoadError(true); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [user?.customerUniqueId]);

  const tabs = [
    { key: 'ALL', label: 'All Bookings' },
    { key: 'PENDING', label: 'Pending' },
    { key: 'ACTIVE', label: 'Active / Upcoming' },
    { key: 'COMPLETED', label: 'Completed' },
    { key: 'CANCELLED', label: 'Cancelled' }
  ];

  const filteredBookings = bookings.filter(b => {
    if (activeTab === 'ALL') return true;
    const status = String(b.status || '').toUpperCase();
    if (activeTab === 'PENDING') return ['PENDING', 'PROVIDER_SELECTED', 'WAITING_FOR_PROVIDER', 'WAITING_ACCEPTANCE'].includes(status);
    if (activeTab === 'ACTIVE') return ['PROVIDER_ACCEPTED', 'CONFIRMED', 'ACCEPTED', 'PROVIDER_EN_ROUTE', 'IN_PROGRESS', 'SERVICE_STARTED'].includes(status);
    if (activeTab === 'CANCELLED') return ['CUSTOMER_CANCELLED', 'PROVIDER_CANCELLED', 'CANCELLED', 'PROVIDER_REJECTED', 'REJECTED'].includes(status);
    return status === activeTab;
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Header />

      <main className="container mx-auto px-4 lg:px-8 py-8 flex-1 space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">My Bookings</h1>
          <p className="text-xs text-slate-500">Manage and track your service appointments</p>
        </div>

        {/* Tabs navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                activeTab === tab.key
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="py-12 text-center text-sm text-slate-500">Loading bookings...</div>
        ) : loadError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-sm text-rose-700">We couldn’t load your bookings. Please refresh and try again.</div>
        ) : filteredBookings.length === 0 ? (
          <EmptyState
            title="No Bookings Found"
            description="You don't have any service bookings under this filter."
            actionLabel="Find a Service"
            actionPath="/customer/find-service"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredBookings.map((bkg) => (
              <div
                key={bkg.bookingUniqueId}
                className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-xs font-bold text-indigo-600">{bkg.bookingUniqueId}</span>
                    <div className="flex items-center gap-1.5">
                      <StatusBadge status={bkg.status} />
                      {(bkg.status === 'COMPLETED' || ['PAID', 'SUCCESS', 'FAILED', 'REFUND_PENDING', 'REFUNDED', 'PARTIALLY_REFUNDED'].includes(bkg.paymentStatus)) && <PaymentStatusBadge status={bkg.paymentStatus} />}
                    </div>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-lg">{bkg.serviceName}</h3>
                  <p className="text-xs text-slate-600 font-semibold">{bkg.providerName}</p>

                  <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{bkg.bookingDate} at {bkg.bookingTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{bkg.customerAddress}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Total Payable</span>
                    <span className="text-lg font-extrabold text-indigo-600">₹{bkg.totalPrice}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {bkg.status === 'COMPLETED' && bkg.paymentStatus !== 'PAID' && bkg.paymentStatus !== 'SUCCESS' ? (
                      <Link
                        to={`/customer/payment/${bkg.bookingUniqueId}`}
                        className="px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-extrabold text-xs rounded-xl transition flex items-center gap-1 shadow-xs"
                      >
                        <CreditCard className="w-3.5 h-3.5" /> Pay Now
                      </Link>
                    ) : (bkg.paymentStatus === 'PAID' || bkg.paymentStatus === 'SUCCESS') ? (
                      <Link
                        to={`/customer/receipt/${bkg.bookingUniqueId}`}
                        className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs rounded-xl transition flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5 text-emerald-600" /> Receipt
                      </Link>
                    ) : null}

                    <Link
                      to={`/customer/bookings/${bkg.bookingUniqueId}/track`}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1"
                    >
                      Details <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
