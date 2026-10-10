package com.example.movieticketbooking.controller;

import com.example.movieticketbooking.dto.BookingRequest;
import com.example.movieticketbooking.dto.BookingResponse;
import com.example.movieticketbooking.dto.TicketResponse;
import com.example.movieticketbooking.security.CustomUserDetails;
import com.example.movieticketbooking.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
    @PreAuthorize("hasRole('ADMIN')")
    public List<BookingResponse> getAllBookings() {
        return bookingService.getAllBookings();
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getBookingById(@PathVariable Integer id,
                                                          @AuthenticationPrincipal CustomUserDetails currentUser) {
        return ResponseEntity.ok(bookingService.getBookingById(id, currentUser));
    }

    @PostMapping
    public ResponseEntity<TicketResponse> createBooking(@Valid @RequestBody BookingRequest bookingRequest,
                                                        @AuthenticationPrincipal CustomUserDetails currentUser) {
        TicketResponse ticket = bookingService.bookTicket(bookingRequest, currentUser);
        return new ResponseEntity<>(ticket, HttpStatus.CREATED);
    }
}