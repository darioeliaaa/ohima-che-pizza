package com.example.Food_delivery_management_backend.service;

import com.example.Food_delivery_management_backend.entity.Product;
import com.example.Food_delivery_management_backend.entity.Restaurant;
import com.example.Food_delivery_management_backend.repository.ProductRepository;
import com.example.Food_delivery_management_backend.repository.RestaurantRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final RestaurantRepository restaurantRepository;

    public ProductService(ProductRepository productRepository, RestaurantRepository restaurantRepository) {
        this.productRepository = productRepository;
        this.restaurantRepository = restaurantRepository;
    }

    public List<Product> getByRestaurant(Long restaurantId) {
        return productRepository.findByRestaurantIdOrderByProductNameAsc(restaurantId);
    }

    public List<Product> getAvailableByRestaurant(Long restaurantId) {
        return productRepository.findByRestaurantIdAndIsAvailableTrueOrderByProductNameAsc(restaurantId);
    }

    public Product create(Long restaurantId, String productName, String description,
                          java.math.BigDecimal price, String category, String brand,
                          String imageUrl) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Attività non trovata"));
        Product product = new Product();
        product.setRestaurant(restaurant);
        product.setProductName(productName);
        product.setDescription(description);
        product.setPrice(price);
        product.setCategory(category);
        product.setBrand(brand);
        product.setImageUrl(imageUrl);
        product.setIsAvailable(true);
        return productRepository.save(product);
    }

    public Product toggleAvailability(Long productId, boolean isAvailable) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Prodotto non trovato"));
        product.setIsAvailable(isAvailable);
        return productRepository.save(product);
    }

    public void delete(Long productId) {
        if (!productRepository.existsById(productId)) {
            throw new RuntimeException("Prodotto non trovato");
        }
        productRepository.deleteById(productId);
    }
}
