package com.example.movieticketbooking.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "movies")
public class Movie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "movie_id")
    private Integer movieId;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(length = 50)
    private String genre;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Column(length = 30)
    private String language;

    public Movie() {
    }

    public Movie(String title, String genre, Integer durationMinutes, String language) {
        this.title = title;
        this.genre = genre;
        this.durationMinutes = durationMinutes;
        this.language = language;
    }

    public Integer getMovieId() {
        return movieId;
    }

    public void setMovieId(Integer movieId) {
        this.movieId = movieId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getGenre() {
        return genre;
    }

    public void setGenre(String genre) {
        this.genre = genre;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }
}