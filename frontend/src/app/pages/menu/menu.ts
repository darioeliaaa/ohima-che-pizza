import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RestaurantService } from '../../services/restaurant';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule],
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
    // Usiamo l'ID 1 del tuo ristorante
    this.restaurantService.getMenu(1).subscribe({
      next: (data) => {
        this.allPizzas = data;
        this.filteredPizzas = data;

        // Estraiamo le categorie uniche dalla colonna 'category' del tuo DB
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
      // Filtriamo sulla proprietà 'category' (es: 'PIZZE')
      this.filteredPizzas = this.allPizzas.filter(item => item.category === cat);
    }
  }
}
