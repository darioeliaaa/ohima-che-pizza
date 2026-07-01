import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // FONDAMENTALE per leggere i campi
import { BookingService, Booking } from '../../services/booking.service';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, FormsModule], // Aggiunto FormsModule
  templateUrl: './booking.html',
  styleUrl: './booking.css'
})
export class BookingComponent {

  // Oggetto che raccoglie i dati inseriti dall'utente
  bookingData: Booking = {
    customerName: '',
    customerPhone: '',
    bookingDate: '',
    bookingTime: '',
    numberOfPeople: 1,
    notes: ''
  };

  messaggioSuccesso = false;
  messaggioErrore = '';

  // Inietta il servizio che abbiamo appena creato
  constructor(private bookingService: BookingService) {}

  confermaPrenotazione() {
    // Controllo base: ha compilato tutto?
    if (!this.bookingData.customerName || !this.bookingData.customerPhone || !this.bookingData.bookingDate || !this.bookingData.bookingTime) {
      this.messaggioErrore = 'Per favore, compila tutti i campi obbligatori.';
      return;
    }

    this.messaggioErrore = '';

    // Spedisce il missile verso Spring Boot
    this.bookingService.creaPrenotazione(this.bookingData).subscribe({
      next: (risposta) => {
        console.log('Prenotazione salvata nel DB:', risposta);
        this.messaggioSuccesso = true;
        // Pulisce il form
        this.bookingData = { customerName: '', customerPhone: '', bookingDate: '', bookingTime: '', numberOfPeople: 1, notes: '' };

        // Nasconde il messaggio di successo dopo 5 secondi
        setTimeout(() => this.messaggioSuccesso = false, 5000);
      },
      error: (errore) => {
        console.error('Errore dal backend:', errore);
        this.messaggioErrore = 'Si è verificato un problema. Riprova più tardi.';
      }
    });
  }
}
