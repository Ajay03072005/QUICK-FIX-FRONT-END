import React, { useEffect, useState } from 'react';
import { Bell, ArrowRight } from 'lucide-react';
import ProviderPortalNav from '../../components/provider/ProviderPortalNav';
import Footer from '../../components/common/Footer';
import { Link } from 'react-router-dom';
import { bookingApi } from '../../api/bookingApi';
import { useAuth } from '../../context/AuthContext';

export default function ProviderNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.providerUniqueId) return;
    bookingApi.getProviderBookings(user.providerUniqueId).then(bookings => {
      setNotifications(bookings.map(booking => ({
        id: booking.bookingUniqueId,
        title: `Booking ${booking.status}`,
        message: `${booking.customerName} requested ${booking.serviceName} for ${booking.bookingDate} at ${booking.bookingTime}.`,
        timestamp: booking.bookingDate,
        link: `/provider/active-service/${booking.bookingUniqueId}`
      })));
    });
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <ProviderPortalNav />

      <main className="container mx-auto px-4 lg:px-8 py-8 flex-1 space-y-6 max-w-3xl">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Provider Notifications</h1>
          <p className="text-xs text-slate-500">Alerts regarding job requests and account payouts</p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
          {notifications.map((notif) => (
            <div key={notif.id} className="p-5 flex items-start gap-4 hover:bg-slate-50 transition">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-slate-900 text-sm">{notif.title}</h4>
                  <span className="text-[11px] text-slate-400">{notif.timestamp}</span>
                </div>
                <p className="text-xs text-slate-600">{notif.message}</p>
                {notif.link && (
                  <Link to={notif.link} className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline pt-1">
                    View Request <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
