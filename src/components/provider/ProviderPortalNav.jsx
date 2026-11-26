import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BriefcaseBusiness, CalendarDays, ClipboardList, Clock3, Settings,
  UserRound, Wrench, LogOut, Compass, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const links = [
  { label: 'Dashboard', path: '/provider/dashboard', icon: BriefcaseBusiness },
  { label: 'Requests', path: '/provider/booking-requests', icon: ClipboardList },
  { label: 'Active Job', path: '/provider/active-service', icon: Clock3 },
  { label: 'History', path: '/provider/history', icon: CalendarDays },
  { label: 'Availability', path: '/provider/availability', icon: Settings },
  { label: 'My Services', path: '/provider/services', icon: Wrench },
  { label: 'Explore Services', path: '/provider/services/discover', icon: Compass },
  { label: 'Profile', path: '/provider/profile', icon: UserRound },
];

export default function ProviderPortalNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/provider/login');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-[#14213d] text-white shadow-xl font-sans">
      <div className="container mx-auto flex h-16 items-center gap-4 px-4 lg:px-8">
        
        {/* Brand Partner Logo */}
        <Link to="/provider/dashboard" className="shrink-0 text-sm font-black tracking-wide flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/30 group-hover:scale-105 transition">
            <Wrench className="w-4 h-4 text-amber-300" />
          </div>
          <span className="font-black text-white">QUIX FIX</span>
          <span className="text-[10px] font-black text-blue-400 bg-blue-950/60 border border-blue-500/30 px-2 py-0.5 rounded-md uppercase">
            PARTNER PRO
          </span>
        </Link>

        {/* Scrollable Horizontal Navigation */}
        <nav aria-label="Provider portal navigation" className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto py-2 scrollbar-none">
          {links.map(({ label, path, icon: Icon }) => {
            const active = location.pathname === path || (path === '/provider/active-service' && location.pathname.startsWith('/provider/active-service/'));
            return (
              <Link
                key={path}
                to={path}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-black transition ${
                  active
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 border border-blue-500/50'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="h-3.5 w-3.5" /> {label}
              </Link>
            );
          })}
        </nav>

        {/* User Badge & Logout */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/provider/profile"
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-slate-700/80 transition text-xs font-bold text-slate-200"
          >
            <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-black">
              {user?.providerName?.charAt(0) || user?.name?.charAt(0) || 'P'}
            </div>
            <span className="max-w-[120px] truncate">{user?.providerName || user?.name || 'Pro Partner'}</span>
          </Link>

          <button
            onClick={handleLogout}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-black text-slate-300 hover:bg-rose-500/20 hover:text-rose-300 transition border border-transparent hover:border-rose-500/30"
          >
            <LogOut className="h-3.5 w-3.5" /> Logout
          </button>
        </div>

      </div>
    </header>
  );
}
