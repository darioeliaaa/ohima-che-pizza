import { ChangeDetectionStrategy, Component, DestroyRef, HostListener, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';

/**
 * Da telefono le azioni che contano stanno sotto il pollice:
 * chiamare, aprire il menù, farsi portare al locale.
 * Compare dopo il primo scroll, così non copre l'apertura della pagina.
 */
@Component({
  selector: 'app-mobile-dock',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="dock" [class.is-shown]="shown()" aria-label="Azioni rapide" [attr.inert]="shown() ? null : ''">
      <a href="tel:+393248333640" class="dock-call">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/></svg>
        Chiama
      </a>
      @if (!onMenu()) {
        <a routerLink="/menu" class="dock-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="9" cy="9.5" r="1.4" fill="currentColor"/><circle cx="14.5" cy="13" r="1.6" fill="currentColor"/><circle cx="9.5" cy="15" r="1" fill="currentColor"/></svg>
          Menù
        </a>
      }
      <a href="https://www.google.com/maps/place/Ohim%C3%A0+che+pizza/@39.2468561,17.1061005,18z" target="_blank" rel="noopener noreferrer" class="dock-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>
        Portami lì
      </a>
    </nav>
  `,
  styleUrl: './mobile-dock.css'
})
export class MobileDockComponent {
  shown = signal(false);
  onMenu = signal(false);

  constructor() {
    const router = inject(Router);
    const sub = router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe((e) => {
      this.onMenu.set((e as NavigationEnd).urlAfterRedirects.startsWith('/menu'));
    });
    inject(DestroyRef).onDestroy(() => sub.unsubscribe());
  }

  @HostListener('window:scroll')
  onScroll() {
    const show = window.scrollY > 420;
    if (show !== this.shown()) this.shown.set(show);
  }
}
