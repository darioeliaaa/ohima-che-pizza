import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getMenuCategories, createMenuCategory, updateMenuCategory, deleteMenuCategory, uploadImage, getMenuSections } from '../../services/api';
import { FolderOpen, Plus, X, Pencil, Trash2, AlertCircle, ImagePlus, GripVertical, Image, Layers } from 'lucide-react';

export default function CategoriesAdminPage() {
  const { user } = useAuth();
  const rid = user?.restaurantId || 1;
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [bgFile, setBgFile] = useState(null);
  const [bgPreview, setBgPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [sections, setSections] = useState([]);
  const emptyForm = { name: '', description: '', imageUrl: '', videoUrl: '', displayOrder: '', sectionId: '' };
  const [form, setForm] = useState(emptyForm);

  const load = () => Promise.all([getMenuCategories(rid), getMenuSections(rid)])
    .then(([cats, secs]) => { setCategories(cats); setSections(secs); })
    .catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { load(); }, [rid]);

  const startEdit = (c) => {
    setEditing(c.id);
    setForm({ name: c.name, description: c.description || '', imageUrl: c.imageUrl || '', videoUrl: c.videoUrl || '', displayOrder: c.displayOrder || 0, sectionId: c.section?.id || '' });
    setImageFile(null);
    setImagePreview(c.imageUrl || null);
    setBgFile(null);
    setBgPreview(c.videoUrl || null);
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

  const handleBgChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      setError('L\'immagine sfondo supera 1 MB. Riduci la dimensione del file e riprova.');
      e.target.value = '';
      return;
    }
    setBgFile(file);
    setBgPreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setForm(f => ({ ...f, imageUrl: '' }));
  };

  const removeBgImage = () => {
    setBgFile(null);
    setBgPreview(null);
    setForm(f => ({ ...f, videoUrl: '' }));
  };

  const resetForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm(emptyForm);
    setImageFile(null);
    setImagePreview(null);
    setBgFile(null);
    setBgPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      setUploading(true);
      let finalImageUrl = form.imageUrl;
      let finalVideoUrl = form.videoUrl;
      if (imageFile) {
        const res = await uploadImage(imageFile);
        finalImageUrl = res.url;
      }
      if (bgFile) {
        const res = await uploadImage(bgFile);
        finalVideoUrl = res.url;
      }
      setUploading(false);
      const data = {
        name: form.name,
        description: form.description || null,
        imageUrl: finalImageUrl || null,
        videoUrl: finalVideoUrl || null,
        displayOrder: form.displayOrder ? parseInt(form.displayOrder) : 0,
        sectionId: form.sectionId ? parseInt(form.sectionId) : null,
      };
      if (editing) {
        await updateMenuCategory(editing, data);
      } else {
        await createMenuCategory(rid, data);
      }
      resetForm();
      load();
    } catch (err) {
      setUploading(false);
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Eliminare questa categoria?')) return;
    try { await deleteMenuCategory(id); load(); } catch (err) { setError(err.message); }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Categorie Servizi</h1>
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
          <h2 className="font-semibold text-stone-800 mb-4">{editing ? 'Modifica categoria' : 'Nuova categoria'}</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nome categoria (es. Viso, Corpo, Unghie)"
              className="px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-sm" />
            <input type="number" min="0" value={form.displayOrder} onChange={e => setForm(f => ({ ...f, displayOrder: e.target.value }))} placeholder="Ordine (0, 1, 2...)"
              className="px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-sm" />
          </div>
          <div className="mb-4">
            <select value={form.sectionId} onChange={e => setForm(f => ({ ...f, sectionId: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-sm">
              <option value="">Nessuna sezione (senza raggruppamento)</option>
              {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <p className="text-xs text-stone-400 mt-1">Assegna questa categoria a una sezione per raggruppare i servizi</p>
          </div>
          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Descrizione (opzionale)" rows={2}
            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-sm mb-4 resize-none" />

          {/* Cover image upload */}
          <div className="mb-4">
            <p className="text-sm text-stone-600 mb-2 font-medium flex items-center gap-2"><ImagePlus className="w-4 h-4" /> Immagine copertina (card nel menu)</p>
            {imagePreview ? (
              <div className="flex items-center gap-4">
                <img src={imagePreview} alt="Anteprima copertina" className="w-32 h-20 object-cover rounded-xl border border-stone-200" />
                <button type="button" onClick={removeImage} className="text-red-500 hover:text-red-600 text-sm flex items-center gap-1">
                  <X className="w-4 h-4" /> Rimuovi
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-24 rounded-xl border-2 border-dashed border-stone-300 hover:border-amber-400 cursor-pointer transition-colors bg-stone-50 hover:bg-amber-50/30">
                <ImagePlus className="w-6 h-6 text-stone-400 mb-1" />
                <span className="text-xs text-stone-500">Carica immagine copertina (JPG, PNG, WebP — max 1 MB)</span>
                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImageChange} />
              </label>
            )}
            <p className="text-xs text-stone-400 mt-1">Questa immagine apparirà come copertina della card nel catalogo servizi</p>
          </div>

          {/* Background/splash image upload */}
          <div className="mb-4">
            <p className="text-sm text-stone-600 mb-2 font-medium flex items-center gap-2"><Image className="w-4 h-4" /> Immagine sfondo (dietro la scritta grande)</p>
            {bgPreview ? (
              <div className="flex items-center gap-4">
                <img src={bgPreview} alt="Anteprima sfondo" className="w-32 h-20 object-cover rounded-xl border border-stone-200" />
                <button type="button" onClick={removeBgImage} className="text-red-500 hover:text-red-600 text-sm flex items-center gap-1">
                  <X className="w-4 h-4" /> Rimuovi
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-24 rounded-xl border-2 border-dashed border-stone-300 hover:border-amber-400 cursor-pointer transition-colors bg-stone-50 hover:bg-amber-50/30">
                <Image className="w-6 h-6 text-stone-400 mb-1" />
                <span className="text-xs text-stone-500">Carica immagine sfondo (JPG, PNG, WebP — max 1 MB)</span>
                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleBgChange} />
              </label>
            )}
            <p className="text-xs text-stone-400 mt-1">Questa immagine apparirà come sfondo dietro il nome della categoria quando viene aperta</p>
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
          <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Nessuna categoria creata</p>
          <p className="text-xs mt-1">Crea le categorie e poi assegna i servizi</p>
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
                <div className="flex items-center gap-2 mb-3 text-xs text-stone-400">
                  {c.section && <span className="flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full"><Layers className="w-3 h-3" /> {c.section.name}</span>}
                  {c.imageUrl && <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full"><ImagePlus className="w-3 h-3" /> Cover</span>}
                  {c.videoUrl && <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full"><Image className="w-3 h-3" /> Sfondo</span>}
                </div>
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
