package com.example.movieticketbooking.dto;

public class RegisterResponse {
    private String message;
    private String username;
    private Integer customerId;

    public RegisterResponse() {
    }

    public RegisterResponse(String message, String username, Integer customerId) {
        this.message = message;
        this.username = username;
        this.customerId = customerId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public Integer getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Integer customerId) {
        this.customerId = customerId;
    }
}
