package com.example.movieticketbooking.dto;

import com.example.movieticketbooking.entity.SenderType;
import java.time.LocalDateTime;

public class TicketMessageResponse {

    private Integer messageId;
    private SenderType senderType;
    private String senderName;
    private String message;
    private LocalDateTime createdAt;

    public TicketMessageResponse() {
    }

    public TicketMessageResponse(Integer messageId, SenderType senderType, String senderName,
                                 String message, LocalDateTime createdAt) {
        this.messageId = messageId;
        this.senderType = senderType;
        this.senderName = senderName;
        this.message = message;
        this.createdAt = createdAt;
    }

    public Integer getMessageId() {
        return messageId;
    }

    public void setMessageId(Integer messageId) {
        this.messageId = messageId;
    }

    public SenderType getSenderType() {
        return senderType;
    }

    public void setSenderType(SenderType senderType) {
        this.senderType = senderType;
    }

    public String getSenderName() {
        return senderName;
    }

    public void setSenderName(String senderName) {
        this.senderName = senderName;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
