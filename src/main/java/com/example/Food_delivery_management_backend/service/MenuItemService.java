package com.example.Food_delivery_management_backend.service;


import com.example.Food_delivery_management_backend.entity.MenuItem;
import com.example.Food_delivery_management_backend.entity.MenuItemType;
import com.example.Food_delivery_management_backend.entity.Restaurant;
import com.example.Food_delivery_management_backend.repository.MenuItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class MenuItemService {

    private final MenuItemRepository menuItemRepository;
    private final RestaurantService restaurantService;

    public MenuItemService(MenuItemRepository menuItemRepository, RestaurantService restaurantService) {
        this.menuItemRepository = menuItemRepository;
        this.restaurantService = restaurantService;
    }

    @Transactional
    public MenuItem addMenuItem(Long restaurantId, String itemName, String description,
                                BigDecimal price, String category, MenuItemType itemType,
                                String imageUrl, Integer preparationTime) {

        Restaurant restaurant = restaurantService.findById(restaurantId);

        MenuItem menuItem = new MenuItem();
        menuItem.setRestaurant(restaurant);
        menuItem.setItemName(itemName);
        menuItem.setDescription(description);
        menuItem.setPrice(price);
        menuItem.setCategory(category);
        menuItem.setItemType(itemType);
        menuItem.setImageUrl(imageUrl);
        menuItem.setPreparationTime(preparationTime);
        menuItem.setIsAvailable(true);

        return menuItemRepository.save(menuItem);
    }

    @Transactional(readOnly = true)
    public List<MenuItem> getMenuByRestaurant(Long restaurantId) {
        return menuItemRepository.findByRestaurantId(restaurantId);
    }

    @Transactional(readOnly = true)
    public List<MenuItem> getAvailableMenuByRestaurant(Long restaurantId) {
        return menuItemRepository.findByRestaurantIdAndIsAvailable(restaurantId, true);
    }

    @Transactional(readOnly = true)
    public MenuItem findById(Long id) {
        return menuItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu item not found with ID: " + id));
    }

    @Transactional
    public MenuItem updateAvailability(Long menuItemId, Boolean isAvailable) {
        MenuItem menuItem = findById(menuItemId);
        menuItem.setIsAvailable(isAvailable);
        return menuItemRepository.save(menuItem);
    }
}