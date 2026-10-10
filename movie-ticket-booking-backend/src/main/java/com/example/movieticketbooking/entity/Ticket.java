package com.example.movieticketbooking.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tickets")
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ticket_id")
    private Integer ticketId;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "booking_id", nullable = false, unique = true)
    @JsonIgnoreProperties({"ticket", "bookingSeats"})
    private Booking booking;

    @Column(name = "ticket_number", nullable = false, unique = true, length = 50)
    private String ticketNumber;

    @Column(name = "issued_at")
    private LocalDateTime issuedAt;

    @Column(nullable = false, length = 20)
    private String status; // "CONFIRMED", "CANCELLED"

    public Ticket() {
    }

    public Ticket(Booking booking, String ticketNumber, LocalDateTime issuedAt, String status) {
        this.booking = booking;
        this.ticketNumber = ticketNumber;
        this.issuedAt = issuedAt;
        this.status = status;
    }

    public Integer getTicketId() {
        return ticketId;
    }

    public void setTicketId(Integer ticketId) {
        this.ticketId = ticketId;
    }

    public Booking getBooking() {
        return booking;
    }

    public void setBooking(Booking booking) {
        this.booking = booking;
    }

    public String getTicketNumber() {
        return ticketNumber;
    }

    public void setTicketNumber(String ticketNumber) {
        this.ticketNumber = ticketNumber;
    }

    public LocalDateTime getIssuedAt() {
        return issuedAt;
    }

    public void setIssuedAt(LocalDateTime issuedAt) {
        this.issuedAt = issuedAt;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
