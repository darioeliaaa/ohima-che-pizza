import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, NgZone, OnDestroy, inject, viewChild } from '@angular/core';
import { PizzaArtComponent } from '../pizza-art/pizza-art';

/**
 * La pizza del logo che gira piano, come quando il pizzaiolo la gira nel forno.
 * Con un colpo di dito in orizzontale la fai girare; in verticale la pagina scorre normalmente.
 */
@Component({
  selector: 'app-spin-pizza',
  standalone: true,
  imports: [PizzaArtComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="disc" #disc>
      <app-pizza-art variant="logo" [seed]="7"/>
    </div>
    <span class="hint" aria-hidden="true">
      <svg viewBox="0 0 40 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 16c8-12 24-12 32 0M30 8l6 8-9 1"/></svg>
      Girala!
    </span>
  `,
  styleUrl: './spin-pizza.css'
})
export class SpinPizzaComponent implements AfterViewInit, OnDestroy {
  private zone = inject(NgZone);
  private host = inject(ElementRef<HTMLElement>);
  private disc = viewChild.required<ElementRef<HTMLElement>>('disc');

  private angle = 0;
  private vel = 0;          // gradi al millisecondo
  private auto = 0.009;     // un giro ogni 40 secondi circa
  private dragging = false;
  private lastX = 0;
  private lastT = 0;
  private raf = 0;
  private prev = 0;
  private visible = true;
  private io?: IntersectionObserver;
  private off: Array<() => void> = [];

  ngAfterViewInit() {
    const el = this.host.nativeElement as HTMLElement;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) this.auto = 0;
    this.vel = this.auto;

    this.zone.runOutsideAngular(() => {
      const on = <K extends keyof HTMLElementEventMap>(t: K, fn: (e: HTMLElementEventMap[K]) => void) => {
        el.addEventListener(t, fn as EventListener);
        this.off.push(() => el.removeEventListener(t, fn as EventListener));
      };

      on('pointerdown', (e) => {
        this.dragging = true;
        this.lastX = e.clientX;
        this.lastT = e.timeStamp;
        el.classList.add('is-touched');
      });
      on('pointermove', (e) => {
        if (!this.dragging) return;
        const dx = e.clientX - this.lastX;
        const dt = Math.max(1, e.timeStamp - this.lastT);
        this.angle += dx * 0.45;
        this.vel = (dx * 0.45) / dt;
        this.lastX = e.clientX;
        this.lastT = e.timeStamp;
      });
      const release = () => { this.dragging = false; };
      on('pointerup', release);
      on('pointercancel', release);
      on('pointerleave', release);

      this.io = new IntersectionObserver(([e]) => {
        this.visible = e.isIntersecting;
        if (this.visible && !this.raf) this.raf = requestAnimationFrame(this.tick);
      });
      this.io.observe(el);
    });
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.raf);
    this.io?.disconnect();
    this.off.forEach((fn) => fn());
  }

  private tick = (now: number) => {
    this.raf = 0;
    if (!this.visible) return;
    const dt = this.prev ? Math.min(48, now - this.prev) : 16;
    this.prev = now;

    if (!this.dragging) {
      // la spinta si spegne piano e torna al giro lento
      this.vel += (this.auto - this.vel) * Math.min(1, dt * 0.0022);
      this.angle += this.vel * dt;
    }
    this.disc().nativeElement.style.transform = `rotate(${this.angle.toFixed(2)}deg)`;
    this.raf = requestAnimationFrame(this.tick);
  };
}
