package com.example.Food_delivery_management_backend.controller;

import com.example.Food_delivery_management_backend.dto.RestaurantRegistrationRequest;
import com.example.Food_delivery_management_backend.entity.Restaurant;
import com.example.Food_delivery_management_backend.service.RestaurantService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/restaurants")
public class RestaurantController {
    private final RestaurantService restaurantService;

    public RestaurantController(RestaurantService restaurantService) {
        this.restaurantService = restaurantService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerRestaurant(@RequestBody RestaurantRegistrationRequest request) {
        try {
            Restaurant restaurant = restaurantService.registerRestaurant(
                    request.getEmail(),
                    request.getPassword(),
                    request.getPhoneNumber(),
                    request.getRestaurantName(),
                    request.getAddress(),
                    request.getZipCode(),
                    request.getCuisineType(),
                    request.getOwnerPhone()
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(restaurant);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Registration failed: " + e.getMessage());
        }
    }
    @GetMapping("/search")
    public ResponseEntity<List<Restaurant>> searchRestaurants(@RequestParam String zipCode) {
        List<Restaurant> restaurants = restaurantService.searchByZipCode(zipCode);
        return ResponseEntity.ok(restaurants);
    }

    @GetMapping
    public ResponseEntity<List<Restaurant>> getAllActiveRestaurants() {
        List<Restaurant> restaurants = restaurantService.getActiveRestaurants();
        return ResponseEntity.ok(restaurants);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getRestaurantById(@PathVariable Long id) {
        try {
            Restaurant restaurant = restaurantService.findById(id);
            return ResponseEntity.ok(restaurant);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Restaurant not found: " + e.getMessage());
        }
    }

    @GetMapping("/{id}/contacts")
    public ResponseEntity<?> getRestaurantContacts(@PathVariable Long id) {
        try {
            Restaurant restaurant = restaurantService.findById(id);
            return ResponseEntity.ok(Map.of(
                    "ownerPhone", restaurant.getOwnerPhone() != null ? restaurant.getOwnerPhone() : "",
                    "contactEmail", restaurant.getContactEmail() != null ? restaurant.getContactEmail() : "",
                    "address", restaurant.getAddress() != null ? restaurant.getAddress() : "",
                    "restaurantName", restaurant.getRestaurantName() != null ? restaurant.getRestaurantName() : "",
                    "whatsappNumber", restaurant.getWhatsappNumber() != null ? restaurant.getWhatsappNumber() : ""
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PreAuthorize("hasAnyRole('ADMIN','OWNER')")
    @PutMapping("/{id}/contacts")
    public ResponseEntity<?> updateRestaurantContacts(@PathVariable Long id, @RequestBody Map<String, String> contacts) {
        try {
            Restaurant restaurant = restaurantService.findById(id);
            if (contacts.containsKey("ownerPhone")) restaurant.setOwnerPhone(contacts.get("ownerPhone"));
            if (contacts.containsKey("contactEmail")) restaurant.setContactEmail(contacts.get("contactEmail"));
            if (contacts.containsKey("address")) restaurant.setAddress(contacts.get("address"));
            if (contacts.containsKey("whatsappNumber")) restaurant.setWhatsappNumber(contacts.get("whatsappNumber"));
            Restaurant updated = restaurantService.save(restaurant);
            return ResponseEntity.ok(Map.of(
                    "ownerPhone", updated.getOwnerPhone() != null ? updated.getOwnerPhone() : "",
                    "contactEmail", updated.getContactEmail() != null ? updated.getContactEmail() : "",
                    "address", updated.getAddress() != null ? updated.getAddress() : "",
                    "restaurantName", updated.getRestaurantName() != null ? updated.getRestaurantName() : "",
                    "whatsappNumber", updated.getWhatsappNumber() != null ? updated.getWhatsappNumber() : ""
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @GetMapping("/{id}/features")
    public ResponseEntity<?> getFeatureFlags(@PathVariable Long id) {
        try {
            Restaurant restaurant = restaurantService.findById(id);
            return ResponseEntity.ok(Map.of(
                    "promotionsEnabled", restaurant.getPromotionsEnabled() != null ? restaurant.getPromotionsEnabled() : false
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PreAuthorize("hasAnyRole('ADMIN','OWNER')")
    @PutMapping("/{id}/features")
    public ResponseEntity<?> updateFeatureFlags(@PathVariable Long id, @RequestBody Map<String, Object> flags) {
        try {
            Restaurant restaurant = restaurantService.findById(id);
            if (flags.containsKey("promotionsEnabled")) {
                restaurant.setPromotionsEnabled((Boolean) flags.get("promotionsEnabled"));
            }
            Restaurant updated = restaurantService.save(restaurant);
            return ResponseEntity.ok(Map.of(
                    "promotionsEnabled", updated.getPromotionsEnabled() != null ? updated.getPromotionsEnabled() : false
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}

