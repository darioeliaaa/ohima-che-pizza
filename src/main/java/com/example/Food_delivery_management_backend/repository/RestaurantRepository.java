package com.example.Food_delivery_management_backend.repository;

import com.example.Food_delivery_management_backend.entity.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {
    List<Restaurant> findByZipCode(String zipCode);
    List<Restaurant> findByIsActive(Boolean isActive);
    Optional<Restaurant> findByUserId(Long userId);
}
