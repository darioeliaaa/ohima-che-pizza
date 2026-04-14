import { Link } from 'react-router-dom';
import { Sparkles, Heart, Star, Clock, MapPin, Phone, Mail, Navigation, CalendarDays } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getOpeningHours, getRestaurantContacts } from '../../services/api';

const DAYS = ['', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];
const RESTAURANT_ID = 1;

export default function HomePage() {
  const [hours, setHours] = useState([]);
  const [contacts, setContacts] = useState(null);

  useEffect(() => {
    getOpeningHours(RESTAURANT_ID).then(setHours).catch(() => {});
    getRestaurantContacts(RESTAURANT_ID).then(setContacts).catch(() => {});
  }, []);

  // Group hours by day
  const grouped = {};
  hours.forEach(h => {
    if (!grouped[h.dayOfWeek]) grouped[h.dayOfWeek] = [];
    grouped[h.dayOfWeek].push(h);
  });

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=1920&q=80')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f0a15]/60 via-[#0f0a15]/70 to-[#0f0a15]" />
        <div className="relative max-w-7xl mx-auto px-6 py-32 w-full">
          <div className="max-w-2xl animate-fade-in">
            <p className="text-pink-400 font-medium tracking-[0.3em] uppercase text-sm mb-6">Benvenuti al</p>
            <h1 className="font-serif text-4xl sm:text-6xl md:text-8xl font-bold leading-[0.95] mb-6 sm:mb-8 text-white">
              Centro Estetico<br />Bella Vita
            </h1>
            <p className="text-stone-300 sm:text-stone-400 text-base sm:text-lg md:text-xl max-w-lg mb-8 sm:mb-12 leading-relaxed">
              Trattamenti viso e corpo personalizzati, manicure, pedicure e prodotti di bellezza selezionati. Il tuo benessere è la nostra passione.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/prenota"
                className="inline-flex items-center gap-2 bg-pink-600 hover:bg-pink-500 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-bold transition-all hover:shadow-xl hover:shadow-pink-600/30 text-xs sm:text-sm uppercase tracking-wider">
                <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5" />
                Prenota su WhatsApp
              </Link>
              <Link to="/servizi"
                className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 backdrop-blur text-white px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-bold transition-all border border-white/10 hover:border-white/20 text-xs sm:text-sm uppercase tracking-wider">
                <Sparkles className="w-5 h-5" />
                I nostri servizi
              </Link>
            </div>
          </div>
        </div>
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/20 rounded-full flex items-start justify-center pt-2">
            <div className="w-1.5 h-3 bg-pink-400 rounded-full" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-[#0f0a15]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12 sm:mb-16">
            <p className="text-pink-400 font-medium tracking-[0.3em] uppercase text-xs mb-4">I nostri punti di forza</p>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">Perch&eacute; sceglierci</h2>
            <div className="w-16 h-1 bg-pink-500 rounded-full mx-auto" />
          </div>
          <div className="grid sm:grid-cols-3 gap-8 stagger-children">
            {[
              { icon: Sparkles, title: 'Trattamenti personalizzati', desc: 'Ogni trattamento è studiato su misura per le tue esigenze. Ci prendiamo cura di te con prodotti di alta qualità.' },
              { icon: Heart, title: 'Passione e professionalità', desc: 'Il nostro team di estetiste qualificate ti garantisce un\'esperienza di benessere unica e rilassante.' },
              { icon: Star, title: 'Prodotti premium', desc: 'Utilizziamo e vendiamo solo prodotti di altissima qualità, selezionati tra i migliori marchi di cosmetica.' },
            ].map((f, i) => (
              <div key={i} className="text-center p-10 rounded-2xl bg-purple-950/30 border border-purple-800/30 hover:border-pink-500/30 transition-all duration-500 group">
                <div className="w-16 h-16 bg-pink-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-pink-500/20 transition-colors">
                  <f.icon className="w-8 h-8 text-pink-400" />
                </div>
                <h3 className="font-semibold text-lg text-white mb-3">{f.title}</h3>
                <p className="text-stone-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Info + Hours */}
      <section className="py-24 bg-purple-950/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="glass rounded-3xl overflow-hidden">
            <div className="grid md:grid-cols-2">
              <div className="p-10 sm:p-14">
                <p className="text-pink-400 font-medium tracking-[0.3em] uppercase text-xs mb-4">Informazioni</p>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-8">Vieni a trovarci</h2>
                <div className="space-y-6 text-stone-300">
                  <div className="flex items-start gap-4">
                    <MapPin className="w-5 h-5 text-pink-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-white">Indirizzo</p>
                      <p className="text-stone-400">{contacts?.address || 'Via Roma 1, 88816 Strongoli (KR)'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Clock className="w-5 h-5 text-pink-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-white mb-2">Orari di apertura</p>
                      {hours.length > 0 ? (
                        <div className="space-y-1">
                          {[1,2,3,4,5,6,7].map(d => {
                            const dayData = grouped[d] || [];
                            const isClosed = dayData.length === 1 && dayData[0].isClosed;
                            const slots = dayData.filter(h => !h.isClosed);
                            return (
                              <div key={d} className="flex gap-3 text-sm">
                                <span className="w-24 text-stone-500">{DAYS[d]}</span>
                                {isClosed ? (
                                  <span className="text-red-400">Chiuso</span>
                                ) : slots.length > 0 ? (
                                  <span className="text-stone-300">
                                    {slots.map((s, i) =>
                                      `${s.openTime?.substring(0,5)} - ${s.closeTime?.substring(0,5)}`
                                    ).join(' / ')}
                                  </span>
                                ) : (
                                  <span className="text-stone-500">—</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-stone-400 text-sm">
                          <p>Lun - Ven: 09:00 - 13:00 / 15:00 - 19:00</p>
                          <p>Sab: 09:00 - 13:00</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Phone className="w-5 h-5 text-pink-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-white">Telefono</p>
                      <a href={`tel:${(contacts?.ownerPhone || '333 987 6543').replace(/\s/g, '')}`} className="text-stone-400 hover:text-pink-400 transition-colors">{contacts?.ownerPhone || '333 987 6543'}</a>
                    </div>
                  </div>
                  {(contacts?.contactEmail) && (
                  <div className="flex items-start gap-4">
                    <Mail className="w-5 h-5 text-pink-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-white">Email</p>
                      <a href={`mailto:${contacts.contactEmail}`} className="text-stone-400 hover:text-pink-400 transition-colors">{contacts.contactEmail}</a>
                    </div>
                  </div>
                  )}
                </div>
              </div>
              <div className="bg-[url('https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80')] bg-cover bg-center min-h-80" />
            </div>
          </div>
        </div>
      </section>

      {/* Google Review */}
      <section className="py-16 bg-[#0f0a15]">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="glass rounded-3xl p-10 sm:p-14 group hover:border-pink-500/30 transition-all duration-500">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-white/10 flex items-center justify-center group-hover:bg-white/15 transition-colors">
              <svg className="w-8 h-8" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-3">Ti è piaciuta l'esperienza?</h3>
            <p className="text-stone-400 text-sm mb-8 max-w-md mx-auto">Lascia una recensione su Google e aiuta altre persone a scoprire il nostro centro estetico</p>
            <a href="#" className="inline-flex items-center gap-3 bg-white/5 hover:bg-white/10 backdrop-blur border border-white/10 hover:border-white/20 text-white px-8 py-4 rounded-xl font-bold transition-all text-sm uppercase tracking-wider group">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Scrivi una recensione
            </a>
          </div>
        </div>
      </section>

      {/* Raggiungici */}
      <section className="py-24 bg-[#0f0a15]">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-pink-400 font-medium tracking-[0.3em] uppercase text-xs mb-4">Come arrivare</p>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">Raggiungici</h2>
          <div className="w-16 h-1 bg-pink-500 rounded-full mx-auto mb-6" />
          <p className="text-stone-400 text-sm sm:text-base mb-10 max-w-lg mx-auto leading-relaxed">
            Apri la mappa e lasciati guidare fino al nostro centro estetico. Ti aspettiamo!
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#"
              onClick={e => e.preventDefault()}
              className="inline-flex items-center gap-3 bg-white/5 hover:bg-white/10 backdrop-blur border border-white/10 hover:border-white/20 text-white px-8 py-4 rounded-xl font-bold transition-all text-sm uppercase tracking-wider w-full sm:w-auto justify-center"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path d="M14.12 2.06L9.57 6.61l4.24 4.24 4.55-4.55a1.5 1.5 0 000-2.12l-2.12-2.12a1.5 1.5 0 00-2.12 0z" fill="#34A853"/>
                <path d="M9.57 6.61L2.39 13.79a1.5 1.5 0 000 2.12l2.12 2.12a1.5 1.5 0 002.12 0l7.18-7.18L9.57 6.61z" fill="#4285F4"/>
                <path d="M16.37 15.09l-2.56 2.56a1.5 1.5 0 000 2.12l2.12 2.12a1.5 1.5 0 002.12 0l2.56-2.56-4.24-4.24z" fill="#FBBC05"/>
                <path d="M20.61 15.09l-4.24-4.24-2.56 2.56 4.24 4.24 2.56-2.56z" fill="#EA4335"/>
              </svg>
              Google Maps
            </a>
            <a
              href="#"
              onClick={e => e.preventDefault()}
              className="inline-flex items-center gap-3 bg-white/5 hover:bg-white/10 backdrop-blur border border-white/10 hover:border-white/20 text-white px-8 py-4 rounded-xl font-bold transition-all text-sm uppercase tracking-wider w-full sm:w-auto justify-center"
            >
              <Navigation className="w-5 h-5 text-blue-400" />
              Apple Mappe
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-[#0f0a15] text-center">
        <div className="max-w-2xl mx-auto px-6 animate-fade-in">
          <p className="text-pink-400 font-medium tracking-[0.3em] uppercase text-xs mb-4">Non aspettare</p>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">Prenota il tuo trattamento</h2>
          <p className="text-stone-300 sm:text-stone-400 mb-8 sm:mb-10 leading-relaxed">Concediti un momento di relax e benessere. Prenotazione semplice e veloce su WhatsApp.</p>
          <Link to="/prenota"
            className="inline-flex items-center gap-2 bg-pink-600 hover:bg-pink-500 text-white px-10 py-4 rounded-xl font-bold transition-all hover:shadow-xl hover:shadow-pink-600/30 text-sm uppercase tracking-wider">
            <CalendarDays className="w-5 h-5" />
            Prenota ora
          </Link>
        </div>
      </section>
    </div>
  );
}
