package com.example.movieticketbooking.service;

import com.example.movieticketbooking.entity.Theatre;
import com.example.movieticketbooking.repository.TheatreRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TheatreService {

    private final TheatreRepository theatreRepository;

    public TheatreService(TheatreRepository theatreRepository) {
        this.theatreRepository = theatreRepository;
    }

    public List<Theatre> getAllTheatres() {
        return theatreRepository.findAll();
    }

    public Optional<Theatre> getTheatreById(Integer theatreId) {
        return theatreRepository.findById(theatreId);
    }

    public Theatre createTheatre(Theatre theatre) {
        return theatreRepository.save(theatre);
    }

    public Theatre updateTheatre(Integer theatreId, Theatre theatreDetails) {
        Theatre theatre = theatreRepository.findById(theatreId)
                .orElseThrow(() -> new RuntimeException("Theatre not found"));

        theatre.setName(theatreDetails.getName());
        theatre.setLocation(theatreDetails.getLocation());
        theatre.setTotalScreens(theatreDetails.getTotalScreens());

        return theatreRepository.save(theatre);
    }

    public void deleteTheatre(Integer theatreId) {
        theatreRepository.deleteById(theatreId);
    }
}