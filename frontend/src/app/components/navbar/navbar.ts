import { Component, DestroyRef, HostListener, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent {
  isMenuOpen = signal(false);
  scrolled = signal(false);

  constructor() {
    // se si cambia pagina col menù mobile aperto, lo chiudiamo
    const sub = inject(Router).events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => this.closeMenu());
    inject(DestroyRef).onDestroy(() => sub.unsubscribe());
  }

  @HostListener('window:scroll')
  onScroll() {
    this.scrolled.set(window.scrollY > 8);
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.closeMenu();
  }

  toggleMenu() {
    this.setMenu(!this.isMenuOpen());
  }

  closeMenu() {
    this.setMenu(false);
  }

  private setMenu(open: boolean) {
    this.isMenuOpen.set(open);
    // blocca lo scroll della pagina sotto al menù a tutto schermo
    document.body.style.overflow = open ? 'hidden' : '';
  }
}
