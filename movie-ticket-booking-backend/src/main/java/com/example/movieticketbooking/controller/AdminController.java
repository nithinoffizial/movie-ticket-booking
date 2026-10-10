package com.example.movieticketbooking.controller;

import com.example.movieticketbooking.dto.AdminDashboardResponse;
import com.example.movieticketbooking.dto.BookingResponse;
import com.example.movieticketbooking.dto.TicketResponse;
import com.example.movieticketbooking.entity.Customer;
import com.example.movieticketbooking.entity.Seat;
import com.example.movieticketbooking.security.CustomUserDetails;
import com.example.movieticketbooking.service.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final CustomerService customerService;
    private final BookingService bookingService;
    private final TicketService ticketService;
    private final SeatService seatService;

    public AdminController(AdminService adminService,
                           CustomerService customerService,
                           BookingService bookingService,
                           TicketService ticketService,
                           SeatService seatService) {
        this.adminService = adminService;
        this.customerService = customerService;
        this.bookingService = bookingService;
        this.ticketService = ticketService;
        this.seatService = seatService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardResponse> getDashboard() {
        return ResponseEntity.ok(adminService.getDashboardStatistics());
    }

    @GetMapping("/customers")
    public ResponseEntity<List<Customer>> getAllCustomers() {
        return ResponseEntity.ok(customerService.getAllCustomers());
    }

    @GetMapping("/bookings")
    public ResponseEntity<List<BookingResponse>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @GetMapping("/tickets")
    public ResponseEntity<List<TicketResponse>> getAllTickets() {
        return ResponseEntity.ok(ticketService.getAllTickets());
    }

    @GetMapping("/seats")
    public ResponseEntity<List<Seat>> getAllSeats(@RequestParam(required = false) Integer showId) {
        return ResponseEntity.ok(seatService.getAllSeats(showId));
    }

    @PatchMapping("/customers/{id}/status")
    public ResponseEntity<Customer> updateCustomerStatus(
            @PathVariable Integer id,
            @RequestParam boolean active,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        return ResponseEntity.ok(customerService.toggleCustomerStatus(id, active, currentUser));
    }
}
