import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, CheckCircle2 } from 'lucide-react';
import ProviderPortalNav from '../../components/provider/ProviderPortalNav';
import Footer from '../../components/common/Footer';
import StatusBadge from '../../components/common/StatusBadge';
import { bookingApi } from '../../api/bookingApi';
import { useAuth } from '../../context/AuthContext';

export default function ServiceHistoryPage() {
  const [bookings, setBookings] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.providerUniqueId) bookingApi.getProviderBookings(user.providerUniqueId).then(setBookings);
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <ProviderPortalNav />

      <main className="container mx-auto px-4 lg:px-8 py-8 flex-1 space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Provider Service History</h1>
          <p className="text-xs text-slate-500">Record of all completed and past service jobs</p>
        </div>

        <div className="space-y-4">
          {bookings.map((bkg) => (
            <div key={bkg.bookingUniqueId} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-slate-900 text-base">{bkg.serviceName}</h3>
                  <StatusBadge status={bkg.status} />
                </div>
                <p className="text-xs text-slate-600">Customer: {bkg.customerName} • {bkg.customerAddress}</p>
                <p className="text-[11px] text-slate-400">{bkg.bookingDate} at {bkg.bookingTime}</p>
              </div>

              <div className="text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Fare Earned</span>
                <span className="text-xl font-extrabold text-emerald-600">₹{bkg.totalPrice}</span>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
