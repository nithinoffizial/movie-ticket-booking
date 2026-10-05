package com.example.movieticketbooking.repository;

import com.example.movieticketbooking.entity.Movie;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MovieRepository extends JpaRepository<Movie, Integer> {
}