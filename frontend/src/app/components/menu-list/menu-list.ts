import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RestaurantService } from '../../services/restaurant';

@Component({
  selector: 'app-menu-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './menu-list.html',
  styleUrl: './menu-list.css'
})
export class MenuListComponent implements OnInit {
  pizzas: any[] = [];
  loading = true;

  constructor(private restaurantService: RestaurantService) {}

  ngOnInit(): void {
    // Rimosso il riferimento a Neon DB, richiamiamo semplicemente il menu
    this.restaurantService.getMenu().subscribe({
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
