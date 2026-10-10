package com.example.movieticketbooking.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "booking_seats", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"booking_id", "seat_id"}),
    @UniqueConstraint(columnNames = {"seat_id"})
})
public class BookingSeat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "booking_seat_id")
    private Integer bookingSeatId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    @JsonIgnore
    private Booking booking;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "seat_id", nullable = false)
    private Seat seat;

    public BookingSeat() {
    }

    public BookingSeat(Booking booking, Seat seat) {
        this.booking = booking;
        this.seat = seat;
    }

    public Integer getBookingSeatId() {
        return bookingSeatId;
    }

    public void setBookingSeatId(Integer bookingSeatId) {
        this.bookingSeatId = bookingSeatId;
    }

    public Booking getBooking() {
        return booking;
    }

    public void setBooking(Booking booking) {
        this.booking = booking;
    }

    public Seat getSeat() {
        return seat;
    }

    public void setSeat(Seat seat) {
        this.seat = seat;
    }
}
