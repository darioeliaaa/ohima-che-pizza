import { createContext, useContext, useState, useEffect } from 'react';
import { revokeVerification, getVerificationStatus } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ownerVerified, setOwnerVerified] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { localStorage.removeItem('user'); }
    }
    // Ripristina stato passkey dalla sessione corrente
    if (sessionStorage.getItem('ownerVerified') === 'true') {
      setOwnerVerified(true);
    }
    setLoading(false);
  }, []);

  // Sincronizza stato verifica con il backend quando l'utente OWNER è presente
  useEffect(() => {
    if (!user || user.role !== 'OWNER') return;
    getVerificationStatus()
      .then(data => {
        if (data.verified) {
          setOwnerVerified(true);
          sessionStorage.setItem('ownerVerified', 'true');
        } else {
          setOwnerVerified(false);
          sessionStorage.removeItem('ownerVerified');
        }
      })
      .catch(() => {});
  }, [user]);

  const loginUser = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setOwnerVerified(false);
    sessionStorage.removeItem('ownerVerified');
  };

  const logout = async () => {
    // Revoca verifica server-side prima di pulire lo stato locale
    try { await revokeVerification(); } catch {}
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('ownerVerified');
    setUser(null);
    setOwnerVerified(false);
  };

  const confirmOwner = () => {
    setOwnerVerified(true);
    sessionStorage.setItem('ownerVerified', 'true');
  };

  return (
    <AuthContext.Provider value={{
      user, loading, loginUser, logout,
      isAdmin: user?.role === 'ADMIN' || user?.role === 'OWNER',
      isOwner: user?.role === 'OWNER',
      ownerVerified,
      confirmOwner
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
