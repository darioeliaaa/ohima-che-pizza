import { useEffect, useState } from 'react';
import { getActivePromotions } from '../../services/api';
import { Tag, Percent } from 'lucide-react';

const RESTAURANT_ID = 1;

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getActivePromotions(RESTAURANT_ID)
      .then(setPromotions)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="pt-24 pb-16">
      {/* Header */}
      <div className="relative py-16 mb-8 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=1920&q=80')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-sm" />
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <p className="text-amber-400 font-medium tracking-[0.3em] uppercase text-xs mb-4">Offerte speciali</p>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">Promozioni</h1>
          <div className="w-16 h-1 bg-amber-500 rounded-full mx-auto mb-4" />
          <p className="text-stone-400 max-w-lg mx-auto">Scopri le nostre offerte e promozioni esclusive per i trattamenti di bellezza</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : promotions.length === 0 ? (
          <div className="text-center py-20 text-stone-500">
            <Tag className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg">Nessuna promozione attiva al momento</p>
            <p className="text-sm mt-1">Torna a trovarci per scoprire le prossime offerte</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {promotions.map(p => (
              <div key={p.id} className="glass rounded-2xl overflow-hidden group hover:ring-1 hover:ring-amber-500/30 transition-all">
                {p.imageUrl ? (
                  <div className="aspect-[16/10] overflow-hidden">
                    <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                ) : (
                  <div className="aspect-[16/10] bg-gradient-to-br from-amber-500/10 to-pink-500/10 flex items-center justify-center">
                    <Tag className="w-12 h-12 text-stone-600" />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-white text-lg">{p.title}</h3>
                    {p.discountPercentage && (
                      <span className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-full">
                        <Percent className="w-3 h-3" />
                        -{p.discountPercentage}%
                      </span>
                    )}
                  </div>
                  {p.description && <p className="text-stone-400 text-sm mb-3 line-clamp-3">{p.description}</p>}
                  {(p.startDate || p.endDate) && (
                    <div className="text-xs text-stone-500 border-t border-white/5 pt-3 mt-3">
                      {p.startDate && <span>Dal {new Date(p.startDate).toLocaleDateString('it-IT', { day: 'numeric', month: 'long' })}</span>}
                      {p.startDate && p.endDate && <span> </span>}
                      {p.endDate && <span>al {new Date(p.endDate).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}</span>}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
