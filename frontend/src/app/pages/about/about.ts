import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, inject, viewChild } from '@angular/core';
import { RevealDirective } from '../../directives/reveal';
import { EmbersComponent } from '../../components/embers/embers';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RevealDirective, EmbersComponent],
  templateUrl: './about.html',
  styleUrl: './about.css'
})
export class About implements AfterViewInit, OnDestroy {
  private zone = inject(NgZone);
  private counter = viewChild.required<ElementRef<HTMLElement>>('counter');
  private raf = 0;

  ngAfterViewInit() {
    const el = this.counter().nativeElement;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.textContent = '400';
      return;
    }
    // il forno si scalda: da 0 a 400 gradi, veloce all'inizio e piano alla fine
    this.zone.runOutsideAngular(() => {
      const start = performance.now();
      const run = (now: number) => {
        const t = Math.min(1, (now - start) / 1900);
        el.textContent = String(Math.round(400 * (1 - Math.pow(1 - t, 3))));
        if (t < 1) this.raf = requestAnimationFrame(run);
      };
      this.raf = requestAnimationFrame(run);
    });
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.raf);
  }
}
