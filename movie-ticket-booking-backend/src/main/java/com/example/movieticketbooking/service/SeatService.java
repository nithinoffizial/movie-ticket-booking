package com.example.movieticketbooking.service;

import com.example.movieticketbooking.dto.SeatDto;
import com.example.movieticketbooking.entity.Seat;
import com.example.movieticketbooking.exception.ResourceNotFoundException;
import com.example.movieticketbooking.repository.SeatRepository;
import com.example.movieticketbooking.repository.ShowRepository;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SeatService {

    private final SeatRepository seatRepository;
    private final ShowRepository showRepository;

    public SeatService(SeatRepository seatRepository, ShowRepository showRepository) {
        this.seatRepository = seatRepository;
        this.showRepository = showRepository;
    }

    public List<SeatDto> getSeatsByShowId(Integer showId) {
        if (!showRepository.existsById(showId)) {
            throw new ResourceNotFoundException("Show not found with id: " + showId);
        }

        List<Seat> seats = seatRepository.findByShowShowId(showId);

        // Sort reliably by row letter (A-Z) and seat number (1-100)
        seats.sort(Comparator.comparing((Seat s) -> {
            String sn = s.getSeatNumber();
            if (sn == null || sn.isEmpty()) return "";
            return sn.replaceAll("[0-9]", "");
        }).thenComparingInt((Seat s) -> {
            String sn = s.getSeatNumber();
            if (sn == null || sn.isEmpty()) return 0;
            String digits = sn.replaceAll("[^0-9]", "");
            return digits.isEmpty() ? 0 : Integer.parseInt(digits);
        }));

        return seats.stream()
                .map(s -> new SeatDto(s.getSeatId(), s.getSeatNumber(), s.getStatus()))
                .collect(Collectors.toList());
    }

    public List<Seat> getAllSeats(Integer showId) {
        if (showId != null) {
            return seatRepository.findByShowShowId(showId);
        }
        return seatRepository.findAll();
    }
}
