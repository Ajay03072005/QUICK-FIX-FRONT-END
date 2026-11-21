import React from 'react';

export default class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error) {
    console.error('Quick-Fix page render failed:', error);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 p-6 text-center">
        <div className="max-w-md space-y-4 rounded-2xl border border-rose-200 bg-white p-6 shadow-sm">
          <h1 className="text-lg font-extrabold text-slate-900">This page could not load</h1>
          <p className="text-sm text-slate-600">This page could not be rendered. Return to the booking flow and select the service and address again.</p>
          {import.meta.env.DEV && <p className="break-words rounded-lg bg-slate-50 p-3 text-left text-xs text-slate-500">{this.state.error?.message || 'Unknown page error'}</p>}
          <a href="/customer/find-service" className="inline-block rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">Return to booking</a>
          <button type="button" onClick={() => window.location.reload()} className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700">Reload page</button>
        </div>
      </main>
    );
  }
}
