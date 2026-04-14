package com.example.Food_delivery_management_backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "restaurants")
public class Restaurant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Version
    private Long version;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "restaurant_name", nullable = false, length = 200)
    private String restaurantName;

    @Column(nullable = false, length = 500)
    private String address;

    @Column(name = "zip_code", nullable = false, length = 10)
    private String zipCode;

    @Column(name = "cuisine_type", length = 100)
    private String cuisineType;

    @Column(name = "owner_phone", length = 20)
    private String ownerPhone;

    @Column(name = "whatsapp_number", length = 20)
    private String whatsappNumber;

    @Column(name = "contact_email", length = 200)
    private String contactEmail;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    @Column(name = "promotions_enabled", nullable = false)
    private Boolean promotionsEnabled = false;

    public Restaurant() {
    }

    public Restaurant(Long id, User user, String restaurantName, String address, String zipCode, String cuisineType, String ownerPhone, Boolean isActive) {
        this.id = id;
        this.user = user;
        this.restaurantName = restaurantName;
        this.address = address;
        this.zipCode = zipCode;
        this.cuisineType = cuisineType;
        this.ownerPhone = ownerPhone;
        this.isActive = isActive;
    }

    public String getOwnerPhone() {
        return ownerPhone;
    }

    public void setOwnerPhone(String ownerPhone) {
        this.ownerPhone = ownerPhone;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getRestaurantName() {
        return restaurantName;
    }

    public void setRestaurantName(String restaurantName) {
        this.restaurantName = restaurantName;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getZipCode() {
        return zipCode;
    }

    public void setZipCode(String zipCode) {
        this.zipCode = zipCode;
    }

    public String getCuisineType() {
        return cuisineType;
    }

    public void setCuisineType(String cuisineType) {
        this.cuisineType = cuisineType;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean active) {
        isActive = active;
    }

    public String getContactEmail() {
        return contactEmail;
    }

    public void setContactEmail(String contactEmail) {
        this.contactEmail = contactEmail;
    }

    public String getWhatsappNumber() {
        return whatsappNumber;
    }

    public void setWhatsappNumber(String whatsappNumber) {
        this.whatsappNumber = whatsappNumber;
    }

    public Boolean getPromotionsEnabled() {
        return promotionsEnabled;
    }

    public void setPromotionsEnabled(Boolean promotionsEnabled) {
        this.promotionsEnabled = promotionsEnabled;
    }

}
