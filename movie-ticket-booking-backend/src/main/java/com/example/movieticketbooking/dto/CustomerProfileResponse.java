package com.example.movieticketbooking.dto;

public class CustomerProfileResponse {

    private Integer customerId;
    private String name;
    private String email;
    private String phone;
    private String username;
    private int totalBookings;
    private int totalTickets;
    private boolean active;

    public CustomerProfileResponse() {
    }

    public CustomerProfileResponse(Integer customerId, String name, String email, String phone, String username, int totalBookings, int totalTickets) {
        this(customerId, name, email, phone, username, totalBookings, totalTickets, true);
    }

    public CustomerProfileResponse(Integer customerId, String name, String email, String phone, String username, int totalBookings, int totalTickets, boolean active) {
        this.customerId = customerId;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.username = username;
        this.totalBookings = totalBookings;
        this.totalTickets = totalTickets;
        this.active = active;
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

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public int getTotalBookings() {
        return totalBookings;
    }

    public void setTotalBookings(int totalBookings) {
        this.totalBookings = totalBookings;
    }

    public int getTotalTickets() {
        return totalTickets;
    }

    public void setTotalTickets(int totalTickets) {
        this.totalTickets = totalTickets;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
