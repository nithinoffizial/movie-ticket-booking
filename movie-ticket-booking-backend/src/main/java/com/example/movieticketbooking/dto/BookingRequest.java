package com.example.movieticketbooking.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class BookingRequest {

    private Integer customerId;

    @NotNull(message = "Show ID is required")
    private Integer showId;

    @NotEmpty(message = "At least one seat must be selected")
    private List<String> seatNumbers;

    public BookingRequest() {
    }

    public BookingRequest(Integer customerId, Integer showId, List<String> seatNumbers) {
        this.customerId = customerId;
        this.showId = showId;
        this.seatNumbers = seatNumbers;
    }

    public Integer getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Integer customerId) {
        this.customerId = customerId;
    }

    public Integer getShowId() {
        return showId;
    }

    public void setShowId(Integer showId) {
        this.showId = showId;
    }

    public List<String> getSeatNumbers() {
        return seatNumbers;
    }

    public void setSeatNumbers(List<String> seatNumbers) {
        this.seatNumbers = seatNumbers;
    }
}
