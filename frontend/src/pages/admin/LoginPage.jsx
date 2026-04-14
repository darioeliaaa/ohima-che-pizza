import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { login } from '../../services/api';
import { UtensilsCrossed, Mail, Lock, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await login({ email, password });
      loginUser({ email: res.email, role: res.role, userId: res.userId, restaurantId: res.restaurantId }, res.token);
      navigate('/admin');
    } catch (err) {
      setError('Credenziali non valide');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-stone-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UtensilsCrossed className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-white mb-1">Area Admin</h1>
          <p className="text-stone-400">Accedi per gestire il tuo centro estetico</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 animate-slide-down">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={submit} className="bg-stone-800/50 backdrop-blur border border-stone-700/50 rounded-2xl p-8 space-y-5">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-stone-300 mb-1.5">
              <Mail className="w-4 h-4" /> Email
            </label>
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-stone-700/50 border border-stone-600/50 text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-sm transition-all" />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-stone-300 mb-1.5">
              <Lock className="w-4 h-4" /> Password
            </label>
            <input required type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-stone-700/50 border border-stone-600/50 text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-sm transition-all" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/50 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-amber-500/25 flex items-center justify-center gap-2">
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Accedi'}
          </button>
        </form>
      </div>
    </div>
  );
}
