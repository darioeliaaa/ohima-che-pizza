package com.example.Food_delivery_management_backend.repository;

import com.example.Food_delivery_management_backend.entity.ClosingDay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ClosingDayRepository extends JpaRepository<ClosingDay, Long> {
    List<ClosingDay> findByRestaurantIdOrderByDateAsc(Long restaurantId);
    List<ClosingDay> findByRestaurantIdAndDateGreaterThanEqual(Long restaurantId, LocalDate date);
    boolean existsByRestaurantIdAndDate(Long restaurantId, LocalDate date);
}
