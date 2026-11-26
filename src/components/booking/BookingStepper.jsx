import React from 'react';
import { Check } from 'lucide-react';

export default function BookingStepper({ currentStep = 1 }) {
  const steps = [
    { number: 1, title: 'Select Service' },
    { number: 2, title: 'Select Address' },
    { number: 3, title: 'Date & Time' },
    { number: 4, title: 'Nearby Provider' },
    { number: 5, title: 'Confirm' }
  ];

  return (
    <div className="w-full bg-white p-4 lg:p-6 rounded-2xl border border-slate-200/80 shadow-xs mb-8">
      <div className="flex items-center justify-between relative max-w-4xl mx-auto">
        {/* Background Connecting Bar */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2 z-0 hidden sm:block"></div>

        {/* Dynamic Progress Fill in Emerald */}
        <div
          className="absolute top-1/2 left-0 h-1 bg-emerald-600 -translate-y-1/2 z-0 transition-all duration-500 hidden sm:block"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        ></div>

        {steps.map((step) => {
          const isCompleted = currentStep > step.number;
          const isCurrent = currentStep === step.number;

          return (
            <div key={step.number} className="relative z-10 flex flex-col items-center group">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  isCompleted
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : isCurrent
                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-500/20 shadow-md shadow-emerald-600/30'
                    : 'bg-white text-slate-400 border-2 border-slate-200'
                }`}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : step.number}
              </div>
              <span
                className={`mt-2 text-xs font-semibold hidden md:block text-center ${
                  isCurrent ? 'text-emerald-700 font-bold' : isCompleted ? 'text-slate-700' : 'text-slate-400'
                }`}
              >
                {step.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
