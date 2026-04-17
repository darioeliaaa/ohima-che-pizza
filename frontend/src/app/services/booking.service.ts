import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Qui replichiamo esattamente i nomi dell'Entity Java
export interface Booking {
  customerName: string;
  customerPhone: string;
  bookingDate: string;  // Formato YYYY-MM-DD
  bookingTime: string;  // Formato HH:mm
  numberOfPeople: number;
  notes?: string;       // Opzionale
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  // L'URL base del tuo backend Spring Boot
  private baseUrl = 'https://ohima-che-pizza.onrender.com/api/bookings';

  constructor(private http: HttpClient) {}

  // Metodo per inviare la prenotazione al backend
  // Sostituisci "1" con l'ID reale del tuo ristorante nel database
  creaPrenotazione(bookingData: Booking, restaurantId: number = 1): Observable<any> {
    return this.http.post(`${this.baseUrl}/restaurant/${restaurantId}`, bookingData);
  }
}
