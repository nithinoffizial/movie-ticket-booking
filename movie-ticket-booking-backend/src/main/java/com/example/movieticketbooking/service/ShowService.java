package com.example.movieticketbooking.service;

import com.example.movieticketbooking.entity.Show;
import com.example.movieticketbooking.repository.ShowRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ShowService {

    private final ShowRepository showRepository;

    public ShowService(ShowRepository showRepository) {
        this.showRepository = showRepository;
    }

    public List<Show> getAllShows() {
        return showRepository.findAll();
    }

    public Optional<Show> getShowById(Integer showId) {
        return showRepository.findById(showId);
    }

    public Show createShow(Show show) {
        return showRepository.save(show);
    }

    public Show updateShow(Integer showId, Show showDetails) {

        Show show = showRepository.findById(showId)
                .orElseThrow(() -> new RuntimeException("Show not found"));

        show.setMovie(showDetails.getMovie());
        show.setTheatre(showDetails.getTheatre());
        show.setShowDate(showDetails.getShowDate());
        show.setShowTime(showDetails.getShowTime());
        show.setTicketPrice(showDetails.getTicketPrice());
        show.setTotalSeats(showDetails.getTotalSeats());
        show.setAvailableSeats(showDetails.getAvailableSeats());

        return showRepository.save(show);
    }

    public void deleteShow(Integer showId) {
        showRepository.deleteById(showId);
    }
}