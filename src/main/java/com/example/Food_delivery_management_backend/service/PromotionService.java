package com.example.Food_delivery_management_backend.service;

import com.example.Food_delivery_management_backend.dto.PromotionRequest;
import com.example.Food_delivery_management_backend.entity.Promotion;
import com.example.Food_delivery_management_backend.entity.Restaurant;
import com.example.Food_delivery_management_backend.repository.PromotionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PromotionService {

    private final PromotionRepository promotionRepository;
    private final RestaurantService restaurantService;

    public PromotionService(PromotionRepository promotionRepository, RestaurantService restaurantService) {
        this.promotionRepository = promotionRepository;
        this.restaurantService = restaurantService;
    }

    @Transactional(readOnly = true)
    public List<Promotion> getAllByRestaurant(Long restaurantId) {
        return promotionRepository.findByRestaurantIdOrderByCreatedAtDesc(restaurantId);
    }

    @Transactional(readOnly = true)
    public List<Promotion> getActiveByRestaurant(Long restaurantId) {
        return promotionRepository.findByRestaurantIdAndIsActiveTrueOrderByCreatedAtDesc(restaurantId);
    }

    @Transactional
    public Promotion create(PromotionRequest request) {
        Restaurant restaurant = restaurantService.findById(request.getRestaurantId());
        Promotion promotion = new Promotion();
        promotion.setRestaurant(restaurant);
        promotion.setTitle(request.getTitle());
        promotion.setDescription(request.getDescription());
        promotion.setDiscountPercentage(request.getDiscountPercentage());
        promotion.setStartDate(request.getStartDate());
        promotion.setEndDate(request.getEndDate());
        promotion.setImageUrl(request.getImageUrl());
        promotion.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
        return promotionRepository.save(promotion);
    }

    @Transactional
    public Promotion update(Long id, PromotionRequest request) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Promozione non trovata con ID: " + id));
        if (request.getTitle() != null) promotion.setTitle(request.getTitle());
        if (request.getDescription() != null) promotion.setDescription(request.getDescription());
        if (request.getDiscountPercentage() != null) promotion.setDiscountPercentage(request.getDiscountPercentage());
        if (request.getStartDate() != null) promotion.setStartDate(request.getStartDate());
        if (request.getEndDate() != null) promotion.setEndDate(request.getEndDate());
        if (request.getImageUrl() != null) promotion.setImageUrl(request.getImageUrl());
        if (request.getIsActive() != null) promotion.setIsActive(request.getIsActive());
        return promotionRepository.save(promotion);
    }

    @Transactional
    public void delete(Long id) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Promozione non trovata con ID: " + id));
        promotionRepository.delete(promotion);
    }
}
