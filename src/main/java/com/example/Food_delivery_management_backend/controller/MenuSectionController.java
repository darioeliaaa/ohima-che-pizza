package com.example.Food_delivery_management_backend.controller;

import com.example.Food_delivery_management_backend.entity.MenuSection;
import com.example.Food_delivery_management_backend.service.MenuSectionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/menu-sections")
public class MenuSectionController {

    private final MenuSectionService menuSectionService;

    public MenuSectionController(MenuSectionService menuSectionService) {
        this.menuSectionService = menuSectionService;
    }

    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<List<MenuSection>> getByRestaurant(@PathVariable Long restaurantId) {
        return ResponseEntity.ok(menuSectionService.getByRestaurant(restaurantId));
    }

    @PreAuthorize("hasAnyRole('ADMIN','OWNER')")
    @PostMapping("/{restaurantId}")
    public ResponseEntity<?> create(@PathVariable Long restaurantId, @RequestBody Map<String, Object> body) {
        try {
            String name = (String) body.get("name");
            String description = (String) body.get("description");
            String icon = (String) body.get("icon");
            Integer displayOrder = body.get("displayOrder") != null ? ((Number) body.get("displayOrder")).intValue() : 0;
            MenuSection section = menuSectionService.create(restaurantId, name, description, icon, displayOrder);
            return ResponseEntity.status(HttpStatus.CREATED).body(section);
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
            String icon = (String) body.get("icon");
            Integer displayOrder = body.get("displayOrder") != null ? ((Number) body.get("displayOrder")).intValue() : null;
            MenuSection section = menuSectionService.update(id, name, description, icon, displayOrder);
            return ResponseEntity.ok(section);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PreAuthorize("hasAnyRole('ADMIN','OWNER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            menuSectionService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}
