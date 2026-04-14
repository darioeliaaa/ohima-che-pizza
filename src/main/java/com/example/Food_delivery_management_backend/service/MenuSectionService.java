package com.example.Food_delivery_management_backend.service;

import com.example.Food_delivery_management_backend.entity.MenuSection;
import com.example.Food_delivery_management_backend.entity.Restaurant;
import com.example.Food_delivery_management_backend.repository.MenuSectionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MenuSectionService {

    private final MenuSectionRepository menuSectionRepository;
    private final RestaurantService restaurantService;

    public MenuSectionService(MenuSectionRepository menuSectionRepository, RestaurantService restaurantService) {
        this.menuSectionRepository = menuSectionRepository;
        this.restaurantService = restaurantService;
    }

    @Transactional(readOnly = true)
    public List<MenuSection> getByRestaurant(Long restaurantId) {
        return menuSectionRepository.findByRestaurantIdOrderByDisplayOrderAsc(restaurantId);
    }

    @Transactional(readOnly = true)
    public MenuSection findById(Long id) {
        return menuSectionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sezione non trovata con ID: " + id));
    }

    @Transactional
    public MenuSection create(Long restaurantId, String name, String description, String icon, Integer displayOrder) {
        Restaurant restaurant = restaurantService.findById(restaurantId);
        MenuSection section = new MenuSection();
        section.setRestaurant(restaurant);
        section.setName(name);
        section.setDescription(description);
        section.setIcon(icon);
        section.setDisplayOrder(displayOrder != null ? displayOrder : 0);
        return menuSectionRepository.save(section);
    }

    @Transactional
    public MenuSection update(Long id, String name, String description, String icon, Integer displayOrder) {
        MenuSection section = findById(id);
        section.setName(name);
        section.setDescription(description);
        section.setIcon(icon);
        if (displayOrder != null) section.setDisplayOrder(displayOrder);
        return menuSectionRepository.save(section);
    }

    @Transactional
    public void delete(Long id) {
        MenuSection section = findById(id);
        menuSectionRepository.delete(section);
    }
}
