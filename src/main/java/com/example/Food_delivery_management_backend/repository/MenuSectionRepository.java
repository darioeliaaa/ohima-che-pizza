package com.example.Food_delivery_management_backend.repository;

import com.example.Food_delivery_management_backend.entity.MenuSection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenuSectionRepository extends JpaRepository<MenuSection, Long> {
    List<MenuSection> findByRestaurantIdOrderByDisplayOrderAsc(Long restaurantId);
}
