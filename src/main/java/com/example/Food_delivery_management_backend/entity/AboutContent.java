package com.example.Food_delivery_management_backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "about_content")
public class AboutContent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Version
    private Long version;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    @Column(name = "hero_image_url", length = 500)
    private String heroImageUrl;

    @Column(name = "hero_title", length = 200)
    private String heroTitle;

    @Column(name = "hero_subtitle", length = 500)
    private String heroSubtitle;

    @Column(name = "story_label", length = 100)
    private String storyLabel;

    @Column(name = "story_title", length = 200)
    private String storyTitle;

    @Column(name = "story_text", columnDefinition = "TEXT")
    private String storyText;

    @Column(name = "story_image_url", length = 500)
    private String storyImageUrl;

    @Column(name = "story_image_caption", length = 200)
    private String storyImageCaption;

    @Column(name = "story_image_subcaption", length = 200)
    private String storyImageSubcaption;

    @Column(name = "location_text", length = 500)
    private String locationText;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public AboutContent() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Restaurant getRestaurant() { return restaurant; }
    public void setRestaurant(Restaurant restaurant) { this.restaurant = restaurant; }
    public String getHeroImageUrl() { return heroImageUrl; }
    public void setHeroImageUrl(String heroImageUrl) { this.heroImageUrl = heroImageUrl; }
    public String getHeroTitle() { return heroTitle; }
    public void setHeroTitle(String heroTitle) { this.heroTitle = heroTitle; }
    public String getHeroSubtitle() { return heroSubtitle; }
    public void setHeroSubtitle(String heroSubtitle) { this.heroSubtitle = heroSubtitle; }
    public String getStoryLabel() { return storyLabel; }
    public void setStoryLabel(String storyLabel) { this.storyLabel = storyLabel; }
    public String getStoryTitle() { return storyTitle; }
    public void setStoryTitle(String storyTitle) { this.storyTitle = storyTitle; }
    public String getStoryText() { return storyText; }
    public void setStoryText(String storyText) { this.storyText = storyText; }
    public String getStoryImageUrl() { return storyImageUrl; }
    public void setStoryImageUrl(String storyImageUrl) { this.storyImageUrl = storyImageUrl; }
    public String getStoryImageCaption() { return storyImageCaption; }
    public void setStoryImageCaption(String storyImageCaption) { this.storyImageCaption = storyImageCaption; }
    public String getStoryImageSubcaption() { return storyImageSubcaption; }
    public void setStoryImageSubcaption(String storyImageSubcaption) { this.storyImageSubcaption = storyImageSubcaption; }
    public String getLocationText() { return locationText; }
    public void setLocationText(String locationText) { this.locationText = locationText; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
