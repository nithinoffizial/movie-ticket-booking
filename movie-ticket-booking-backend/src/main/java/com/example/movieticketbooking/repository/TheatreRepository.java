package com.example.movieticketbooking.repository;

import com.example.movieticketbooking.entity.Theatre;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TheatreRepository extends JpaRepository<Theatre, Integer> {
}