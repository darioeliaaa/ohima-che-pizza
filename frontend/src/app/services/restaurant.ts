import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
// Qui importeremo i dati statici che creeremo nel prossimo file
import { MENU_DATA } from './menu-data';

@Injectable({
  providedIn: 'root'
})
export class RestaurantService {

  constructor() {}

  // Recupera il menù della pizzeria dal file statico locale
  getMenu(): Observable<any> {
    // 'of' avvolge i dati statici in un Observable
    return of(MENU_DATA);
  }

  /*
  // NOTA: Senza backend non possiamo salvare prenotazioni.
  // Se non ti serve, puoi cancellare questo metodo.
  // Se invece hai un form e vuoi solo simulare che funzioni, usa questo:
  postBooking(bookingData: any): Observable<any> {
    console.log('Prenotazione simulata inviata:', bookingData);
    return of({ success: true, message: 'Prenotazione confermata!' });
  }
  */
}
