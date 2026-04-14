import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getRestaurantContacts, updateRestaurantContacts, getFeatureFlags, updateFeatureFlags, isWebAuthnSupported, getWebAuthnCredentials, registerPasskey, deleteWebAuthnCredential } from '../../services/api';
import { Settings, Phone, Mail, MapPin, Save, AlertCircle, CheckCircle, X, Fingerprint, Plus, Trash2, ShieldCheck, KeyRound, MessageCircle, Tag } from 'lucide-react';

export default function SettingsPage() {
  const { user, isOwner } = useAuth();
  const rid = user?.restaurantId || 1;
  const [form, setForm] = useState({ ownerPhone: '', contactEmail: '', address: '', whatsappNumber: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Passkey state
  const [passkeys, setPasskeys] = useState([]);
  const [passkeysLoading, setPasskeysLoading] = useState(false);
  const [passkeyName, setPasskeyName] = useState('');
  const [passkeyRegistering, setPasskeyRegistering] = useState(false);
  const [passkeyError, setPasskeyError] = useState('');
  const [passkeySuccess, setPasskeySuccess] = useState('');
  const [showPasskeyForm, setShowPasskeyForm] = useState(false);
  const webauthnSupported = isWebAuthnSupported();

  // Feature flags state
  const [promotionsEnabled, setPromotionsEnabled] = useState(false);
  const [featureSaving, setFeatureSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      getRestaurantContacts(rid),
      getFeatureFlags(rid)
    ]).then(([contacts, features]) => {
      setForm({ ownerPhone: contacts.ownerPhone || '', contactEmail: contacts.contactEmail || '', address: contacts.address || '', whatsappNumber: contacts.whatsappNumber || '' });
      setPromotionsEnabled(features.promotionsEnabled || false);
    }).catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [rid]);

  // Carica passkey registrate (solo per owner)
  useEffect(() => {
    if (!isOwner || !webauthnSupported) return;
    loadPasskeys();
  }, [isOwner]);

  const loadPasskeys = () => {
    setPasskeysLoading(true);
    getWebAuthnCredentials()
      .then(setPasskeys)
      .catch(() => setPasskeys([]))
      .finally(() => setPasskeysLoading(false));
  };

  const handleRegisterPasskey = async () => {
    setPasskeyError(''); setPasskeySuccess(''); setPasskeyRegistering(true);
    try {
      await registerPasskey(passkeyName || 'Passkey');
      setPasskeySuccess('Passkey registrata con successo!');
      setPasskeyName('');
      setShowPasskeyForm(false);
      loadPasskeys();
      setTimeout(() => setPasskeySuccess(''), 3000);
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        setPasskeyError('Registrazione annullata dall\'utente');
      } else {
        setPasskeyError(err.message || 'Errore durante la registrazione');
      }
    } finally { setPasskeyRegistering(false); }
  };

  const handleDeletePasskey = async (id, name) => {
    if (!confirm(`Eliminare la passkey "${name}"?`)) return;
    try {
      await deleteWebAuthnCredential(id);
      loadPasskeys();
    } catch (err) {
      setPasskeyError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setSaving(true);
    try {
      await updateRestaurantContacts(rid, form);
      setSuccess('Contatti aggiornati con successo');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-800">Impostazioni</h1>
        <p className="text-stone-500 mt-1">Gestisci i contatti visibili sul sito pubblico</p>
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

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-stone-200/60 p-6 max-w-xl">
        <h2 className="font-semibold text-stone-800 mb-6 flex items-center gap-2">
          <Settings className="w-5 h-5 text-amber-500" />
          Contatti del centro estetico
        </h2>

        <div className="space-y-4 mb-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-stone-600 mb-1.5">
              <Phone className="w-4 h-4 text-stone-400" /> Telefono
            </label>
            <input value={form.ownerPhone} onChange={e => setForm(f => ({ ...f, ownerPhone: e.target.value }))}
              placeholder="es. 333 987 6543"
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-sm" />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-stone-600 mb-1.5">
              <MessageCircle className="w-4 h-4 text-stone-400" /> Numero WhatsApp
            </label>
            <input value={form.whatsappNumber} onChange={e => setForm(f => ({ ...f, whatsappNumber: e.target.value }))}
              placeholder="es. +39 333 987 6543"
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-sm" />
            <p className="text-xs text-stone-400 mt-1">Usato per il pulsante "Prenota su WhatsApp" nella pagina prenotazioni</p>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-stone-600 mb-1.5">
              <Mail className="w-4 h-4 text-stone-400" /> Email
            </label>
            <input type="email" value={form.contactEmail} onChange={e => setForm(f => ({ ...f, contactEmail: e.target.value }))}
              placeholder="es. info@centroestetico.it"
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-sm" />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-stone-600 mb-1.5">
              <MapPin className="w-4 h-4 text-stone-400" /> Indirizzo
            </label>
            <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
              placeholder="es. Via Roma 1, 20121 Milano"
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-sm" />
          </div>
        </div>

        <button type="submit" disabled={saving}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-2.5 rounded-xl font-medium text-sm transition-all hover:shadow-lg hover:shadow-amber-500/25 disabled:opacity-50">
          <Save className="w-4 h-4" />
          {saving ? 'Salvataggio...' : 'Salva contatti'}
        </button>
      </form>

      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl max-w-xl">
        <p className="text-amber-800 text-sm">
          Questi contatti vengono mostrati nella homepage e nel footer del sito pubblico.
        </p>
      </div>

      {/* ── Sezione Funzionalità ── */}
      <div className="mt-10">
        <h2 className="text-xl font-bold text-stone-800 mb-1 flex items-center gap-2">
          <Tag className="w-5 h-5 text-amber-500" />
          Funzionalità
        </h2>
        <p className="text-stone-500 text-sm mb-6">Attiva o disattiva le sezioni del sito</p>

        <div className="bg-white rounded-2xl border border-stone-200/60 p-6 max-w-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-stone-800">Promozioni</p>
              <p className="text-xs text-stone-400 mt-0.5">Mostra la sezione promozioni nel sito pubblico e nel pannello admin</p>
            </div>
            <button
              disabled={featureSaving}
              onClick={async () => {
                setFeatureSaving(true);
                try {
                  const res = await updateFeatureFlags(rid, { promotionsEnabled: !promotionsEnabled });
                  setPromotionsEnabled(res.promotionsEnabled);
                  setSuccess(res.promotionsEnabled ? 'Promozioni attivate' : 'Promozioni disattivate');
                  setTimeout(() => setSuccess(''), 3000);
                } catch (err) { setError(err.message); }
                finally { setFeatureSaving(false); }
              }}
              className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${promotionsEnabled ? 'bg-emerald-500' : 'bg-stone-300'} disabled:opacity-50`}
            >
              <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-200 ${promotionsEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Sezione Passkey (solo Owner) ── */}
      {isOwner && (
        <div className="mt-10">
          <h2 className="text-xl font-bold text-stone-800 mb-1 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-500" />
            Passkey di sicurezza
          </h2>
          <p className="text-stone-500 text-sm mb-6">
            Le passkey biometriche (WebAuthn/FIDO2) proteggono l'accesso all'area proprietario con Touch ID, Face ID o chiave di sicurezza hardware.
          </p>

          {!webauthnSupported && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl max-w-xl mb-4">
              <p className="text-red-700 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Il tuo browser non supporta WebAuthn. Usa un browser moderno (Chrome, Safari, Edge, Firefox).
              </p>
            </div>
          )}

          {passkeyError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 animate-slide-down max-w-xl">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-700 text-sm">{passkeyError}</p>
              <button onClick={() => setPasskeyError('')} className="ml-auto"><X className="w-4 h-4 text-red-400" /></button>
            </div>
          )}

          {passkeySuccess && (
            <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 animate-slide-down max-w-xl">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              <p className="text-emerald-700 text-sm">{passkeySuccess}</p>
            </div>
          )}

          {webauthnSupported && (
            <div className="bg-white rounded-2xl border border-stone-200/60 p-6 max-w-xl">
              {/* Lista passkey registrate */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-stone-800 flex items-center gap-2">
                  <Fingerprint className="w-5 h-5 text-emerald-500" />
                  Passkey registrate
                </h3>
                <button
                  onClick={() => setShowPasskeyForm(!showPasskeyForm)}
                  className="flex items-center gap-1.5 text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors"
                >
                  {showPasskeyForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {showPasskeyForm ? 'Annulla' : 'Nuova passkey'}
                </button>
              </div>

              {/* Form registrazione nuova passkey */}
              {showPasskeyForm && (
                <div className="mb-4 p-4 bg-stone-50 rounded-xl border border-stone-100 space-y-3">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-stone-600 mb-1.5">
                      <KeyRound className="w-4 h-4 text-stone-400" /> Nome passkey
                    </label>
                    <input
                      type="text"
                      value={passkeyName}
                      onChange={e => setPasskeyName(e.target.value)}
                      placeholder='es. "MacBook Pro", "iPhone", "YubiKey"'
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-sm"
                    />
                  </div>
                  <button
                    onClick={handleRegisterPasskey}
                    disabled={passkeyRegistering}
                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-stone-300 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-all hover:shadow-lg hover:shadow-emerald-500/25"
                  >
                    {passkeyRegistering ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Fingerprint className="w-4 h-4" />
                    )}
                    {passkeyRegistering ? 'Registrazione in corso...' : 'Registra passkey'}
                  </button>
                  <p className="text-xs text-stone-400">
                    Il browser ti chiederà di confermare con impronta digitale, Face ID o chiave di sicurezza.
                  </p>
                </div>
              )}

              {/* Lista */}
              {passkeysLoading ? (
                <div className="flex justify-center py-6">
                  <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : passkeys.length === 0 ? (
                <div className="text-center py-8 text-stone-400">
                  <Fingerprint className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Nessuna passkey registrata</p>
                  <p className="text-xs mt-1">Registra una passkey per proteggere l'area proprietario con autenticazione biometrica</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {passkeys.map(pk => (
                    <div key={pk.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-100 group">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                          <Fingerprint className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-stone-800">{pk.name}</p>
                          <p className="text-xs text-stone-400">
                            Registrata il {new Date(pk.createdAt).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeletePasskey(pk.id, pk.name)}
                        className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        title="Elimina passkey"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl max-w-xl">
            <p className="text-emerald-800 text-sm">
              <strong>Consiglio:</strong> Registra passkey su ogni dispositivo che usi per accedere all'area proprietario.
              Le passkey sono legate al dispositivo e non possono essere trasferite.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
