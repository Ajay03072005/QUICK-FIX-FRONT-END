import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Shield, Phone, Mail, MapPin, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto bg-slate-950 text-slate-400 border-t border-slate-800">
      <div className="container mx-auto grid grid-cols-1 gap-10 px-4 py-12 sm:py-16 md:grid-cols-2 lg:grid-cols-5 lg:px-8">
        
        {/* Col 1: Brand USP */}
        <div className="lg:col-span-2 space-y-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30">
              <Wrench className="w-5 h-5" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">
              Quick<span className="text-emerald-400">-Fix</span>
            </span>
          </Link>
          <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
            Quick-Fix is an on-demand local service booking platform connecting customers with top verified local technicians, plumbers, electricians, and cleaning professionals based on distance & transparent pricing.
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5"><Shield className="w-4 h-4 shrink-0 text-emerald-400" /> Verified Providers</span>
            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 shrink-0 text-emerald-400" /> Location First</span>
          </div>
        </div>

        {/* Col 2: Popular Services */}
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Top Services</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/services" className="hover:text-emerald-400 transition">AC Servicing & Repair</Link></li>
            <li><Link to="/services" className="hover:text-emerald-400 transition">Electrical Switchboard Repair</Link></li>
            <li><Link to="/services" className="hover:text-emerald-400 transition">Plumbing & Pipe Fitting</Link></li>
            <li><Link to="/services" className="hover:text-emerald-400 transition">Full Home Deep Cleaning</Link></li>
            <li><Link to="/services" className="hover:text-emerald-400 transition">Washing Machine Repair</Link></li>
          </ul>
        </div>

        {/* Col 3: Navigation */}
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Quick Links</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/find-nearby" className="hover:text-emerald-400 transition">Find Nearby Providers</Link></li>
            <li><Link to="/#how-it-works" className="hover:text-emerald-400 transition">How It Works</Link></li>
            <li><Link to="/provider/register" className="hover:text-emerald-400 transition">Become a Partner Provider</Link></li>
            <li><Link to="/customer/login" className="hover:text-emerald-400 transition">Customer Login</Link></li>
            <li><Link to="/provider/login" className="hover:text-emerald-400 transition">Provider Portal</Link></li>
          </ul>
        </div>

        {/* Col 4: Support & Contact */}
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Customer Support</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>+91 1800-QUICK-FIX</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-400" />
              <span>support@quickfix.app</span>
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>Coimbatore & Major Metro Cities</span>
            </li>
          </ul>
        </div>

      </div>

      <div className="container mx-auto px-4 lg:px-8 mt-12 pt-8 border-t border-slate-800 text-xs text-center flex flex-col md:flex-row items-center justify-between gap-4">
        <p>© 2026 Quick-Fix Technologies Inc. All rights reserved.</p>
        <p className="flex items-center gap-1">
          Designed with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for instant, transparent local home services.
        </p>
      </div>
    </footer>
  );
}
