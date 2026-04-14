import { useState, useEffect } from 'react';
import { Camera, X, ChevronLeft, ChevronRight, Heart, MapPin } from 'lucide-react';
import { getAboutContent, getAboutGallery } from '../../services/api';

const RESTAURANT_ID = 1;

const DEFAULT_GALLERY = [
  { src: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=800&q=80', caption: 'Area relax', category: 'ambiente' },
  { src: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=800&q=80', caption: 'Reception del centro', category: 'ambiente' },
  { src: 'https://images.unsplash.com/photo-1540555700478-4be289fbec6d?w=800&q=80', caption: 'Sala trattamenti', category: 'ambiente' },
  { src: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=800&q=80', caption: 'Angolo manicure', category: 'ambiente' },
  { src: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80', caption: 'Trattamento viso', category: 'trattamenti' },
  { src: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&q=80', caption: 'Manicure professionale', category: 'trattamenti' },
  { src: 'https://images.unsplash.com/photo-1519824145371-296894a0daa9?w=800&q=80', caption: 'Pedicure spa', category: 'trattamenti' },
  { src: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80', caption: 'Massaggio rilassante', category: 'trattamenti' },
  { src: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80', caption: 'I nostri prodotti', category: 'centro' },
  { src: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80', caption: 'Prodotti skincare', category: 'centro' },
  { src: 'https://images.unsplash.com/photo-1583416750470-965b2707b355?w=800&q=80', caption: 'Linea trattamenti corpo', category: 'centro' },
  { src: 'https://images.unsplash.com/photo-1631730486784-5c8e1d2f80b5?w=800&q=80', caption: 'Il nostro team', category: 'centro' },
];

const categories = [
  { key: 'tutti', label: 'Tutti' },
  { key: 'ambiente', label: 'Ambiente' },
  { key: 'centro', label: 'Il centro' },
  { key: 'trattamenti', label: 'Trattamenti' },
];

const DEFAULT_CONTENT = {
  heroImageUrl: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=1920&q=80',
  heroTitle: 'Chi siamo',
  heroSubtitle: 'Passione per la bellezza e il benessere, nel cuore della tua città',
  storyLabel: 'La nostra missione',
  storyTitle: 'La nostra storia',
  storyText: `Il Centro Estetico Bella Vita nasce dalla passione per la cura della persona e il desiderio di offrire un'esperienza di benessere unica. Ogni trattamento è studiato su misura per le esigenze di ogni cliente.

Il nostro team di professioniste qualificate si aggiorna costantemente sulle ultime tecniche e tendenze del settore estetico. Utilizziamo solo prodotti di alta qualità e strumenti all'avanguardia per garantire risultati eccellenti.

Dal trattamento viso personalizzato alla manicure perfetta, dal massaggio rilassante alla depilazione, ogni servizio è pensato per farti sentire al meglio. Il nostro ambiente accogliente e rilassante ti farà dimenticare lo stress quotidiano.

Vieni a trovarci e scopri il piacere di prenderti cura di te.`,
  storyImageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80',
  storyImageCaption: 'Professionalità e passione',
  storyImageSubcaption: 'Centro Estetico Bella Vita',
  locationText: '',
};

export default function GalleryPage() {
  const [filter, setFilter] = useState('tutti');
  const [lightbox, setLightbox] = useState(null);
  const [gallery, setGallery] = useState(DEFAULT_GALLERY);
  const [content, setContent] = useState(DEFAULT_CONTENT);

  useEffect(() => {
    getAboutContent(RESTAURANT_ID).then(data => {
      if (data && data.heroTitle) setContent(data);
    }).catch(() => {});
    getAboutGallery(RESTAURANT_ID).then(data => {
      if (data && data.length > 0) {
        setGallery(data.map(item => ({
          src: item.imageUrl,
          caption: item.caption,
          category: item.category,
        })));
      }
    }).catch(() => {});
  }, []);

  const filtered = filter === 'tutti' ? gallery : gallery.filter(g => g.category === filter);

  useEffect(() => {
    if (lightbox === null) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') setLightbox(null);
      if (e.key === 'ArrowRight') setLightbox(i => (i + 1) % filtered.length);
      if (e.key === 'ArrowLeft') setLightbox(i => (i - 1 + filtered.length) % filtered.length);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightbox, filtered.length]);

  return (
    <div className="pt-24 pb-16">
      {/* Header */}
      <div className="relative py-16 mb-8 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${content.heroImageUrl}')` }} />
        <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-sm" />
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <p className="text-amber-400 font-medium tracking-[0.3em] uppercase text-xs mb-4">La nostra storia</p>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">{content.heroTitle}</h1>
          <div className="w-16 h-1 bg-amber-500 rounded-full mx-auto mb-4" />
          <p className="text-stone-400 max-w-lg mx-auto">{content.heroSubtitle}</p>
        </div>
      </div>

      {/* La nostra storia */}
      <section className="max-w-5xl mx-auto px-6 mb-20">
        <div className="glass rounded-3xl overflow-hidden">
          <div className="grid md:grid-cols-2">
            <div className="p-10 sm:p-14">
              <p className="text-amber-400 font-medium tracking-[0.3em] uppercase text-xs mb-4">{content.storyLabel}</p>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-6">{content.storyTitle}</h2>
              <div className="space-y-4 text-stone-400 text-sm leading-relaxed">
                {content.storyText.split('\n\n').map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
              <div className="mt-8 flex items-center gap-2 text-xs text-stone-500">
                <MapPin className="w-4 h-4 text-amber-500" />
                <span>{content.locationText}</span>
              </div>
            </div>
            <div className="relative min-h-80">
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${content.storyImageUrl}')` }} />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/40 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="font-serif text-white text-lg font-bold">{content.storyImageCaption}</p>
                <p className="text-stone-300 text-xs mt-1">{content.storyImageSubcaption}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-10">
          <p className="text-amber-400 font-medium tracking-[0.3em] uppercase text-xs mb-4">Galleria fotografica</p>
          <h2 className="font-serif text-4xl sm:text-5xl font-bold text-white mb-6">I nostri scatti</h2>
          <div className="w-16 h-1 bg-amber-500 rounded-full mx-auto mb-8" />

          {/* Filtri */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {categories.map(c => (
              <button key={c.key} onClick={() => setFilter(c.key)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  filter === c.key
                    ? 'bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/20'
                    : 'bg-white/5 text-stone-400 hover:text-white hover:bg-white/10 border border-white/10'
                }`}>
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 stagger-children">
          {filtered.map((img, i) => (
            <button key={`${filter}-${i}`} onClick={() => setLightbox(i)}
              className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500/50">
              <img src={img.src} alt={img.caption} loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <p className="text-white text-sm font-medium">{img.caption}</p>
                <p className="text-amber-400 text-xs mt-0.5 capitalize">{img.category}</p>
              </div>
              <div className="absolute top-3 right-3 w-8 h-8 bg-black/30 backdrop-blur rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-4 h-4 text-white" />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Lightbox */}
      {lightbox !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center" onClick={() => setLightbox(null)}>
          <button onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10">
            <X className="w-6 h-6" />
          </button>

          <button onClick={(e) => { e.stopPropagation(); setLightbox(i => (i - 1 + filtered.length) % filtered.length); }}
            className="absolute left-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10">
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button onClick={(e) => { e.stopPropagation(); setLightbox(i => (i + 1) % filtered.length); }}
            className="absolute right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10">
            <ChevronRight className="w-6 h-6" />
          </button>

          <div className="max-w-5xl max-h-[85vh] mx-4 animate-fade-in" onClick={e => e.stopPropagation()}>
            <img src={filtered[lightbox].src} alt={filtered[lightbox].caption}
              className="max-w-full max-h-[80vh] object-contain rounded-2xl mx-auto" />
            <div className="text-center mt-4">
              <p className="text-white font-medium">{filtered[lightbox].caption}</p>
              <p className="text-stone-500 text-sm mt-1">{lightbox + 1} / {filtered.length}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
