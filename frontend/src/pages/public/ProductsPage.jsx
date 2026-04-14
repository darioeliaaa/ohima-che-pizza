import { useEffect, useState } from 'react';
import { getProducts, getProductCategories } from '../../services/api';
import { ShoppingBag, Search } from 'lucide-react';

const RESTAURANT_ID = 1;

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState('tutti');
  const [search, setSearch] = useState('');

  useEffect(() => {
    Promise.all([getProducts(RESTAURANT_ID), getProductCategories(RESTAURANT_ID)])
      .then(([prods, cats]) => {
        setProducts(prods.filter(p => p.isAvailable));
        setCategories(cats);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = products
    .filter(p => selectedCat === 'tutti' || p.category === selectedCat)
    .filter(p => !search || p.productName?.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase()));

  const catNames = [...new Set(products.map(p => p.category).filter(Boolean))];

  return (
    <div className="pt-24 pb-16">
      {/* Header */}
      <div className="relative py-16 mb-8 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1920&q=80')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-sm" />
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <p className="text-amber-400 font-medium tracking-[0.3em] uppercase text-xs mb-4">I nostri prodotti</p>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">Prodotti di Bellezza</h1>
          <div className="w-16 h-1 bg-amber-500 rounded-full mx-auto mb-4" />
          <p className="text-stone-400 max-w-lg mx-auto">Scopri la nostra selezione di prodotti professionali per la cura della pelle, capelli e unghie</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* Filtri */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10 items-center justify-between">
          <div className="flex flex-wrap justify-center gap-2">
            <button onClick={() => setSelectedCat('tutti')}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCat === 'tutti'
                  ? 'bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/20'
                  : 'bg-white/5 text-stone-400 hover:text-white hover:bg-white/10 border border-white/10'
              }`}>
              Tutti
            </button>
            {catNames.map(cat => (
              <button key={cat} onClick={() => setSelectedCat(cat)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCat === cat
                    ? 'bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/20'
                    : 'bg-white/5 text-stone-400 hover:text-white hover:bg-white/10 border border-white/10'
                }`}>
                {cat}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cerca prodotto..."
              className="pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 text-sm w-64" />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-stone-500">
            <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg">Nessun prodotto disponibile</p>
            {search && <p className="text-sm mt-1">Prova a modificare la ricerca</p>}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 stagger-children">
            {filtered.map(p => (
              <div key={p.id} className="glass rounded-2xl overflow-hidden group hover:ring-1 hover:ring-amber-500/30 transition-all">
                {p.imageUrl ? (
                  <div className="aspect-square overflow-hidden">
                    <img src={p.imageUrl} alt={p.productName} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                ) : (
                  <div className="aspect-square bg-gradient-to-br from-purple-500/10 to-pink-500/10 flex items-center justify-center">
                    <ShoppingBag className="w-12 h-12 text-stone-600" />
                  </div>
                )}
                <div className="p-5">
                  {p.brand && <p className="text-xs text-amber-400 font-medium uppercase tracking-wider mb-1">{p.brand}</p>}
                  <h3 className="font-semibold text-white text-lg mb-1">{p.productName}</h3>
                  {p.description && <p className="text-stone-400 text-sm mb-3 line-clamp-2">{p.description}</p>}
                  <div className="flex items-center justify-between">
                    <span className="text-amber-400 font-bold text-lg">&euro;{Number(p.price).toFixed(2)}</span>
                    {p.category && <span className="text-xs text-stone-500 px-2 py-1 bg-white/5 rounded-full">{p.category}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
