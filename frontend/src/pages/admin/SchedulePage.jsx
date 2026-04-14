import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getOpeningHours, setOpeningHours, getClosingDays, addClosingDay, removeClosingDay } from '../../services/api';
import { Clock, Plus, Trash2, X, AlertCircle, CalendarOff, Save } from 'lucide-react';

const DAYS = ['', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];

export default function SchedulePage() {
  const { user } = useAuth();
  const rid = user?.restaurantId || 1;
  const [hours, setHours] = useState([]);
  const [closingDays, setClosingDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [closingForm, setClosingForm] = useState({ date: '', reason: '' });

  const load = () => {
    setLoading(true);
    Promise.all([
      getOpeningHours(rid).catch(() => []),
      getClosingDays(rid).catch(() => []),
    ]).then(([h, c]) => {
      setHours(h);
      setClosingDays(c);
    }).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [rid]);

  // Build schedule editor state from API data
  const [schedule, setSchedule] = useState([]);
  useEffect(() => {
    const sched = [];
    for (let d = 1; d <= 7; d++) {
      const dayHours = hours.filter(h => h.dayOfWeek === d);
      const isClosed = dayHours.length === 1 && dayHours[0].isClosed;
      if (isClosed) {
        sched.push({ dayOfWeek: d, isClosed: true, slots: [] });
      } else if (dayHours.length > 0) {
        sched.push({
          dayOfWeek: d, isClosed: false,
          slots: dayHours.filter(h => !h.isClosed).map(h => ({
            openTime: h.openTime?.substring(0, 5) || '',
            closeTime: h.closeTime?.substring(0, 5) || ''
          }))
        });
      } else {
        sched.push({ dayOfWeek: d, isClosed: false, slots: [{ openTime: '', closeTime: '' }] });
      }
    }
    setSchedule(sched);
  }, [hours]);

  const toggleDay = (idx) => {
    setSchedule(s => s.map((d, i) =>
      i === idx ? { ...d, isClosed: !d.isClosed, slots: d.isClosed ? [{ openTime: '', closeTime: '' }] : [] } : d
    ));
  };

  const updateSlot = (dayIdx, slotIdx, field, value) => {
    setSchedule(s => s.map((d, i) =>
      i === dayIdx ? {
        ...d, slots: d.slots.map((slot, j) =>
          j === slotIdx ? { ...slot, [field]: value } : slot
        )
      } : d
    ));
  };

  const addSlot = (dayIdx) => {
    setSchedule(s => s.map((d, i) =>
      i === dayIdx ? { ...d, slots: [...d.slots, { openTime: '', closeTime: '' }] } : d
    ));
  };

  const removeSlot = (dayIdx, slotIdx) => {
    setSchedule(s => s.map((d, i) =>
      i === dayIdx ? { ...d, slots: d.slots.filter((_, j) => j !== slotIdx) } : d
    ));
  };

  const saveSchedule = async () => {
    setError(''); setSuccess('');
    const data = [];
    for (const day of schedule) {
      if (day.isClosed) {
        data.push({ dayOfWeek: day.dayOfWeek, isClosed: true, openTime: null, closeTime: null });
      } else {
        for (const slot of day.slots) {
          if (slot.openTime && slot.closeTime) {
            data.push({ dayOfWeek: day.dayOfWeek, isClosed: false, openTime: slot.openTime, closeTime: slot.closeTime });
          }
        }
      }
    }
    try {
      await setOpeningHours(rid, data);
      setSuccess('Orari salvati con successo!');
      load();
    } catch (err) { setError(err.message); }
  };

  const handleAddClosingDay = async (e) => {
    e.preventDefault(); setError('');
    try {
      await addClosingDay(rid, closingForm);
      setClosingForm({ date: '', reason: '' });
      load();
    } catch (err) { setError(err.message); }
  };

  const handleRemoveClosingDay = async (id) => {
    try { await removeClosingDay(id); load(); } catch (err) { setError(err.message); }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-800">Orari e Chiusure</h1>
        <p className="text-stone-500 mt-1">Gestisci gli orari di apertura e i giorni di chiusura</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 animate-slide-down">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-red-700 text-sm">{error}</p>
          <button onClick={() => setError('')} className="ml-auto"><X className="w-4 h-4 text-red-400" /></button>
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 animate-slide-down">
          <Clock className="w-5 h-5 text-emerald-500" />
          <p className="text-emerald-700 text-sm">{success}</p>
          <button onClick={() => setSuccess('')} className="ml-auto"><X className="w-4 h-4 text-emerald-400" /></button>
        </div>
      )}

      {/* Weekly Schedule */}
      <div className="bg-white rounded-2xl border border-stone-200/60 p-6 mb-6">
        <h2 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-500" />
          Orari settimanali
        </h2>
        <div className="space-y-3">
          {schedule.map((day, dayIdx) => (
            <div key={day.dayOfWeek} className="flex flex-col sm:flex-row sm:items-center gap-3 py-3 border-b border-stone-100 last:border-0">
              <div className="flex items-center gap-3 w-32 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => toggleDay(dayIdx)}
                  className={`w-10 h-6 rounded-full transition-all relative ${day.isClosed ? 'bg-stone-300' : 'bg-emerald-500'}`}>
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${day.isClosed ? 'left-0.5' : 'left-4.5'}`} />
                </button>
                <span className={`text-sm font-medium ${day.isClosed ? 'text-stone-400' : 'text-stone-700'}`}>
                  {DAYS[day.dayOfWeek]}
                </span>
              </div>

              {day.isClosed ? (
                <span className="text-sm text-red-400 font-medium">Chiuso</span>
              ) : (
                <div className="flex flex-wrap items-center gap-2 flex-1">
                  {day.slots.map((slot, slotIdx) => (
                    <div key={slotIdx} className="flex items-center gap-2">
                      <input type="time" value={slot.openTime} onChange={e => updateSlot(dayIdx, slotIdx, 'openTime', e.target.value)}
                        className="px-3 py-1.5 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-sm" />
                      <span className="text-stone-400">—</span>
                      <input type="time" value={slot.closeTime} onChange={e => updateSlot(dayIdx, slotIdx, 'closeTime', e.target.value)}
                        className="px-3 py-1.5 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-sm" />
                      {day.slots.length > 1 && (
                        <button type="button" onClick={() => removeSlot(dayIdx, slotIdx)} className="p-1 rounded hover:bg-red-50 text-stone-400 hover:text-red-500">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={() => addSlot(dayIdx)}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-stone-50 hover:bg-amber-50 text-xs text-stone-500 hover:text-amber-600 transition-all">
                    <Plus className="w-3 h-3" /> Fascia
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
        <button onClick={saveSchedule}
          className="mt-6 flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-2.5 rounded-xl font-medium text-sm transition-all hover:shadow-lg hover:shadow-amber-500/25">
          <Save className="w-4 h-4" /> Salva orari
        </button>
      </div>

      {/* Closing Days */}
      <div className="bg-white rounded-2xl border border-stone-200/60 p-6">
        <h2 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
          <CalendarOff className="w-5 h-5 text-red-400" />
          Chiusure straordinarie
        </h2>

        <form onSubmit={handleAddClosingDay} className="flex flex-wrap gap-3 mb-6">
          <input required type="date" value={closingForm.date} onChange={e => setClosingForm(f => ({ ...f, date: e.target.value }))}
            className="px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-sm" />
          <input value={closingForm.reason} onChange={e => setClosingForm(f => ({ ...f, reason: e.target.value }))} placeholder="Motivo (es. Ferie, Festività...)"
            className="flex-1 min-w-48 px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-sm" />
          <button type="submit"
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all">
            <Plus className="w-4 h-4" /> Aggiungi chiusura
          </button>
        </form>

        {closingDays.length === 0 ? (
          <p className="text-stone-400 text-sm">Nessuna chiusura straordinaria programmata</p>
        ) : (
          <div className="space-y-2">
            {closingDays.map(cd => (
              <div key={cd.id} className="flex items-center justify-between py-2.5 px-4 rounded-xl bg-red-50 border border-red-100">
                <div>
                  <span className="font-medium text-stone-700">{new Date(cd.date).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  {cd.reason && <span className="text-sm text-stone-500 ml-3">— {cd.reason}</span>}
                </div>
                <button onClick={() => handleRemoveClosingDay(cd.id)} className="p-1.5 rounded-lg hover:bg-red-100 text-red-400 hover:text-red-600 transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
