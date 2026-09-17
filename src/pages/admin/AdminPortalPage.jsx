import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Users, Wrench, CalendarCheck } from 'lucide-react';

const modules = [
  { icon: Users, title: 'Customers', description: 'Review customer accounts and support requests.' },
  { icon: Wrench, title: 'Providers', description: 'Verify providers, documents, and service coverage.' },
  { icon: CalendarCheck, title: 'Bookings', description: 'Monitor bookings, cancellations, and disputes.' },
];

export default function AdminPortalPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 font-sans text-white sm:px-8">
      <section className="mx-auto max-w-5xl space-y-10">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-white">
          <Wrench className="h-5 w-5 text-cyan-400" /> Quick-Fix
        </Link>

        <div className="rounded-3xl border border-slate-700 bg-slate-900 p-8 shadow-2xl sm:p-12">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-cyan-400/10 p-4 text-cyan-300"><ShieldCheck className="h-8 w-8" /></div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">Restricted workspace</p>
              <h1 className="mt-2 text-3xl font-extrabold">Quick-Fix Admin Portal</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                This is a dedicated administration area, separate from customer booking and provider operations.
                Admin authentication must be enabled on the backend before management data can be displayed safely.
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {modules.map(({ icon: Icon, title, description }) => (
              <div key={title} className="rounded-2xl border border-slate-700 bg-slate-800/70 p-5">
                <Icon className="h-5 w-5 text-cyan-300" />
                <h2 className="mt-4 font-bold">{title}</h2>
                <p className="mt-2 text-sm leading-5 text-slate-400">{description}</p>
                <span className="mt-5 inline-block text-xs font-bold text-amber-300">Awaiting admin authentication</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
