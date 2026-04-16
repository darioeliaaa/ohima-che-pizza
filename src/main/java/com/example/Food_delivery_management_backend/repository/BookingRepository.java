package com.example.Food_delivery_management_backend.repository;

import com.example.Food_delivery_management_backend.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    // Trova tutte le prenotazioni di una specifica pizzeria
    List<Booking> findByRestaurantId(Long restaurantId);
}