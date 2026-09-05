import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RestaurantService } from '../../services/restaurant';
import { RevealDirective } from '../../directives/reveal';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, RevealDirective],
  templateUrl: './menu.html',
  styleUrl: './menu.css'
})
export class MenuComponent implements OnInit {
  allPizzas: any[] = [];
  filteredPizzas: any[] = [];
  categories: string[] = [];
  selectedCategory: string = 'TUTTO';
  loading = true;

  constructor(private restaurantService: RestaurantService) {}

  ngOnInit() {
    // Richiamiamo il servizio senza passare l'ID, ottenendo i dati dal file statico
    this.restaurantService.getMenu().subscribe({
      next: (data) => {
        this.allPizzas = data;
        this.filteredPizzas = data;

        // Estraiamo le categorie uniche dalla proprietà 'category'
        const uniqueCats = [...new Set(data.map((item: any) => item.category))];
        // Puliamo da eventuali null e aggiungiamo TUTTO
        this.categories = ['TUTTO', ...uniqueCats.filter(c => c) as string[]];

        this.loading = false;
      },
      error: (err) => {
        console.error('Errore nel caricamento del menù', err);
        this.loading = false;
      }
    });
  }

  filterByCategory(cat: string) {
    this.selectedCategory = cat;
    if (cat === 'TUTTO') {
      this.filteredPizzas = this.allPizzas;
    } else {
      // Filtriamo sulla proprietà 'category'
      this.filteredPizzas = this.allPizzas.filter(item => item.category === cat);
    }

    // Se stavamo scrollati più in basso, torniamo in cima ai risultati
    // (altrimenti si resta a guardare uno scroll ormai fuori posto o vuoto).
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  private categoryIcons: Record<string, string> = {
    'TUTTO': '🍽️',
    'PIZZE SPECIALI': '⭐',
    'PIZZE ROSSE': '🍕',
    'PIZZE BIANCHE': '🧀',
    'DOLCI': '🍰',
    'BEVANDE': '🥤',
    'ANTIPASTI': '🫒'
  };

  categoryIcon(cat: string): string {
    return this.categoryIcons[cat?.toUpperCase()] ?? '🍕';
  }
}
