package com.example.Food_delivery_management_backend.repository;

import com.example.Food_delivery_management_backend.entity.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, Long> {
    List<Promotion> findByRestaurantIdOrderByCreatedAtDesc(Long restaurantId);
    List<Promotion> findByRestaurantIdAndIsActiveTrueOrderByCreatedAtDesc(Long restaurantId);
}
