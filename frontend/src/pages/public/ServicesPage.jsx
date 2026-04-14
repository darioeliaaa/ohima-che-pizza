import { useEffect, useState, useRef, useCallback } from 'react';
import { getMenuItems, getMenuCategories, getMenuSections } from '../../services/api';
import { Sparkles, Clock, Search, ArrowLeft } from 'lucide-react';

const RESTAURANT_ID = 1;

const DEFAULT_VIDEO = 'https://media.giphy.com/media/IzT2QPekC9w5apkCqk/giphy.mp4';
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80';

export default function ServicesPage() {
  const [items, setItems] = useState([]);
  const [dbCategories, setDbCategories] = useState([]);
  const [dbSections, setDbSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState(null);
  const [showSplash, setShowSplash] = useState(false);
  const [search, setSearch] = useState('');
  const splashTimer = useRef(null);

  useEffect(() => {
    Promise.all([
      getMenuItems(RESTAURANT_ID),
      getMenuCategories(RESTAURANT_ID),
      getMenuSections(RESTAURANT_ID),
    ]).then(([menuItems, cats, secs]) => {
      setItems(menuItems);
      setDbCategories(cats);
      setDbSections(secs);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => () => clearTimeout(splashTimer.current), []);

  const categories = dbCategories.length > 0
    ? dbCategories
    : [...new Set(items.map(i => i.category || 'Altro'))].map((name, i) => ({ id: i, name, imageUrl: null, description: null }));

  const getCatImage = (cat) => cat.imageUrl || DEFAULT_IMAGE;
  const getCatVideo = (cat) => {
    if (cat.videoUrl) return cat.videoUrl;
    return DEFAULT_VIDEO;
  };

  const categoryItems = selectedCat
    ? items.filter(i => (i.category || 'Altro') === selectedCat.name)
        .filter(i => !search || i.itemName.toLowerCase().includes(search.toLowerCase()) || i.description?.toLowerCase().includes(search.toLowerCase()))
    : [];

  const selectCategory = useCallback((cat) => {
    setSelectedCat(cat);
    setShowSplash(true);
    setSearch('');
    splashTimer.current = setTimeout(() => setShowSplash(false), 3500);
  }, []);

  const skipSplash = useCallback(() => {
    clearTimeout(splashTimer.current);
    setShowSplash(false);
  }, []);

  const goBack = useCallback(() => {
    setSelectedCat(null);
    setShowSplash(false);
    setSearch('');
    clearTimeout(splashTimer.current);
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-32 pt-40">
      <div className="w-8 h-8 border-3 border-pink-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  /* ========== SPLASH SCREEN ========== */
  if (showSplash && selectedCat) {
    const splashUrl = getCatVideo(selectedCat);
    const isVideo = splashUrl.endsWith('.mp4') || splashUrl.endsWith('.webm');
    return (
      <div className="fixed inset-0 z-50 bg-[#0f0a15] flex items-center justify-center cursor-pointer" onClick={skipSplash}>
        {isVideo ? (
          <video
            src={splashUrl}
            autoPlay muted loop playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          />
        ) : (
          <img
            src={splashUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0a15] via-[#0f0a15]/50 to-[#0f0a15]/30" />
        <div className="relative text-center" style={{ animation: 'fadeScale 0.8s ease-out both' }}>
          <div className="w-20 h-0.5 bg-pink-500 rounded-full mx-auto mb-6" />
          <h1 className="font-serif text-7xl sm:text-8xl lg:text-9xl font-bold text-white tracking-wide drop-shadow-2xl">
            {selectedCat.name}
          </h1>
          <div className="w-20 h-0.5 bg-pink-500 rounded-full mx-auto mt-6" />
          <p className="mt-8 text-stone-400 text-sm tracking-[0.3em] uppercase animate-pulse">
            Tocca per continuare
          </p>
        </div>
      </div>
    );
  }

  /* ========== ITEMS VIEW ========== */
  if (selectedCat) {
    return (
      <div className="pt-24 pb-16 animate-fade-in">
        <div className="relative py-20 mb-8 overflow-hidden">
          <img src={getCatImage(selectedCat)} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[#0f0a15]/75 backdrop-blur-sm" />
          <div className="relative max-w-7xl mx-auto px-6">
            <button onClick={goBack} className="flex items-center gap-2 text-pink-400 hover:text-pink-300 text-sm mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Tutte le categorie
            </button>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-white">{selectedCat.name}</h1>
            <p className="text-stone-400 mt-2">{categoryItems.length} {categoryItems.length === 1 ? 'trattamento' : 'trattamenti'}</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6">
          <div className="relative max-w-md mb-10">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder={`Cerca in ${selectedCat.name}...`}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-purple-950/50 border border-purple-800/30 text-stone-200 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500/50 text-sm transition-all" />
          </div>

          {categoryItems.length === 0 ? (
            <div className="text-center py-20 text-stone-500">
              <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nessun trattamento trovato</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
              {categoryItems.map(item => (
                <div key={item.id} className="bg-purple-950/30 rounded-2xl border border-purple-800/30 overflow-hidden hover:border-pink-500/30 transition-all duration-300 group">
                  {item.imageUrl && (
                    <div className="w-full h-40 overflow-hidden">
                      <img src={item.imageUrl} alt={item.itemName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-pink-500/10 rounded-xl flex items-center justify-center group-hover:bg-pink-500/20 transition-colors">
                          <Sparkles className="w-5 h-5 text-pink-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{item.itemName}</h3>
                          {item.description && <p className="text-sm text-stone-500 mt-0.5">{item.description}</p>}
                        </div>
                      </div>
                      <span className="text-lg font-bold text-pink-400 whitespace-nowrap">
                        &euro;{Number(item.price).toFixed(2)}
                      </span>
                    </div>
                    {item.preparationTime > 0 && (
                      <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-2">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{item.preparationTime} min</span>
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

  /* ========== SECTION ICON MAP ========== */
  const SECTION_EMOJIS = {
    face: '✨', body: '💆', hands: '💅', feet: '🦶', hair: '💇',
    massage: '🧖', wax: '🪒', makeup: '💄', laser: '⚡', wellness: '🧘',
    utensils: '🍽️', wine: '🍷', beer: '🍺', cocktail: '🍹', coffee: '☕',
    dessert: '🍰', pizza: '🍕', fish: '🐟', meat: '🥩', salad: '🥗',
    star: '⭐', other: '📋', leaf: '🌿', fire: '🔥',
  };

  const hasSections = dbSections.length > 0;
  const groupedSections = hasSections
    ? dbSections.map(sec => ({
        ...sec,
        emoji: SECTION_EMOJIS[sec.icon] || '✨',
        cats: categories.filter(c => c.section?.id === sec.id),
      })).filter(g => g.cats.length > 0)
    : [];
  const ungroupedCats = hasSections
    ? categories.filter(c => !c.section)
    : [];

  /* ========== CATEGORY PICKER ========== */
  return (
    <div className="pt-24 pb-16">
      <div className="relative py-16 mb-8 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1920&q=80')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-[#0f0a15]/80 backdrop-blur-sm" />
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <p className="text-pink-400 font-medium tracking-[0.3em] uppercase text-xs mb-4">Scopri i nostri trattamenti</p>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">I Servizi</h1>
          <div className="w-16 h-1 bg-pink-500 rounded-full mx-auto mb-4" />
          <p className="text-stone-400 max-w-lg mx-auto">Scegli una categoria per esplorare i nostri trattamenti</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6">
        {categories.length === 0 ? (
          <div className="text-center py-20 text-stone-500">
            <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Nessun servizio disponibile</p>
          </div>
        ) : hasSections && groupedSections.length > 0 ? (
          <div className="space-y-14">
            {groupedSections.map((sec) => (
              <div key={sec.id}>
                <div className="flex items-center gap-4 mb-8">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{sec.emoji}</span>
                    <div>
                      <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">{sec.name}</h2>
                      {sec.description && <p className="text-stone-500 text-sm mt-0.5">{sec.description}</p>}
                    </div>
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-pink-500/50 to-transparent" />
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
                  {sec.cats.map(cat => {
                    const imgUrl = getCatImage(cat);
                    const count = items.filter(i => (i.category || 'Altro') === cat.name).length;
                    return (
                      <button key={cat.id} onClick={() => selectCategory(cat)}
                        className="group relative h-56 rounded-2xl overflow-hidden border border-purple-800/30 hover:border-pink-500/40 transition-all duration-500 text-left">
                        <img src={imgUrl} alt={cat.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0a15] via-[#0f0a15]/50 to-transparent group-hover:from-[#0f0a15]/90 transition-all duration-500" />
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                          <div className="w-8 h-0.5 bg-pink-500 rounded-full mb-3 group-hover:w-14 transition-all duration-500" />
                          <h3 className="font-serif text-2xl font-bold text-white group-hover:text-pink-400 transition-colors">{cat.name}</h3>
                          <p className="text-stone-400 text-sm mt-1">{count} {count === 1 ? 'trattamento' : 'trattamenti'}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {ungroupedCats.length > 0 && (
              <div>
                <div className="flex items-center gap-4 mb-8">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">✨</span>
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">Altro</h2>
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-pink-500/50 to-transparent" />
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
                  {ungroupedCats.map(cat => {
                    const imgUrl = getCatImage(cat);
                    const count = items.filter(i => (i.category || 'Altro') === cat.name).length;
                    return (
                      <button key={cat.id} onClick={() => selectCategory(cat)}
                        className="group relative h-56 rounded-2xl overflow-hidden border border-purple-800/30 hover:border-pink-500/40 transition-all duration-500 text-left">
                        <img src={imgUrl} alt={cat.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0a15] via-[#0f0a15]/50 to-transparent group-hover:from-[#0f0a15]/90 transition-all duration-500" />
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                          <div className="w-8 h-0.5 bg-pink-500 rounded-full mb-3 group-hover:w-14 transition-all duration-500" />
                          <h3 className="font-serif text-2xl font-bold text-white group-hover:text-pink-400 transition-colors">{cat.name}</h3>
                          <p className="text-stone-400 text-sm mt-1">{count} {count === 1 ? 'trattamento' : 'trattamenti'}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {categories.map(cat => {
              const imgUrl = getCatImage(cat);
              const count = items.filter(i => (i.category || 'Altro') === cat.name).length;
              return (
                <button key={cat.id} onClick={() => selectCategory(cat)}
                  className="group relative h-56 rounded-2xl overflow-hidden border border-purple-800/30 hover:border-pink-500/40 transition-all duration-500 text-left">
                  <img src={imgUrl} alt={cat.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f0a15] via-[#0f0a15]/50 to-transparent group-hover:from-[#0f0a15]/90 transition-all duration-500" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="w-8 h-0.5 bg-pink-500 rounded-full mb-3 group-hover:w-14 transition-all duration-500" />
                    <h3 className="font-serif text-2xl font-bold text-white group-hover:text-pink-400 transition-colors">{cat.name}</h3>
                    <p className="text-stone-400 text-sm mt-1">{count} {count === 1 ? 'trattamento' : 'trattamenti'}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
