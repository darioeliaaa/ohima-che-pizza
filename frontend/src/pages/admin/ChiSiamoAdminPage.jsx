import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  getAboutContent, saveAboutContent,
  getAboutGallery, addAboutGalleryItem, updateAboutGalleryItem, deleteAboutGalleryItem,
  uploadImage
} from '../../services/api';
import { Info, Save, Plus, X, Pencil, Trash2, AlertCircle, ImagePlus, Camera, Check } from 'lucide-react';

const GALLERY_CATEGORIES = [
  { value: 'ambiente', label: 'L\'ambiente' },
  { value: 'centro', label: 'Il centro' },
  { value: 'trattamenti', label: 'I trattamenti' },
];

export default function ChiSiamoAdminPage() {
  const { user } = useAuth();
  const rid = user?.restaurantId || 1;

  /* ===== STATE ===== */
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tab, setTab] = useState('content'); // 'content' | 'gallery'

  // Content
  const [content, setContent] = useState({
    heroImageUrl: '', heroTitle: '', heroSubtitle: '',
    storyLabel: '', storyTitle: '', storyText: '',
    storyImageUrl: '', storyImageCaption: '', storyImageSubcaption: '',
    locationText: ''
  });
  const [heroFile, setHeroFile] = useState(null);
  const [heroPreview, setHeroPreview] = useState(null);
  const [storyFile, setStoryFile] = useState(null);
  const [storyPreview, setStoryPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  // Gallery
  const [gallery, setGallery] = useState([]);
  const [showGalleryForm, setShowGalleryForm] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState(null);
  const [photoForm, setPhotoForm] = useState({ imageUrl: '', caption: '', category: 'centro', displayOrder: '' });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  /* ===== LOAD ===== */
  const load = async () => {
    try {
      const [c, g] = await Promise.all([getAboutContent(rid), getAboutGallery(rid)]);
      if (c && c.id) {
        setContent({
          heroImageUrl: c.heroImageUrl || '',
          heroTitle: c.heroTitle || '',
          heroSubtitle: c.heroSubtitle || '',
          storyLabel: c.storyLabel || '',
          storyTitle: c.storyTitle || '',
          storyText: c.storyText || '',
          storyImageUrl: c.storyImageUrl || '',
          storyImageCaption: c.storyImageCaption || '',
          storyImageSubcaption: c.storyImageSubcaption || '',
          locationText: c.locationText || '',
        });
        setHeroPreview(c.heroImageUrl || null);
        setStoryPreview(c.storyImageUrl || null);
      }
      setGallery(g || []);
    } catch {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [rid]);

  /* ===== CONTENT HANDLERS ===== */
  const handleFileChange = (setter, previewSetter, field) => (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      setError('L\'immagine supera 1 MB.');
      e.target.value = '';
      return;
    }
    setter(file);
    previewSetter(URL.createObjectURL(file));
  };

  const handleSaveContent = async () => {
    setError(''); setSuccess(''); setSaving(true);
    try {
      let data = { ...content };
      if (heroFile) {
        const res = await uploadImage(heroFile);
        data.heroImageUrl = res.url;
      }
      if (storyFile) {
        const res = await uploadImage(storyFile);
        data.storyImageUrl = res.url;
      }
      await saveAboutContent(rid, data);
      setHeroFile(null); setStoryFile(null);
      setSuccess('Contenuto salvato con successo!');
      load();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  /* ===== GALLERY HANDLERS ===== */
  const handlePhotoFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) { setError('L\'immagine supera 1 MB.'); e.target.value = ''; return; }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const resetGalleryForm = () => {
    setShowGalleryForm(false);
    setEditingPhoto(null);
    setPhotoForm({ imageUrl: '', caption: '', category: 'centro', displayOrder: '' });
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const startEditPhoto = (p) => {
    setEditingPhoto(p.id);
    setPhotoForm({ imageUrl: p.imageUrl, caption: p.caption || '', category: p.category || 'centro', displayOrder: p.displayOrder || 0 });
    setPhotoPreview(p.imageUrl);
    setPhotoFile(null);
    setShowGalleryForm(true);
  };

  const handleGallerySubmit = async (e) => {
    e.preventDefault();
    setError(''); setUploading(true);
    try {
      let finalUrl = photoForm.imageUrl;
      if (photoFile) {
        const res = await uploadImage(photoFile);
        finalUrl = res.url;
      }
      if (!finalUrl) { setError('Carica un\'immagine.'); setUploading(false); return; }
      const data = { imageUrl: finalUrl, caption: photoForm.caption || null, category: photoForm.category, displayOrder: photoForm.displayOrder ? parseInt(photoForm.displayOrder) : 0 };
      if (editingPhoto) {
        await updateAboutGalleryItem(editingPhoto, data);
      } else {
        await addAboutGalleryItem(rid, data);
      }
      resetGalleryForm();
      load();
    } catch (err) { setError(err.message); }
    finally { setUploading(false); }
  };

  const handleDeletePhoto = async (id) => {
    if (!confirm('Eliminare questa foto?')) return;
    try { await deleteAboutGalleryItem(id); load(); } catch (err) { setError(err.message); }
  };

  /* ===== RENDER ===== */
  if (loading) return (
    <div className="flex items-center justify-center py-20 animate-fade-in">
      <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Chi Siamo</h1>
          <p className="text-stone-500 mt-1">Gestisci contenuti e galleria della pagina pubblica</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab('content')}
          className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${tab === 'content' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>
          <Info className="w-4 h-4 inline mr-2" />Contenuti
        </button>
        <button onClick={() => setTab('gallery')}
          className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${tab === 'gallery' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>
          <Camera className="w-4 h-4 inline mr-2" />Galleria ({gallery.length})
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 animate-slide-down">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700 text-sm">{error}</p>
          <button onClick={() => setError('')} className="ml-auto"><X className="w-4 h-4 text-red-400" /></button>
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 animate-slide-down">
          <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
          <p className="text-green-700 text-sm">{success}</p>
          <button onClick={() => setSuccess('')} className="ml-auto"><X className="w-4 h-4 text-green-400" /></button>
        </div>
      )}

      {/* ==================== CONTENT TAB ==================== */}
      {tab === 'content' && (
        <div className="space-y-6">
          {/* Hero section */}
          <div className="bg-white rounded-2xl border border-stone-200/60 p-6">
            <h2 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full" /> Sezione Hero (intestazione pagina)
            </h2>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <input value={content.heroTitle} onChange={e => setContent(c => ({ ...c, heroTitle: e.target.value }))} placeholder="Titolo (es. Chi siamo)"
                className="px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-sm" />
              <input value={content.heroSubtitle} onChange={e => setContent(c => ({ ...c, heroSubtitle: e.target.value }))} placeholder="Sottotitolo"
                className="px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-sm" />
            </div>
            <div className="mb-2">
              <p className="text-sm text-stone-600 mb-2 font-medium">Immagine sfondo hero</p>
              {heroPreview ? (
                <div className="flex items-center gap-4">
                  <img src={heroPreview} alt="Hero" className="w-48 h-24 object-cover rounded-xl border border-stone-200" />
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-dashed border-stone-300 hover:border-amber-500 cursor-pointer text-xs text-stone-500 hover:text-amber-600 transition-colors">
                      <ImagePlus className="w-3.5 h-3.5" /> Cambia
                      <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileChange(setHeroFile, setHeroPreview, 'heroImageUrl')} />
                    </label>
                    <button type="button" onClick={() => { setHeroFile(null); setHeroPreview(null); setContent(c => ({ ...c, heroImageUrl: '' })); }}
                      className="text-red-500 hover:text-red-600 text-xs flex items-center gap-1"><X className="w-3 h-3" /> Rimuovi</button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-24 rounded-xl border-2 border-dashed border-stone-300 hover:border-amber-400 cursor-pointer transition-colors bg-stone-50 hover:bg-amber-50/30">
                  <ImagePlus className="w-6 h-6 text-stone-400 mb-1" />
                  <span className="text-xs text-stone-500">Carica immagine hero (max 1 MB)</span>
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileChange(setHeroFile, setHeroPreview, 'heroImageUrl')} />
                </label>
              )}
            </div>
          </div>

          {/* Story section */}
          <div className="bg-white rounded-2xl border border-stone-200/60 p-6">
            <h2 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full" /> Sezione Storia
            </h2>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <input value={content.storyLabel} onChange={e => setContent(c => ({ ...c, storyLabel: e.target.value }))} placeholder="Etichetta (es. Dal 1987)"
                className="px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-sm" />
              <input value={content.storyTitle} onChange={e => setContent(c => ({ ...c, storyTitle: e.target.value }))} placeholder="Titolo (es. La nostra storia)"
                className="px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-sm" />
            </div>
            <textarea value={content.storyText} onChange={e => setContent(c => ({ ...c, storyText: e.target.value }))} placeholder="Racconta la vostra storia..." rows={8}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-sm mb-4 resize-none" />
            <p className="text-xs text-stone-400 mb-4">Puoi separare i paragrafi con una riga vuota</p>

            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <input value={content.storyImageCaption} onChange={e => setContent(c => ({ ...c, storyImageCaption: e.target.value }))} placeholder="Didascalia immagine (es. Tre generazioni di passione)"
                className="px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-sm" />
              <input value={content.storyImageSubcaption} onChange={e => setContent(c => ({ ...c, storyImageSubcaption: e.target.value }))} placeholder="Sotto-didascalia (es. Dal 1987 — Marina di Strongoli)"
                className="px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-sm" />
            </div>

            <div className="mb-4">
              <p className="text-sm text-stone-600 mb-2 font-medium">Immagine laterale storia</p>
              {storyPreview ? (
                <div className="flex items-center gap-4">
                  <img src={storyPreview} alt="Story" className="w-48 h-24 object-cover rounded-xl border border-stone-200" />
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-dashed border-stone-300 hover:border-amber-500 cursor-pointer text-xs text-stone-500 hover:text-amber-600 transition-colors">
                      <ImagePlus className="w-3.5 h-3.5" /> Cambia
                      <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileChange(setStoryFile, setStoryPreview, 'storyImageUrl')} />
                    </label>
                    <button type="button" onClick={() => { setStoryFile(null); setStoryPreview(null); setContent(c => ({ ...c, storyImageUrl: '' })); }}
                      className="text-red-500 hover:text-red-600 text-xs flex items-center gap-1"><X className="w-3 h-3" /> Rimuovi</button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-24 rounded-xl border-2 border-dashed border-stone-300 hover:border-amber-400 cursor-pointer transition-colors bg-stone-50 hover:bg-amber-50/30">
                  <ImagePlus className="w-6 h-6 text-stone-400 mb-1" />
                  <span className="text-xs text-stone-500">Carica immagine storia (max 1 MB)</span>
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileChange(setStoryFile, setStoryPreview, 'storyImageUrl')} />
                </label>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-2xl border border-stone-200/60 p-6">
            <h2 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full" /> Posizione
            </h2>
            <input value={content.locationText} onChange={e => setContent(c => ({ ...c, locationText: e.target.value }))} placeholder="Indirizzo completo"
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-sm" />
          </div>

          {/* Save button */}
          <button onClick={handleSaveContent} disabled={saving}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-xl font-medium text-sm transition-all hover:shadow-lg hover:shadow-amber-500/25 disabled:opacity-50">
            <Save className="w-4 h-4" />
            {saving ? 'Salvataggio...' : 'Salva contenuti'}
          </button>
        </div>
      )}

      {/* ==================== GALLERY TAB ==================== */}
      {tab === 'gallery' && (
        <div>
          <div className="flex justify-end mb-6">
            <button onClick={() => { showGalleryForm ? resetGalleryForm() : setShowGalleryForm(true); }}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all hover:shadow-lg hover:shadow-amber-500/25">
              {showGalleryForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showGalleryForm ? 'Annulla' : 'Nuova foto'}
            </button>
          </div>

          {showGalleryForm && (
            <form onSubmit={handleGallerySubmit} className="bg-white rounded-2xl border border-stone-200/60 p-6 mb-6 animate-slide-down">
              <h2 className="font-semibold text-stone-800 mb-4">{editingPhoto ? 'Modifica foto' : 'Nuova foto galleria'}</h2>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <input value={photoForm.caption} onChange={e => setPhotoForm(f => ({ ...f, caption: e.target.value }))} placeholder="Didascalia foto"
                  className="px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-sm" />
                <select value={photoForm.category} onChange={e => setPhotoForm(f => ({ ...f, category: e.target.value }))}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-sm">
                  {GALLERY_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <input type="number" min="0" value={photoForm.displayOrder} onChange={e => setPhotoForm(f => ({ ...f, displayOrder: e.target.value }))} placeholder="Ordine (0, 1, 2...)"
                className="w-full sm:w-40 px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-sm mb-4" />

              <div className="mb-4">
                <p className="text-sm text-stone-600 mb-2 font-medium">Immagine</p>
                {photoPreview ? (
                  <div className="flex items-center gap-4">
                    <img src={photoPreview} alt="Preview" className="w-32 h-24 object-cover rounded-xl border border-stone-200" />
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-dashed border-stone-300 hover:border-amber-500 cursor-pointer text-xs text-stone-500 hover:text-amber-600 transition-colors">
                        <ImagePlus className="w-3.5 h-3.5" /> Cambia
                        <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePhotoFileChange} />
                      </label>
                      <button type="button" onClick={() => { setPhotoFile(null); setPhotoPreview(null); setPhotoForm(f => ({ ...f, imageUrl: '' })); }}
                        className="text-red-500 hover:text-red-600 text-xs flex items-center gap-1"><X className="w-3 h-3" /> Rimuovi</button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-24 rounded-xl border-2 border-dashed border-stone-300 hover:border-amber-400 cursor-pointer transition-colors bg-stone-50 hover:bg-amber-50/30">
                    <ImagePlus className="w-6 h-6 text-stone-400 mb-1" />
                    <span className="text-xs text-stone-500">JPG, PNG, WebP — max 1 MB</span>
                    <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePhotoFileChange} />
                  </label>
                )}
              </div>

              <button type="submit" disabled={uploading}
                className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2.5 rounded-xl font-medium text-sm transition-all disabled:opacity-50">
                {uploading ? 'Caricamento...' : editingPhoto ? 'Salva modifiche' : 'Aggiungi foto'}
              </button>
            </form>
          )}

          {gallery.length === 0 ? (
            <div className="text-center py-20 text-stone-400">
              <Camera className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nessuna foto nella galleria</p>
              <p className="text-xs mt-1">Aggiungi foto per popolare la sezione "Chi siamo"</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 stagger-children">
              {gallery.map(p => (
                <div key={p.id} className="bg-white rounded-2xl border border-stone-200/60 overflow-hidden hover:shadow-sm transition-all group">
                  <div className="aspect-square overflow-hidden">
                    <img src={p.imageUrl} alt={p.caption || ''} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-3">
                    {p.caption && <p className="text-sm font-medium text-stone-800 truncate">{p.caption}</p>}
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-xs px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full capitalize">{p.category}</span>
                      <div className="flex gap-1">
                        <button onClick={() => startEditPhoto(p)}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-stone-400 hover:text-blue-600 transition-all">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDeletePhoto(p.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-600 transition-all">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
