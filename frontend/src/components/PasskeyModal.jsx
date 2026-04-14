import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { verifyOwnerPasskey, authenticateWithPasskey, hasWebAuthnCredentials, isWebAuthnSupported } from '../services/api';
import { ShieldCheck, Fingerprint, KeyRound, Lock, AlertCircle, X } from 'lucide-react';

/**
 * Modal globale che si mostra quando un OWNER tenta un'operazione di scrittura
 * senza aver verificato la passkey. Supporta WebAuthn (biometrica) e passkey testuale.
 */
export default function PasskeyModal({ show, onVerified, onClose, message }) {
  const { isOwner, confirmOwner } = useAuth();
  const [passkey, setPasskey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasPasskeys, setHasPasskeys] = useState(false);
  const [checking, setChecking] = useState(true);
  const webauthnSupported = isWebAuthnSupported();

  useEffect(() => {
    if (!show || !isOwner) return;
    setError('');
    setPasskey('');
    hasWebAuthnCredentials()
      .then(data => setHasPasskeys(data.hasCredentials))
      .catch(() => setHasPasskeys(false))
      .finally(() => setChecking(false));
  }, [show, isOwner]);

  if (!show) return null;

  const handleWebAuthn = async () => {
    setError(''); setLoading(true);
    try {
      await authenticateWithPasskey();
      confirmOwner();
      onVerified();
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        setError('Autenticazione annullata');
      } else {
        setError(err.message || 'Errore di autenticazione');
      }
    } finally { setLoading(false); }
  };

  const handleTextPasskey = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await verifyOwnerPasskey(passkey);
      confirmOwner();
      onVerified();
    } catch (err) {
      setError('Passkey non valida');
      setPasskey('');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h2 className="font-bold text-stone-800">Verifica richiesta</h2>
              <p className="text-xs text-stone-500">
                {message || 'Conferma la tua identità per procedere'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-stone-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-stone-400" />
          </button>
        </div>

        <div className="px-6 pb-6 pt-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 animate-slide-down">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* WebAuthn */}
          {!checking && hasPasskeys && webauthnSupported && (
            <>
              <button
                onClick={handleWebAuthn}
                disabled={loading}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-stone-300 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-emerald-500/25 flex items-center justify-center gap-2 mb-3"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Fingerprint className="w-5 h-5" />
                    Verifica con Passkey
                  </>
                )}
              </button>

              <div className="flex items-center gap-3 my-3">
                <div className="flex-1 border-t border-stone-200" />
                <span className="text-xs text-stone-400">oppure</span>
                <div className="flex-1 border-t border-stone-200" />
              </div>
            </>
          )}

          {/* Passkey testuale */}
          <form onSubmit={handleTextPasskey}>
            <label className="flex items-center gap-2 text-sm font-medium text-stone-700 mb-1.5">
              <KeyRound className="w-4 h-4 text-stone-400" /> Passkey testuale
            </label>
            <input
              required
              type="password"
              value={passkey}
              onChange={e => setPasskey(e.target.value)}
              placeholder="Inserisci la passkey del proprietario"
              autoFocus={!hasPasskeys || !webauthnSupported}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-sm transition-all mb-3"
            />
            <button
              type="submit"
              disabled={loading || !passkey}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-stone-300 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-amber-500/25 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Verifica
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-stone-400 mt-4">
            La verifica dura 30 minuti
          </p>
        </div>
      </div>
    </div>
  );
}
