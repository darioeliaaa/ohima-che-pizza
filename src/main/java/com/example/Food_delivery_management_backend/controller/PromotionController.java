package com.example.Food_delivery_management_backend.controller;

import com.example.Food_delivery_management_backend.dto.PromotionRequest;
import com.example.Food_delivery_management_backend.entity.Promotion;
import com.example.Food_delivery_management_backend.service.PromotionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/promotions")
public class PromotionController {

    private final PromotionService promotionService;

    public PromotionController(PromotionService promotionService) {
        this.promotionService = promotionService;
    }

    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<List<Promotion>> getAllByRestaurant(@PathVariable Long restaurantId) {
        return ResponseEntity.ok(promotionService.getAllByRestaurant(restaurantId));
    }

    @GetMapping("/active/{restaurantId}")
    public ResponseEntity<List<Promotion>> getActiveByRestaurant(@PathVariable Long restaurantId) {
        return ResponseEntity.ok(promotionService.getActiveByRestaurant(restaurantId));
    }

    @PreAuthorize("hasAnyRole('ADMIN','OWNER')")
    @PostMapping
    public ResponseEntity<?> create(@RequestBody PromotionRequest request) {
        try {
            Promotion promotion = promotionService.create(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(promotion);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PreAuthorize("hasAnyRole('ADMIN','OWNER')")
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody PromotionRequest request) {
        try {
            Promotion promotion = promotionService.update(id, request);
            return ResponseEntity.ok(promotion);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PreAuthorize("hasAnyRole('ADMIN','OWNER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            promotionService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}
