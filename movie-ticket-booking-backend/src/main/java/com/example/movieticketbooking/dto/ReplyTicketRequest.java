package com.example.movieticketbooking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ReplyTicketRequest {

    @NotBlank(message = "Reply message cannot be blank")
    @Size(min = 2, max = 4000, message = "Reply message must be between 2 and 4000 characters")
    private String message;

    public ReplyTicketRequest() {
    }

    public ReplyTicketRequest(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
