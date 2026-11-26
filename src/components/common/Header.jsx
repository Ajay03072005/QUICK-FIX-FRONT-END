import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Wrench, Menu, X, Bell, LogOut, ShieldCheck, MapPin, ChevronDown, User, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  const [currentCity, setCurrentCity] = useState('Coimbatore, TN');
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isCustomer = !location.pathname.startsWith('/provider');

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'All Services', path: '/services' },
    { name: 'Find Nearby', path: '/find-nearby' },
    { name: 'About Us', path: '/#why-choose-us' },
    { name: 'How It Works', path: '/#how-it-works' },
    ...(isAuthenticated && isCustomer ? [{ name: 'My Bookings', path: '/customer/bookings' }] : []),
    ...(isAuthenticated && !isCustomer ? [{ name: 'Provider Hub', path: '/provider/dashboard' }] : []),
  ];

  const popularLocations = [
    'Coimbatore, TN',
    'Chennai, TN',
    'Bangalore, KA',
    'Hyderabad, TS',
    'Kochi, KL',
    'Madurai, TN'
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const selectCity = (city) => {
    setCurrentCity(city);
    setLocationDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs transition-all">
      <div className="container mx-auto h-[76px] px-4 lg:px-8 flex items-center justify-between gap-4">
        
        {/* Left: Brand Logo & City Selector */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-[#14213d] text-white flex items-center justify-center shadow-md shadow-[#14213d]/20 group-hover:scale-105 transition-transform">
              <Wrench className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-[#14213d]">
                QUIX<span className="text-blue-600"> FIX</span>
              </span>
              <span className="block text-[10px] font-bold text-slate-400 -mt-1 tracking-wider uppercase">
                Reliable Services at Doorstep
              </span>
            </div>
          </Link>

          {/* Urban Company style Location Selector */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setLocationDropdownOpen(!locationDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-blue-400 bg-slate-50 text-xs font-bold text-slate-700 transition"
            >
              <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>{currentCity}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {locationDropdownOpen && (
              <div className="absolute top-10 left-0 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 text-xs animate-in fade-in slide-in-from-top-1">
                <span className="px-3 py-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  Select Location
                </span>
                {popularLocations.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => selectCity(loc)}
                    className={`w-full text-left px-3 py-2 font-semibold hover:bg-slate-50 transition flex items-center justify-between ${
                      currentCity === loc ? 'text-blue-600 bg-blue-50/60 font-bold' : 'text-slate-700'
                    }`}
                  >
                    {loc}
                    {currentCity === loc && <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center: Desktop Navigation Links */}
        <nav aria-label="Primary navigation" className="hidden lg:flex items-center gap-6 xl:gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`text-sm font-semibold transition-colors hover:text-blue-600 ${
                location.pathname === link.path
                  ? 'text-blue-600 font-extrabold bg-blue-50/80 px-3 py-1.5 rounded-xl'
                  : 'text-slate-600'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Right: Controls, Provider CTA & Profile */}
        <div className="hidden lg:flex items-center gap-4">
          <Link
            to="/provider/register"
            className="text-xs font-bold text-slate-700 hover:text-blue-600 px-3 py-2 rounded-xl border border-transparent hover:border-slate-200 transition"
          >
            Become a Provider
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link
                to={isCustomer ? '/customer/notifications' : '/provider/notifications'}
                className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition relative"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full"></span>
              </Link>

              <Link
                to={isCustomer ? '/customer/dashboard' : '/provider/dashboard'}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition"
              >
                <div className="w-7 h-7 rounded-full bg-[#14213d] text-white flex items-center justify-center text-xs font-bold">
                  {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
                </div>
                <div className="text-left">
                  <span className="text-xs font-bold text-slate-900 block leading-tight">
                    {user?.name ? user.name.split(' ')[0] : 'Account'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold block leading-tight">
                    {isCustomer ? 'Customer' : 'Provider'}
                  </span>
                </div>
              </Link>

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 rounded-xl p-2 text-xs font-bold text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                to="/customer/login"
                className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition"
              >
                Log In
              </Link>
              <Link
                to="/customer/register"
                className="px-5 py-2.5 bg-[#14213d] hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md transition hover:scale-[1.02] flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="lg:hidden flex items-center gap-2">
          {isAuthenticated && (
            <Link
              to={isCustomer ? '/customer/notifications' : '/provider/notifications'}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              <Bell className="w-5 h-5" />
            </Link>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-6 space-y-4 animate-in slide-in-from-top-2">
          {/* Mobile City Selector */}
          <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
            <select
              value={currentCity}
              onChange={(e) => setCurrentCity(e.target.value)}
              className="w-full bg-transparent text-xs font-bold text-slate-800 outline-none"
            >
              {popularLocations.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition ${
                  location.pathname === link.path
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-3">
            {isAuthenticated ? (
              <div className="space-y-2">
                <Link
                  to={isCustomer ? '/customer/dashboard' : '/provider/dashboard'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 bg-slate-100 text-slate-900 font-bold text-xs rounded-xl flex items-center justify-center gap-2"
                >
                  <User className="w-4 h-4" /> Go to Dashboard ({user?.name || 'User'})
                </Link>
                <button
                  onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                  className="w-full py-3 bg-rose-50 text-rose-600 font-bold text-xs rounded-xl flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/customer/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-3 bg-slate-100 text-slate-800 font-bold text-xs rounded-xl text-center"
                >
                  Log In
                </Link>
                <Link
                  to="/customer/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-3 bg-[#14213d] text-white font-bold text-xs rounded-xl text-center shadow-md"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
