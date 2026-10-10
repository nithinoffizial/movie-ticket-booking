package com.example.movieticketbooking.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "bookings")
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "booking_id")
    private Integer bookingId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "show_id", nullable = false)
    private Show show;

    @Column(name = "seats_booked", nullable = false)
    private Integer seatsBooked;

    @Column(name = "total_amount", nullable = false)
    private Double totalAmount;

    @Column(name = "booking_date")
    private LocalDateTime bookingDate;

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<BookingSeat> bookingSeats = new ArrayList<>();

    @OneToOne(mappedBy = "booking", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private Ticket ticket;

    public Booking() {
    }

    public Booking(Customer customer, Show show, Integer seatsBooked,
                    Double totalAmount, LocalDateTime bookingDate) {
        this.customer = customer;
        this.show = show;
        this.seatsBooked = seatsBooked;
        this.totalAmount = totalAmount;
        this.bookingDate = bookingDate;
    }

    public Integer getBookingId() {
        return bookingId;
    }

    public void setBookingId(Integer bookingId) {
        this.bookingId = bookingId;
    }

    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }

    public Show getShow() {
        return show;
    }

    public void setShow(Show show) {
        this.show = show;
    }

    public Integer getSeatsBooked() {
        return seatsBooked;
    }

    public void setSeatsBooked(Integer seatsBooked) {
        this.seatsBooked = seatsBooked;
    }

    public Double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(Double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public LocalDateTime getBookingDate() {
        return bookingDate;
    }

    public void setBookingDate(LocalDateTime bookingDate) {
        this.bookingDate = bookingDate;
    }

    public List<BookingSeat> getBookingSeats() {
        return bookingSeats;
    }

    public void setBookingSeats(List<BookingSeat> bookingSeats) {
        this.bookingSeats = bookingSeats;
    }

    public Ticket getTicket() {
        return ticket;
    }

    public void setTicket(Ticket ticket) {
        this.ticket = ticket;
    }
}