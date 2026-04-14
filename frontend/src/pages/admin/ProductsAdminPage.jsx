import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getProducts, createProduct, toggleProductAvailability, deleteProduct, uploadImage, getProductCategories } from '../../services/api';
import { Plus, ShoppingBag, Eye, EyeOff, X, AlertCircle, ImagePlus, Trash2 } from 'lucide-react';

export default function ProductsAdminPage() {
  const { user } = useAuth();
  const rid = user?.restaurantId || 1;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    productName: '', description: '', price: '', category: '', brand: '', imageUrl: ''
  });

  const load = () => {
    Promise.all([getProducts(rid), getProductCategories(rid)]).then(([data, cats]) => {
      setProducts(data); setCategories(cats);
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
      await createProduct({
        ...form,
        imageUrl,
        restaurantId: rid,
        price: parseFloat(form.price),
        isAvailable: true
      });
      setForm({ productName: '', description: '', price: '', category: '', brand: '', imageUrl: '' });
      setImageFile(null); setImagePreview('');
      setShowForm(false); load();
    } catch (err) { setUploading(false); setError(err.message); }
  };

  const toggle = async (id, current) => {
    try { await toggleProductAvailability(id, !current); load(); } catch (err) { setError(err.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Eliminare questo prodotto?')) return;
    try { await deleteProduct(id); load(); } catch (err) { setError(err.message); }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Prodotti</h1>
          <p className="text-stone-500 mt-1">{products.length} prodotti in catalogo</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all hover:shadow-lg hover:shadow-amber-500/25">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Annulla' : 'Nuovo prodotto'}
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
          <h2 className="font-semibold text-stone-800 mb-4">Nuovo prodotto</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <input required value={form.productName} onChange={e => setForm(f => ({ ...f, productName: e.target.value }))} placeholder="Nome prodotto"
              className="px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-sm" />
            <input value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} placeholder="Brand (opzionale)"
              className="px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-sm" />
            <input required type="number" step="0.01" min="0" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="Prezzo (€)"
              className="px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-sm" />
            <select required value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-sm">
              <option value="">Seleziona categoria</option>
              {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Descrizione prodotto" rows={2}
            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-sm mb-4 resize-none" />
          {/* Image upload */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-stone-600 mb-2">Immagine prodotto</label>
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
            {uploading ? 'Caricamento...' : 'Aggiungi prodotto'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-stone-400">
          <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Nessun prodotto in catalogo</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-100">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Prodotto</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Categoria</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Brand</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Prezzo</th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Stato</th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} className="border-b border-stone-50 hover:bg-stone-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.productName} className="w-9 h-9 object-cover rounded-lg" />
                        ) : (
                          <div className="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center">
                            <ShoppingBag className="w-4 h-4 text-purple-600" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-stone-800">{p.productName}</p>
                          {p.description && <p className="text-xs text-stone-400 max-w-xs truncate">{p.description}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-stone-600">{p.category}</td>
                    <td className="px-6 py-4 text-sm text-stone-500">{p.brand || '—'}</td>
                    <td className="px-6 py-4 text-right font-semibold text-stone-800">&euro;{Number(p.price).toFixed(2)}</td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => toggle(p.id, p.isAvailable)}
                        className={`p-2 rounded-lg transition-all ${p.isAvailable ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-red-50 text-red-400 hover:bg-red-100'}`}>
                        {p.isAvailable ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => handleDelete(p.id)}
                        className="p-2 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-all">
                        <Trash2 className="w-4 h-4" />
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
