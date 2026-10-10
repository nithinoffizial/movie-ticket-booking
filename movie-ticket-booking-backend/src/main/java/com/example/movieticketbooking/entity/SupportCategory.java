package com.example.movieticketbooking.entity;

public enum SupportCategory {
    BOOKING_ISSUE("Booking Issue"),
    PAYMENT_ISSUE("Payment Issue"),
    TICKET_ISSUE("Ticket Issue"),
    SEAT_SELECTION("Seat Selection"),
    CANCELLATION_REFUND("Cancellation & Refund"),
    ACCOUNT_ISSUE("Account Issue"),
    OTHER("Other");

    private final String displayName;

    SupportCategory(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
