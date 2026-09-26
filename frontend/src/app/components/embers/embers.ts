import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, NgZone, OnDestroy, inject, input, viewChild } from '@angular/core';

interface Spark { x: number; y: number; vy: number; vx: number; r: number; life: number; max: number; hue: number; ph: number; }

/** Scintille che salgono dal forno. Gira solo quando è visibile. */
@Component({
  selector: 'app-embers',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<canvas #cv aria-hidden="true"></canvas>`,
  styles: [`
    :host { position: absolute; inset: 0; display: block; pointer-events: none; overflow: hidden; }
    canvas { width: 100%; height: 100%; display: block; }
  `]
})
export class EmbersComponent implements AfterViewInit, OnDestroy {
  count = input(40);

  private zone = inject(NgZone);
  private host = inject(ElementRef<HTMLElement>);
  private cv = viewChild.required<ElementRef<HTMLCanvasElement>>('cv');

  private sparks: Spark[] = [];
  private raf = 0;
  private visible = false;
  private w = 0;
  private h = 0;
  private dpr = 1;
  private io?: IntersectionObserver;
  private ro?: ResizeObserver;

  ngAfterViewInit() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    this.zone.runOutsideAngular(() => {
      this.ro = new ResizeObserver(() => this.resize());
      this.ro.observe(this.host.nativeElement);
      this.io = new IntersectionObserver(([e]) => {
        this.visible = e.isIntersecting;
        if (this.visible && !this.raf) this.raf = requestAnimationFrame(this.tick);
      });
      this.io.observe(this.host.nativeElement);
    });
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.raf);
    this.io?.disconnect();
    this.ro?.disconnect();
  }

  private resize() {
    const el = this.host.nativeElement as HTMLElement;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = el.clientWidth;
    this.h = el.clientHeight;
    const c = this.cv().nativeElement;
    c.width = Math.round(this.w * this.dpr);
    c.height = Math.round(this.h * this.dpr);
  }

  private spawn(fresh: boolean): Spark {
    const max = 120 + Math.random() * 160;
    return {
      x: Math.random() * this.w,
      y: fresh ? Math.random() * this.h : this.h + 10,
      vy: 0.35 + Math.random() * 1.1,
      vx: (Math.random() - 0.5) * 0.3,
      r: 0.7 + Math.random() * 1.9,
      life: fresh ? Math.random() * max : 0,
      max,
      hue: 18 + Math.random() * 30,
      ph: Math.random() * 6.28
    };
  }

  private tick = () => {
    this.raf = 0;
    if (!this.visible || document.hidden || !this.w) {
      if (this.visible) this.raf = requestAnimationFrame(this.tick);
      return;
    }

    const ctx = this.cv().nativeElement.getContext('2d')!;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, this.w, this.h);
    ctx.globalCompositeOperation = 'lighter';

    const target = this.w < 600 ? Math.round(this.count() * 0.6) : this.count();
    while (this.sparks.length < target) this.sparks.push(this.spawn(this.sparks.length < target / 2));

    for (let k = 0; k < this.sparks.length; k++) {
      const s = this.sparks[k];
      s.life++;
      s.y -= s.vy;
      s.x += s.vx + Math.sin(s.life * 0.03 + s.ph) * 0.35;
      const t = s.life / s.max;
      if (t >= 1 || s.y < -10) { this.sparks[k] = this.spawn(false); continue; }
      const a = Math.sin(Math.PI * t) * (0.55 + 0.45 * Math.sin(s.life * 0.2 + s.ph));
      ctx.beginPath();
      ctx.fillStyle = `hsla(${s.hue}, 100%, ${60 + 20 * (1 - t)}%, ${a.toFixed(3)})`;
      ctx.arc(s.x, s.y, s.r, 0, 6.2832);
      ctx.fill();
    }

    this.raf = requestAnimationFrame(this.tick);
  };
}
