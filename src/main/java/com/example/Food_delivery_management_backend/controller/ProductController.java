package com.example.Food_delivery_management_backend.controller;

import com.example.Food_delivery_management_backend.entity.Product;
import com.example.Food_delivery_management_backend.service.ProductService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<List<Product>> getByRestaurant(@PathVariable Long restaurantId) {
        return ResponseEntity.ok(productService.getByRestaurant(restaurantId));
    }

    @PreAuthorize("hasAnyRole('ADMIN','OWNER')")
    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body) {
        try {
            Long restaurantId = Long.valueOf(body.get("restaurantId").toString());
            String productName = (String) body.get("productName");
            String description = (String) body.get("description");
            BigDecimal price = new BigDecimal(body.get("price").toString());
            String category = (String) body.get("category");
            String brand = (String) body.getOrDefault("brand", null);
            String imageUrl = (String) body.getOrDefault("imageUrl", null);

            Product product = productService.create(restaurantId, productName, description,
                    price, category, brand, imageUrl);
            return ResponseEntity.status(HttpStatus.CREATED).body(product);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PreAuthorize("hasAnyRole('ADMIN','OWNER')")
    @PatchMapping("/{id}/availability")
    public ResponseEntity<?> toggleAvailability(@PathVariable Long id,
                                                @RequestParam boolean isAvailable) {
        try {
            return ResponseEntity.ok(productService.toggleAvailability(id, isAvailable));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PreAuthorize("hasAnyRole('ADMIN','OWNER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            productService.delete(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
