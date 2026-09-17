import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BriefcaseBusiness, CalendarDays, ClipboardList, Clock3, Settings, UserRound, Wrench, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const links = [
  { label: 'Dashboard', path: '/provider/dashboard', icon: BriefcaseBusiness },
  { label: 'Requests', path: '/provider/booking-requests', icon: ClipboardList },
  { label: 'Active Job', path: '/provider/active-service', icon: Clock3 },
  { label: 'History', path: '/provider/history', icon: CalendarDays },
  { label: 'Availability', path: '/provider/availability', icon: Settings },
  { label: 'Services', path: '/provider/services', icon: Wrench },
  { label: 'Profile', path: '/provider/profile', icon: UserRound },
];

export default function ProviderPortalNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/provider/login');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950 text-white shadow-lg">
      <div className="container mx-auto flex h-16 items-center gap-4 px-4 lg:px-8">
        <Link to="/provider/dashboard" className="shrink-0 text-sm font-extrabold tracking-wide text-cyan-300">
          QUICK-FIX <span className="text-white">PARTNER</span>
        </Link>
        <nav aria-label="Provider portal navigation" className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto py-2">
          {links.map(({ label, path, icon: Icon }) => {
            const active = location.pathname === path || (path === '/provider/active-service' && location.pathname.startsWith('/provider/active-service/'));
            return (
              <Link
                key={path}
                to={path}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition ${active ? 'bg-cyan-400/15 text-cyan-300' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
              >
                <Icon className="h-3.5 w-3.5" /> {label}
              </Link>
            );
          })}
        </nav>
        <button onClick={handleLogout} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-rose-300">
          <LogOut className="h-3.5 w-3.5" /> Logout
        </button>
      </div>
    </header>
  );
}
