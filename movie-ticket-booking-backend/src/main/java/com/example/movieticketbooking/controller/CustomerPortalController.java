package com.example.movieticketbooking.controller;

import com.example.movieticketbooking.dto.BookingResponse;
import com.example.movieticketbooking.dto.CustomerProfileResponse;
import com.example.movieticketbooking.dto.TicketResponse;
import com.example.movieticketbooking.security.CustomUserDetails;
import com.example.movieticketbooking.service.BookingService;
import com.example.movieticketbooking.service.CustomerService;
import com.example.movieticketbooking.service.TicketService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/customer")
@PreAuthorize("hasRole('CUSTOMER')")
public class CustomerPortalController {

    private final CustomerService customerService;
    private final BookingService bookingService;
    private final TicketService ticketService;

    public CustomerPortalController(CustomerService customerService,
                                    BookingService bookingService,
                                    TicketService ticketService) {
        this.customerService = customerService;
        this.bookingService = bookingService;
        this.ticketService = ticketService;
    }

    @GetMapping("/profile")
    public ResponseEntity<CustomerProfileResponse> getProfile(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(customerService.getCustomerProfile(userDetails));
    }

    @GetMapping("/bookings")
    public ResponseEntity<List<BookingResponse>> getMyBookings(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(bookingService.getCustomerBookings(userDetails.getCustomerId()));
    }

    @GetMapping("/tickets")
    public ResponseEntity<List<TicketResponse>> getMyTickets(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(ticketService.getCustomerTickets(userDetails.getCustomerId()));
    }
}
