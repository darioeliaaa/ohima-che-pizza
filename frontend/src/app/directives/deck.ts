import { AfterViewInit, Directive, ElementRef, NgZone, OnDestroy, inject } from '@angular/core';

/**
 * Scaffale orizzontale da sfogliare col dito.
 * Scrive due variabili CSS: --roll (quanto hai sfogliato, in pixel) sullo scaffale
 * e --deck (quanto ne hai visto, da 0 a 1) sul contenitore, per la barretta di avanzamento.
 */
@Directive({
  selector: '[appDeck]',
  standalone: true,
  exportAs: 'appDeck'
})
export class DeckDirective implements AfterViewInit, OnDestroy {
  private el = inject(ElementRef<HTMLElement>);
  private zone = inject(NgZone);
  private frame = 0;

  ngAfterViewInit() {
    this.zone.runOutsideAngular(() => {
      this.el.nativeElement.addEventListener('scroll', this.onScroll, { passive: true });
      window.addEventListener('resize', this.onScroll, { passive: true });
    });
    this.update();
  }

  ngOnDestroy() {
    this.el.nativeElement.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('resize', this.onScroll);
    cancelAnimationFrame(this.frame);
  }

  /** avanti o indietro di una scheda */
  move(dir: 1 | -1) {
    const deck = this.el.nativeElement as HTMLElement;
    const card = deck.firstElementChild as HTMLElement | null;
    const step = card ? card.offsetWidth + 16 : deck.clientWidth * 0.8;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    deck.scrollBy({ left: dir * step, behavior: reduce ? 'auto' : 'smooth' });
  }

  private onScroll = () => {
    cancelAnimationFrame(this.frame);
    this.frame = requestAnimationFrame(() => this.update());
  };

  private update() {
    const deck = this.el.nativeElement as HTMLElement;
    const seen = deck.scrollWidth ? (deck.scrollLeft + deck.clientWidth) / deck.scrollWidth : 1;
    deck.style.setProperty('--roll', String(Math.round(deck.scrollLeft)));
    deck.parentElement?.style.setProperty('--deck', Math.min(1, seen).toFixed(3));
  }
}
