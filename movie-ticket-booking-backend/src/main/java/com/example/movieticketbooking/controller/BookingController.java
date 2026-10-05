package com.example.movieticketbooking.controller;

import com.example.movieticketbooking.entity.Booking;
import com.example.movieticketbooking.service.BookingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @GetMapping
    public List<Booking> getAllBookings() {
        return bookingService.getAllBookings();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Booking> getBookingById(
            @PathVariable Integer id) {

        return bookingService.getBookingById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Booking createBooking(@RequestBody Booking booking) {
        return bookingService.createBooking(booking);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Booking> updateBooking(
            @PathVariable Integer id,
            @RequestBody Booking booking) {

        try {
            return ResponseEntity.ok(
                    bookingService.updateBooking(id, booking)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBooking(
            @PathVariable Integer id) {

        bookingService.deleteBooking(id);
        return ResponseEntity.noContent().build();
    }
}