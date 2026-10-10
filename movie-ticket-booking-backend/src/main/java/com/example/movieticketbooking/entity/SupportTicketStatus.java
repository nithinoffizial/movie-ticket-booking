package com.example.movieticketbooking.entity;

public enum SupportTicketStatus {
    OPEN("Open"),
    IN_PROGRESS("In Progress"),
    WAITING_FOR_CUSTOMER("Waiting for Customer"),
    RESOLVED("Resolved"),
    CLOSED("Closed");

    private final String displayName;

    SupportTicketStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
