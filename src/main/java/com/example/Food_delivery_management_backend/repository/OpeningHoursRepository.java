package com.example.Food_delivery_management_backend.repository;

import com.example.Food_delivery_management_backend.entity.OpeningHours;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OpeningHoursRepository extends JpaRepository<OpeningHours, Long> {
    List<OpeningHours> findByRestaurantIdOrderByDayOfWeekAscOpenTimeAsc(Long restaurantId);

    @Modifying(clearAutomatically = true)
    @Query("DELETE FROM OpeningHours o WHERE o.restaurant.id = :restaurantId")
    void deleteByRestaurantId(Long restaurantId);
}
