import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { RestaurantService } from '../../services/restaurant';
import { RevealDirective } from '../../directives/reveal';
import { PizzaArtComponent } from '../../components/pizza-art/pizza-art';

interface Chapter {
  key: string;   // categoria come arriva dai dati
  id: string;    // ancora nella pagina
  nav: string;   // etichetta breve per la barra delle sezioni
  title: string;
  note: string;
  pizza: boolean;
  items: any[];
}

interface Part { t: string; hit: boolean; }

// ordine di un menù vero: si parte dagli antipasti e si chiude con le bevande
const CHAPTERS: Omit<Chapter, 'items'>[] = [
  { key: 'ANTIPASTI', id: 'antipasti', nav: 'Antipasti', title: 'Antipasti', note: 'Per cominciare, mentre il forno lavora.', pizza: false },
  { key: 'PIZZE SPECIALI', id: 'speciali', nav: 'Speciali', title: 'Pizze speciali', note: 'Le ricette che portano la firma di Ohimà.', pizza: true },
  { key: 'PIZZE ROSSE', id: 'rosse', nav: 'Rosse', title: 'Pizze rosse', note: 'Con la base di pomodoro.', pizza: true },
  { key: 'PIZZE BIANCHE', id: 'bianche', nav: 'Bianche', title: 'Pizze bianche', note: 'Senza pomodoro, con la base di mozzarella.', pizza: true },
  { key: 'DOLCI', id: 'dolci', nav: 'Dolci', title: 'Dolci', note: 'Per chiudere: dolci, amari e caffè.', pizza: false },
  { key: 'BEVANDE', id: 'bevande', nav: 'Bevande', title: 'Bevande', note: 'Birra alla spina, bibite e vino.', pizza: false }
];

// senza accenti e in minuscolo, così "nduja", "Nduja" e "ndujà" si trovano allo stesso modo
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [RevealDirective, PizzaArtComponent],
  templateUrl: './menu.html',
  styleUrl: './menu.css'
})
export class MenuComponent implements OnInit, AfterViewInit, OnDestroy {
  private host = inject(ElementRef<HTMLElement>);
  private zone = inject(NgZone);
  private restaurantService = inject(RestaurantService);
  private spy?: IntersectionObserver;

  loading = signal(true);
  chapters = signal<Chapter[]>([]);
  active = signal('antipasti');
  query = signal('');

  // gli ingredienti che la gente cerca di più, tutti presenti nel menù
  suggestions = ['nduja', 'burrata', 'salmone', 'funghi', 'guanciale', 'rucola', 'gorgonzola', 'olive'];

  extras = [
    { name: 'Bufala', price: '2,50' },
    { name: 'Stracciatella', price: '2,50' },
    { name: 'Burrata', price: '2,50' },
    { name: 'Aggiunta verdura', price: '2,00' },
    { name: 'Altre salse', price: '0,20' }
  ];

  visible = computed(() => {
    const q = norm(this.query().trim());
    if (!q) return this.chapters();
    return this.chapters()
      .map((c) => ({ ...c, items: c.items.filter((i) => norm(`${i.itemName} ${i.description}`).includes(q)) }))
      .filter((c) => c.items.length);
  });

  results = computed(() => this.visible().reduce((n, c) => n + c.items.length, 0));

  ngOnInit() {
    this.restaurantService.getMenu().subscribe({
      next: (data: any[]) => {
        this.chapters.set(
          CHAPTERS
            .map((c) => ({ ...c, items: data.filter((item) => item.category === c.key) }))
            .filter((c) => c.items.length)
        );
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Errore nel caricamento del menù', err);
        this.loading.set(false);
      }
    });
  }

  ngAfterViewInit() {
    this.watchChapters();
  }

  ngOnDestroy() {
    this.spy?.disconnect();
  }

  search(value: string) {
    this.query.set(value);
    // le sezioni cambiano: ricolleghiamo la barra quando la pagina è ridisegnata
    setTimeout(() => this.watchChapters());
  }

  pick(word: string) {
    this.search(this.query() === word ? '' : word);
    const box = this.host.nativeElement.querySelector('.finder') as HTMLElement | null;
    box?.scrollIntoView({ behavior: this.smooth(), block: 'start' });
  }

  goTo(event: Event, id: string) {
    event.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: this.smooth(), block: 'start' });
    this.setActive(id);
  }

  price(value: number): string {
    return value.toFixed(2).replace('.', ',');
  }

  /** divide il testo per evidenziare l'ingrediente cercato */
  mark(text: string): Part[] {
    const q = norm(this.query().trim());
    if (!q || !text) return [{ t: text, hit: false }];
    const n = norm(text);
    const parts: Part[] = [];
    let from = 0;
    let at = n.indexOf(q);
    while (at !== -1) {
      if (at > from) parts.push({ t: text.slice(from, at), hit: false });
      parts.push({ t: text.slice(at, at + q.length), hit: true });
      from = at + q.length;
      at = n.indexOf(q, from);
    }
    if (from < text.length) parts.push({ t: text.slice(from), hit: false });
    return parts;
  }

  private smooth(): ScrollBehavior {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
  }

  private watchChapters() {
    this.spy?.disconnect();
    if (typeof IntersectionObserver === 'undefined') return;

    this.zone.runOutsideAngular(() => {
      // la sezione che attraversa la fascia alta dello schermo è quella attiva
      this.spy = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) this.zone.run(() => this.setActive(entry.target.id));
          }
        },
        { rootMargin: '-30% 0px -65% 0px' }
      );
      this.host.nativeElement.querySelectorAll('.chapter').forEach((el: Element) => this.spy!.observe(el));
    });
  }

  private setActive(id: string) {
    this.active.set(id);

    // su telefono la barra scorre di lato: teniamo in vista la voce attiva
    const track = this.host.nativeElement.querySelector('.chapter-track') as HTMLElement | null;
    const chip = track?.querySelector(`[data-id="${id}"]`) as HTMLElement | null;
    if (track && chip && track.scrollWidth > track.clientWidth) {
      track.scrollTo({ left: chip.offsetLeft - (track.clientWidth - chip.offsetWidth) / 2, behavior: 'smooth' });
    }
  }
}
