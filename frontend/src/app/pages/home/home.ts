import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink], // Fondamentale per i link interni!
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent { }
