package com.example.movieticketbooking.service;

import com.example.movieticketbooking.entity.Movie;
import com.example.movieticketbooking.repository.MovieRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MovieService {

    private final MovieRepository movieRepository;

    public MovieService(MovieRepository movieRepository) {
        this.movieRepository = movieRepository;
    }

    public List<Movie> getAllMovies() {
        return movieRepository.findAll();
    }

    public Optional<Movie> getMovieById(Integer movieId) {
        return movieRepository.findById(movieId);
    }

    public Movie createMovie(Movie movie) {
        return movieRepository.save(movie);
    }

    public Movie updateMovie(Integer movieId, Movie movieDetails) {
        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new RuntimeException("Movie not found"));

        movie.setTitle(movieDetails.getTitle());
        movie.setGenre(movieDetails.getGenre());
        movie.setDurationMinutes(movieDetails.getDurationMinutes());
        movie.setLanguage(movieDetails.getLanguage());

        return movieRepository.save(movie);
    }

    public void deleteMovie(Integer movieId) {
        movieRepository.deleteById(movieId);
    }
}