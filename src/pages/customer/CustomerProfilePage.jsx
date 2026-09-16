import React from 'react';
import { User, Mail, Phone, MapPin, Shield, CreditCard, Bell, Lock, LogOut } from 'lucide-react';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function CustomerProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Header />

      <main className="container mx-auto px-4 lg:px-8 py-8 flex-1 space-y-6 max-w-4xl">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-6">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
            alt={user?.name || 'User'}
            className="w-20 h-20 rounded-2xl object-cover border border-slate-200 shrink-0"
          />
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">{user?.name || 'Ajay Ram'}</h1>
            <p className="text-xs text-slate-500">{user?.email || 'ajay.ram@example.com'} • Member since Jan 2025</p>
            <span className="inline-block mt-2 px-3 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-200">
              Verified Customer
            </span>
          </div>
        </div>

        {/* Profile Settings Options */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
          <Link to="/customer/addresses" className="p-5 flex items-center justify-between hover:bg-slate-50 transition">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-indigo-600" />
              <div>
                <h4 className="text-sm font-bold text-slate-900">Saved Addresses</h4>
                <p className="text-xs text-slate-500">Manage 3 saved home and work locations</p>
              </div>
            </div>
            <span className="text-xs font-bold text-indigo-600">Manage</span>
          </Link>

          <Link to="/customer/notifications" className="p-5 flex items-center justify-between hover:bg-slate-50 transition">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-indigo-600" />
              <div>
                <h4 className="text-sm font-bold text-slate-900">Notifications & Alerts</h4>
                <p className="text-xs text-slate-500">Manage booking updates and reminders</p>
              </div>
            </div>
            <span className="text-xs font-bold text-indigo-600">Preferences</span>
          </Link>

          <div className="p-5 flex items-center justify-between hover:bg-slate-50 transition">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-indigo-600" />
              <div>
                <h4 className="text-sm font-bold text-slate-900">Security & Privacy</h4>
                <p className="text-xs text-slate-500">Update password and authentication</p>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-400">Protected</span>
          </div>

          <button onClick={handleLogout} className="w-full p-5 flex items-center justify-between text-rose-600 hover:bg-rose-50 transition">
            <div className="flex items-center gap-3">
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-bold">Logout</span>
            </div>
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
