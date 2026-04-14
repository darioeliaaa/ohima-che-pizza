package com.example.Food_delivery_management_backend.controller;

import com.example.Food_delivery_management_backend.dto.MenuItemRequest;
import com.example.Food_delivery_management_backend.entity.MenuItem;
import com.example.Food_delivery_management_backend.service.MenuItemService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@RestController
@RequestMapping("/api/menu-items")
public class MenuItemController {

    private final MenuItemService menuItemService;

    public MenuItemController(MenuItemService menuItemService) {
        this.menuItemService = menuItemService;
    }

    @PreAuthorize("hasAnyRole('ADMIN','OWNER')")
    @PostMapping
    public ResponseEntity<?> addMenuItem(@Valid @RequestBody MenuItemRequest request) {
        try {
            MenuItem menuItem = menuItemService.addMenuItem(
                    request.getRestaurantId(),
                    request.getItemName(),
                    request.getDescription(),
                    request.getPrice(),
                    request.getCategory(),
                    request.getItemType(),
                    request.getImageUrl(),
                    request.getPreparationTime()
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(menuItem);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Failed to add menu item: " + e.getMessage());
        }
    }

    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<List<MenuItem>> getMenuByRestaurant(@PathVariable Long restaurantId) {
        List<MenuItem> menuItems = menuItemService.getAvailableMenuByRestaurant(restaurantId);
        return ResponseEntity.ok(menuItems);
    }

    @PreAuthorize("hasAnyRole('ADMIN','OWNER')")
    @PatchMapping("/{id}/availability")
    public ResponseEntity<?> updateAvailability(@PathVariable Long id, @RequestParam Boolean isAvailable) {
        try {
            MenuItem menuItem = menuItemService.updateAvailability(id, isAvailable);
            return ResponseEntity.ok(menuItem);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Menu item not found: " + e.getMessage());
        }
    }
}
