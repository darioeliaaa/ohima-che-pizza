import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { verifyOwnerPasskey, authenticateWithPasskey, hasWebAuthnCredentials, isWebAuthnSupported } from '../services/api';
import { ShieldCheck, Lock, AlertCircle, KeyRound, Fingerprint, Loader2 } from 'lucide-react';

export default function OwnerRoute({ children }) {
  const { isOwner, ownerVerified, confirmOwner } = useAuth();
  const [passkey, setPasskey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [hasPasskeys, setHasPasskeys] = useState(false);
  const [webauthnSupported] = useState(isWebAuthnSupported());

  // Se non è owner, redirect alla dashboard admin
  if (!isOwner) return <Navigate to="/admin" replace />;

  // Se già verificato in questa sessione, mostra il contenuto
  if (ownerVerified) return children;

  // Controlla se l'utente ha passkey registrate
  useEffect(() => {
    if (!isOwner || ownerVerified) return;
    hasWebAuthnCredentials()
      .then(data => setHasPasskeys(data.hasCredentials))
      .catch(() => setHasPasskeys(false))
      .finally(() => setChecking(false));
  }, [isOwner, ownerVerified]);

  // Autenticazione con Passkey (WebAuthn/FIDO2)
  const handlePasskeyAuth = async () => {
    setError(''); setLoading(true);
    try {
      await authenticateWithPasskey();
      confirmOwner();
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        setError('Autenticazione annullata o non autorizzata');
      } else {
        setError(err.message || 'Errore durante l\'autenticazione con passkey');
      }
    } finally { setLoading(false); }
  };

  // Autenticazione con passkey testuale (fallback)
  const handleTextPasskey = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await verifyOwnerPasskey(passkey);
      confirmOwner();
    } catch (err) {
      setError('Passkey non valida');
      setPasskey('');
    } finally { setLoading(false); }
  };

  if (checking) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
    </div>
  );

  return (
    <div className="animate-fade-in flex items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-stone-800 mb-1">Area Proprietario</h1>
          <p className="text-stone-500 text-sm">
            {hasPasskeys && webauthnSupported
              ? 'Verifica la tua identità con la passkey biometrica'
              : 'Inserisci la passkey per accedere a quest\'area riservata'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 animate-slide-down">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Metodo principale: Passkey biometrica (WebAuthn/FIDO2) */}
        {hasPasskeys && webauthnSupported && (
          <div className="bg-white rounded-2xl border border-stone-200/60 p-8 space-y-5 shadow-sm mb-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Fingerprint className="w-6 h-6 text-emerald-500" />
              </div>
              <h2 className="font-semibold text-stone-800 mb-1">Passkey biometrica</h2>
              <p className="text-stone-500 text-xs">Touch ID, Face ID o chiave di sicurezza</p>
            </div>
            <button
              onClick={handlePasskeyAuth}
              disabled={loading}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-stone-300 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-emerald-500/25 flex items-center justify-center gap-2"
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
          </div>
        )}

        {/* Separatore */}
        {hasPasskeys && webauthnSupported && (
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 border-t border-stone-200" />
            <span className="text-xs text-stone-400 font-medium">oppure</span>
            <div className="flex-1 border-t border-stone-200" />
          </div>
        )}

        {/* Metodo fallback: Passkey testuale */}
        <form onSubmit={handleTextPasskey} className="bg-white rounded-2xl border border-stone-200/60 p-8 space-y-5 shadow-sm">
          <div>
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
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-sm transition-all"
            />
          </div>
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
                Verifica e accedi
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-stone-400 mt-4">
          {hasPasskeys
            ? 'La verifica è valida per la sessione corrente del browser'
            : 'Registra una passkey biometrica nelle Impostazioni per un accesso più sicuro'}
        </p>
      </div>
    </div>
  );
}
