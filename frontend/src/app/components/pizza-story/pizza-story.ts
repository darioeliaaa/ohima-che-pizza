import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, NgZone, OnDestroy, ViewEncapsulation, inject, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PizzaArtComponent } from '../pizza-art/pizza-art';
import { EmbersComponent } from '../embers/embers';
import { MENU_DATA } from '../../services/menu-data';

const clamp = (v: number) => Math.min(1, Math.max(0, v));

/**
 * "Come nasce una Ohimà": la sezione resta ferma sullo schermo mentre scorri
 * e la pizza si prepara davanti a te. Tutto è guidato da una sola variabile,
 * l'avanzamento dello scroll, da cui derivano le altre fasi.
 */
@Component({
  selector: 'app-pizza-story',
  standalone: true,
  imports: [RouterLink, PizzaArtComponent, EmbersComponent],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pizza-story.html',
  styleUrl: './pizza-story.css'
})
export class PizzaStoryComponent implements AfterViewInit, OnDestroy {
  private zone = inject(NgZone);
  private root = viewChild.required<ElementRef<HTMLElement>>('root');
  private stage = viewChild.required<ElementRef<HTMLElement>>('stage');
  private temp = viewChild.required<ElementRef<HTMLElement>>('temp');
  private tempLabel = viewChild.required<ElementRef<HTMLElement>>('tempLabel');

  // la pizza della storia è una vera pizza del menù
  private pizza = MENU_DATA.find((item) => item.itemName === 'Citerà') ?? MENU_DATA[0];
  recipe = this.pizza.description;
  seed = this.pizza.id;

  readonly isStatic = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  steps = [
    { kicker: "01 · L'impasto", title: 'Lunga lievitazione', text: "Un impasto che riposa a lungo, soffice e facile da digerire, dalla prima all'ultima fetta." },
    { kicker: '02 · Il condimento', title: 'Ingredienti veri', text: 'Materie prime calabresi selezionate con cura, senza scorciatoie e senza compromessi.' },
    { kicker: '03 · Il forno', title: 'Oltre 400 gradi', text: 'La fiamma viva cuoce ogni pizza in pochi minuti, per un cornicione croccante e leggero.' },
    { kicker: '04 · In tavola', title: 'Ohimà, che pizza!', text: `Questa è una ${this.pizza.itemName}: ${this.pizza.description}.` }
  ];

  private ticking = false;
  private lastStep = -1;
  private lastTemp = -1;

  ngAfterViewInit() {
    if (this.isStatic) {
      this.apply(1);
      return;
    }
    this.zone.runOutsideAngular(() => {
      window.addEventListener('scroll', this.onScroll, { passive: true });
      window.addEventListener('resize', this.onScroll, { passive: true });
    });
    this.update();
  }

  ngOnDestroy() {
    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('resize', this.onScroll);
  }

  private onScroll = () => {
    if (this.ticking) return;
    this.ticking = true;
    requestAnimationFrame(() => {
      this.ticking = false;
      this.update();
    });
  };

  private update() {
    const root = this.root().nativeElement;
    const rect = root.getBoundingClientRect();
    const vh = window.innerHeight;
    if (rect.bottom < -50 || rect.top > vh + 50) return;
    const total = Math.max(1, root.offsetHeight - vh);
    this.apply(clamp(-rect.top / total));
  }

  private apply(p: number) {
    const s = this.stage().nativeElement.style;
    const flat = clamp((p - 0.19) / 0.09);
    const oven = this.isStatic ? 0 : clamp((p - 0.5) / 0.05);
    const serve = clamp((p - 0.79) / 0.1);

    const vars: Record<string, number> = {
      p,
      rise: clamp(p / 0.2),
      flat,
      spread: clamp((p - 0.29) / 0.07),
      top: clamp((p - 0.35) / 0.13),
      heat: oven,
      bake: clamp((p - 0.56) / 0.14),
      serve,
      ph1: clamp(p / 0.04) * (1 - flat),
      ph2: clamp((p - 0.52) / 0.04) * (1 - clamp((p - 0.74) / 0.04))
    };
    for (const k in vars) s.setProperty('--' + k, vars[k].toFixed(3));

    const el = this.stage().nativeElement;
    const step = p < 0.25 ? 0 : p < 0.5 ? 1 : p < 0.77 ? 2 : 3;
    if (step !== this.lastStep) {
      el.dataset['step'] = String(step);
      this.lastStep = step;
    }
    el.toggleAttribute('data-dark', oven > 0.5);
    el.toggleAttribute('data-serve', serve > 0);

    // il termometro sale da temperatura ambiente fino a oltre 400 gradi
    const t = Math.round(20 + 380 * clamp((p - 0.5) / 0.22));
    if (t !== this.lastTemp) {
      this.temp().nativeElement.textContent = String(t);
      this.tempLabel().nativeElement.textContent = t >= 400 ? 'oltre' : 'forno';
      this.lastTemp = t;
    }
  }
}
