import React, { useState } from 'react';
import { Clock, Calendar, CheckCircle2 } from 'lucide-react';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import { useNotification } from '../../context/NotificationContext';

export default function ProviderAvailabilityPage() {
  const [schedule, setSchedule] = useState({
    Monday: { active: true, start: '09:00 AM', end: '07:00 PM' },
    Tuesday: { active: true, start: '09:00 AM', end: '07:00 PM' },
    Wednesday: { active: true, start: '09:00 AM', end: '07:00 PM' },
    Thursday: { active: true, start: '09:00 AM', end: '07:00 PM' },
    Friday: { active: true, start: '09:00 AM', end: '07:00 PM' },
    Saturday: { active: true, start: '10:00 AM', end: '05:00 PM' },
    Sunday: { active: false, start: 'Off', end: 'Off' }
  });

  const { showToast } = useNotification();

  const toggleDay = (day) => {
    setSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], active: !prev[day].active }
    }));
  };

  const handleSave = () => {
    showToast('Working hours schedule saved successfully', 'success');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Header />

      <main className="container mx-auto px-4 lg:px-8 py-8 flex-1 space-y-6 max-w-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Provider Working Schedule</h1>
            <p className="text-xs text-slate-500">Set your available days and working hours</p>
          </div>
          <button onClick={handleSave} className="px-5 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-md">
            Save Schedule
          </button>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
          {Object.keys(schedule).map((day) => (
            <div key={day} className="p-4 sm:p-5 flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">{day}</span>
              <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
                <span>{schedule[day].start} - {schedule[day].end}</span>
                <button
                  onClick={() => toggleDay(day)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                    schedule[day].active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {schedule[day].active ? 'Active' : 'Off'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
