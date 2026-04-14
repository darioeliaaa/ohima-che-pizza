package com.example.Food_delivery_management_backend.repository;

import com.example.Food_delivery_management_backend.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByRestaurantIdOrderByProductNameAsc(Long restaurantId);
    List<Product> findByRestaurantIdAndIsAvailableTrueOrderByProductNameAsc(Long restaurantId);
}
