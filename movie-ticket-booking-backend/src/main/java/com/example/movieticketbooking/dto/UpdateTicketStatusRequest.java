package com.example.movieticketbooking.dto;

import com.example.movieticketbooking.entity.SupportTicketStatus;
import jakarta.validation.constraints.NotNull;

public class UpdateTicketStatusRequest {

    @NotNull(message = "Status cannot be null")
    private SupportTicketStatus status;

    public UpdateTicketStatusRequest() {
    }

    public UpdateTicketStatusRequest(SupportTicketStatus status) {
        this.status = status;
    }

    public SupportTicketStatus getStatus() {
        return status;
    }

    public void setStatus(SupportTicketStatus status) {
        this.status = status;
    }
}
