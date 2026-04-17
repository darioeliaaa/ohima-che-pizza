import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common'; // Serve per la logica dell'hamburger

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent {
  isMenuOpen = false; // Di base il menù è chiuso

  // Funzione che scatta quando clicchi le 3 lineette
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  // Funzione per chiudere il menù appena clicchi su un link
  closeMenu() {
    this.isMenuOpen = false;
  }
}
