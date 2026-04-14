package com.example.Food_delivery_management_backend.service;

import com.example.Food_delivery_management_backend.entity.Restaurant;
import com.example.Food_delivery_management_backend.entity.User;
import com.example.Food_delivery_management_backend.entity.UserRole;
import com.example.Food_delivery_management_backend.repository.RestaurantRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class RestaurantService {
    private final RestaurantRepository restaurantRepository;
    private final UserService userService;


    public RestaurantService(RestaurantRepository restaurantRepository, UserService userService) {
        this.restaurantRepository = restaurantRepository;
        this.userService = userService;
    }

    @Transactional
    public Restaurant registerRestaurant(String email, String password, String phoneNumber,
                                         String restaurantName, String address, String zipCode,
                                         String cuisineType, String ownerPhone) {
        User user = userService.createUser(email, password, phoneNumber, UserRole.OWNER);

        Restaurant restaurant = new Restaurant();
        restaurant.setUser(user);
        restaurant.setRestaurantName(restaurantName);
        restaurant.setAddress(address);
        restaurant.setZipCode(zipCode);
        restaurant.setCuisineType(cuisineType);
        restaurant.setOwnerPhone(ownerPhone);
        restaurant.setIsActive(true);

        return restaurantRepository.save(restaurant);
    }

    @Transactional(readOnly = true)
    public List<Restaurant> searchByZipCode(String zipCode) {
        return restaurantRepository.findByZipCode(zipCode);
    }

    @Transactional(readOnly = true)
    public List<Restaurant> getActiveRestaurants() {
        return restaurantRepository.findByIsActive(true);
    }

    @Transactional(readOnly = true)
    public Restaurant findById(Long id) {
        return restaurantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Restaurant not found with ID: " + id));
    }

    @Transactional(readOnly = true)
    public Restaurant findByUserId(Long userId) {
        return restaurantRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Restaurant not found for user ID: " + userId));
    }

    @Transactional
    public Restaurant save(Restaurant restaurant) {
        return restaurantRepository.save(restaurant);
    }
}
