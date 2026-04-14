package com.example.Food_delivery_management_backend.service;

import com.example.Food_delivery_management_backend.entity.AboutContent;
import com.example.Food_delivery_management_backend.entity.AboutGalleryItem;
import com.example.Food_delivery_management_backend.entity.Restaurant;
import com.example.Food_delivery_management_backend.repository.AboutContentRepository;
import com.example.Food_delivery_management_backend.repository.AboutGalleryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class AboutService {

    private final AboutContentRepository contentRepo;
    private final AboutGalleryRepository galleryRepo;
    private final RestaurantService restaurantService;

    public AboutService(AboutContentRepository contentRepo, AboutGalleryRepository galleryRepo, RestaurantService restaurantService) {
        this.contentRepo = contentRepo;
        this.galleryRepo = galleryRepo;
        this.restaurantService = restaurantService;
    }

    /* ===== CONTENT ===== */

    @Transactional(readOnly = true)
    public AboutContent getContent(Long restaurantId) {
        return contentRepo.findByRestaurantId(restaurantId).orElse(null);
    }

    @Transactional
    public AboutContent saveContent(Long restaurantId, Map<String, String> data) {
        Restaurant restaurant = restaurantService.findById(restaurantId);
        AboutContent c = contentRepo.findByRestaurantId(restaurantId).orElseGet(() -> {
            AboutContent n = new AboutContent();
            n.setRestaurant(restaurant);
            return n;
        });
        if (data.containsKey("heroImageUrl")) c.setHeroImageUrl(data.get("heroImageUrl"));
        if (data.containsKey("heroTitle")) c.setHeroTitle(data.get("heroTitle"));
        if (data.containsKey("heroSubtitle")) c.setHeroSubtitle(data.get("heroSubtitle"));
        if (data.containsKey("storyLabel")) c.setStoryLabel(data.get("storyLabel"));
        if (data.containsKey("storyTitle")) c.setStoryTitle(data.get("storyTitle"));
        if (data.containsKey("storyText")) c.setStoryText(data.get("storyText"));
        if (data.containsKey("storyImageUrl")) c.setStoryImageUrl(data.get("storyImageUrl"));
        if (data.containsKey("storyImageCaption")) c.setStoryImageCaption(data.get("storyImageCaption"));
        if (data.containsKey("storyImageSubcaption")) c.setStoryImageSubcaption(data.get("storyImageSubcaption"));
        if (data.containsKey("locationText")) c.setLocationText(data.get("locationText"));
        return contentRepo.save(c);
    }

    /* ===== GALLERY ===== */

    @Transactional(readOnly = true)
    public List<AboutGalleryItem> getGallery(Long restaurantId) {
        return galleryRepo.findByRestaurantIdOrderByDisplayOrderAsc(restaurantId);
    }

    @Transactional
    public AboutGalleryItem addGalleryItem(Long restaurantId, String imageUrl, String caption, String category, Integer displayOrder) {
        Restaurant restaurant = restaurantService.findById(restaurantId);
        AboutGalleryItem item = new AboutGalleryItem();
        item.setRestaurant(restaurant);
        item.setImageUrl(imageUrl);
        item.setCaption(caption);
        item.setCategory(category);
        item.setDisplayOrder(displayOrder != null ? displayOrder : 0);
        return galleryRepo.save(item);
    }

    @Transactional
    public AboutGalleryItem updateGalleryItem(Long id, String imageUrl, String caption, String category, Integer displayOrder) {
        AboutGalleryItem item = galleryRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Foto non trovata con ID: " + id));
        if (imageUrl != null) item.setImageUrl(imageUrl);
        if (caption != null) item.setCaption(caption);
        if (category != null) item.setCategory(category);
        if (displayOrder != null) item.setDisplayOrder(displayOrder);
        return galleryRepo.save(item);
    }

    @Transactional
    public void deleteGalleryItem(Long id) {
        AboutGalleryItem item = galleryRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Foto non trovata con ID: " + id));
        galleryRepo.delete(item);
    }
}
