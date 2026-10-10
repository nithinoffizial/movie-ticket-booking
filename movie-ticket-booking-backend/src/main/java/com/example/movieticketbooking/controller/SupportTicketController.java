package com.example.movieticketbooking.controller;

import com.example.movieticketbooking.dto.CreateTicketRequest;
import com.example.movieticketbooking.dto.ReplyTicketRequest;
import com.example.movieticketbooking.dto.SupportTicketResponse;
import com.example.movieticketbooking.security.CustomUserDetails;
import com.example.movieticketbooking.service.SupportTicketService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/support/tickets")
@PreAuthorize("hasRole('CUSTOMER')")
public class SupportTicketController {

    private final SupportTicketService supportTicketService;

    public SupportTicketController(SupportTicketService supportTicketService) {
        this.supportTicketService = supportTicketService;
    }

    @PostMapping
    public ResponseEntity<SupportTicketResponse> createTicket(
            @Valid @RequestBody CreateTicketRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        SupportTicketResponse response = supportTicketService.createTicket(request, userDetails);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<SupportTicketResponse>> getMyTickets(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        List<SupportTicketResponse> response = supportTicketService.getCustomerTickets(userDetails);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SupportTicketResponse> getTicketDetail(
            @PathVariable Integer id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        SupportTicketResponse response = supportTicketService.getCustomerTicketDetail(id, userDetails);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/messages")
    public ResponseEntity<SupportTicketResponse> replyToTicket(
            @PathVariable Integer id,
            @Valid @RequestBody ReplyTicketRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        SupportTicketResponse response = supportTicketService.customerReply(id, request, userDetails);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/close")
    public ResponseEntity<SupportTicketResponse> closeTicket(
            @PathVariable Integer id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        SupportTicketResponse response = supportTicketService.customerCloseTicket(id, userDetails);
        return ResponseEntity.ok(response);
    }
}
