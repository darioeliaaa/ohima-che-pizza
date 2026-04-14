package com.example.Food_delivery_management_backend.service;

import com.example.Food_delivery_management_backend.entity.MenuCategory;
import com.example.Food_delivery_management_backend.entity.MenuSection;
import com.example.Food_delivery_management_backend.entity.Restaurant;
import com.example.Food_delivery_management_backend.repository.MenuCategoryRepository;
import com.example.Food_delivery_management_backend.repository.MenuSectionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MenuCategoryService {

    private final MenuCategoryRepository menuCategoryRepository;
    private final MenuSectionRepository menuSectionRepository;
    private final RestaurantService restaurantService;

    public MenuCategoryService(MenuCategoryRepository menuCategoryRepository, MenuSectionRepository menuSectionRepository, RestaurantService restaurantService) {
        this.menuCategoryRepository = menuCategoryRepository;
        this.menuSectionRepository = menuSectionRepository;
        this.restaurantService = restaurantService;
    }

    @Transactional(readOnly = true)
    public List<MenuCategory> getByRestaurant(Long restaurantId) {
        return menuCategoryRepository.findByRestaurantIdOrderByDisplayOrderAsc(restaurantId);
    }

    @Transactional
    public MenuCategory create(Long restaurantId, String name, String description, String imageUrl, String videoUrl, Integer displayOrder, Long sectionId) {
        Restaurant restaurant = restaurantService.findById(restaurantId);
        MenuCategory cat = new MenuCategory();
        cat.setRestaurant(restaurant);
        cat.setName(name);
        cat.setDescription(description);
        cat.setImageUrl(imageUrl);
        cat.setVideoUrl(videoUrl);
        cat.setDisplayOrder(displayOrder != null ? displayOrder : 0);
        if (sectionId != null) {
            MenuSection section = menuSectionRepository.findById(sectionId)
                    .orElseThrow(() -> new RuntimeException("Sezione non trovata con ID: " + sectionId));
            cat.setSection(section);
        }
        return menuCategoryRepository.save(cat);
    }

    @Transactional
    public MenuCategory update(Long id, String name, String description, String imageUrl, String videoUrl, Integer displayOrder, Long sectionId) {
        MenuCategory cat = menuCategoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoria non trovata con ID: " + id));
        cat.setName(name);
        cat.setDescription(description);
        cat.setImageUrl(imageUrl);
        cat.setVideoUrl(videoUrl);
        if (displayOrder != null) cat.setDisplayOrder(displayOrder);
        if (sectionId != null) {
            MenuSection section = menuSectionRepository.findById(sectionId)
                    .orElseThrow(() -> new RuntimeException("Sezione non trovata con ID: " + sectionId));
            cat.setSection(section);
        } else {
            cat.setSection(null);
        }
        return menuCategoryRepository.save(cat);
    }

    @Transactional
    public void delete(Long id) {
        MenuCategory cat = menuCategoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoria non trovata con ID: " + id));
        menuCategoryRepository.delete(cat);
    }
}
