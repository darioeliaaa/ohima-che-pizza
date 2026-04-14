package com.example.Food_delivery_management_backend.dto;

public class LoginResponse {
    private String token;
    private String email;
    private String role;
    private Long userId;
    private Long restaurantId;

    public LoginResponse(String token, String email, String role, Long userId, Long restaurantId) {
        this.token = token;
        this.email = email;
        this.role = role;
        this.userId = userId;
        this.restaurantId = restaurantId;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getRestaurantId() {
        return restaurantId;
    }

    public void setRestaurantId(Long restaurantId) {
        this.restaurantId = restaurantId;
    }
}
