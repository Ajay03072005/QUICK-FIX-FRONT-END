import React, { useState, useEffect } from 'react';
import { Clock, Calendar, CheckCircle2, Loader2 } from 'lucide-react';
import ProviderPortalNav from '../../components/provider/ProviderPortalNav';
import Footer from '../../components/common/Footer';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { providerApi } from '../../api/providerApi';

const DAY_MAP = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function ProviderAvailabilityPage() {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const providerId = user?.uniqueId || user?.providerUniqueId || 'PRO-DEMO1';

  const [schedule, setSchedule] = useState({
    Monday: { active: true, start: '09:00', end: '19:00' },
    Tuesday: { active: true, start: '09:00', end: '19:00' },
    Wednesday: { active: true, start: '09:00', end: '19:00' },
    Thursday: { active: true, start: '09:00', end: '19:00' },
    Friday: { active: true, start: '09:00', end: '19:00' },
    Saturday: { active: true, start: '10:00', end: '17:00' },
    Sunday: { active: false, start: '09:00', end: '17:00' }
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadSchedule() {
      if (!providerId) return;
      try {
        setLoading(true);
        const data = await providerApi.getSchedule(providerId);
        if (data && data.length > 0) {
          const nextSched = { ...schedule };
          data.forEach(item => {
            const dayName = DAY_MAP[item.weekday];
            if (dayName) {
              nextSched[dayName] = {
                active: item.isWorkingDay ?? item.workingDay ?? false,
                start: item.startTime ? item.startTime.substring(0, 5) : '09:00',
                end: item.endTime ? item.endTime.substring(0, 5) : '19:00'
              };
            }
          });
          setSchedule(nextSched);
        }
      } catch (err) {
        console.warn("Could not load backend schedule, using default:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSchedule();
  }, [providerId]);

  const toggleDay = (day) => {
    setSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], active: !prev[day].active }
    }));
  };

  const handleTimeChange = (day, field, value) => {
    setSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = Object.keys(schedule).map(dayName => {
        const weekdayIndex = DAY_MAP.indexOf(dayName);
        const item = schedule[dayName];
        return {
          weekday: weekdayIndex,
          startTime: item.start.length === 5 ? `${item.start}:00` : item.start,
          endTime: item.end.length === 5 ? `${item.end}:00` : item.end,
          isWorkingDay: item.active
        };
      });

      await providerApi.saveSchedule(providerId, payload);
      showToast('Working hours schedule saved successfully to database', 'success');
    } catch (err) {
      showToast('Failed to save schedule: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <ProviderPortalNav />

      <main className="container mx-auto px-4 lg:px-8 py-8 flex-1 space-y-6 max-w-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Provider Working Schedule</h1>
            <p className="text-xs text-slate-500">Set your available days and working hours</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Schedule'}
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mx-auto mb-2" />
            <p className="text-xs text-slate-500">Loading schedule...</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
            {Object.keys(schedule).map((day) => (
              <div key={day} className="p-4 sm:p-5 flex items-center justify-between gap-4">
                <span className="font-bold text-slate-900 text-sm w-28">{day}</span>
                <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
                  <input
                    type="time"
                    value={schedule[day].start}
                    disabled={!schedule[day].active}
                    onChange={(e) => handleTimeChange(day, 'start', e.target.value)}
                    className="px-2 py-1 border border-slate-200 rounded-lg disabled:opacity-40"
                  />
                  <span>to</span>
                  <input
                    type="time"
                    value={schedule[day].end}
                    disabled={!schedule[day].active}
                    onChange={(e) => handleTimeChange(day, 'end', e.target.value)}
                    className="px-2 py-1 border border-slate-200 rounded-lg disabled:opacity-40"
                  />
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
        )}
      </main>

      <Footer />
    </div>
  );
}
