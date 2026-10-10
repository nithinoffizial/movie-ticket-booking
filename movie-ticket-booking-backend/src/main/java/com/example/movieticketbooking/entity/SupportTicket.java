package com.example.movieticketbooking.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "support_tickets")
public class SupportTicket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ticket_id")
    private Integer ticketId;

    @Column(name = "ticket_reference", nullable = false, unique = true, length = 50)
    private String ticketReference;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private SupportCategory category;

    @Column(nullable = false, length = 200)
    private String subject;

    @Column(name = "booking_reference", length = 50)
    private String bookingReference;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private SupportTicketStatus status = SupportTicketStatus.OPEN;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("createdAt ASC")
    private List<TicketMessage> messages = new ArrayList<>();

    public SupportTicket() {
    }

    public SupportTicket(String ticketReference, Customer customer, SupportCategory category,
                         String subject, String bookingReference) {
        this.ticketReference = ticketReference;
        this.customer = customer;
        this.category = category;
        this.subject = subject;
        this.bookingReference = bookingReference;
        this.status = SupportTicketStatus.OPEN;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = SupportTicketStatus.OPEN;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public void addMessage(TicketMessage message) {
        messages.add(message);
        message.setTicket(this);
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

    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
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

    public List<TicketMessage> getMessages() {
        return messages;
    }

    public void setMessages(List<TicketMessage> messages) {
        this.messages = messages;
    }
}
