import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2, Info, ArrowRight } from 'lucide-react';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import { customerApi } from '../../api/customerApi';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function CustomerNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.customerUniqueId) customerApi.getNotifications(user.customerUniqueId).then(setNotifications);
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Header />

      <main className="container mx-auto px-4 lg:px-8 py-8 flex-1 space-y-6 max-w-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Notifications</h1>
            <p className="text-xs text-slate-500">Stay updated on your booking status and appointments</p>
          </div>
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
                    View Details <ArrowRight className="w-3.5 h-3.5" />
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
