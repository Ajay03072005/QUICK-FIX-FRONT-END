import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Wrench, Menu, X, User, ShieldCheck, Bell, MapPin, Search, ArrowRightLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { userRole, user, switchRole, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isCustomer = userRole === 'CUSTOMER';
  const isProvider = userRole === 'PROVIDER';

  const toggleRole = () => {
    const nextRole = isCustomer ? 'PROVIDER' : 'CUSTOMER';
    switchRole(nextRole);
    if (nextRole === 'PROVIDER') {
      navigate('/provider/dashboard');
    } else {
      navigate('/customer/dashboard');
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'Find Nearby', path: '/find-nearby' },
    { name: 'How It Works', path: '/#how-it-works' },
    { name: 'Become a Provider', path: '/register?role=provider' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all">
      {/* Quick Role Switcher Banner */}
      <div className="bg-slate-900 text-slate-200 py-1.5 px-4 text-xs font-medium flex items-center justify-between">
        <div className="container mx-auto flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Currently viewing as: <strong className="text-white uppercase tracking-wider">{userRole}</strong>
          </span>
          <button
            onClick={toggleRole}
            className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition text-xs shadow-xs"
          >
            <ArrowRightLeft className="w-3 h-3" />
            Switch to {isCustomer ? 'Provider Portal' : 'Customer Portal'}
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30 group-hover:scale-105 transition-transform">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Quick<span className="text-indigo-600">-Fix</span>
            </span>
            <span className="block text-[10px] font-semibold text-slate-400 -mt-1 tracking-wider uppercase">
              Local Services
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`text-sm font-medium transition-colors hover:text-indigo-600 ${
                location.pathname === link.path ? 'text-indigo-600 font-semibold' : 'text-slate-600'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Action Controls & Profile */}
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link
                to={isCustomer ? '/customer/notifications' : '/provider/notifications'}
                className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition relative"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full"></span>
              </Link>

              <Link
                to={isCustomer ? '/customer/dashboard' : '/provider/dashboard'}
                className="flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-xl border border-slate-200 hover:border-indigo-200 hover:bg-slate-50 transition"
              >
                <img
                  src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                  alt={user?.name || 'User'}
                  className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                />
                <div className="text-left">
                  <span className="block text-xs font-bold text-slate-800 leading-tight">
                    {user?.name || user?.providerName || 'User Account'}
                  </span>
                  <span className="block text-[10px] text-slate-500">
                    {isCustomer ? 'Customer Dashboard' : 'Provider Portal'}
                  </span>
                </div>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600 transition"
              >
                Login
              </Link>
              <Link
                to="/customer/find-service"
                className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 transition hover:shadow-indigo-600/30"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-slate-600 hover:text-indigo-600 focus:outline-none"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-medium text-slate-700 hover:text-indigo-600 border-b border-slate-100"
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-2 flex flex-col gap-2">
            <Link
              to={isCustomer ? '/customer/dashboard' : '/provider/dashboard'}
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 text-sm font-semibold text-indigo-600 bg-indigo-50 rounded-xl"
            >
              Go to {isCustomer ? 'Customer Dashboard' : 'Provider Dashboard'}
            </Link>
            {!isAuthenticated && (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl"
              >
                Login / Register
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
