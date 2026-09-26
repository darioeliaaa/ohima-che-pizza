import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EmbersComponent } from '../embers/embers';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, EmbersComponent],
  templateUrl: './footer.html',
  styleUrl: './footer.css'
})
export class FooterComponent {
  year = new Date().getFullYear();
}
