import { Outlet, Navigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AdminSidebar from './AdminSidebar';
import PasskeyModal from './PasskeyModal';
import { setWriteProtectionHandlers } from '../services/api';

export default function AdminLayout() {
  const { user, loading, isAdmin, isOwner } = useAuth();
  const [showPasskey, setShowPasskey] = useState(false);
  const [passkeyMsg, setPasskeyMsg] = useState('');
  const [adminMsg, setAdminMsg] = useState('');

  const handlePasskeyRequired = useCallback((msg) => {
    setPasskeyMsg(msg || 'Verifica con passkey richiesta per le modifiche');
    setShowPasskey(true);
  }, []);

  const handleAdminReadOnly = useCallback((msg) => {
    setAdminMsg(msg || 'Non hai i permessi per questa operazione');
    setTimeout(() => setAdminMsg(''), 4000);
  }, []);

  useEffect(() => {
    setWriteProtectionHandlers({
      onPasskeyRequired: handlePasskeyRequired,
      onAdminReadOnly: handleAdminReadOnly
    });
    return () => setWriteProtectionHandlers({ onPasskeyRequired: null, onAdminReadOnly: null });
  }, [handlePasskeyRequired, handleAdminReadOnly]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-stone-100">
      <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user || !isAdmin) return <Navigate to="/admin/login" replace />;

  return (
    <div className="flex min-h-screen bg-stone-100">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Modale passkey (OWNER non verificato) */}
      {isOwner && (
        <PasskeyModal
          show={showPasskey}
          message={passkeyMsg}
          onVerified={() => setShowPasskey(false)}
          onClose={() => setShowPasskey(false)}
        />
      )}

      {/* Toast ADMIN read-only */}
      {adminMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-red-500 text-white px-5 py-3 rounded-xl shadow-lg animate-slide-up flex items-center gap-2 max-w-sm">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-medium">{adminMsg}</span>
        </div>
      )}
    </div>
  );
}
