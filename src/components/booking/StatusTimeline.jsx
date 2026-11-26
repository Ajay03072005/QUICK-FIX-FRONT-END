import React from 'react';
import { CheckCircle2, Clock, PlayCircle, ShieldCheck } from 'lucide-react';

export default function StatusTimeline({ currentStatus = 'WAITING_ACCEPTANCE', history = [] }) {
  const steps = [
    { key: 'BOOKING_CREATED', label: 'Booking Created', desc: 'Booking request registered in system' },
    { key: 'PROVIDER_SELECTED', label: 'Provider Selected', desc: 'Customer chose preferred nearby provider' },
    { key: 'WAITING_ACCEPTANCE', label: 'Waiting for Acceptance', desc: 'Notification sent to provider' },
    { key: 'PROVIDER_ACCEPTED', label: 'Provider Accepted', desc: 'Provider accepted time slot & job details' },
    { key: 'IN_PROGRESS', label: 'Service Started', desc: 'Technician on-site fixing issue' },
    { key: 'COMPLETED', label: 'Service Completed', desc: 'Work done & invoice settled' }
  ];

  const getStepState = (stepKey) => {
    const statusOrder = [
      'BOOKING_CREATED',
      'PROVIDER_SELECTED',
      'WAITING_ACCEPTANCE',
      'PROVIDER_ACCEPTED',
      'IN_PROGRESS',
      'COMPLETED'
    ];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const stepIndex = statusOrder.indexOf(stepKey);

    if (currentStatus === 'CANCELLED') {
      return stepIndex === 0 ? 'completed' : 'pending';
    }

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" /> Booking Status Timeline
        </h3>
        <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200/60">Live Status Tracker</span>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
        {steps.map((step) => {
          const state = getStepState(step.key);
          const historyEntry = history.find(h => h.status === step.key);

          return (
            <div key={step.key} className="relative flex items-start gap-4 group">
              {/* Timeline Bullet */}
              <div
                className={`absolute -left-6 top-1 w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                  state === 'completed'
                    ? 'bg-blue-600 text-white ring-4 ring-blue-50'
                    : state === 'current'
                    ? 'bg-[#14213d] text-white ring-4 ring-blue-500/20 animate-pulse'
                    : 'bg-white border-2 border-slate-300 text-transparent'
                }`}
              >
                {state === 'completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                {state === 'current' && <div className="w-2 h-2 rounded-full bg-white"></div>}
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <h4
                    className={`text-sm font-bold ${
                      state === 'completed'
                        ? 'text-slate-900'
                        : state === 'current'
                        ? 'text-blue-700 font-extrabold'
                        : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </h4>
                  {historyEntry && (
                    <span className="text-[11px] font-medium text-slate-400">
                      {new Date(historyEntry.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
                <p
                  className={`text-xs mt-0.5 ${
                    state === 'current' ? 'text-slate-700 font-medium' : 'text-slate-500'
                  }`}
                >
                  {historyEntry?.desc || step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
