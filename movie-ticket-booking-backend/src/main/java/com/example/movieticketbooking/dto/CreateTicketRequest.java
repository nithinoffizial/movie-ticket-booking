package com.example.movieticketbooking.dto;

import com.example.movieticketbooking.entity.SupportCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CreateTicketRequest {

    @NotNull(message = "Support category is required")
    private SupportCategory category;

    @NotBlank(message = "Subject cannot be blank")
    @Size(min = 3, max = 200, message = "Subject must be between 3 and 200 characters")
    private String subject;

    @NotBlank(message = "Message details cannot be blank")
    @Size(min = 5, max = 4000, message = "Message must be between 5 and 4000 characters")
    private String message;

    @Size(max = 50, message = "Booking reference cannot exceed 50 characters")
    private String bookingReference;

    public CreateTicketRequest() {
    }

    public CreateTicketRequest(SupportCategory category, String subject, String message, String bookingReference) {
        this.category = category;
        this.subject = subject;
        this.message = message;
        this.bookingReference = bookingReference;
    }

    public SupportCategory getCategory() {
        return category;
    }

    public void setCategory(SupportCategory category) {
        this.category = category;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getBookingReference() {
        return bookingReference;
    }

    public void setBookingReference(String bookingReference) {
        this.bookingReference = bookingReference;
    }
}
