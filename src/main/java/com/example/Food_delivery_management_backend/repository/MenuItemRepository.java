package com.example.Food_delivery_management_backend.repository;

import com.example.Food_delivery_management_backend.entity.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
    List<MenuItem> findByRestaurantId(Long restaurantId);
    List<MenuItem> findByRestaurantIdAndIsAvailable(Long restaurantId, Boolean isAvailable);
    List<MenuItem> findByCategory(String category);
}
