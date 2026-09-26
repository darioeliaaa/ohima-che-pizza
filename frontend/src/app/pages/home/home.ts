import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RevealDirective } from '../../directives/reveal';
import { DeckDirective } from '../../directives/deck';
import { SpinPizzaComponent } from '../../components/spin-pizza/spin-pizza';
import { PizzaStoryComponent } from '../../components/pizza-story/pizza-story';
import { PizzaArtComponent } from '../../components/pizza-art/pizza-art';
import { MENU_DATA } from '../../services/menu-data';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, RevealDirective, DeckDirective, SpinPizzaComponent, PizzaStoryComponent, PizzaArtComponent],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  specials = MENU_DATA.filter((item) => item.category === 'PIZZE SPECIALI');

  reviews = [
    {
      text: 'Ottimo locale,pizza buonissima siamo venuti da Crotone 3 persone apposta,una delle migliori pizze assaggiate fin ora',
      author: 'UltimoRivoluzionarioKR'
    },
    {
      text: 'La pizza è ottima, il servizio è confortevole e l’ambiente è tranquillo  accogliente',
      author: 'Miriam De Tursi'
    },
    {
      text: "Locale spartano in una zona ancora poco sviluppata di Strongoli ma vi assicuro che la pizza è la migliore di tutta la zona, croccante e ben condita. Le polpette di carne poi sono una goduria per il palato e la birra viene servita ghiacciata come dovrebbe sempre essere. Un plauso al cameriere che ci ha servito, cordiale, preparato, molto gentile e professionale. Entro la fine della vacanza ci torneremo senz'altro.",
      author: 'Lucia Braico'
    }
  ];

  price(value: number): string {
    return value.toFixed(2).replace('.', ',');
  }
}
