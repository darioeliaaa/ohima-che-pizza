package com.example.Food_delivery_management_backend.controller;

import com.example.Food_delivery_management_backend.entity.MenuCategory;
import com.example.Food_delivery_management_backend.service.MenuCategoryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/menu-categories")
public class MenuCategoryController {

    private final MenuCategoryService menuCategoryService;

    public MenuCategoryController(MenuCategoryService menuCategoryService) {
        this.menuCategoryService = menuCategoryService;
    }

    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<List<MenuCategory>> getByRestaurant(@PathVariable Long restaurantId) {
        return ResponseEntity.ok(menuCategoryService.getByRestaurant(restaurantId));
    }

    @PreAuthorize("hasAnyRole('ADMIN','OWNER')")
    @PostMapping("/{restaurantId}")
    public ResponseEntity<?> create(@PathVariable Long restaurantId, @RequestBody Map<String, Object> body) {
        try {
            String name = (String) body.get("name");
            String description = (String) body.get("description");
            String imageUrl = (String) body.get("imageUrl");
            String videoUrl = (String) body.get("videoUrl");
            Integer displayOrder = body.get("displayOrder") != null ? ((Number) body.get("displayOrder")).intValue() : 0;
            Long sectionId = body.get("sectionId") != null ? ((Number) body.get("sectionId")).longValue() : null;
            MenuCategory cat = menuCategoryService.create(restaurantId, name, description, imageUrl, videoUrl, displayOrder, sectionId);
            return ResponseEntity.status(HttpStatus.CREATED).body(cat);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PreAuthorize("hasAnyRole('ADMIN','OWNER')")
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        try {
            String name = (String) body.get("name");
            String description = (String) body.get("description");
            String imageUrl = (String) body.get("imageUrl");
            String videoUrl = (String) body.get("videoUrl");
            Integer displayOrder = body.get("displayOrder") != null ? ((Number) body.get("displayOrder")).intValue() : null;
            Long sectionId = body.get("sectionId") != null ? ((Number) body.get("sectionId")).longValue() : null;
            MenuCategory cat = menuCategoryService.update(id, name, description, imageUrl, videoUrl, displayOrder, sectionId);
            return ResponseEntity.ok(cat);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PreAuthorize("hasAnyRole('ADMIN','OWNER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            menuCategoryService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}
