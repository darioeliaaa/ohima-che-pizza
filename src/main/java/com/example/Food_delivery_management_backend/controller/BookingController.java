package com.example.Food_delivery_management_backend.controller;

import com.example.Food_delivery_management_backend.entity.Booking;
import com.example.Food_delivery_management_backend.repository.BookingRepository;
import com.example.Food_delivery_management_backend.repository.RestaurantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;

    // Endpoint per i clienti: Crea una nuova prenotazione
    @PostMapping("/restaurant/{restaurantId}")
    public ResponseEntity<?> createBooking(@PathVariable Long restaurantId, @RequestBody Booking booking) {
        return restaurantRepository.findById(restaurantId).map(restaurant -> {
            booking.setRestaurant(restaurant);
            Booking saved = bookingRepository.save(booking);
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    // Endpoint per l'Admin: Vedi tutte le prenotazioni della pizzeria
    @GetMapping("/restaurant/{restaurantId}")
    public List<Booking> getBookings(@PathVariable Long restaurantId) {
        return bookingRepository.findByRestaurantId(restaurantId);
    }
}