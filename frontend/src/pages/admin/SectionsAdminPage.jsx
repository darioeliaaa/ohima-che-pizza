import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getMenuSections, createMenuSection, updateMenuSection, deleteMenuSection } from '../../services/api';
import { Layers, Plus, X, Pencil, Trash2, AlertCircle, GripVertical } from 'lucide-react';

const ICON_OPTIONS = [
  { value: 'face', label: '✨ Viso' },
  { value: 'body', label: '💆 Corpo' },
  { value: 'nails', label: '💅 Unghie' },
  { value: 'hair', label: '💇 Capelli' },
  { value: 'massage', label: '🧖 Massaggi' },
  { value: 'wax', label: '🌸 Depilazione' },
  { value: 'makeup', label: '💄 Make-up' },
  { value: 'eyes', label: '👁️ Ciglia e sopracciglia' },
  { value: 'feet', label: '🦶 Pedicure' },
  { value: 'hands', label: '🤲 Manicure' },
  { value: 'relax', label: '🧘 Relax' },
  { value: 'skincare', label: '🧴 Skincare' },
  { value: 'laser', label: '⚡ Laser' },
  { value: 'bride', label: '👰 Sposa' },
  { value: 'pack', label: '🎁 Pacchetti' },
  { value: 'star', label: '⭐ Premium' },
  { value: 'other', label: '📋 Altro' },
];

const getEmojiForIcon = (icon) => {
  const found = ICON_OPTIONS.find(o => o.value === icon);
  return found ? found.label.split(' ')[0] : '📋';
};

export default function SectionsAdminPage() {
  const { user } = useAuth();
  const rid = user?.restaurantId || 1;
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const emptyForm = { name: '', description: '', icon: '', displayOrder: '' };
  const [form, setForm] = useState(emptyForm);

  const load = () => getMenuSections(rid).then(setSections).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { load(); }, [rid]);

  const startEdit = (s) => {
    setEditing(s.id);
    setForm({ name: s.name, description: s.description || '', icon: s.icon || '', displayOrder: s.displayOrder || 0 });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = {
        name: form.name,
        description: form.description || null,
        icon: form.icon || null,
        displayOrder: form.displayOrder ? parseInt(form.displayOrder) : 0,
      };
      if (editing) {
        await updateMenuSection(editing, data);
      } else {
        await createMenuSection(rid, data);
      }
      resetForm();
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Eliminare questa sezione? Le categorie associate perderanno il collegamento.')) return;
    try { await deleteMenuSection(id); load(); } catch (err) { setError(err.message); }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Sezioni Servizi</h1>
          <p className="text-stone-500 mt-1">{sections.length} sezioni — raggruppano le categorie nel catalogo servizi</p>
        </div>
        <button onClick={() => { showForm ? resetForm() : setShowForm(true); }}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all hover:shadow-lg hover:shadow-amber-500/25">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Annulla' : 'Nuova sezione'}
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
          <h2 className="font-semibold text-stone-800 mb-4">{editing ? 'Modifica sezione' : 'Nuova sezione'}</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nome sezione (es. Viso, Corpo, Unghie)"
              className="px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-sm" />
            <input type="number" min="0" value={form.displayOrder} onChange={e => setForm(f => ({ ...f, displayOrder: e.target.value }))} placeholder="Ordine (0, 1, 2...)"
              className="px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-sm" />
          </div>
          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Descrizione (opzionale)" rows={2}
            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-sm mb-4 resize-none" />
          
          <div className="mb-4">
            <p className="text-sm text-stone-600 mb-2 font-medium">Icona sezione</p>
            <div className="flex flex-wrap gap-2">
              {ICON_OPTIONS.map(opt => (
                <button key={opt.value} type="button" onClick={() => setForm(f => ({ ...f, icon: opt.value }))}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${form.icon === opt.value 
                    ? 'border-amber-500 bg-amber-50 text-amber-700 ring-2 ring-amber-500/20' 
                    : 'border-stone-200 bg-white text-stone-600 hover:border-amber-300 hover:bg-amber-50/30'}`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2.5 rounded-xl font-medium text-sm transition-all">
            {editing ? 'Salva modifiche' : 'Crea sezione'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : sections.length === 0 ? (
        <div className="text-center py-20 text-stone-400">
          <Layers className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Nessuna sezione creata</p>
          <p className="text-xs mt-1">Crea sezioni come "Viso", "Corpo", "Unghie" per organizzare le categorie</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          {sections.map(s => (
            <div key={s.id} className="bg-white rounded-2xl border border-stone-200/60 overflow-hidden hover:shadow-sm transition-all">
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getEmojiForIcon(s.icon)}</span>
                    <div>
                      <h3 className="font-semibold text-stone-800">{s.name}</h3>
                      <span className="text-xs text-stone-400 flex items-center gap-1">
                        <GripVertical className="w-3 h-3" /> Ordine: {s.displayOrder}
                      </span>
                    </div>
                  </div>
                </div>
                {s.description && <p className="text-sm text-stone-500 mb-3">{s.description}</p>}
                <div className="flex gap-2">
                  <button onClick={() => startEdit(s)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-50 hover:bg-blue-50 text-stone-600 hover:text-blue-600 text-xs font-medium transition-all">
                    <Pencil className="w-3.5 h-3.5" /> Modifica
                  </button>
                  <button onClick={() => handleDelete(s.id)}
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
