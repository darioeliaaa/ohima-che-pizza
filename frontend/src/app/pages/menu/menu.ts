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
  pizzas: any[] = [];
  loading = true;

  constructor(private restaurantService: RestaurantService) {}

  ngOnInit() {
    this.restaurantService.getMenu(1).subscribe({
      next: (data) => {
        this.pizzas = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Errore nel caricamento del menù', err);
        this.loading = false;
      }
    });
  }
}
