package com.example.Food_delivery_management_backend.service;

import com.example.Food_delivery_management_backend.entity.ProductCategory;
import com.example.Food_delivery_management_backend.entity.Restaurant;
import com.example.Food_delivery_management_backend.repository.ProductCategoryRepository;
import com.example.Food_delivery_management_backend.repository.RestaurantRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductCategoryService {

    private final ProductCategoryRepository categoryRepository;
    private final RestaurantRepository restaurantRepository;

    public ProductCategoryService(ProductCategoryRepository categoryRepository,
                                  RestaurantRepository restaurantRepository) {
        this.categoryRepository = categoryRepository;
        this.restaurantRepository = restaurantRepository;
    }

    public List<ProductCategory> getByRestaurant(Long restaurantId) {
        return categoryRepository.findByRestaurantIdOrderByDisplayOrderAscNameAsc(restaurantId);
    }

    public ProductCategory create(Long restaurantId, String name, String description,
                                  String imageUrl, Integer displayOrder) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Attività non trovata"));
        ProductCategory category = new ProductCategory();
        category.setRestaurant(restaurant);
        category.setName(name);
        category.setDescription(description);
        category.setImageUrl(imageUrl);
        category.setDisplayOrder(displayOrder != null ? displayOrder : 0);
        return categoryRepository.save(category);
    }

    public ProductCategory update(Long categoryId, String name, String description,
                                  String imageUrl, Integer displayOrder) {
        ProductCategory category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Categoria non trovata"));
        if (name != null) category.setName(name);
        if (description != null) category.setDescription(description);
        if (imageUrl != null) category.setImageUrl(imageUrl);
        if (displayOrder != null) category.setDisplayOrder(displayOrder);
        return categoryRepository.save(category);
    }

    public void delete(Long categoryId) {
        if (!categoryRepository.existsById(categoryId)) {
            throw new RuntimeException("Categoria non trovata");
        }
        categoryRepository.deleteById(categoryId);
    }
}
