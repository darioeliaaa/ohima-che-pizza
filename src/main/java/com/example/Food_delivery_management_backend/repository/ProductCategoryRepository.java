package com.example.Food_delivery_management_backend.repository;

import com.example.Food_delivery_management_backend.entity.ProductCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductCategoryRepository extends JpaRepository<ProductCategory, Long> {
    List<ProductCategory> findByRestaurantIdOrderByDisplayOrderAscNameAsc(Long restaurantId);
}
