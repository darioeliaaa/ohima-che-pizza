import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getProductCategories, createProductCategory, updateProductCategory, deleteProductCategory, uploadImage } from '../../services/api';
import { Package, Plus, X, Pencil, Trash2, AlertCircle, ImagePlus, GripVertical } from 'lucide-react';

export default function ProductCategoriesAdminPage() {
  const { user } = useAuth();
  const rid = user?.restaurantId || 1;
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const emptyForm = { name: '', description: '', imageUrl: '', displayOrder: '' };
  const [form, setForm] = useState(emptyForm);

  const load = () => getProductCategories(rid)
    .then(setCategories)
    .catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { load(); }, [rid]);

  const startEdit = (c) => {
    setEditing(c.id);
    setForm({ name: c.name, description: c.description || '', imageUrl: c.imageUrl || '', displayOrder: c.displayOrder || 0 });
    setImageFile(null);
    setImagePreview(c.imageUrl || null);
    setShowForm(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      setError('L\'immagine supera 1 MB. Riduci la dimensione del file e riprova.');
      e.target.value = '';
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setForm(f => ({ ...f, imageUrl: '' }));
  };

  const resetForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm(emptyForm);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      setUploading(true);
      let finalImageUrl = form.imageUrl;
      if (imageFile) {
        const res = await uploadImage(imageFile);
        finalImageUrl = res.url;
      }
      setUploading(false);
      const data = {
        name: form.name,
        description: form.description || null,
        imageUrl: finalImageUrl || null,
        displayOrder: form.displayOrder ? parseInt(form.displayOrder) : 0,
      };
      if (editing) {
        await updateProductCategory(editing, data);
      } else {
        await createProductCategory(rid, data);
      }
      resetForm();
      load();
    } catch (err) {
      setUploading(false);
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Eliminare questa categoria prodotti?')) return;
    try { await deleteProductCategory(id); load(); } catch (err) { setError(err.message); }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Categorie Prodotti</h1>
          <p className="text-stone-500 mt-1">{categories.length} categorie</p>
        </div>
        <button onClick={() => { showForm ? resetForm() : setShowForm(true); }}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all hover:shadow-lg hover:shadow-amber-500/25">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Annulla' : 'Nuova categoria'}
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
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-stone-200/60 p-6 mb-6 animate-slide-down">
          <h2 className="font-semibold text-stone-800 mb-4">{editing ? 'Modifica categoria' : 'Nuova categoria prodotti'}</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nome categoria (es. Creme viso, Smalti)"
              className="px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-sm" />
            <input type="number" min="0" value={form.displayOrder} onChange={e => setForm(f => ({ ...f, displayOrder: e.target.value }))} placeholder="Ordine (0, 1, 2...)"
              className="px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-sm" />
          </div>
          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Descrizione (opzionale)" rows={2}
            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-sm mb-4 resize-none" />

          {/* Image upload */}
          <div className="mb-4">
            <p className="text-sm text-stone-600 mb-2 font-medium flex items-center gap-2"><ImagePlus className="w-4 h-4" /> Immagine categoria</p>
            {imagePreview ? (
              <div className="flex items-center gap-4">
                <img src={imagePreview} alt="Anteprima" className="w-32 h-20 object-cover rounded-xl border border-stone-200" />
                <button type="button" onClick={removeImage} className="text-red-500 hover:text-red-600 text-sm flex items-center gap-1">
                  <X className="w-4 h-4" /> Rimuovi
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-24 rounded-xl border-2 border-dashed border-stone-300 hover:border-amber-400 cursor-pointer transition-colors bg-stone-50 hover:bg-amber-50/30">
                <ImagePlus className="w-6 h-6 text-stone-400 mb-1" />
                <span className="text-xs text-stone-500">Carica immagine (JPG, PNG, WebP — max 1 MB)</span>
                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImageChange} />
              </label>
            )}
          </div>

          <button type="submit" disabled={uploading} className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2.5 rounded-xl font-medium text-sm transition-all disabled:opacity-50">
            {uploading ? 'Caricamento...' : editing ? 'Salva modifiche' : 'Crea categoria'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-20 text-stone-400">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Nessuna categoria prodotti creata</p>
          <p className="text-xs mt-1">Crea le categorie per organizzare i prodotti in vendita</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          {categories.map(c => (
            <div key={c.id} className="bg-white rounded-2xl border border-stone-200/60 overflow-hidden hover:shadow-sm transition-all">
              {c.imageUrl && (
                <div className="h-32 overflow-hidden">
                  <img src={c.imageUrl} alt={c.name} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-stone-800">{c.name}</h3>
                  <span className="text-xs text-stone-400 flex items-center gap-1">
                    <GripVertical className="w-3 h-3" /> {c.displayOrder}
                  </span>
                </div>
                {c.description && <p className="text-sm text-stone-500 mb-2">{c.description}</p>}
                <div className="flex gap-2">
                  <button onClick={() => startEdit(c)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-50 hover:bg-blue-50 text-stone-600 hover:text-blue-600 text-xs font-medium transition-all">
                    <Pencil className="w-3.5 h-3.5" /> Modifica
                  </button>
                  <button onClick={() => handleDelete(c.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-50 hover:bg-red-50 text-stone-600 hover:text-red-600 text-xs font-medium transition-all">
                    <Trash2 className="w-3.5 h-3.5" /> Elimina
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
