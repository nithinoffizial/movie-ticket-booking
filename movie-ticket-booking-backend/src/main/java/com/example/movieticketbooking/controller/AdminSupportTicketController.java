package com.example.movieticketbooking.controller;

import com.example.movieticketbooking.dto.ReplyTicketRequest;
import com.example.movieticketbooking.dto.SupportTicketResponse;
import com.example.movieticketbooking.dto.UpdateTicketStatusRequest;
import com.example.movieticketbooking.entity.SupportCategory;
import com.example.movieticketbooking.entity.SupportTicketStatus;
import com.example.movieticketbooking.security.CustomUserDetails;
import com.example.movieticketbooking.service.SupportTicketService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/support/tickets")
@PreAuthorize("hasRole('ADMIN')")
public class AdminSupportTicketController {

    private final SupportTicketService supportTicketService;

    public AdminSupportTicketController(SupportTicketService supportTicketService) {
        this.supportTicketService = supportTicketService;
    }

    @GetMapping
    public ResponseEntity<List<SupportTicketResponse>> getAllTickets(
            @RequestParam(required = false) SupportTicketStatus status,
            @RequestParam(required = false) SupportCategory category,
            @RequestParam(required = false) String search) {
        List<SupportTicketResponse> response = supportTicketService.getAdminTickets(status, category, search);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SupportTicketResponse> getTicketDetail(@PathVariable Integer id) {
        SupportTicketResponse response = supportTicketService.getAdminTicketDetail(id);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/messages")
    public ResponseEntity<SupportTicketResponse> replyToTicket(
            @PathVariable Integer id,
            @Valid @RequestBody ReplyTicketRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        SupportTicketResponse response = supportTicketService.adminReply(id, request, userDetails);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<SupportTicketResponse> updateTicketStatus(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateTicketStatusRequest request) {
        SupportTicketResponse response = supportTicketService.adminUpdateStatus(id, request);
        return ResponseEntity.ok(response);
    }
}
