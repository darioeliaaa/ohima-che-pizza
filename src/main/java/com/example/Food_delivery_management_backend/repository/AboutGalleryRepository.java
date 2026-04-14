package com.example.Food_delivery_management_backend.repository;

import com.example.Food_delivery_management_backend.entity.AboutGalleryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AboutGalleryRepository extends JpaRepository<AboutGalleryItem, Long> {
    List<AboutGalleryItem> findByRestaurantIdOrderByDisplayOrderAsc(Long restaurantId);
}
