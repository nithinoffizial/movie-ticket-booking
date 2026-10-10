package com.example.movieticketbooking.dto;

public class SeatDto {

    private Integer seatId;
    private String seatNumber;
    private String status;

    public SeatDto() {
    }

    public SeatDto(Integer seatId, String seatNumber, String status) {
        this.seatId = seatId;
        this.seatNumber = seatNumber;
        this.status = status;
    }

    public Integer getSeatId() {
        return seatId;
    }

    public void setSeatId(Integer seatId) {
        this.seatId = seatId;
    }

    public String getSeatNumber() {
        return seatNumber;
    }

    public void setSeatNumber(String seatNumber) {
        this.seatNumber = seatNumber;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
