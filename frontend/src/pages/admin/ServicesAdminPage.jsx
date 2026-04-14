import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getMenuItems, createMenuItem, toggleMenuItemAvailability, uploadImage, getMenuCategories } from '../../services/api';
import { Plus, Sparkles, Eye, EyeOff, X, AlertCircle, ImagePlus, Clock } from 'lucide-react';

export default function ServicesAdminPage() {
  const { user } = useAuth();
  const rid = user?.restaurantId || 1;
  const [items, setItems] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    itemName: '', description: '', price: '', category: '', imageUrl: '', preparationTime: ''
  });
  const [categories, setCategories] = useState([]);

  const load = () => {
    Promise.all([getMenuItems(rid), getMenuCategories(rid)]).then(([data, cats]) => {
      setItems(data); setAllItems(data); setCategories(cats);
    }).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [rid]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      setError('L\'immagine supera 1 MB. Riduci la dimensione del file e riprova.');
      e.target.value = '';
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleCreate = async (e) => {
    e.preventDefault(); setError('');
    try {
      let imageUrl = form.imageUrl;
      if (imageFile) {
        setUploading(true);
        const res = await uploadImage(imageFile);
        imageUrl = res.url;
        setUploading(false);
      }
      await createMenuItem({
        ...form,
        imageUrl,
        restaurantId: rid,
        price: parseFloat(form.price),
        itemType: 'FOOD',
        preparationTime: form.preparationTime ? parseInt(form.preparationTime) : 0
      });
      setForm({ itemName: '', description: '', price: '', category: '', imageUrl: '', preparationTime: '' });
      setImageFile(null); setImagePreview('');
      setShowForm(false); load();
    } catch (err) { setUploading(false); setError(err.message); }
  };

  const toggle = async (id, current) => {
    try { await toggleMenuItemAvailability(id, !current); load(); } catch (err) { setError(err.message); }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Servizi</h1>
          <p className="text-stone-500 mt-1">{items.length} trattamenti</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all hover:shadow-lg hover:shadow-amber-500/25">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Annulla' : 'Nuovo servizio'}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 animate-slide-down">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-red-700 text-sm">{error}</p>
          <button onClick={() => setError('')} className="ml-auto"><X className="w-4 h-4 text-red-400" /></button>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-2xl border border-stone-200/60 p-6 mb-6 animate-slide-down">
          <h2 className="font-semibold text-stone-800 mb-4">Nuovo servizio</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <input required value={form.itemName} onChange={e => setForm(f => ({ ...f, itemName: e.target.value }))} placeholder="Nome servizio (es. Manicure classica)"
              className="px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-sm" />
            <input required value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Descrizione"
              className="px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-sm" />
            <input required type="number" step="0.01" min="0" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="Prezzo (€)"
              className="px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-sm" />
            <input type="number" min="0" value={form.preparationTime} onChange={e => setForm(f => ({ ...f, preparationTime: e.target.value }))} placeholder="Durata (minuti)"
              className="px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-sm" />
            <select required value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-sm sm:col-span-2">
              <option value="">Seleziona categoria</option>
              {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          {/* Image upload */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-stone-600 mb-2">Immagine servizio</label>
            <div className="flex items-start gap-4">
              <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-stone-300 hover:border-amber-500 cursor-pointer transition-colors text-sm text-stone-500 hover:text-amber-600">
                <ImagePlus className="w-4 h-4" />
                {imageFile ? imageFile.name : 'Scegli immagine'}
                <input type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={handleImageChange} className="hidden" />
              </label>
              {imagePreview && (
                <div className="relative">
                  <img src={imagePreview} alt="Anteprima" className="w-20 h-20 object-cover rounded-xl border border-stone-200" />
                  <button type="button" onClick={() => { setImageFile(null); setImagePreview(''); }}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"><X className="w-3 h-3" /></button>
                </div>
              )}
            </div>
            <p className="text-xs text-stone-400 mt-1">JPG, PNG, GIF o WebP — max 1MB</p>
          </div>
          <button type="submit" disabled={uploading}
            className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2.5 rounded-xl font-medium text-sm transition-all disabled:opacity-50">
            {uploading ? 'Caricamento...' : 'Aggiungi servizio'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-stone-400">
          <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Nessun servizio inserito</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-100">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Servizio</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Categoria</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Prezzo</th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Durata</th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Stato</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id} className="border-b border-stone-50 hover:bg-stone-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.itemName} className="w-9 h-9 object-cover rounded-lg" />
                        ) : (
                          <div className="w-9 h-9 bg-pink-50 rounded-lg flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-pink-600" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-stone-800">{item.itemName}</p>
                          {item.description && <p className="text-xs text-stone-400">{item.description}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-stone-600">{item.category}</td>
                    <td className="px-6 py-4 text-right font-semibold text-stone-800">&euro;{Number(item.price).toFixed(2)}</td>
                    <td className="px-6 py-4 text-center text-sm text-stone-500">
                      {item.preparationTime ? (
                        <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />{item.preparationTime} min</span>
                      ) : '—'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => toggle(item.id, item.isAvailable)}
                        className={`p-2 rounded-lg transition-all ${item.isAvailable ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-red-50 text-red-400 hover:bg-red-100'}`}>
                        {item.isAvailable ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
