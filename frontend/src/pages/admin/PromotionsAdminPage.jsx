import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getPromotions, createPromotion, updatePromotion, deletePromotion, uploadImage } from '../../services/api';
import { Plus, Tag, X, AlertCircle, ImagePlus, Trash2, Edit3, CheckCircle } from 'lucide-react';

export default function PromotionsAdminPage() {
  const { user } = useAuth();
  const rid = user?.restaurantId || 1;
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', discountPercentage: '', startDate: '', endDate: '', imageUrl: '', isActive: true
  });

  const resetForm = () => {
    setForm({ title: '', description: '', discountPercentage: '', startDate: '', endDate: '', imageUrl: '', isActive: true });
    setImageFile(null); setImagePreview(''); setEditingId(null);
  };

  const load = () => {
    getPromotions(rid).then(setPromotions).catch(() => {}).finally(() => setLoading(false));
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

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    try {
      let imageUrl = form.imageUrl;
      if (imageFile) {
        setUploading(true);
        const res = await uploadImage(imageFile);
        imageUrl = res.url;
        setUploading(false);
      }
      const data = {
        ...form,
        imageUrl,
        restaurantId: rid,
        discountPercentage: form.discountPercentage ? parseFloat(form.discountPercentage) : null,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
      };
      if (editingId) {
        await updatePromotion(editingId, data);
        setSuccess('Promozione aggiornata');
      } else {
        await createPromotion(data);
        setSuccess('Promozione creata');
      }
      resetForm(); setShowForm(false); load();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) { setUploading(false); setError(err.message); }
  };

  const handleEdit = (p) => {
    setForm({
      title: p.title || '',
      description: p.description || '',
      discountPercentage: p.discountPercentage || '',
      startDate: p.startDate || '',
      endDate: p.endDate || '',
      imageUrl: p.imageUrl || '',
      isActive: p.isActive,
    });
    setImagePreview(p.imageUrl || '');
    setEditingId(p.id);
    setShowForm(true);
  };

  const toggleActive = async (p) => {
    try {
      await updatePromotion(p.id, { isActive: !p.isActive });
      load();
    } catch (err) { setError(err.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Eliminare questa promozione?')) return;
    try { await deletePromotion(id); load(); } catch (err) { setError(err.message); }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Promozioni</h1>
          <p className="text-stone-500 mt-1">{promotions.length} promozioni totali</p>
        </div>
        <button onClick={() => { if (showForm && editingId) resetForm(); setShowForm(!showForm); }}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all hover:shadow-lg hover:shadow-amber-500/25">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Annulla' : 'Nuova promozione'}
        </button>
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
          <CheckCircle className="w-5 h-5 text-emerald-500" />
          <p className="text-emerald-700 text-sm">{success}</p>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-stone-200/60 p-6 mb-6 animate-slide-down">
          <h2 className="font-semibold text-stone-800 mb-4">{editingId ? 'Modifica promozione' : 'Nuova promozione'}</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Titolo promozione"
              className="px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-sm" />
            <input type="number" step="0.01" min="0" max="100" value={form.discountPercentage} onChange={e => setForm(f => ({ ...f, discountPercentage: e.target.value }))} placeholder="Sconto % (opzionale)"
              className="px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-sm" />
            <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
              className="px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-sm" />
            <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
              className="px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-sm" />
          </div>
          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Descrizione promozione" rows={3}
            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-sm mb-4 resize-none" />
          {/* Image upload */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-stone-600 mb-2">Immagine (opzionale)</label>
            <div className="flex items-start gap-4">
              <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-stone-300 hover:border-amber-500 cursor-pointer transition-colors text-sm text-stone-500 hover:text-amber-600">
                <ImagePlus className="w-4 h-4" />
                {imageFile ? imageFile.name : 'Scegli immagine'}
                <input type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={handleImageChange} className="hidden" />
              </label>
              {imagePreview && (
                <div className="relative">
                  <img src={imagePreview} alt="Anteprima" className="w-20 h-20 object-cover rounded-xl border border-stone-200" />
                  <button type="button" onClick={() => { setImageFile(null); setImagePreview(''); setForm(f => ({ ...f, imageUrl: '' })); }}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"><X className="w-3 h-3" /></button>
                </div>
              )}
            </div>
            <p className="text-xs text-stone-400 mt-1">JPG, PNG, GIF o WebP — max 1MB</p>
          </div>
          {/* Active toggle */}
          <label className="flex items-center gap-3 mb-4 cursor-pointer">
            <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
              className="w-4 h-4 rounded border-stone-300 text-amber-500 focus:ring-amber-500/30" />
            <span className="text-sm text-stone-600">Promozione attiva</span>
          </label>
          <button type="submit" disabled={uploading}
            className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2.5 rounded-xl font-medium text-sm transition-all disabled:opacity-50">
            {uploading ? 'Caricamento...' : editingId ? 'Salva modifiche' : 'Crea promozione'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : promotions.length === 0 ? (
        <div className="text-center py-20 text-stone-400">
          <Tag className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Nessuna promozione creata</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {promotions.map(p => (
            <div key={p.id} className="bg-white rounded-2xl border border-stone-200/60 p-5 flex items-start gap-4">
              {p.imageUrl ? (
                <img src={p.imageUrl} alt={p.title} className="w-20 h-20 object-cover rounded-xl flex-shrink-0" />
              ) : (
                <div className="w-20 h-20 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Tag className="w-8 h-8 text-amber-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-stone-800 truncate">{p.title}</h3>
                  {p.discountPercentage && (
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">-{p.discountPercentage}%</span>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded-full ${p.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-stone-100 text-stone-400'}`}>
                    {p.isActive ? 'Attiva' : 'Disattiva'}
                  </span>
                </div>
                {p.description && <p className="text-sm text-stone-500 line-clamp-2 mb-1">{p.description}</p>}
                <div className="flex items-center gap-3 text-xs text-stone-400">
                  {p.startDate && <span>Dal {new Date(p.startDate).toLocaleDateString('it-IT')}</span>}
                  {p.endDate && <span>al {new Date(p.endDate).toLocaleDateString('it-IT')}</span>}
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => toggleActive(p)} title={p.isActive ? 'Disattiva' : 'Attiva'}
                  className={`p-2 rounded-lg transition-all ${p.isActive ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-stone-100 text-stone-400 hover:bg-stone-200'}`}>
                  <Tag className="w-4 h-4" />
                </button>
                <button onClick={() => handleEdit(p)} className="p-2 rounded-lg text-stone-400 hover:text-amber-500 hover:bg-amber-50 transition-all">
                  <Edit3 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(p.id)} className="p-2 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
