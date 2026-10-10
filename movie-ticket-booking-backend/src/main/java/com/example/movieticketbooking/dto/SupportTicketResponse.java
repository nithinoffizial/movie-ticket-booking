package com.example.movieticketbooking.dto;

import com.example.movieticketbooking.entity.SupportCategory;
import com.example.movieticketbooking.entity.SupportTicketStatus;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class SupportTicketResponse {

    private Integer ticketId;
    private String ticketReference;
    private Integer customerId;
    private String customerName;
    private String customerEmail;
    private SupportCategory category;
    private String categoryDisplayName;
    private String subject;
    private String bookingReference;
    private SupportTicketStatus status;
    private String statusDisplayName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<TicketMessageResponse> messages = new ArrayList<>();
    private int messageCount;

    public SupportTicketResponse() {
    }

    public Integer getTicketId() {
        return ticketId;
    }

    public void setTicketId(Integer ticketId) {
        this.ticketId = ticketId;
    }

    public String getTicketReference() {
        return ticketReference;
    }

    public void setTicketReference(String ticketReference) {
        this.ticketReference = ticketReference;
    }

    public Integer getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Integer customerId) {
        this.customerId = customerId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }

    public void setCustomerEmail(String customerEmail) {
        this.customerEmail = customerEmail;
    }

    public SupportCategory getCategory() {
        return category;
    }

    public void setCategory(SupportCategory category) {
        this.category = category;
        this.categoryDisplayName = category != null ? category.getDisplayName() : null;
    }

    public String getCategoryDisplayName() {
        return categoryDisplayName;
    }

    public void setCategoryDisplayName(String categoryDisplayName) {
        this.categoryDisplayName = categoryDisplayName;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getBookingReference() {
        return bookingReference;
    }

    public void setBookingReference(String bookingReference) {
        this.bookingReference = bookingReference;
    }

    public SupportTicketStatus getStatus() {
        return status;
    }

    public void setStatus(SupportTicketStatus status) {
        this.status = status;
        this.statusDisplayName = status != null ? status.getDisplayName() : null;
    }

    public String getStatusDisplayName() {
        return statusDisplayName;
    }

    public void setStatusDisplayName(String statusDisplayName) {
        this.statusDisplayName = statusDisplayName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<TicketMessageResponse> getMessages() {
        return messages;
    }

    public void setMessages(List<TicketMessageResponse> messages) {
        this.messages = messages;
        this.messageCount = messages != null ? messages.size() : 0;
    }

    public int getMessageCount() {
        return messageCount;
    }

    public void setMessageCount(int messageCount) {
        this.messageCount = messageCount;
    }
}
