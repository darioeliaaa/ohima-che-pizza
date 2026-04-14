import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getFeatureFlags } from '../services/api';

export default function PublicNavbar() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [promotionsEnabled, setPromotionsEnabled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    getFeatureFlags(1).then(f => setPromotionsEnabled(f.promotionsEnabled)).catch(() => {});
  }, []);

  const baseLinks = [
    { to: '/', label: 'Home' },
    { to: '/servizi', label: 'Servizi' },
    { to: '/prodotti', label: 'Prodotti' },
  ];
  const links = [
    ...baseLinks,
    ...(promotionsEnabled ? [{ to: '/promozioni', label: 'Promozioni' }] : []),
    { to: '/prenota', label: 'Prenota' },
    { to: '/chi-siamo', label: 'Chi siamo' },
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        open ? 'bg-[#0f0a15] shadow-lg shadow-black/30' :
        scrolled ? 'bg-[#0f0a15]/90 backdrop-blur-xl shadow-lg shadow-black/20' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-serif font-bold text-lg">B</span>
              </div>
              <span className="font-serif text-lg font-bold text-white hidden sm:block">Bella Vita</span>
            </Link>

            {/* Desktop */}
            <div className="hidden md:flex items-center gap-1">
              {links.map(l => (
                <Link key={l.to} to={l.to}
                  className={`px-4 py-2 rounded-lg text-sm font-medium tracking-wide uppercase transition-all ${
                    pathname === l.to
                      ? 'text-pink-400'
                      : 'text-stone-300 hover:text-white'
                  }`}>
                  {l.label}
                </Link>
              ))}
            </div>

            {/* Mobile toggle */}
            <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors">
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile menu */}
          {open && (
            <div className="md:hidden pb-6 animate-slide-down border-t border-purple-800/30">
              {links.map(l => (
                <Link key={l.to} to={l.to} onClick={() => setOpen(false)}
                  className={`block px-4 py-3.5 rounded-lg text-sm font-medium tracking-wide uppercase transition-all ${
                    pathname === l.to
                      ? 'text-pink-400 bg-pink-500/10'
                      : 'text-stone-300 hover:text-white hover:bg-white/5'
                  }`}>
                  {l.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Mobile overlay backdrop */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
      )}
    </>
  );
}
