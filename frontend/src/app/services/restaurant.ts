import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RestaurantService {
  // L'URL è /api perché abbiamo il proxy configurato nel file proxy.conf.json
  private apiUrl = '/api';

  constructor(private http: HttpClient) {}

  // Recupera il menù della pizzeria
  getMenu(restaurantId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/menu-items/restaurant/${restaurantId}`);
  }

  // Invia la prenotazione del tavolo
  postBooking(restaurantId: number, bookingData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/bookings/restaurant/${restaurantId}`, bookingData);
  }
}
