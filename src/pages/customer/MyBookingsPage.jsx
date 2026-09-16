import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Calendar, MapPin, ChevronRight, Filter } from 'lucide-react';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import { bookingApi } from '../../api/bookingApi';
import { useAuth } from '../../context/AuthContext';

export default function MyBookingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, PENDING, ACTIVE, COMPLETED, CANCELLED
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.customerUniqueId) bookingApi.getCustomerBookings(user.customerUniqueId).then(data => {
      setBookings(data);
      setLoading(false);
    });
  }, []);

  const tabs = [
    { key: 'ALL', label: 'All Bookings' },
    { key: 'WAITING_ACCEPTANCE', label: 'Pending' },
    { key: 'PROVIDER_ACCEPTED', label: 'Active / Upcoming' },
    { key: 'COMPLETED', label: 'Completed' },
    { key: 'CANCELLED', label: 'Cancelled' }
  ];

  const filteredBookings = bookings.filter(b => {
    if (activeTab === 'ALL') return true;
    return b.status === activeTab;
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
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-600">{bkg.bookingUniqueId}</span>
                    <StatusBadge status={bkg.status} />
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

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Estimated Total</span>
                    <span className="text-lg font-extrabold text-indigo-600">₹{bkg.totalPrice}</span>
                  </div>

                  <Link
                    to={`/customer/bookings/${bkg.bookingUniqueId}/track`}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1 shadow-xs"
                  >
                    View Details <ChevronRight className="w-4 h-4" />
                  </Link>
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
