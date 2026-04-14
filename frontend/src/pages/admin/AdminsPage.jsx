import { useEffect, useState } from 'react';
import { getAdmins, createAdmin, deleteAdmin } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Users, Plus, X, Trash2, AlertCircle, Shield, Mail, Phone } from 'lucide-react';

export default function AdminsPage() {
  const { user } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ email: '', password: '', phoneNumber: '' });

  const load = () => getAdmins().then(setAdmins).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const resetForm = () => { setShowForm(false); setForm({ email: '', password: '', phoneNumber: '' }); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      await createAdmin({ email: form.email, password: form.password, phoneNumber: form.phoneNumber || null });
      setSuccess('Amministratore creato con successo');
      resetForm();
      load();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (id === user?.id) { setError('Non puoi eliminare il tuo account'); return; }
    if (!confirm('Eliminare questo amministratore?')) return;
    try { await deleteAdmin(id); load(); } catch (err) { setError(err.message); }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Amministratori</h1>
          <p className="text-stone-500 mt-1">{admins.length} account admin</p>
        </div>
        <button onClick={() => { showForm ? resetForm() : setShowForm(true); }}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all hover:shadow-lg hover:shadow-amber-500/25">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Annulla' : 'Nuovo admin'}
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
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 animate-slide-down">
          <Shield className="w-5 h-5 text-green-500" />
          <p className="text-green-700 text-sm">{success}</p>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-stone-200/60 p-6 mb-6 animate-slide-down">
          <h2 className="font-semibold text-stone-800 mb-4">Nuovo amministratore</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="Email"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-sm" />
            </div>
            <div>
              <input required type="password" minLength={10} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Password (min. 10 caratteri)"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-sm" />
            </div>
          </div>
          <div className="relative mb-4">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input type="tel" value={form.phoneNumber} onChange={e => setForm(f => ({ ...f, phoneNumber: e.target.value }))} placeholder="Telefono (opzionale)"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-sm" />
          </div>
          <button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2.5 rounded-xl font-medium text-sm transition-all">
            Crea amministratore
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : admins.length === 0 ? (
        <div className="text-center py-20 text-stone-400">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Nessun amministratore trovato</p>
        </div>
      ) : (
        <div className="space-y-3 stagger-children">
          {admins.map(a => (
            <div key={a.id} className="bg-white rounded-2xl border border-stone-200/60 p-4 flex items-center justify-between hover:shadow-sm transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium text-stone-800">{a.email}</p>
                  <div className="flex items-center gap-3 text-xs text-stone-400 mt-0.5">
                    {a.phoneNumber && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{a.phoneNumber}</span>}
                    <span>{a.status}</span>
                    <span>{new Date(a.createdAt).toLocaleDateString('it-IT')}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => handleDelete(a.id)} disabled={a.id === user?.id}
                className="p-2 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
