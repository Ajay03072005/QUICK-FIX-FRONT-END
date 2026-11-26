import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, ShieldCheck, Mail, Phone, MapPin, Heart, ArrowUpRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#14213d] text-white border-t border-slate-800 pt-16 pb-12 font-sans">
      <div className="container mx-auto px-4 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-5">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/30">
                <Wrench className="w-5 h-5 text-amber-400" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                QUIX<span className="text-blue-400"> FIX</span>
              </span>
            </Link>
            <p className="text-slate-300 text-sm leading-relaxed max-w-sm">
              Reliable Services. Right at Your Doorstep. India's trusted on-demand home & professional service marketplace with transparent pricing and verified technicians.
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>100% Verified Professionals & Safe Doorstep Guarantee</span>
            </div>
          </div>

          {/* Customer Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest">For Customers</h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li><Link to="/services" className="hover:text-white transition">All Home Services</Link></li>
              <li><Link to="/find-nearby" className="hover:text-white transition">Find Nearby Providers</Link></li>
              <li><Link to="/customer/bookings" className="hover:text-white transition">My Bookings</Link></li>
              <li><Link to="/#how-it-works" className="hover:text-white transition">How It Works</Link></li>
              <li><Link to="/#why-choose-us" className="hover:text-white transition">Why QUIX FIX</Link></li>
            </ul>
          </div>

          {/* Provider Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest">For Providers</h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li><Link to="/provider/register" className="hover:text-white transition font-bold flex items-center gap-1">Become a Partner <ArrowUpRight className="w-3.5 h-3.5 text-blue-400" /></Link></li>
              <li><Link to="/provider/login" className="hover:text-white transition">Provider Portal Login</Link></li>
              <li><Link to="/provider/availability" className="hover:text-white transition">Manage Availability</Link></li>
              <li><Link to="/provider/dashboard" className="hover:text-white transition">Live Job Dispatch</Link></li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest">Support & Legal</h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-blue-400" /> +91 98765 43210</li>
              <li className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-blue-400" /> support@quixfix.local</li>
              <li className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-blue-400" /> Coimbatore, Tamil Nadu</li>
              <li className="pt-2"><Link to="/support" className="hover:text-white transition">Customer Support Desk</Link></li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} QUIX FIX Technologies Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-white transition cursor-pointer">Privacy Policy</span>
            <span className="hover:text-white transition cursor-pointer">Terms & Conditions</span>
            <span className="hover:text-white transition cursor-pointer">Trust & Safety</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
