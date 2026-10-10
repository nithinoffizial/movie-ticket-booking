package com.example.movieticketbooking.controller;

import com.example.movieticketbooking.dto.TicketResponse;
import com.example.movieticketbooking.security.CustomUserDetails;
import com.example.movieticketbooking.service.TicketService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<TicketResponse> getAllTickets() {
        return ticketService.getAllTickets();
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketResponse> getTicketById(@PathVariable Integer id,
                                                        @AuthenticationPrincipal CustomUserDetails currentUser) {
        return ResponseEntity.ok(ticketService.getTicketById(id, currentUser));
    }
}
