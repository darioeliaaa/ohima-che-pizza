import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getFeatureFlags } from '../services/api';
import {
  Sparkles, LogOut, ChevronLeft, ChevronRight, Menu, Clock, Settings,
  FolderOpen, Users, Layers, Info, ShieldCheck, ShoppingBag, Package, Tag
} from 'lucide-react';
import { useState, useEffect } from 'react';

export default function AdminSidebar() {
  const { pathname } = useLocation();
  const { logout, user, ownerVerified } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [promotionsEnabled, setPromotionsEnabled] = useState(false);
  const isOwner = user?.role === 'OWNER';
  const rid = user?.restaurantId || 1;

  useEffect(() => {
    getFeatureFlags(rid).then(f => setPromotionsEnabled(f.promotionsEnabled)).catch(() => {});
  }, [rid]);

  const allLinks = [
    { to: '/admin/servizi', label: 'Servizi', icon: Sparkles },
    { to: '/admin/categorie', label: 'Categorie Servizi', icon: FolderOpen },
    { to: '/admin/sezioni', label: 'Sezioni Servizi', icon: Layers },
    { to: '/admin/prodotti', label: 'Prodotti', icon: ShoppingBag },
    { to: '/admin/categorie-prodotti', label: 'Categorie Prodotti', icon: Package },
    ...(promotionsEnabled ? [{ to: '/admin/promozioni', label: 'Promozioni', icon: Tag }] : []),
    { to: '/admin/chi-siamo-admin', label: 'Chi Siamo', icon: Info },
    { to: '/admin/orari', label: 'Orari', icon: Clock },
    { to: '/admin/impostazioni', label: 'Impostazioni', icon: Settings },
  ];

  const ownerLinks = [
    { to: '/admin/amministratori', label: 'Amministratori', icon: Users },
  ];

  const links = allLinks;

  const handleLogout = () => { logout(); navigate('/'); };

  const isActive = (to) => to === '/admin' ? pathname === '/admin' : pathname.startsWith(to);

  const sidebar = (
    <div className={`flex flex-col h-full bg-stone-900 text-white transition-all duration-300 ${collapsed ? 'w-[72px]' : 'w-64'}`}>
      <div className="flex items-center gap-3 px-4 h-16 border-b border-stone-700/50">
        <div className={`w-8 h-8 ${isOwner ? 'bg-pink-700' : 'bg-pink-600'} rounded-lg flex items-center justify-center flex-shrink-0`}>
          {isOwner ? <ShieldCheck className="w-4 h-4 text-white" /> : <Sparkles className="w-4 h-4 text-white" />}
        </div>
        {!collapsed && <span className="font-serif font-bold text-lg">{isOwner ? 'Proprietario' : 'Admin'}</span>}
      </div>

      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {links.map(l => (
          <Link key={l.to} to={l.to} onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              isActive(l.to)
                ? 'bg-pink-500/20 text-pink-400'
                : 'text-stone-400 hover:text-white hover:bg-stone-800'
            }`}>
            <l.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{l.label}</span>}
          </Link>
        ))}

        {isOwner && (
          <>
            <div className="pt-3 pb-1 px-3">
              {!collapsed && (
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-pink-500/60 font-semibold border-t border-stone-700/40 pt-3">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Area Proprietario
                </div>
              )}
              {collapsed && <div className="border-t border-pink-500/30 mt-1" />}
            </div>
            {ownerLinks.map(l => (
              <Link key={l.to} to={l.to} onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive(l.to)
                    ? 'bg-pink-500/20 text-pink-400'
                    : 'text-stone-400 hover:text-white hover:bg-stone-800'
                }`}>
                <l.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span>{l.label}</span>}
              </Link>
            ))}
          </>
        )}
      </nav>

      <div className="p-2 border-t border-stone-700/50">
        <button onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-stone-400 hover:text-red-400 hover:bg-stone-800 transition-all">
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Esci</span>}
        </button>
        <button onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-stone-500 hover:text-stone-300 transition-all mt-1">
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <><ChevronLeft className="w-5 h-5" /><span>Comprimi</span></>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:flex h-screen sticky top-0">{sidebar}</div>

      {/* Mobile header */}
      <div className="md:hidden sticky top-0 z-50 flex items-center gap-3 px-4 h-14 bg-stone-900 text-white">
        <button onClick={() => setMobileOpen(true)} className="p-1"><Menu className="w-6 h-6" /></button>
        <span className="font-serif font-bold">{isOwner ? 'Proprietario' : 'Admin'}</span>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-64">{sidebar}</div>
          <div className="flex-1 bg-black/50" onClick={() => setMobileOpen(false)} />
        </div>
      )}
    </>
  );
}
