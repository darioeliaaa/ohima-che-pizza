package com.example.Food_delivery_management_backend.controller;

import com.example.Food_delivery_management_backend.entity.ProductCategory;
import com.example.Food_delivery_management_backend.service.ProductCategoryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/product-categories")
public class ProductCategoryController {

    private final ProductCategoryService categoryService;

    public ProductCategoryController(ProductCategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<List<ProductCategory>> getByRestaurant(@PathVariable Long restaurantId) {
        return ResponseEntity.ok(categoryService.getByRestaurant(restaurantId));
    }

    @PreAuthorize("hasAnyRole('ADMIN','OWNER')")
    @PostMapping("/{restaurantId}")
    public ResponseEntity<?> create(@PathVariable Long restaurantId, @RequestBody Map<String, Object> body) {
        try {
            String name = (String) body.get("name");
            String description = (String) body.getOrDefault("description", null);
            String imageUrl = (String) body.getOrDefault("imageUrl", null);
            Integer displayOrder = body.containsKey("displayOrder") ? Integer.valueOf(body.get("displayOrder").toString()) : 0;

            ProductCategory category = categoryService.create(restaurantId, name, description, imageUrl, displayOrder);
            return ResponseEntity.status(HttpStatus.CREATED).body(category);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PreAuthorize("hasAnyRole('ADMIN','OWNER')")
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        try {
            String name = (String) body.getOrDefault("name", null);
            String description = (String) body.getOrDefault("description", null);
            String imageUrl = (String) body.getOrDefault("imageUrl", null);
            Integer displayOrder = body.containsKey("displayOrder") ? Integer.valueOf(body.get("displayOrder").toString()) : null;

            ProductCategory category = categoryService.update(id, name, description, imageUrl, displayOrder);
            return ResponseEntity.ok(category);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PreAuthorize("hasAnyRole('ADMIN','OWNER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            categoryService.delete(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
