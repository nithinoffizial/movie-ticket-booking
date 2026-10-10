package com.example.movieticketbooking.dto;

public class LoginResponse {

    private String token;
    private Integer userId;
    private String username;
    private String role;
    private Integer customerId;
    private String name;

    public LoginResponse() {
    }

    public LoginResponse(String token, Integer userId, String username, String role, Integer customerId, String name) {
        this.token = token;
        this.userId = userId;
        this.username = username;
        this.role = role;
        this.customerId = customerId;
        this.name = name;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Integer getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Integer customerId) {
        this.customerId = customerId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
