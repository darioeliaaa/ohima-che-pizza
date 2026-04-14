import { useState, useEffect } from 'react';
import { checkAvailability, getOpeningHours, getRestaurantContacts } from '../../services/api';
import { CalendarDays, Clock, User, MessageSquare, CheckCircle, XCircle, Sparkles, AlertCircle } from 'lucide-react';

const RESTAURANT_ID = 1;
const DAYS = ['', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];

export default function ReservationPage() {
  const [form, setForm] = useState({
    customerName: '', reservationDate: '', startTime: '', treatment: '', notes: ''
  });
  const [availability, setAvailability] = useState(null);
  const [hours, setHours] = useState([]);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    getOpeningHours(RESTAURANT_ID).then(setHours).catch(() => {});
    getRestaurantContacts(RESTAURANT_ID).then(data => {
      if (data?.whatsappNumber) setWhatsappNumber(data.whatsappNumber);
    }).catch(() => {});
  }, []);

  // Check availability when date+time change
  useEffect(() => {
    if (form.reservationDate && form.startTime) {
      setAvailability(null);
      checkAvailability(RESTAURANT_ID, form.reservationDate, form.startTime)
        .then(setAvailability)
        .catch(() => setAvailability(null));
    } else {
      setAvailability(null);
    }
  }, [form.reservationDate, form.startTime]);

  const nameRegex = /^[A-Za-zÀ-ÿ'\-\s]+$/;

  const maxDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  })();

  const today = new Date().toISOString().split('T')[0];

  const validateField = (key, value) => {
    switch (key) {
      case 'customerName':
        if (!value.trim()) return 'Il nome è obbligatorio';
        if (value.trim().length < 2) return 'Minimo 2 caratteri';
        if (value.length > 50) return 'Massimo 50 caratteri';
        if (!nameRegex.test(value)) return 'Solo lettere, spazi e apostrofi';
        return '';
      case 'reservationDate':
        if (!value) return 'La data è obbligatoria';
        if (value < today) return 'Non puoi prenotare nel passato';
        if (value > maxDate) return 'Puoi prenotare al massimo 30 giorni in anticipo';
        return '';
      case 'notes':
        if (value.length > 500) return 'Massimo 500 caratteri';
        return '';
      default:
        return '';
    }
  };

  const update = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    const err = validateField(k, v);
    setFieldErrors(prev => ({ ...prev, [k]: err }));
  };

  const hasErrors = () => {
    const errs = {};
    for (const [k, v] of Object.entries(form)) {
      if (k === 'startTime' || k === 'treatment') continue;
      const e = validateField(k, v);
      if (e) errs[k] = e;
    }
    if (!form.startTime) errs.startTime = "L'orario è obbligatorio";
    setFieldErrors(errs);
    return Object.keys(errs).length > 0;
  };

  const buildWhatsAppUrl = () => {
    const number = whatsappNumber.replace(/[^0-9]/g, '');
    const date = form.reservationDate ? new Date(form.reservationDate + 'T00:00:00').toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '';
    let msg = `Ciao! Vorrei prenotare un appuntamento.\n\n`;
    msg += `*Nome:* ${form.customerName}\n`;
    msg += `*Data:* ${date}\n`;
    msg += `*Ora:* ${form.startTime}\n`;
    if (form.treatment) msg += `*Trattamento:* ${form.treatment}\n`;
    if (form.notes) msg += `*Note:* ${form.notes}\n`;
    msg += `\nGrazie!`;
    return `https://wa.me/${number}?text=${encodeURIComponent(msg)}`;
  };

  const submit = (e) => {
    e.preventDefault();
    if (hasErrors()) return;
    if (!whatsappNumber) {
      setFieldErrors(prev => ({ ...prev, _general: 'Numero WhatsApp non configurato. Contattaci telefonicamente.' }));
      return;
    }
    if (availability && !availability.open) return;
    window.open(buildWhatsAppUrl(), '_blank', 'noopener,noreferrer');
  };

  // Group hours by day
  const grouped = {};
  hours.forEach(h => { if (!grouped[h.dayOfWeek]) grouped[h.dayOfWeek] = []; grouped[h.dayOfWeek].push(h); });

  return (
    <div className="pt-24 pb-16">
      {/* Header */}
      <div className="relative py-16 mb-8 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=1920&q=80')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-sm" />
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <p className="text-amber-400 font-medium tracking-[0.3em] uppercase text-xs mb-4">Prenota il tuo trattamento</p>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">Prenota un appuntamento</h1>
          <div className="w-16 h-1 bg-amber-500 rounded-full mx-auto mb-4" />
          <p className="text-stone-400 max-w-lg mx-auto">Compila il form e invia la richiesta direttamente su WhatsApp. Ti confermeremo l'appuntamento il prima possibile.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Opening hours sidebar */}
          <div className="md:col-span-1">
            <div className="glass rounded-2xl p-6 sticky top-28">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" /> Orari
              </h3>
              {hours.length > 0 ? (
                <div className="space-y-2">
                  {[1,2,3,4,5,6,7].map(d => {
                    const dayData = grouped[d] || [];
                    const isClosed = dayData.length === 1 && dayData[0].isClosed;
                    const slots = dayData.filter(h => !h.isClosed);
                    return (
                      <div key={d} className="text-xs">
                        <span className="text-stone-500 block">{DAYS[d]}</span>
                        {isClosed ? (
                          <span className="text-red-400 font-medium">Chiuso</span>
                        ) : slots.length > 0 ? (
                          <span className="text-stone-300">{slots.map(s => `${s.openTime?.substring(0,5)}-${s.closeTime?.substring(0,5)}`).join(' / ')}</span>
                        ) : (
                          <span className="text-stone-600">—</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-stone-500 text-xs">Orari non disponibili</p>
              )}
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-2">
            {fieldErrors._general && (
              <div className="mb-8 p-4 glass rounded-2xl border-red-500/30 animate-fade-in flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-red-300 text-sm">{fieldErrors._general}</p>
              </div>
            )}

            <form onSubmit={submit} className="glass rounded-2xl p-6 sm:p-8 space-y-5 animate-fade-in">
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-stone-300 mb-1.5">
                    <User className="w-4 h-4 text-stone-500" /> Nome completo
                  </label>
                  <input required value={form.customerName} onChange={e => update('customerName', e.target.value)} maxLength={50}
                    placeholder="Mario Rossi"
                    className={`w-full px-4 py-3 rounded-xl bg-stone-800/50 border text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 text-sm transition-all ${fieldErrors.customerName ? 'border-red-500/50' : 'border-stone-700/50'}`} />
                  {fieldErrors.customerName && <p className="text-red-400 text-xs mt-1">{fieldErrors.customerName}</p>}
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-stone-300 mb-1.5">
                    <CalendarDays className="w-4 h-4 text-stone-500" /> Data
                  </label>
                  <input required type="date" min={today} max={maxDate} value={form.reservationDate} onChange={e => update('reservationDate', e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl bg-stone-800/50 border text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 text-sm transition-all ${fieldErrors.reservationDate ? 'border-red-500/50' : 'border-stone-700/50'}`} />
                  {fieldErrors.reservationDate && <p className="text-red-400 text-xs mt-1">{fieldErrors.reservationDate}</p>}
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-stone-300 mb-1.5">
                    <Clock className="w-4 h-4 text-stone-500" /> Ora
                  </label>
                  <input required type="time" value={form.startTime} onChange={e => update('startTime', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-stone-800/50 border border-stone-700/50 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 text-sm transition-all" />
                  {fieldErrors.startTime && <p className="text-red-400 text-xs mt-1">{fieldErrors.startTime}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-stone-300 mb-1.5">
                    <Sparkles className="w-4 h-4 text-stone-500" /> Trattamento desiderato <span className="text-stone-600 font-normal">(opzionale)</span>
                  </label>
                  <input value={form.treatment} onChange={e => setForm(f => ({ ...f, treatment: e.target.value }))} maxLength={100}
                    placeholder="es. Manicure, Pulizia viso, Massaggio..."
                    className="w-full px-4 py-3 rounded-xl bg-stone-800/50 border border-stone-700/50 text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 text-sm transition-all" />
                </div>
              </div>

              {/* Availability indicator */}
              {availability && (
                <div className={`flex items-center gap-2 p-3 rounded-xl text-sm ${
                  availability.open
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                    : 'bg-red-500/10 border border-red-500/20 text-red-300'
                }`}>
                  {availability.open ? (
                    <><CheckCircle className="w-4 h-4" /> Il centro è aperto in questa data e orario</>
                  ) : (
                    <><XCircle className="w-4 h-4" /> Il centro è chiuso in questa data e orario</>
                  )}
                </div>
              )}

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-stone-300 mb-1.5">
                  <MessageSquare className="w-4 h-4 text-stone-500" /> Note <span className="text-stone-600 font-normal">(opzionale — max 500 caratteri)</span>
                </label>
                <textarea value={form.notes} onChange={e => update('notes', e.target.value)} rows={3} maxLength={500}
                  placeholder="Allergie, preferenze particolari..."
                  className={`w-full px-4 py-3 rounded-xl bg-stone-800/50 border text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 text-sm transition-all resize-none ${fieldErrors.notes ? 'border-red-500/50' : 'border-stone-700/50'}`} />
                <div className="flex justify-between mt-1">
                  {fieldErrors.notes && <p className="text-red-400 text-xs">{fieldErrors.notes}</p>}
                  <p className={`text-xs ml-auto ${form.notes.length > 450 ? 'text-amber-400' : 'text-stone-600'}`}>{form.notes.length}/500</p>
                </div>
              </div>
              <button type="submit" disabled={availability && !availability.open}
                className="w-full py-3.5 bg-[#25D366] hover:bg-[#20BD5A] disabled:bg-stone-700 disabled:text-stone-500 text-white font-bold rounded-xl transition-all hover:shadow-xl hover:shadow-[#25D366]/20 flex items-center justify-center gap-2 uppercase tracking-wider text-sm">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Prenota su WhatsApp
              </button>

              <p className="text-center text-stone-500 text-xs">
                Cliccando il pulsante si aprirà WhatsApp con il messaggio pre-compilato. La prenotazione sarà confermata dal centro.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
