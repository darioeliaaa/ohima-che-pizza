package com.example.Food_delivery_management_backend.repository;

import com.example.Food_delivery_management_backend.entity.AboutContent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AboutContentRepository extends JpaRepository<AboutContent, Long> {
    Optional<AboutContent> findByRestaurantId(Long restaurantId);
}
